"""Riconoscimento del palombaro P1 nel video (sottofase 2.2): il centro del marcatore rosso, fotogramma per fotogramma.

Il rosso è quello di pc/postazione.py (stesse soglie della maschera della dashboard) e si cerca solo dentro la colonna
d'acqua disegnata nella dashboard (pc/config/postazione.json): il rosso fuori dalla colonna non conta. Tra più zone
rosse vince la più grande: il marcatore è circa 2700 pixel, il pezzetto di filo rosso del cavo in cima circa 50.
Le coordinate sono in pixel dell'immagine a piena risoluzione; la conversione in centimetri è della 2.3.

Uso su un video registrato (dalla cartella del progetto):
  .venv/bin/python pc/tracking.py dati/2026-10-24/telecamera/2026-10-24_postazione_05.mp4
  .venv/bin/python pc/tracking.py <video> --annotato media/<nome>.mp4     # video con il riquadro sovrapposto
Scrive accanto al video <nome>_marcatore.csv (n, t, ora, trovato, x, y, area) e stampa il riassunto.
"""
import argparse
import csv
import json
import logging
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

import postazione as p

RADICE = Path(__file__).resolve().parents[1]
FILE_CONFIG = RADICE / "pc" / "config" / "postazione.json"
AREA_MIN_MARCATORE = 300  # pixel a piena risoluzione: circa un decimo del marcatore; il filo del cavo ne fa circa 50
# Il marcatore misura 1400–4800 pixel lungo la colonna (video del 24 ottobre). Una zona «rossa» più grande è
# qualcos'altro davanti alla bottiglia (nel video 03 una mano: 5000–36000 pixel) e in quel fotogramma non ci si fida.
AREA_MAX_MARCATORE = 8000
TOLLERANZA_S = 0.25       # un buco più breve si scavalca tenendo l'ultima posizione; oltre, P1 è «perso»
# P1 si muove al massimo di 13 pixel per fotogramma (video 05: circa 300 px/s, 9,5 cm/s). Un salto più lungo di
# SALTO_MIN_PX + VELOCITA_MAX_PX_S · Δt non è P1: si scarta, finché il palombaro non è dato per perso.
VELOCITA_MAX_PX_S = 1000
SALTO_MIN_PX = 25
MM_PER_PIXEL_PROVVISORIO = 0.31  # misurato a occhio sul metro il 24 ottobre; quello vero viene dalla 2.3
LARGHEZZA_ANNOTATO = 1280

log = logging.getLogger("tracking")


@dataclass(frozen=True)
class Marcatore:
    x: float                              # centro, in pixel dell'immagine intera
    y: float
    area: int                             # pixel rossi della zona
    riquadro: tuple[int, int, int, int]   # x, y, larghezza, altezza


def trova_marcatore(bgr: np.ndarray, roi: tuple[int, int, int, int] | None = None,
                    area_min: int = AREA_MIN_MARCATORE, area_max: int = AREA_MAX_MARCATORE) -> Marcatore | None:
    """Il marcatore rosso dentro la colonna (o in tutta l'immagine se roi è None); None se non c'è.

    None anche se la zona rossa più grande supera area_max: qualcosa copre la scena e la posizione non è sicura.
    ValueError se la colonna è fuori dall'immagine (disegnata con un'altra risoluzione).
    """
    pezzo = p.ritaglia(bgr, roi)
    x0, y0 = (max(0, roi[0]), max(0, roi[1])) if roi else (0, 0)
    n, _, statistiche, centri = cv2.connectedComponentsWithStats(p.maschera_rosso(pezzo), connectivity=8)
    if n <= 1:  # solo lo sfondo
        return None
    i = 1 + int(np.argmax(statistiche[1:, cv2.CC_STAT_AREA]))
    x, y, w, h, area = (int(v) for v in statistiche[i])
    if not area_min <= area <= area_max:
        return None
    return Marcatore(x=float(centri[i][0]) + x0, y=float(centri[i][1]) + y0, area=area, riquadro=(x + x0, y + y0, w, h))


class Inseguitore:
    """Segue P1 fotogramma dopo fotogramma e decide quando è «perso».

    Se il marcatore manca per poco (un riflesso, il menisco in superficie) si tiene l'ultima posizione buona;
    oltre `tolleranza_s` il palombaro è perso, e chi usa la quota (il controllore, fase 4) deve fermarsi.
    """

    def __init__(self, roi: tuple[int, int, int, int] | None = None, area_min: int = AREA_MIN_MARCATORE,
                 tolleranza_s: float = TOLLERANZA_S):
        self.roi, self.area_min, self.tolleranza_s = roi, area_min, tolleranza_s
        self.ultimo: Marcatore | None = None
        self.t_ultimo: float | None = None

    def plausibile(self, m: Marcatore, t: float) -> bool:
        """Vero se P1 può essere arrivato lì dall'ultima posizione buona; dopo una perdita va bene ovunque."""
        if self.ultimo is None or t - self.t_ultimo > self.tolleranza_s:
            return True
        salto = float(np.hypot(m.x - self.ultimo.x, m.y - self.ultimo.y))
        return salto <= SALTO_MIN_PX + VELOCITA_MAX_PX_S * (t - self.t_ultimo)

    def aggiorna(self, bgr: np.ndarray, t: float) -> dict:
        m = trova_marcatore(bgr, self.roi, self.area_min)
        if m and not self.plausibile(m, t):
            m = None
        if m:
            self.ultimo, self.t_ultimo = m, t
        da_quanto = None if self.t_ultimo is None else t - self.t_ultimo
        perso = m is None and (da_quanto is None or da_quanto > self.tolleranza_s)
        u = self.ultimo
        return {"t": t, "trovato": m is not None, "perso": perso, "da_quanto_s": da_quanto,
                "x": u.x if u else None, "y": u.y if u else None, "area": m.area if m else 0,
                "riquadro": m.riquadro if m else None}


