"""Misure della postazione di ripresa (sottofase 2.1): funzioni pure su immagini, testabili.

Le usano pc/telecamera.py (che le calcola sui fotogrammi) e la dashboard (che valida e scrive i comandi
per la telecamera). Le immagini sono array numpy di OpenCV: BGR a colori, oppure in scala di grigi (0–255).
Le coordinate (x, y, larghezza, altezza) sono sempre in pixel dell'immagine a piena risoluzione.
"""
import json
import os
import time
from pathlib import Path

import cv2
import numpy as np

SOGLIA_RIFLESSO = 250  # un pixel così chiaro è saturato: un riflesso, non il bianco dello sfondo
# Rosso nello spazio HSV di OpenCV (tinta 0–180): il rosso sta a cavallo dello zero, quindi due intervalli.
# Il limite è 6 e non 10: misurato il 24 ottobre sull'iPhone, il marcatore di P1 sta tra −4 e 6 (176–180 e 0–6),
# il filo di rame avvolto su P1 tra 8 e 16 (quasi tutto 9–13), il cartone marrone attorno a 13–15.
TINTA_ROSSA = ((0, 6), (170, 180))
SATURAZIONE_MIN = 100  # sotto, è un rosa pallido o un riflesso: non il nastro del marcatore
VALORE_MIN = 60        # sotto, è troppo scuro per dirne il colore
AREA_MIN_ROSSO = 12    # pixel (sull'immagine ridotta dell'analisi): sotto, è rumore
LATO_MIN_ROI = 20
SECONDI_MAX_REGISTRAZIONE = 600


def ritaglia(immagine: np.ndarray, roi: tuple[int, int, int, int] | None) -> np.ndarray:
    """La parte dell'immagine dentro il rettangolo (limitato ai bordi); tutta l'immagine se roi è None."""
    if roi is None:
        return immagine
    x, y, w, h = roi
    alto, largo = immagine.shape[:2]
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(largo, x + w), min(alto, y + h)
    if x1 <= x0 or y1 <= y0:
        raise ValueError("il rettangolo è fuori dall'immagine")
    return immagine[y0:y1, x0:x1]


def luminosita(grigio: np.ndarray) -> float:
    """Luminosità tipica (mediana, 0–255): è il numero che cambia se l'esposizione automatica si sposta."""
    return float(np.median(grigio))


def percentuale_riflessi(grigio: np.ndarray, soglia: int = SOGLIA_RIFLESSO) -> float:
    """Percentuale di pixel saturati: sulla colonna d'acqua sono riflessi di luci o di oggetti chiari."""
    return float(np.count_nonzero(grigio >= soglia)) * 100.0 / grigio.size


def nitidezza(grigio: np.ndarray) -> float:
    """Varianza del laplaciano: alta con bordi netti (tacche del righello), bassa se l'immagine è sfocata.

    Non ha un valore assoluto «giusto»: si confronta con quello dell'immagine di riferimento.
    """
    return float(cv2.Laplacian(grigio, cv2.CV_64F).var())


