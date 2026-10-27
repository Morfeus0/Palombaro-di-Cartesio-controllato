"""Dai pixel ai centimetri (sottofase 2.3): rotazione della telecamera, scala del metro e modello della quota.

Tre cose, in quest'ordine:
1. **Rotazione.** Il bordo del metro (verticale, reso tale con la Livella) nell'immagine pende: la pendenza dx/dy è la
   rotazione della telecamera. Con la pendenza, `verticale()` dà a ogni punto la coordinata lungo la verticale vera,
   così la quota di P1 non cambia se il palombaro si sposta di lato.
2. **Scala lungo il metro.** Le tacche dei millimetri, a tratti: se la scala cambia dall'alto in basso, il metro non è
   parallelo all'immagine (telecamera inclinata in avanti o indietro, oppure asta del metro che pende verso di lei).
3. **Modello della quota** h(s) = (a + b·s) / (1 + c·s), con s la coordinata verticale corretta: è la prospettiva di
   un piano visto da una telecamera inclinata. Si adatta a punti di quota nota **nel piano di P1** (dentro l'acqua):
   il 27 ottobre si è visto che il metro accanto alla bottiglia dà una scala sbagliata di circa il 15 % per P1.

Uso (dalla cartella del progetto):
  .venv/bin/python pc/calibrazione.py metro                     # rotazione e scala dal riferimento della dashboard
  .venv/bin/python pc/calibrazione.py punti X Y H [X Y H ...]   # modello della quota da punti noti (pixel, cm)
I risultati vanno in pc/config/calibrazione.json.
"""
import argparse
import json
import logging
import time
from pathlib import Path

import cv2
import numpy as np

RADICE = Path(__file__).resolve().parents[1]
FILE_CALIBRAZIONE = RADICE / "pc" / "config" / "calibrazione.json"
FILE_RIFERIMENTO = RADICE / "pc" / "config" / "postazione_riferimento.jpg"
SOGLIA_NASTRO = 80        # il nastro è sopra 100 di luminosità, lo sfondo nero dietro sotto 30
SCARTO_BORDO_PX = 3.0     # punti del bordo più lontani dalla retta: numeri o ombre, si scartano
PROFONDITA_TACCA = 8      # un minimo del profilo è una tacca se è almeno così più scuro dei vicini
TOLLERANZA_TACCA = 0.25   # in frazioni di passo: un minimo più lontano dal reticolo non è una tacca

log = logging.getLogger("calibrazione")


# ---------- 1. rotazione ----------

def bordo_nastro(grigio: np.ndarray, x_min: int, x_max: int, soglia: int = SOGLIA_NASTRO) -> tuple[float, float]:
    """Retta del bordo sinistro del nastro, x = pendenza · y + intercetta, cercata tra x_min e x_max.

    ValueError se il nastro non si trova (meno di 20 righe con un bordo).
    """
    sfocato = cv2.GaussianBlur(grigio.astype(np.float32), (1, 5), 0)
    righe, bordi = [], []
    for y in range(sfocato.shape[0]):
        chiari = np.flatnonzero(sfocato[y, x_min:x_max] > soglia)
        if chiari.size:
            righe.append(y)
            bordi.append(x_min + chiari[0])
    if len(righe) < 20:
        raise ValueError("bordo del nastro non trovato: controlla x_min e x_max")
    y, x = np.array(righe, dtype=float), np.array(bordi, dtype=float)
    for _ in range(3):  # tre giri: retta, via i punti lontani, di nuovo
        pendenza, intercetta = np.polyfit(y, x, 1)
        vicini = np.abs(x - (pendenza * y + intercetta)) < SCARTO_BORDO_PX
        y, x = y[vicini], x[vicini]
    return float(pendenza), float(intercetta)


def angolo_gradi(pendenza: float) -> float:
    return float(np.degrees(np.arctan(pendenza)))


def verticale(x: float, y: float, pendenza: float, centro_x: float) -> float:
    """Coordinata lungo la verticale vera: uguale per tutti i punti di una riga orizzontale del mondo."""
    return y + pendenza * (x - centro_x)


# ---------- 2. scala lungo il metro ----------