def riassunto(righe: list[dict], tolleranza_s: float = TOLLERANZA_S) -> dict:
    """Quanto bene è andato il riconoscimento su una serie di fotogrammi (righe con t, trovato, x, y).

    Un buco va dall'ultimo fotogramma con il marcatore al primo in cui ricompare; è una perdita se dura più
    della tolleranza. Il «Fatto quando» della 2.2 chiede nessuna perdita in 2 minuti di movimento.
    """
    trovate = [r for r in righe if r["trovato"]]
    buchi, inizio = [], None
    t_visto = righe[0]["t"] if righe else 0.0
    for r in righe:
        if r["trovato"]:
            if inizio is not None:
                buchi.append(r["t"] - t_visto)
                inizio = None
            t_visto = r["t"]
        elif inizio is None:
            inizio = r["t"]
    if inizio is not None:  # il video finisce con il marcatore assente
        buchi.append(righe[-1]["t"] - t_visto)
    y = np.array([r["y"] for r in trovate], dtype=float)
    x = np.array([r["x"] for r in trovate], dtype=float)
    return {
        "fotogrammi": len(righe),
        "durata_s": righe[-1]["t"] - righe[0]["t"] if righe else 0.0,
        "trovati_pct": 100.0 * len(trovate) / len(righe) if righe else 0.0,
        "buchi": len(buchi),
        "buco_max_s": max(buchi, default=0.0),
        "perdite": sum(1 for b in buchi if b > tolleranza_s),
        "y_min": float(y.min()) if y.size else None,
        "y_max": float(y.max()) if y.size else None,
        "x_dev_px": float(x.std()) if x.size else None,
        "y_dev_px": float(y.std()) if y.size else None,
    }


# ---------- analisi di un video registrato ----------

def roi_dalla_config(larghezza: int, altezza: int) -> tuple[int, int, int, int] | None:
    """La colonna salvata dalla dashboard, se il video ha la risoluzione con cui è stata disegnata."""
    if not FILE_CONFIG.exists() or (larghezza, altezza) != (1920, 1080):
        return None
    roi = json.loads(FILE_CONFIG.read_text(encoding="utf-8")).get("roi")
    return tuple(roi) if roi else None


def orari_fotogrammi(video: Path) -> list[float] | None:
    """Gli istanti veri dei fotogrammi, dal file che pc/telecamera.py scrive accanto a ogni video."""
    file = video.with_name(f"{video.stem}_fotogrammi.csv")
    if not file.exists():
        return None
    with file.open(encoding="utf-8") as f:
        return [float(r["t_unix"]) for r in csv.DictReader(f)]


