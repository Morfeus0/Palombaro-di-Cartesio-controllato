"""Telecamera della postazione (sottofase 2.1): l'unico programma che apre la telecamera dell'iPhone.

Come il registratore per la seriale: legge i fotogrammi, calcola le misure della postazione e scrive tutto su file;
la dashboard legge quei file e scrive i comandi. Così la telecamera resta di un solo programma.

Uso (dalla cartella del progetto, in Terminal.app, che ha il permesso della telecamera):
  .venv/bin/python pc/telecamera.py              # iPhone (Fotocamera Continuity), 1920 × 1080 a 60 fps
  .venv/bin/python pc/telecamera.py --elenco     # telecamere viste dal Mac
  .venv/bin/python pc/telecamera.py --video media/2026-10-24_M1_palombaro-comandato-dal-servo.mp4   # prova senza iPhone
Ctrl+C per chiuderlo.

Scrive in dati/<oggi>/telecamera/: anteprima.jpg e rosso.jpg (5 volte al secondo), stato.json, i video di prova
(AAAA-MM-GG_postazione_NN.mp4) con l'orario di ogni fotogramma e la posizione di P1 (..._fotogrammi.csv) e
telecamera.log. P1 si cerca in ogni fotogramma (pc/tracking.py, sottofase 2.2), dentro la colonna d'acqua.
Legge i comandi da dati/<oggi>/telecamera/comandi/. La colonna e il riferimento stanno in pc/config/postazione.json.
"""
import argparse
import json
import logging
import re
import subprocess
import threading
import time
from collections import deque
from datetime import date
from pathlib import Path

import cv2
import numpy as np

import postazione as p
import righello
import tracking

RADICE = Path(__file__).resolve().parents[1]
CONFIG = RADICE / "pc" / "config"
FILE_CONFIG = CONFIG / "postazione.json"
FILE_RIFERIMENTO = CONFIG / "postazione_riferimento.jpg"
LARGHEZZA, ALTEZZA, FPS = 1920, 1080, 30
# L'iPhone manda 60 fotogrammi veri al secondo anche se se ne chiedono 30 (misurato il 24 ottobre: 176 in 2,98 s,
# nessuno ripetuto): si chiedono 60, così la richiesta corrisponde a ciò che arriva.
FPS_IPHONE = 60
LARGHEZZA_ANTEPRIMA = 960
PERIODO_ANALISI_S = 0.2
FINESTRA_FPS_S = 2.0
FINESTRA_DERIVA_S = 300.0
BUCO_S = 0.5           # oltre questo tempo senza fotogrammi è un'interruzione (rischio R5)
SILENZIO_S = 5.0       # oltre questo tempo senza fotogrammi si riavvia ffmpeg: se l'iPhone si scollega, ffmpeg resta
                       # aperto ma muto e la lettura non torna più (24 ottobre, 23:16)
QUALITA_JPEG = 80

log = logging.getLogger("telecamera")


def orario(t: float) -> str:
    return time.strftime("%H:%M:%S", time.localtime(t)) + f".{int(t % 1 * 1000):03d}"


# ---------- sorgenti dei fotogrammi ----------

def elenca_telecamere() -> list[str]:
    """Nomi delle telecamere secondo ffmpeg (AVFoundation), nell'ordine dei suoi indici."""
    uscita = subprocess.run(["ffmpeg", "-hide_banner", "-f", "avfoundation", "-list_devices", "true", "-i", ""],
                            capture_output=True, text=True).stderr
    video = uscita.split("video devices:")[-1].split("audio devices:")[0]
    return re.findall(r"\]\s*\[\d+\]\s*(.+)", video)


def scegli_iphone(nomi: list[str]) -> str:
    candidati = [n for n in nomi if "iPhone" in n and "Scrivania" not in n and "Desk" not in n]
    if not candidati:
        raise SystemExit(f"Nessuna Fotocamera Continuity tra le telecamere: {nomi}. "
                         "iPhone vicino, bloccato, con Wi-Fi e Bluetooth attivi?")
    return candidati[0]