def profilo_tacche(grigio: np.ndarray, pendenza: float, intercetta: float, d0: int, d1: int) -> np.ndarray:
    """Luminosità media, riga per riga, della fascia tra d0 e d1 pixel a destra del bordo del nastro."""
    alto = grigio.shape[0]
    colonne = np.arange(d0, d1, dtype=np.float32)
    righe = np.arange(alto, dtype=np.float32)[:, None]
    mappa_x = (pendenza * righe + intercetta + colonne[None, :]).astype(np.float32)
    mappa_y = np.repeat(righe, colonne.size, axis=1).astype(np.float32)
    return cv2.remap(grigio.astype(np.float32), mappa_x, mappa_y, cv2.INTER_LINEAR).mean(axis=1)


def minimi(profilo: np.ndarray) -> np.ndarray:
    """Posizioni (con frazione di pixel) dei minimi netti del profilo: le tacche."""
    p = np.asarray(profilo, dtype=float)
    trovati = []
    for y in range(2, p.size - 2):
        if p[y] < p[y - 1] and p[y] <= p[y + 1] and p[y] < p[y - 2:y + 3].max() - PROFONDITA_TACCA:
            curvatura = p[y - 1] - 2 * p[y] + p[y + 1]
            trovati.append(y + (0.5 * (p[y - 1] - p[y + 1]) / curvatura if curvatura > 0 else 0.0))
    return np.array(trovati)


def passo_tacche(profilo: np.ndarray, passo_min: float = 2.6, passo_max: float = 4.2) -> float:
    """Passo delle tacche in pixel: il reticolo regolare che si accorda con più minimi, rifinito con i minimi quadrati."""
    posizioni = minimi(profilo)
    if posizioni.size < 5:
        raise ValueError("troppo poche tacche nel profilo")
    candidati = np.arange(passo_min, passo_max, 0.0005)
    accordo = [abs(np.exp(2j * np.pi * posizioni / p).mean()) for p in candidati]
    passo = float(candidati[int(np.argmax(accordo))])
    fase = np.angle(np.exp(2j * np.pi * posizioni / passo).mean()) / (2 * np.pi) * passo
    indici = np.round((posizioni - fase) / passo)
    sul_reticolo = np.abs(posizioni - (fase + indici * passo)) < TOLLERANZA_TACCA * passo
    pendenza, _ = np.polyfit(indici[sul_reticolo], posizioni[sul_reticolo], 1)
    return float(pendenza)


def passi_a_tratti(profilo: np.ndarray, finestra: int = 200, passo_finestre: int = 100) -> list[tuple[float, float]]:
    """(centro del tratto, passo delle tacche) lungo il metro: se il passo cambia, c'è prospettiva."""
    risultati = []
    for inizio in range(0, len(profilo) - finestra + 1, passo_finestre):
        try:
            risultati.append((inizio + finestra / 2, passo_tacche(profilo[inizio:inizio + finestra])))
        except ValueError:
            continue
    return risultati


# ---------- 3. modello della quota ----------

def adatta_quota(punti: list[tuple[float, float]]) -> list[float]:
    """[a, b, c] di h(s) = (a + b·s) / (1 + c·s) dai punti (s, h); con due punti è una retta (c = 0)."""
    if len(punti) < 2:
        raise ValueError("servono almeno due punti di quota nota")
    s = np.array([p[0] for p in punti], dtype=float)
    h = np.array([p[1] for p in punti], dtype=float)
    if len(punti) == 2:
        b = (h[1] - h[0]) / (s[1] - s[0])
        return [float(h[0] - b * s[0]), float(b), 0.0]
    # h·(1 + c·s) = a + b·s  →  h = a + b·s − c·s·h: lineare nei tre parametri
    sistema = np.column_stack([np.ones_like(s), s, -s * h])
    (a, b, c), *_ = np.linalg.lstsq(sistema, h, rcond=None)
    return [float(a), float(b), float(c)]


def quota(modello: list[float], s: float) -> float:
    a, b, c = modello
    return (a + b * s) / (1 + c * s)


def scarti(modello: list[float], punti: list[tuple[float, float]]) -> list[float]:
    """Quota del modello meno quota vera, punto per punto (in cm)."""
    return [quota(modello, s) - h for s, h in punti]


# ---------- file ----------

