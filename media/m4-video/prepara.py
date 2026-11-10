"""Prepara il materiale del video di M4 (10 novembre 2026, prova 2026-11-10_4-5-pid-m4_04).

Tutto si riporta allo stesso orologio, con lo zero alle 20:10:55,000:
- banco: il video della telecamera ha meno fotogrammi dove l'iPhone si è fermato; lo si rifà a 30 fps a tempo
  reale dagli orari veri di ogni fotogramma (_fotogrammi.csv), tenendo l'ultimo durante le pause, ritagliato
  sulla bottiglia;
- esterno: il video di Gabriele (IMG_1096.MOV) comincia alle 20:10:42,10 (servo che parte all'ingresso in HOLD a
  20,63 s del video, HOLD alle 20:11:02,70 nel registro; controllato sul gradino: 58,5 s ↔ 20:11:40,6);
- dati: quota, quota voluta, pressione, pressione voluta e servo dal CSV della prova, a 30 campioni al secondo.

Uso (dalla cartella del progetto):  ../../.venv/bin/python prepara.py
"""
import csv
import gzip
import json
import subprocess
from pathlib import Path

import cv2

QUI = Path(__file__).resolve().parent
RADICE = QUI.parents[1]
DATI = RADICE / "dati" / "2026-11-10"
ASSETS = QUI / "assets"
VIDEO_BANCO = DATI / "telecamera" / "2026-11-10_postazione_06.mp4"
FOTOGRAMMI = DATI / "telecamera" / "2026-11-10_postazione_06_fotogrammi.csv"
VIDEO_ESTERNO = Path("/Users/gabrielecaruso/Downloads/IMG_1096.MOV")
CSV_PROVA = DATI / "2026-11-10_4-5-pid-m4_04.csv"

FPS = 30
DURATA = 138.5                     # s: dalle 20:10:55,0 alle 20:13:13,5
INIZIO_ESTERNO = 42.10             # 20:10:42,10 in secondi dopo le 20:10
RITAGLIO_BANCO = (640, 0, 520, 1080)          # x, y, larghezza, altezza: la bottiglia con un po' di margine
RITAGLIO_ESTERNO = "2880:1620:720:480"        # siringa, servo e bordo della bottiglia (4K)


def zero_unix() -> float:
    """L'istante 20:10:55,000 nell'orologio del Mac, dalla prima riga degli orari dei fotogrammi."""
    with FOTOGRAMMI.open(encoding="utf-8") as f:
        prima = next(csv.DictReader(f))
    h, m, s = prima["ora"].split(":")
    secondi = int(h) * 3600 + int(m) * 60 + float(s)
    return float(prima["t_unix"]) + (20 * 3600 + 10 * 60 + 55.0 - secondi)


def video_banco(t0: float) -> None:
    with FOTOGRAMMI.open(encoding="utf-8") as f:
        tempi = [float(r["t_unix"]) - t0 for r in csv.DictReader(f)]
    x, y, w, h = RITAGLIO_BANCO
    uscita = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", str(FPS),
         "-i", "-", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", str(ASSETS / "banco.mp4")],
        stdin=subprocess.PIPE)
    lettore = cv2.VideoCapture(str(VIDEO_BANCO))
    indice, attuale = -1, None
    for k in range(round(DURATA * FPS)):
        t = k / FPS
        while indice + 1 < len(tempi) and tempi[indice + 1] <= t:
            ok, fotogramma = lettore.read()
            if not ok:
                break
            indice += 1
            attuale = fotogramma
        if attuale is None:                      # prima del primo fotogramma: il primo
            ok, attuale = lettore.read()
            indice = 0
        uscita.stdin.write(attuale[y:y + h, x:x + w].tobytes())
    uscita.stdin.close()
    uscita.wait()


def video_esterno() -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", f"{55.0 - INIZIO_ESTERNO:.3f}", "-t", str(DURATA),
         "-i", str(VIDEO_ESTERNO), "-vf", f"crop={RITAGLIO_ESTERNO},scale=1280:720,fps={FPS}",
         "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(ASSETS / "esterno.mp4")],
        check=True)


def dati(t0: float) -> None:
    aperto = gzip.open if CSV_PROVA.suffix == ".gz" else open
    with aperto(CSV_PROVA, "rt", encoding="utf-8") as f:
        righe = list(csv.DictReader(r for r in f if not r.startswith("#")))
    campioni, j = [], 0
    for k in range(round(DURATA * FPS)):
        t = t0 + k / FPS
        while j + 1 < len(righe) and float(righe[j + 1]["t_mac"]) <= t:
            j += 1
        r = righe[j]
        prima = float(r["t_mac"]) > t        # prima dell'inizio del CSV: P1 fermo sul fondo
        quota = None if r["quota_dmm"] == "" else round(int(r["quota_dmm"]) / 100, 2)
        rif = None if (prima or r["quota_rif_dmm"] == "") else round(int(r["quota_rif_dmm"]) / 100, 2)
        campioni.append([quota, rif, round(int(r["p_pa"]) / 1000, 3),
                         None if prima or r["p_rif_pa"] in ("", "0") else round(int(r["p_rif_pa"]) / 1000, 3),
                         round(int(r["u_decimi"]) / 10, 1), "M" if prima else r["stato"]])
    testo = ("// Generato da prepara.py: [quota cm, quota voluta cm, pressione kPa, pressione voluta kPa, servo °, stato]"
             f"\nwindow.DATI_M4 = {{\"fps\": {FPS}, \"campioni\": {json.dumps(campioni, separators=(',', ':'))}}};\n")
    (ASSETS / "dati.js").write_text(testo, encoding="utf-8")


def main() -> None:
    ASSETS.mkdir(exist_ok=True)
    t0 = zero_unix()
    print(f"zero alle 20:10:55,000 = {t0:.3f}")
    dati(t0)
    print("dati.js fatto")
    video_esterno()
    print("esterno.mp4 fatto")
    video_banco(t0)
    print("banco.mp4 fatto")


if __name__ == "__main__":
    main()
