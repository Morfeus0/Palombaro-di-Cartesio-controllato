"""Latenza della telecamera (sottofase 2.3): dallo schermo del Mac al programma.

pc/latenza.html alterna nero e bianco cambiando colore quando l'orologio del Mac passa un multiplo esatto di
PERIODO_S. telecamera.py segna l'arrivo di ogni fotogramma con lo stesso orologio (colonna t_unix di
<video>_fotogrammi.csv). Per ogni cambio visto nel video: latenza = arrivo del fotogramma − istante del cambio.
Comprende anche il ritardo dello schermo (circa un aggiornamento, 8–17 ms): la latenza della sola telecamera
è un po' minore. Vale se la latenza è sotto PERIODO_S.

Uso: .venv/bin/python pc/latenza.py dati/<giorno>/telecamera/<giorno>_postazione_NN.mp4
"""
import csv
import sys
from pathlib import Path

import cv2
import numpy as np

PERIODO_S = 0.5            # come PERIODO_MS in latenza.html
LATO_RIDOTTO = (64, 36)    # i fotogrammi si rimpiccioliscono: basta la luminosità media dello schermo
QUOTA_VARIABILE = 0.5      # si usano i pixel che variano almeno metà del più variabile (lo schermo)


def luminosita_schermo(video: Path) -> np.ndarray:
    """Luminosità media, fotogramma per fotogramma, della zona che lampeggia (lo schermo nell'immagine)."""
    cap = cv2.VideoCapture(str(video))
    piccoli = []
    while True:
        ok, fotogramma = cap.read()
        if not ok:
            break
        grigio = cv2.cvtColor(fotogramma, cv2.COLOR_BGR2GRAY)
        piccoli.append(cv2.resize(grigio, LATO_RIDOTTO, interpolation=cv2.INTER_AREA).astype(float))
    cap.release()
    if not piccoli:
        raise ValueError(f"nessun fotogramma in {video}")
    pila = np.stack(piccoli)
    variazione = pila.std(axis=0)
    zona = variazione >= QUOTA_VARIABILE * variazione.max()
    return pila[:, zona].mean(axis=1)


def latenze(t: np.ndarray, luce: np.ndarray, periodo: float = PERIODO_S) -> tuple[np.ndarray, np.ndarray]:
    """Latenze (s) di ogni cambio di colore e verso del cambio (True = da nero a bianco).

    Il passaggio per la soglia (a metà tra scuro e chiaro) si interpola tra i due fotogrammi vicini; il cambio
    sullo schermo è l'ultimo multiplo di `periodo` prima di quel passaggio.
    """
    basso, alto = np.percentile(luce, [5, 95])
    if alto - basso < 10:
        raise ValueError("lo schermo non lampeggia abbastanza nell'immagine")
    soglia = (basso + alto) / 2
    sopra = luce > soglia
    indici = np.nonzero(sopra[1:] != sopra[:-1])[0] + 1
    frazione = (soglia - luce[indici - 1]) / (luce[indici] - luce[indici - 1])
    passaggio = t[indici - 1] + frazione * (t[indici] - t[indici - 1])
    cambio = np.floor(passaggio / periodo) * periodo
    return passaggio - cambio, sopra[indici]


def main() -> None:
    video = Path(sys.argv[1])
    with open(video.with_name(video.stem + "_fotogrammi.csv"), encoding="utf-8") as f:
        t = np.array([float(r["t_unix"]) for r in csv.DictReader(f)])
    luce = luminosita_schermo(video)
    n = min(len(t), len(luce))
    lat, verso = latenze(t[:n], luce[:n])
    ms = lat * 1000
    print(f"{video.name}: {n} fotogrammi, {len(ms)} cambi di colore")
    print(f"latenza: mediana {np.median(ms):.0f} ms, da {ms.min():.0f} a {ms.max():.0f} ms, "
          f"deviazione {ms.std():.0f} ms")
    for nome, scelta in (("nero → bianco", verso), ("bianco → nero", ~verso)):
        if scelta.any():
            print(f"  {nome}: mediana {np.median(ms[scelta]):.0f} ms su {scelta.sum()} cambi")


if __name__ == "__main__":
    main()
