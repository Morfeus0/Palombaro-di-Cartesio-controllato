"""Video di un esperimento con quota, sovrapressione e comando scritti sopra (2.7, video di M2).

Mette insieme il video della telecamera (con l'orario vero di ogni fotogramma, dal file `_fotogrammi.csv`)
e il file dell'esperimento del ponte (pc/bridge.py, una riga ogni 10 ms): a sinistra la bottiglia con il
riquadro su P1, a destra i numeri del momento e i grafici di tutta la prova con il cursore che avanza.

Uso:  .venv/bin/python pc/video_esperimento.py <video.mp4> <esperimento.csv> <uscita.mp4> \
          --riferimento-kpa 101.64 --titolo "M2 · quota e pressione registrate insieme"
"""
import argparse
import bisect
import csv
import subprocess
from pathlib import Path
from typing import NamedTuple

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

LARGHEZZA, ALTEZZA, FPS_USCITA = 1280, 720, 30
RITAGLIO = (656, 40, 600, 1040)       # x, y, larghezza, altezza nel fotogramma 1920 × 1080: la bottiglia
LATO_PANNELLO = 440                   # da qui in poi, a destra, numeri e grafici
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
SFONDO, INCHIOSTRO, GRIGIO = (24, 24, 27), (240, 240, 240), (150, 150, 155)
COLORE_QUOTA, COLORE_P, VERDE = (90, 170, 255), (255, 150, 70), (80, 210, 110)


class Campione(NamedTuple):
    t: float            # orario del Mac (time.time())
    quota_cm: float
    dp_kpa: float       # sovrapressione rispetto al riferimento
    comando: float      # gradi del servo


def leggi_esperimento(righe, riferimento_pa: float) -> list[Campione]:
    """Le righe del CSV del ponte (intestazione `#` compresa) diventano campioni ordinati nel tempo."""
    dati = csv.DictReader(r for r in righe if not r.startswith("#"))
    return [Campione(float(r["t_mac"]), int(r["quota_dmm"]) / 100, (int(r["p_pa"]) - riferimento_pa) / 1000,
                     int(r["u_decimi"]) / 10) for r in dati if r["quota_dmm"] != ""]


def campione_al(campioni: list[Campione], tempi: list[float], t: float) -> Campione:
    """Il primo campione registrato dopo l'istante t (la quota del fotogramma arriva al ponte entro pochi ms)."""
    i = min(bisect.bisect_left(tempi, t), len(campioni) - 1)
    return campioni[i]


def virgola(valore: float, cifre: int, segno: bool = False) -> str:
    testo = f"{valore:+.{cifre}f}" if segno else f"{valore:.{cifre}f}"
    return testo.replace(".", ",").replace("-", "−")


class Grafico(NamedTuple):
    x: int
    y: int
    w: int
    h: int
    minimo: float
    massimo: float

    def punto(self, frazione: float, valore: float) -> tuple[int, int]:
        v = (min(max(valore, self.minimo), self.massimo) - self.minimo) / (self.massimo - self.minimo)
        return int(self.x + frazione * self.w), int(self.y + self.h - v * self.h)


def font(dimensione: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, dimensione)


def disegna_traccia(d: ImageDraw.ImageDraw, g: Grafico, campioni: list[Campione], campo: str,
                    colore: tuple, etichetta: str, tacche: list[float], t0: float, durata: float) -> None:
    d.rectangle([g.x, g.y, g.x + g.w, g.y + g.h], outline=(60, 60, 66))
    for v in tacche:
        _, yv = g.punto(0, v)
        d.line([g.x, yv, g.x + g.w, yv], fill=(45, 45, 50))
        d.text((g.x - 8, yv), virgola(v, 0 if v == int(v) else 1), font=font(13), fill=GRIGIO, anchor="rm")
    passo = max(1, len(campioni) // 1200)
    punti = [g.punto((c.t - t0) / durata, getattr(c, campo)) for c in campioni[::passo]]
    d.line(punti, fill=colore, width=2)
    d.text((g.x, g.y - 8), etichetta, font=font(15), fill=colore, anchor="ls")


def sfondo_pannello(campioni: list[Campione], titolo: str, sottotitolo: str) -> tuple[np.ndarray, list[Grafico]]:
    """La parte fissa del pannello: titolo e grafici completi. Ogni fotogramma aggiunge numeri e cursore."""
    img = Image.new("RGB", (LARGHEZZA - LATO_PANNELLO, ALTEZZA), SFONDO)
    d = ImageDraw.Draw(img)
    d.text((24, 36), titolo, font=font(26), fill=INCHIOSTRO, anchor="ls")
    d.text((24, 62), sottotitolo, font=font(14), fill=GRIGIO, anchor="ls")
    t0, durata = campioni[0].t, campioni[-1].t - campioni[0].t
    larghezza = LARGHEZZA - LATO_PANNELLO - 80
    gq = Grafico(56, 300, larghezza, 150, 0, 20)
    gp = Grafico(56, 510, larghezza, 150, -0.5, 3.5)
    disegna_traccia(d, gq, campioni, "quota_cm", COLORE_QUOTA, "Quota di P1 [cm]", [0, 5, 10, 15, 20], t0, durata)
    disegna_traccia(d, gp, campioni, "dp_kpa", COLORE_P, "Sovrapressione nella bottiglia [kPa]",
                    [0, 1, 2, 3], t0, durata)
    for s in range(0, int(durata) + 1, 20):
        x, _ = gp.punto(s / durata, 0)
        d.text((x, gp.y + gp.h + 18), f"{s} s", font=font(13), fill=GRIGIO, anchor="mm")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR), [gq, gp]