def maschera_rosso(bgr: np.ndarray) -> np.ndarray:
    """Pixel rossi e saturi (255) contro tutto il resto (0), puliti dai puntini isolati."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    maschera = np.zeros(hsv.shape[:2], dtype=np.uint8)
    for tinta_min, tinta_max in TINTA_ROSSA:
        maschera |= cv2.inRange(hsv, (tinta_min, SATURAZIONE_MIN, VALORE_MIN), (tinta_max, 255, 255))
    return cv2.morphologyEx(maschera, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))


def zone_rosse(maschera: np.ndarray, area_min: int = AREA_MIN_ROSSO, scala: float = 1.0) -> list[dict]:
    """Zone rosse separate, dalla più grande. `scala` riporta le coordinate alla piena risoluzione."""
    n, _, statistiche, _ = cv2.connectedComponentsWithStats(maschera, connectivity=8)
    zone = []
    for i in range(1, n):  # 0 è lo sfondo
        x, y, w, h, area = (int(v) for v in statistiche[i])
        if area >= area_min:
            zone.append({"x": round(x * scala), "y": round(y * scala), "w": round(w * scala),
                         "h": round(h * scala), "area": round(area * scala * scala)})
    return sorted(zone, key=lambda z: z["area"], reverse=True)


def anteprima_rosso(bgr: np.ndarray, maschera: np.ndarray) -> np.ndarray:
    """Immagine grigia e sbiadita con i pixel rossi in magenta pieno: si vede subito cosa è «rosso»."""
    grigio = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    sbiadito = cv2.cvtColor((grigio // 2 + 64).astype(np.uint8), cv2.COLOR_GRAY2BGR)
    sbiadito[maschera > 0] = (255, 0, 255)
    return sbiadito


def deriva_percentuale(valori: list[float]) -> float | None:
    """Escursione (massimo − minimo) in percentuale della media; None con meno di due valori."""
    if len(valori) < 2:
        return None
    media = float(np.mean(valori))
    if media <= 0:
        return None
    return (max(valori) - min(valori)) * 100.0 / media


def statistiche_fotogrammi(tempi: list[float]) -> dict:
    """fps medi e intervallo più lungo (ms) da una serie di istanti di arrivo in secondi."""
    if len(tempi) < 2:
        return {"fps": None, "intervallo_max_ms": None}
    intervalli = np.diff(np.asarray(tempi, dtype=float))
    durata = tempi[-1] - tempi[0]
    return {
        "fps": (len(tempi) - 1) / durata if durata > 0 else None,
        "intervallo_max_ms": float(intervalli.max()) * 1000.0,
    }


def verdetto_postazione(misure: dict) -> dict[str, bool | None]:
    """Il giudizio dei controlli automatici della 2.1: per ogni controllo True (superato), False o None (non si sa).

    `misure` è lo stato che pc/telecamera.py scrive ogni mezzo secondo, con queste chiavi:
      larghezza, altezza      risoluzione vera dei fotogrammi (attesa 1920 × 1080)
      fps                     fotogrammi al secondo negli ultimi 2 secondi
      intervallo_max_ms       l'attesa più lunga tra due fotogrammi negli ultimi 2 secondi
      interruzioni            quante volte, dall'avvio, sono passati più di 0,5 s senza fotogrammi
      luminosita              mediana 0–255 nella colonna (o in tutta l'immagine se la colonna non è disegnata)
      deriva_pct              escursione della luminosità negli ultimi 5 minuti, in % (None all'inizio)
      deriva_finestra_s       quanti secondi copre davvero la deriva (meno di 300 nei primi 5 minuti)
      riflessi_pct            % di pixel saturati nella colonna
      nitidezza               varianza del laplaciano nella colonna; nitidezza_riferimento: quella del riferimento
      zone_rosse              elenco delle zone rosse in tutta l'immagine, dalla più grande
      zone_rosse_colonna      solo quelle con il centro dentro la colonna (le sole che contano per P1)
      roi                     [x, y, w, h] della colonna, oppure None

    Deve restituire un dizionario con le chiavi "risoluzione", "fps", "esposizione", "riflessi", "nitidezza",
    "rosso": la dashboard le mostra come ✓, ✗ o «—». I criteri della scheda (hardware/postazione-ripresa.md,
    blocco F) sono il punto di partenza: F1, F3, F4, F5 e i riflessi del blocco E.
    """
    # TODO(Gabriele): scegli le soglie e scrivi qui il giudizio (5–10 righe).
    raise NotImplementedError


# ---------- comandi dalla dashboard alla telecamera ----------

def _intero(valore, nome: str, minimo: int, massimo: int) -> int:
    if isinstance(valore, bool) or not isinstance(valore, int):
        raise ValueError(f"{nome} deve essere un numero intero")
    if not minimo <= valore <= massimo:
        raise ValueError(f"{nome} deve stare tra {minimo} e {massimo}")
    return valore


def valida_comando(dati) -> dict:
    """Controlla un comando per la telecamera e lo restituisce pulito; ValueError se non è valido.

    Comandi: {"comando": "riferimento"} · {"comando": "registra", "secondi": 1–600} · {"comando": "ferma"} ·
    {"comando": "roi", "x", "y", "w", "h"} (la colonna d'acqua, in pixel della piena risoluzione) · {"comando": "roi_via"}.
    """
    if not isinstance(dati, dict):
        raise ValueError("il comando deve essere un oggetto JSON")
    nome = dati.get("comando")
    if nome in ("riferimento", "ferma", "roi_via"):
        return {"comando": nome}
    if nome == "registra":
        return {"comando": nome, "secondi": _intero(dati.get("secondi"), "secondi", 1, SECONDI_MAX_REGISTRAZIONE)}
    if nome == "roi":
        x, y = (_intero(dati.get(k), k, 0, 10_000) for k in ("x", "y"))
        w, h = (_intero(dati.get(k), k, LATO_MIN_ROI, 10_000) for k in ("w", "h"))
        return {"comando": nome, "x": x, "y": y, "w": w, "h": h}
    raise ValueError("comando sconosciuto")


def scrivi_comando(cartella: Path, comando: dict) -> Path:
    """Un file per comando, scritto in modo atomico: due comandi ravvicinati non si sovrascrivono."""
    cartella.mkdir(parents=True, exist_ok=True)
    finale = cartella / f"{time.time_ns()}.json"
    temporaneo = cartella / f".{finale.name}.tmp"
    temporaneo.write_text(json.dumps(comando), encoding="utf-8")
    os.replace(temporaneo, finale)
    return finale


def leggi_comandi(cartella: Path) -> tuple[list[dict], list[str]]:
    """Comandi validi in ordine di arrivo ed errori dei file scartati; i file letti vengono cancellati."""
    if not cartella.is_dir():
        return [], []
    comandi, errori = [], []
    for file in sorted(cartella.glob("[0-9]*.json")):
        try:
            comandi.append(valida_comando(json.loads(file.read_text(encoding="utf-8"))))
        except (ValueError, json.JSONDecodeError) as errore:
            errori.append(f"{file.name}: {errore}")
        file.unlink(missing_ok=True)
    return comandi, errori


def scrivi_atomico(percorso: Path, dati: bytes) -> None:
    """Scrive un file tutto in una volta: chi lo legge (la dashboard) non lo trova mai a metà."""
    temporaneo = percorso.with_name(f".{percorso.name}.tmp")
    temporaneo.write_bytes(dati)
    os.replace(temporaneo, percorso)