class SorgenteIphone:
    """Fotogrammi grezzi da ffmpeg: sceglie il formato vero del dispositivo (non un 640 × 480 ingrandito)."""

    def __init__(self, nome: str):
        self.nome = nome
        self.descrizione = f"{nome} via ffmpeg, {LARGHEZZA} × {ALTEZZA} a {FPS_IPHONE} fps"
        self.fps_nominali = FPS_IPHONE
        self.processo: subprocess.Popen | None = None

    def apri(self) -> None:
        comando = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "avfoundation",
                   "-framerate", str(FPS_IPHONE), "-video_size", f"{LARGHEZZA}x{ALTEZZA}", "-pixel_format", "nv12",
                   "-i", f"{self.nome}:none",
                   # Senza passthrough ffmpeg ripete i fotogrammi per tenere 30 fps «a orologio»: il 24 ottobre ne uscivano
                   # circa 580 al secondo, la coda cresceva e l'immagine restava sempre più indietro.
                   "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"]
        self.processo = subprocess.Popen(comando, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def leggi(self) -> np.ndarray | None:
        dimensione = LARGHEZZA * ALTEZZA * 3
        dati = self.processo.stdout.read(dimensione)
        if len(dati) < dimensione:
            errore = self.processo.stderr.read().decode(errors="replace").strip()
            if errore:
                log.error("ffmpeg: %s", errore[-500:])
            return None
        return np.frombuffer(dati, dtype=np.uint8).reshape(ALTEZZA, LARGHEZZA, 3)

    def chiudi(self) -> None:
        if self.processo and self.processo.poll() is None:
            self.processo.terminate()
            self.processo.wait(timeout=5)


class SorgenteVideo:
    """Un video registrato, riprodotto in tempo reale e da capo: per provare tutto senza l'iPhone."""

    def __init__(self, percorso: Path):
        self.percorso = percorso
        self.descrizione = f"video {percorso.name} (prova)"
        self.cattura = None
        self.fps_nominali = FPS
        self.periodo = 1 / FPS
        self.prossimo = 0.0

    def apri(self) -> None:
        self.cattura = cv2.VideoCapture(str(self.percorso))
        if not self.cattura.isOpened():
            raise SystemExit(f"Video non apribile: {self.percorso}")
        self.fps_nominali = self.cattura.get(cv2.CAP_PROP_FPS) or FPS
        self.periodo = 1 / self.fps_nominali
        self.prossimo = time.monotonic()

    def leggi(self) -> np.ndarray | None:
        ok, fotogramma = self.cattura.read()
        if not ok:
            self.cattura.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ok, fotogramma = self.cattura.read()
        self.prossimo += self.periodo
        time.sleep(max(0.0, self.prossimo - time.monotonic()))
        return fotogramma if ok else None

    def chiudi(self) -> None:
        if self.cattura:
            self.cattura.release()


# ---------- registrazione dei video di prova ----------

class Registrazione:
    """Video H.264 (codificatore del Mac) e, accanto, l'orario di arrivo di ogni fotogramma."""

    def __init__(self, cartella: Path, secondi: int, larghezza: int, altezza: int, fps: float):
        giorno = date.today().isoformat()
        numeri = [int(m.group(1)) for f in cartella.glob(f"{giorno}_postazione_*.mp4")
                  if (m := re.search(r"_(\d+)\.mp4$", f.name))]
        base = cartella / f"{giorno}_postazione_{max(numeri, default=0) + 1:02d}"
        self.video, self.orari = base.with_suffix(".mp4"), Path(f"{base}_fotogrammi.csv")
        self.fine = time.time() + secondi
        self.n = 0
        self.codificatore = subprocess.Popen(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
             "-s", f"{larghezza}x{altezza}", "-r", f"{fps:g}", "-i", "pipe:0",
             "-c:v", "h264_videotoolbox", "-b:v", "12M", "-pix_fmt", "yuv420p", str(self.video)],
            stdin=subprocess.PIPE)
        self.csv = self.orari.open("w", encoding="utf-8")
        self.csv.write("n,t_unix,ora,trovato,x,y\n")

    def scrivi(self, fotogramma: np.ndarray, t: float, marcatore: dict | None) -> None:
        self.n += 1
        self.codificatore.stdin.write(fotogramma.tobytes())
        trovato = bool(marcatore and marcatore["trovato"])
        xy = f"{marcatore['x']:.2f},{marcatore['y']:.2f}" if trovato else ","
        self.csv.write(f"{self.n},{t:.3f},{orario(t)},{int(trovato)},{xy}\n")

    def chiudi(self) -> None:
        self.csv.close()
        self.codificatore.stdin.close()
        self.codificatore.wait(timeout=30)