def pannello(base: np.ndarray, grafici: list[Grafico], c: Campione, frazione: float, ora: str) -> np.ndarray:
    img = Image.fromarray(cv2.cvtColor(base, cv2.COLOR_BGR2RGB))
    d = ImageDraw.Draw(img)
    colonne = [("Quota", f"{virgola(c.quota_cm, 1)} cm", COLORE_QUOTA),
               ("Sovrapressione", f"{virgola(c.dp_kpa, 2, segno=True)} kPa", COLORE_P),
               ("Comando servo", f"{virgola(c.comando, 0)}°", INCHIOSTRO)]
    for i, (nome, valore, colore) in enumerate(colonne):
        x = 24 + i * 270
        d.text((x, 118), nome, font=font(15), fill=GRIGIO, anchor="ls")
        d.text((x, 170), valore, font=font(40), fill=colore, anchor="ls")
    d.text((24, 222), ora, font=font(15), fill=GRIGIO, anchor="ls")
    for g, valore, colore in ((grafici[0], c.quota_cm, COLORE_QUOTA), (grafici[1], c.dp_kpa, COLORE_P)):
        x, y = g.punto(frazione, valore)
        d.line([x, g.y, x, g.y + g.h], fill=(200, 200, 205), width=1)
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=colore)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def bottiglia(fotogramma: np.ndarray, riga: dict) -> np.ndarray:
    """Il ritaglio della bottiglia ridotto all'altezza del video, con il riquadro verde su P1."""
    x0, y0, w, h = RITAGLIO
    scala = ALTEZZA / h
    img = cv2.resize(fotogramma[y0:y0 + h, x0:x0 + w], (int(w * scala), ALTEZZA), interpolation=cv2.INTER_AREA)
    if riga["trovato"] == "1" and riga["x"]:
        cx, cy = (float(riga["x"]) - x0) * scala, (float(riga["y"]) - y0) * scala
        cv2.rectangle(img, (int(cx - 20), int(cy - 24)), (int(cx + 20), int(cy + 24)), VERDE[::-1], 2)
    return img


def componi(video: Path, esperimento: Path, uscita: Path, riferimento_kpa: float, titolo: str) -> int:
    with esperimento.open(encoding="utf-8") as f:
        campioni = leggi_esperimento(f, riferimento_kpa * 1000)
    tempi = [c.t for c in campioni]
    with video.with_name(f"{video.stem}_fotogrammi.csv").open(encoding="utf-8") as f:
        fotogrammi = list(csv.DictReader(f))
    sottotitolo = (f"{esperimento.stem} · scheda a 100 righe/s · telecamera {video.stem} · "
                   f"sovrapressione rispetto a {virgola(riferimento_kpa, 2)} kPa")
    base, grafici = sfondo_pannello(campioni, titolo, sottotitolo)
    t0, durata = campioni[0].t, campioni[-1].t - campioni[0].t
    fps_video = (len(fotogrammi) - 1) / (float(fotogrammi[-1]["t_unix"]) - float(fotogrammi[0]["t_unix"]))
    ogni = max(1, round(fps_video / FPS_USCITA))
    codifica = subprocess.Popen(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{LARGHEZZA}x{ALTEZZA}", "-r", f"{fps_video / ogni:.3f}", "-i", "pipe:0",
         "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         str(uscita)], stdin=subprocess.PIPE)
    cattura, scritti = cv2.VideoCapture(str(video)), 0
    try:
        for n, riga in enumerate(fotogrammi):
            ok, fotogramma = cattura.read()
            if not ok:
                break
            if n % ogni:
                continue
            t = float(riga["t_unix"])
            c = campione_al(campioni, tempi, t)
            tela = np.empty((ALTEZZA, LARGHEZZA, 3), np.uint8)
            tela[:] = SFONDO[::-1]
            sinistra = bottiglia(fotogramma, riga)
            tela[:, :sinistra.shape[1]] = sinistra
            ora = f"{riga['ora']}  ·  t = {virgola(max(0.0, t - t0), 1)} s"
            tela[:, LATO_PANNELLO:] = pannello(base, grafici, c, min(max((t - t0) / durata, 0), 1), ora)
            codifica.stdin.write(tela.tobytes())
            scritti += 1
    finally:
        cattura.release()
        codifica.stdin.close()
        codifica.wait(timeout=600)
    return scritti


def main() -> None:
    parser = argparse.ArgumentParser(description="Video di un esperimento con i dati sovrapposti")
    parser.add_argument("video", type=Path)
    parser.add_argument("esperimento", type=Path)
    parser.add_argument("uscita", type=Path)
    parser.add_argument("--riferimento-kpa", type=float, required=True,
                        help="pressione della stanza alla chiusura del circuito, in kPa")
    parser.add_argument("--titolo", default="Quota e pressione registrate insieme")
    a = parser.parse_args()
    n = componi(a.video, a.esperimento, a.uscita, a.riferimento_kpa, a.titolo)
    print(f"{a.uscita}: {n} fotogrammi")


if __name__ == "__main__":
    main()