def annota(fotogramma: np.ndarray, r: dict, roi: tuple | None) -> np.ndarray:
    """Il fotogramma ridotto con la colonna (blu), il riquadro del marcatore (verde) e la quota in pixel."""
    scala = LARGHEZZA_ANNOTATO / fotogramma.shape[1]
    img = cv2.resize(fotogramma, None, fx=scala, fy=scala, interpolation=cv2.INTER_AREA)
    s = lambda v: int(round(v * scala))  # noqa: E731
    if roi:
        cv2.rectangle(img, (s(roi[0]), s(roi[1])), (s(roi[0] + roi[2]), s(roi[1] + roi[3])), (200, 120, 30), 1)
    if r["trovato"]:
        x, y, w, h = r["riquadro"]
        cv2.rectangle(img, (s(x) - 3, s(y) - 3), (s(x + w) + 3, s(y + h) + 3), (60, 200, 60), 2)
        cv2.drawMarker(img, (s(r["x"]), s(r["y"])), (60, 200, 60), cv2.MARKER_CROSS, 18, 1)
        testo = f"y = {r['y']:.1f} px   area {r['area']}"
    else:
        testo = "PERSO" if r["perso"] else f"buco {r['da_quanto_s']:.2f} s"
    colore = (60, 200, 60) if r["trovato"] else (40, 40, 230)
    cv2.putText(img, f"{r['ora']}  {testo}", (12, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 4, cv2.LINE_AA)
    cv2.putText(img, f"{r['ora']}  {testo}", (12, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, colore, 1, cv2.LINE_AA)
    return img


def apri_annotato(uscita: Path, larghezza: int, altezza: int, fps: float) -> subprocess.Popen:
    """Video compresso (H.264, qualità 26) per media/: leggero ma con il riquadro leggibile."""
    uscita.parent.mkdir(parents=True, exist_ok=True)
    return subprocess.Popen(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{larghezza}x{altezza}", "-r", f"{fps:g}", "-i", "pipe:0",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-pix_fmt", "yuv420p", str(uscita)],
        stdin=subprocess.PIPE)


def analizza_video(video: Path, roi: tuple | None, annotato: Path | None) -> tuple[list[dict], float]:
    """Riconosce P1 in ogni fotogramma; restituisce le righe e il tempo speso solo nel riconoscimento."""
    cattura = cv2.VideoCapture(str(video))
    if not cattura.isOpened():
        raise SystemExit(f"Video non apribile: {video}")
    fps = cattura.get(cv2.CAP_PROP_FPS) or 60.0
    orari = orari_fotogrammi(video)
    inseguitore = Inseguitore(roi)
    righe, tempo_analisi, codificatore = [], 0.0, None
    try:
        while True:
            ok, fotogramma = cattura.read()
            if not ok:
                break
            n = len(righe) + 1
            t = orari[n - 1] if orari and n <= len(orari) else (n - 1) / fps
            inizio = time.perf_counter()
            r = inseguitore.aggiorna(fotogramma, t)
            tempo_analisi += time.perf_counter() - inizio
            r |= {"n": n, "ora": time.strftime("%H:%M:%S", time.localtime(t)) + f".{int(t % 1 * 1000):03d}"
                  if orari else f"{t:9.3f} s"}
            righe.append(r)
            if annotato:
                img = annota(fotogramma, r, roi)
                codificatore = codificatore or apri_annotato(annotato, img.shape[1], img.shape[0], fps)
                codificatore.stdin.write(img.tobytes())
    finally:
        cattura.release()
        if codificatore:
            codificatore.stdin.close()
            codificatore.wait(timeout=120)
    return righe, tempo_analisi


def scrivi_csv(righe: list[dict], uscita: Path) -> None:
    with uscita.open("w", encoding="utf-8", newline="") as f:
        scrittore = csv.writer(f)
        scrittore.writerow(["n", "t", "ora", "trovato", "x", "y", "area"])
        for r in righe:
            xy = (f"{r['x']:.2f}", f"{r['y']:.2f}") if r["trovato"] else ("", "")
            scrittore.writerow([r["n"], f"{r['t']:.3f}", r["ora"], int(r["trovato"]), *xy, r["area"]])


def main() -> None:
    parser = argparse.ArgumentParser(description="Riconoscimento di P1 in un video registrato (2.2)")
    parser.add_argument("video", type=Path)
    parser.add_argument("--roi", type=int, nargs=4, metavar=("X", "Y", "L", "A"),
                        help="colonna d'acqua in pixel (di solito si legge da pc/config/postazione.json)")
    parser.add_argument("--tutta", action="store_true", help="cerca in tutta l'immagine, senza colonna")
    parser.add_argument("--annotato", type=Path, help="scrive un video con il riquadro del riconoscimento")
    argomenti = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    cattura = cv2.VideoCapture(str(argomenti.video))
    larghezza, altezza = int(cattura.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cattura.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cattura.release()
    roi = None if argomenti.tutta else (tuple(argomenti.roi) if argomenti.roi else roi_dalla_config(larghezza, altezza))
    log.info("%s: %d × %d, colonna %s", argomenti.video.name, larghezza, altezza, roi or "tutta l'immagine")

    righe, tempo_analisi = analizza_video(argomenti.video, roi, argomenti.annotato)
    if not righe:
        raise SystemExit("Nessun fotogramma letto")
    uscita = argomenti.video.with_name(f"{argomenti.video.stem}_marcatore.csv")
    scrivi_csv(righe, uscita)
    r = riassunto(righe)
    log.info("fotogrammi %d in %.1f s · trovato nel %.1f %% · buchi %d (il più lungo %.2f s) · perdite %d",
             r["fotogrammi"], r["durata_s"], r["trovati_pct"], r["buchi"], r["buco_max_s"], r["perdite"])
    if r["y_min"] is not None:
        log.info("y da %.1f a %.1f px (circa %.1f cm) · deviazione x %.2f px, y %.2f px",
                 r["y_min"], r["y_max"], (r["y_max"] - r["y_min"]) * MM_PER_PIXEL_PROVVISORIO / 10,
                 r["x_dev_px"], r["y_dev_px"])
    log.info("riconoscimento: %.1f ms per fotogramma, cioè fino a %.0f fotogrammi al secondo",
             1000 * tempo_analisi / len(righe), len(righe) / tempo_analisi)
    log.info("righe in %s%s", uscita, f"; video annotato in {argomenti.annotato}" if argomenti.annotato else "")


if __name__ == "__main__":
    main()