# ---------- acquisizione (filo separato: non perde fotogrammi mentre si analizza) ----------

class Acquisizione(threading.Thread):
    def __init__(self, sorgente, eventi: deque):
        super().__init__(daemon=True)
        self.sorgente, self.eventi = sorgente, eventi
        self.blocco = threading.Lock()          # ultimo fotogramma e contatori
        self.blocco_video = threading.Lock()    # la registrazione: mai chiusa mentre ci si scrive
        self.ultimo: np.ndarray | None = None
        self.tempi: deque[float] = deque()
        self.fotogrammi = 0
        self.interruzioni = 0
        self.registrazione: Registrazione | None = None
        self.attiva = True
        self.ultimo_segnale = time.time()  # apertura della sorgente o ultimo fotogramma
        self.apertura = time.time()
        self.inseguitore = tracking.Inseguitore()   # P1, cercato in ogni fotogramma
        self.righello = righello.Righello()          # quota in mm ricavata da P1 stesso (zero sul fondo)
        self.marcatore: dict | None = None          # ultimo risultato dell'inseguitore
        self.tempi_riconoscimento: deque[float] = deque()

    def evento(self, testo: str) -> None:
        log.info(testo)
        self.eventi.appendleft({"ora": orario(time.time())[:8], "testo": testo})

    def run(self) -> None:
        while self.attiva:
            try:
                self.sorgente.apri()
                self.ultimo_segnale = self.apertura = time.time()
                self.evento(f"telecamera aperta: {self.sorgente.descrizione}")
                while self.attiva and (fotogramma := self.sorgente.leggi()) is not None:
                    self.nuovo(fotogramma, time.time())
            except OSError as errore:
                log.error("lettura dei fotogrammi: %s", errore)
            self.sorgente.chiudi()
            if self.attiva:
                self.evento("telecamera persa: riprovo tra 2 s")
                time.sleep(2)

    def imposta_colonna(self, roi: list | None) -> None:
        """P1 si cerca solo nella colonna: cambiata la colonna, si riparte da capo."""
        with self.blocco:
            self.inseguitore = tracking.Inseguitore(tuple(roi) if roi else None)
            self.righello.ricomincia()
            self.marcatore = None

    def riconosci(self, fotogramma: np.ndarray, t: float) -> dict | None:
        try:
            marcatore = self.inseguitore.aggiorna(fotogramma, t)
        except ValueError:  # colonna disegnata con un'altra risoluzione: si cerca in tutta l'immagine
            self.imposta_colonna(None)
            self.evento("colonna fuori dall'immagine: P1 si cerca ovunque, ridisegna la colonna")
            marcatore = self.inseguitore.aggiorna(fotogramma, t)
        if marcatore["trovato"]:
            self.righello.aggiorna(t, marcatore["y"], marcatore["altezza"])
        quota = self.righello.quota_mm(marcatore["y"]) if marcatore["y"] is not None else None
        marcatore = {**marcatore, "quota_mm": quota}
        with self.blocco:
            self.marcatore = marcatore
            self.tempi_riconoscimento.append(t)
            while self.tempi_riconoscimento and t - self.tempi_riconoscimento[0] > FINESTRA_FPS_S:
                self.tempi_riconoscimento.popleft()
        return marcatore

    def nuovo(self, fotogramma: np.ndarray, t: float) -> None:
        marcatore = self.riconosci(fotogramma, t)  # circa 1,3 ms a 1920 × 1080: si fa su ogni fotogramma
        with self.blocco:
            if self.tempi and t - self.tempi[-1] > BUCO_S:
                self.interruzioni += 1
                self.evento(f"interruzione di {t - self.tempi[-1]:.1f} s senza fotogrammi")
            self.ultimo = fotogramma
            self.ultimo_segnale = t
            self.fotogrammi += 1
            self.tempi.append(t)
            while self.tempi and t - self.tempi[0] > FINESTRA_FPS_S:
                self.tempi.popleft()
        scaduta = False
        with self.blocco_video:
            if self.registrazione:
                if t < self.registrazione.fine:
                    self.registrazione.scrivi(fotogramma, t, marcatore)
                else:
                    scaduta = True
        if scaduta:
            self.ferma_registrazione()

    def avvia_registrazione(self, cartella: Path, secondi: int) -> None:
        with self.blocco_video:
            if self.ultimo is None or self.registrazione:
                return
            alto, largo = self.ultimo.shape[:2]
            self.registrazione = Registrazione(cartella, secondi, largo, alto, self.sorgente.fps_nominali)
            nome = self.registrazione.video.name
        self.evento(f"registrazione di {secondi} s: {nome}")

    def ferma_registrazione(self) -> None:
        with self.blocco_video:
            registrazione, self.registrazione = self.registrazione, None
            if registrazione:
                registrazione.chiudi()
        if registrazione:
            self.evento(f"registrazione chiusa: {registrazione.n} fotogrammi in {registrazione.video.name}")

    def fotografia(self) -> tuple[np.ndarray | None, list[float], int, int]:
        with self.blocco:
            return self.ultimo, list(self.tempi), self.fotogrammi, self.interruzioni

    def stato_marcatore(self) -> dict | None:
        """L'ultima posizione di P1 per la dashboard, con quanti fotogrammi al secondo vengono riconosciuti."""
        with self.blocco:
            if self.marcatore is None:
                return None
            fps = p.statistiche_fotogrammi(list(self.tempi_riconoscimento))["fps"]
            scala = self.righello.scala()
            return {**self.marcatore, "fps": fps, "scala": None if scala is None else {
                "altezza_px": scala.altezza_px, "k": scala.k, "y_fondo": scala.y_fondo,
                "altezza_mm": self.righello.altezza_mm, "provvisoria": True}}


