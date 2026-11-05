"""Quanti fotogrammi al secondo manda davvero l'iPhone (R5, 5 novembre).

Registra qualche secondo con ffmpeg da solo, senza pc/telecamera.py, a 1080p e a 720p chiedendo 60 fps,
e conta i fotogrammi dai loro orari. Va lanciato da Terminal.app (che ha il permesso della telecamera),
con pc/telecamera.py chiuso.

Uso:  .venv/bin/python pc/misura_fps.py
Scrive il risultato anche in dati/<oggi>/misura_fps.txt.
"""
import re
import subprocess
import time
from pathlib import Path

from telecamera import elenca_telecamere, scegli_iphone

SECONDI = 8
SCARTO_INIZIALE_S = 3      # all'avvio ffmpeg consegna di colpo i fotogrammi in memoria
MODI = ["1920x1080", "1280x720"]
PTS = re.compile(r"pts_time:([0-9.]+)")


def misura(modo: str) -> str:
    # per nome e non per indice: il 5 novembre l'indice 0 è passato dall'iPhone a un'altra telecamera tra due misure
    dispositivo = scegli_iphone(elenca_telecamere())
    comando = ["ffmpeg", "-hide_banner", "-f", "avfoundation", "-framerate", "60", "-video_size", modo,
               "-pixel_format", "nv12", "-i", dispositivo, "-t", str(SECONDI), "-fps_mode", "passthrough",
               "-vf", "showinfo", "-f", "null", "-"]
    try:
        uscita = subprocess.run(comando, capture_output=True, text=True, timeout=SECONDI + 20).stderr
    except subprocess.TimeoutExpired:
        return f"{modo}: ffmpeg non ha risposto (telecamera occupata o permesso mancante)"
    tempi = [float(x) for x in PTS.findall(uscita)]
    if len(tempi) < 10:
        return f"{modo}: solo {len(tempi)} fotogrammi; ultime righe di ffmpeg:\n{uscita[-400:]}"
    tempi = [t for t in tempi if t >= tempi[0] + SCARTO_INIZIALE_S]
    intervalli = sorted(b - a for a, b in zip(tempi, tempi[1:]))
    fps = (len(tempi) - 1) / (tempi[-1] - tempi[0])
    oltre = sum(d > 0.05 for d in intervalli)
    return (f"{modo} chiesto a 60 fps: {fps:.1f} fps veri, intervallo mediano {intervalli[len(intervalli) // 2] * 1000:.1f} ms, "
            f"massimo {intervalli[-1] * 1000:.0f} ms, {oltre} oltre 50 ms")


def main() -> None:
    righe = [time.strftime("%H:%M:%S")]
    for modo in MODI:
        print(f"misuro {modo}…", flush=True)
        righe.append(misura(modo))
        print(righe[-1], flush=True)
    cartella = Path(__file__).resolve().parent.parent / "dati" / time.strftime("%Y-%m-%d")
    cartella.mkdir(parents=True, exist_ok=True)
    with open(cartella / "misura_fps.txt", "a", encoding="utf-8") as f:
        f.write("\n".join(righe) + "\n\n")


if __name__ == "__main__":
    main()