def salva(file: Path, dati: dict) -> None:
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(dati, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def leggi(file: Path) -> dict | None:
    return json.loads(file.read_text(encoding="utf-8")) if file.exists() else None


# ---------- da riga di comando ----------

def comando_metro(argomenti: argparse.Namespace) -> None:
    immagine = cv2.imread(str(argomenti.immagine), cv2.IMREAD_GRAYSCALE)
    if immagine is None:
        raise SystemExit(f"Immagine non leggibile: {argomenti.immagine}")
    pendenza, intercetta = bordo_nastro(immagine, argomenti.x_min, argomenti.x_max)
    log.info("bordo del metro: pendenza %.5f, cioè la telecamera è ruotata di %.2f°", pendenza, angolo_gradi(pendenza))
    profilo = profilo_tacche(immagine, pendenza, intercetta, argomenti.fascia[0], argomenti.fascia[1])
    tratti = passi_a_tratti(profilo)
    for centro, passo in tratti:
        log.info("  y %4.0f: %.3f px per mm (%.3f mm per px)", centro, passo, 1 / passo)
    if len(tratti) >= 2:
        variazione = (tratti[0][1] - tratti[-1][1]) / np.mean([p for _, p in tratti]) * 100
        log.info("la scala cambia del %.1f %% dall'alto in basso: %s", variazione,
                 "il metro è parallelo all'immagine" if abs(variazione) < 2 else
                 "il metro non è parallelo all'immagine (telecamera inclinata o asta che pende)")
    dati = leggi(FILE_CALIBRAZIONE) or {}
    dati |= {"pendenza": pendenza, "angolo_gradi": angolo_gradi(pendenza), "centro_x": immagine.shape[1] / 2,
             "metro": {"immagine": argomenti.immagine.name, "data": time.strftime("%Y-%m-%d %H:%M"),
                       "px_per_mm_a_tratti": [[round(c), round(p, 4)] for c, p in tratti]}}
    salva(FILE_CALIBRAZIONE, dati)
    log.info("salvato in %s", FILE_CALIBRAZIONE)


def comando_punti(argomenti: argparse.Namespace) -> None:
    valori = argomenti.valori
    if len(valori) % 3 or len(valori) < 6:
        raise SystemExit("servono terne X Y H (pixel, pixel, cm), almeno due")
    dati = leggi(FILE_CALIBRAZIONE) or {}
    pendenza, centro_x = dati.get("pendenza", 0.0), dati.get("centro_x", 960.0)
    terne = [tuple(valori[i:i + 3]) for i in range(0, len(valori), 3)]
    punti = [(verticale(x, y, pendenza, centro_x), h) for x, y, h in terne]
    modello = adatta_quota(punti)
    for (x, y, h), e in zip(terne, scarti(modello, punti)):
        log.info("  (%.0f, %.0f) → %.2f cm, vera %.2f cm: scarto %+.1f mm", x, y, h + e, h, 10 * e)
    dati |= {"modello": modello, "punti": [list(t) for t in terne], "data_modello": time.strftime("%Y-%m-%d %H:%M")}
    salva(FILE_CALIBRAZIONE, dati)
    log.info("modello %s salvato in %s", [f"{v:.6g}" for v in modello], FILE_CALIBRAZIONE)


def main() -> None:
    parser = argparse.ArgumentParser(description="Calibrazione da pixel a centimetri (2.3)")
    sotto = parser.add_subparsers(dest="comando", required=True)
    metro = sotto.add_parser("metro", help="rotazione e scala dal metro nell'immagine di riferimento")
    metro.add_argument("--immagine", type=Path, default=FILE_RIFERIMENTO)
    metro.add_argument("--x-min", type=int, default=730, help="dove cercare il bordo sinistro del nastro (pixel)")
    metro.add_argument("--x-max", type=int, default=850)
    metro.add_argument("--fascia", type=int, nargs=2, default=(22, 30),
                       help="fascia delle tacche dei millimetri, in pixel a destra del bordo")
    punti = sotto.add_parser("punti", help="modello della quota da punti di quota nota")
    punti.add_argument("valori", type=float, nargs="+", help="terne X Y H: pixel, pixel, quota dal tavolo in cm")
    argomenti = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    comando_metro(argomenti) if argomenti.comando == "metro" else comando_punti(argomenti)


if __name__ == "__main__":
    main()