# ---------- configurazione e analisi ----------

def leggi_config() -> dict:
    if FILE_CONFIG.exists():
        return json.loads(FILE_CONFIG.read_text(encoding="utf-8"))
    return {"roi": None, "riferimento": None}


def salva_config(config: dict) -> None:
    CONFIG.mkdir(parents=True, exist_ok=True)
    p.scrivi_atomico(FILE_CONFIG, (json.dumps(config, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))


def jpeg(immagine: np.ndarray, qualita: int = QUALITA_JPEG) -> bytes:
    ok, dati = cv2.imencode(".jpg", immagine, [cv2.IMWRITE_JPEG_QUALITY, qualita])
    if not ok:
        raise ValueError("codifica JPEG non riuscita")
    return dati.tobytes()


def dentro(zona: dict, roi: list) -> bool:
    x, y, w, h = roi
    cx, cy = zona["x"] + zona["w"] / 2, zona["y"] + zona["h"] / 2
    return x <= cx <= x + w and y <= cy <= y + h


def misura(fotogramma: np.ndarray, roi: list | None) -> tuple[dict, np.ndarray, np.ndarray]:
    """Misure della postazione su un fotogramma, più le due anteprime ridotte (normale e maschera del rosso)."""
    alto, largo = fotogramma.shape[:2]
    scala = largo / LARGHEZZA_ANTEPRIMA
    ridotto = cv2.resize(fotogramma, (LARGHEZZA_ANTEPRIMA, round(alto / scala)), interpolation=cv2.INTER_AREA)
    maschera = p.maschera_rosso(ridotto)
    try:
        colonna = cv2.cvtColor(p.ritaglia(fotogramma, tuple(roi) if roi else None), cv2.COLOR_BGR2GRAY)
    except ValueError:  # colonna disegnata con un'altra risoluzione
        colonna = cv2.cvtColor(fotogramma, cv2.COLOR_BGR2GRAY)
    misure = {
        "larghezza": largo, "altezza": alto,
        "luminosita": p.luminosita(colonna),
        "riflessi_pct": p.percentuale_riflessi(colonna),
        "nitidezza": p.nitidezza(colonna),
        "zone_rosse": p.zone_rosse(maschera, scala=scala)[:10],
    }
    # Quelle con il centro dentro la colonna: le sole che contano, perché lì il programma cercherà P1 (2.2).
    misure["zone_rosse_colonna"] = [z for z in misure["zone_rosse"] if dentro(z, roi)] if roi else misure["zone_rosse"]
    return misure, ridotto, p.anteprima_rosso(ridotto, maschera)


def giudica(stato: dict) -> dict | None:
    try:
        return p.verdetto_postazione(stato)
    except NotImplementedError:
        return None
    except Exception:  # un errore nel giudizio non deve fermare la telecamera
        log.exception("errore in verdetto_postazione")
        return None


class Postazione:
    """Il ciclo principale: comandi, misure, anteprime e stato, 5 volte al secondo."""

    def __init__(self, acquisizione: Acquisizione, cartella: Path, eventi: deque):
        self.acq, self.cartella, self.eventi = acquisizione, cartella, eventi
        self.config = leggi_config()
        self.acq.imposta_colonna(self.config.get("roi"))
        self.luci: deque[tuple[float, float]] = deque()
        self.avvisato_fps = False
        self.ultimo_riavvio = 0.0

    def esegui(self, comando: dict, fotogramma: np.ndarray | None, misure: dict | None) -> None:
        nome = comando["comando"]
        if nome in ("roi", "roi_via"):
            self.config["roi"] = [comando[k] for k in ("x", "y", "w", "h")] if nome == "roi" else None
            self.luci.clear()  # la luminosità di un'altra zona non è confrontabile
            self.acq.imposta_colonna(self.config["roi"])
            salva_config(self.config)
            self.acq.evento(f"colonna: {self.config['roi']}" if nome == "roi" else "colonna tolta: misure su tutta l'immagine")
        elif nome == "registra":
            self.acq.avvia_registrazione(self.cartella, comando["secondi"])
        elif nome == "ferma":
            self.acq.ferma_registrazione()
        elif nome == "riferimento" and fotogramma is not None:
            self.salva_riferimento(fotogramma, misure)

    def salva_riferimento(self, fotogramma: np.ndarray, misure: dict | None) -> None:
        adesso = time.time()
        dati = jpeg(fotogramma, 92)
        CONFIG.mkdir(parents=True, exist_ok=True)
        p.scrivi_atomico(FILE_RIFERIMENTO, dati)
        p.scrivi_atomico(self.cartella / f"riferimento_{time.strftime('%H%M%S', time.localtime(adesso))}.jpg", dati)
        chiavi = ("larghezza", "altezza", "luminosita", "riflessi_pct", "nitidezza")
        self.config["riferimento"] = {"data": date.today().isoformat(), "ora": orario(adesso)[:8],
                                      "roi": self.config.get("roi"), **{k: (misure or {}).get(k) for k in chiavi}}
        salva_config(self.config)
        self.acq.evento("riferimento salvato")

    def deriva(self, adesso: float, luce: float) -> tuple[float | None, float]:
        self.luci.append((adesso, luce))
        while self.luci and adesso - self.luci[0][0] > FINESTRA_DERIVA_S:
            self.luci.popleft()
        return p.deriva_percentuale([v for _, v in self.luci]), adesso - self.luci[0][0]

    def controlla_silenzio(self, adesso: float) -> None:
        """Se la sorgente tace da troppo, la chiude: la lettura bloccata torna e il filo di acquisizione la riapre."""
        if adesso - self.acq.ultimo_segnale > SILENZIO_S and adesso - self.ultimo_riavvio > 2 * SILENZIO_S:
            self.ultimo_riavvio = adesso
            self.acq.evento(f"nessun fotogramma da {SILENZIO_S:.0f} s: riavvio la telecamera")
            self.acq.sorgente.chiudi()

    def giro(self) -> None:
        fotogramma, tempi, fotogrammi, interruzioni = self.acq.fotografia()
        adesso = time.time()
        self.controlla_silenzio(adesso)
        misure, anteprima, rosso = (misura(fotogramma, self.config.get("roi")) if fotogramma is not None
                                    else (None, None, None))
        comandi, errori = p.leggi_comandi(self.cartella / "comandi")
        for errore in errori:
            self.acq.evento(f"comando scartato: {errore}")
        for comando in comandi:
            self.esegui(comando, fotogramma, misure)
        stato = {"ora": orario(adesso)[:8], "t": adesso, "sorgente": self.acq.sorgente.descrizione,
                 "fotogrammi": fotogrammi, "interruzioni": interruzioni, "roi": self.config.get("roi"),
                 **p.statistiche_fotogrammi(tempi), "eventi": list(self.eventi)[:12]}
        if tempi and adesso - tempi[-1] > BUCO_S:
            stato["fps"] = 0.0  # nessun fotogramma recente: l'ultimo dato non è più vero
        # nei primi 3 s ffmpeg consegna di colpo i fotogrammi che aveva in memoria (24 ottobre: 553 fps all'avvio)
        appena_aperta = adesso - self.acq.apertura < 3
        if (stato.get("fps") or 0) > self.acq.sorgente.fps_nominali * 1.5 and not appena_aperta and not self.avvisato_fps:
            self.avvisato_fps = True  # un avviso basta: più fps di quanti l'iPhone ne mandi sono fotogrammi ripetuti
            self.acq.evento(f"fotogrammi troppo veloci ({stato['fps']:.0f} fps): sono ripetuti, l'immagine è in ritardo")
        if misure:
            deriva, finestra = self.deriva(adesso, misure["luminosita"])
            riferimento = self.config.get("riferimento") or {}
            stato |= misure | {"deriva_pct": deriva, "deriva_finestra_s": finestra,
                               "nitidezza_riferimento": riferimento.get("nitidezza")}
            p.scrivi_atomico(self.cartella / "anteprima.jpg", jpeg(anteprima))
            p.scrivi_atomico(self.cartella / "rosso.jpg", jpeg(rosso))
        registrazione = self.acq.registrazione
        stato["registrazione"] = ({"attiva": True, "file": registrazione.video.name,
                                   "secondi_rimasti": max(0, round(registrazione.fine - adesso))}
                                  if registrazione else {"attiva": False})
        stato["riferimento"] = self.config.get("riferimento")
        stato["marcatore"] = self.acq.stato_marcatore()
        stato["verdetto"] = giudica(stato)
        p.scrivi_atomico(self.cartella / "stato.json", json.dumps(stato, ensure_ascii=False).encode("utf-8"))


def main() -> None:
    giorno = date.today().isoformat()
    parser = argparse.ArgumentParser(description="Telecamera della postazione di ripresa (2.1)")
    parser.add_argument("--elenco", action="store_true", help="elenca le telecamere ed esce")
    parser.add_argument("--dispositivo", help="nome della telecamera (di solito si trova da solo)")
    parser.add_argument("--video", type=Path, help="usa un video registrato al posto della telecamera")
    parser.add_argument("--cartella", type=Path, default=RADICE / "dati" / giorno / "telecamera")
    argomenti = parser.parse_args()
    if argomenti.elenco:
        for i, nome in enumerate(elenca_telecamere()):
            print(f"[{i}] {nome}")
        return

    cartella = argomenti.cartella.resolve()
    (cartella / "comandi").mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S",
                        handlers=[logging.StreamHandler(),
                                  logging.FileHandler(cartella / "telecamera.log", encoding="utf-8")])
    sorgente = (SorgenteVideo(argomenti.video) if argomenti.video
                else SorgenteIphone(argomenti.dispositivo or scegli_iphone(elenca_telecamere())))
    eventi: deque = deque(maxlen=50)
    acquisizione = Acquisizione(sorgente, eventi)
    acquisizione.start()
    postazione = Postazione(acquisizione, cartella, eventi)
    log.info("cartella: %s (Ctrl+C per chiudere)", cartella)
    try:
        while True:
            inizio = time.monotonic()
            postazione.giro()
            time.sleep(max(0.0, PERIODO_ANALISI_S - (time.monotonic() - inizio)))
    except KeyboardInterrupt:
        log.info("chiusura")
    finally:
        acquisizione.attiva = False
        acquisizione.ferma_registrazione()
        sorgente.chiudi()


if __name__ == "__main__":
    main()
