"""Anteprime della trasmissione T01 (braccio, biella, pinza) montata sulla base della revisione 03, a 86°.

Legge trasmissione-T01/scena.json scritto da esporta-trasmissione.cjs; non ridisegna nulla.
Uso: MPLCONFIGDIR=/private/tmp/palombaro-matplotlib .venv/bin/python hardware/cad-base/anteprima-trasmissione.py
"""
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from mpl_toolkits.mplot3d.art3d import Poly3DCollection  # noqa: E402

OUT = Path(__file__).resolve().parent / "trasmissione-T01"
SCENA = json.loads((OUT / "scena.json").read_text())
NASCOSTI_NEL_DETTAGLIO = {"base-servo", "base-siringa", "piastra-giunzione", "viteria-m3-riferimento"}


def render(nome: str, elevazione: float, azimut: float, dettaglio: bool) -> None:
    fig = plt.figure(figsize=(15, 7), facecolor="#f4f2ec", dpi=150)
    ax = fig.add_subplot(111, projection="3d", facecolor="#f4f2ec")
    pezzi = [p for p in SCENA if not (dettaglio and p["nome"] in NASCOSTI_NEL_DETTAGLIO)]
    facce, colori = [], []
    for pezzo in pezzi:
        facce.extend(np.asarray(p) for p in pezzo["poligoni"])
        colori.extend([pezzo["colore"]] * len(pezzo["poligoni"]))
    superficie = Poly3DCollection(facce, facecolors=colori, linewidths=0, shade=True,
                                  lightsource=matplotlib.colors.LightSource(azdeg=315, altdeg=45))
    superficie.set_clip_on(False)
    ax.add_collection3d(superficie)
    vertici = np.concatenate(facce)
    basso, alto = vertici.min(axis=0) - 5, vertici.max(axis=0) + 5
    ax.set(xlim=(basso[0], alto[0]), ylim=(basso[1], alto[1]), zlim=(basso[2], alto[2]))
    ax.set_box_aspect(alto - basso, zoom=1.4)
    ax.view_init(elev=elevazione, azim=azimut)
    ax.set_axis_off()
    ax.set_title("PALOMBARO · TRASMISSIONE STAMPATA T01 SULLA BASE REVISIONE 03 · comando 86°", pad=10)
    fig.text(0.06, 0.06, "Arancio: braccio, biella e pinza da stampare   ·   Bianco: squadretta originale   ·   "
             "Grigio scuro: perni M3×20 e viti di registro   ·   Azzurro: base già inviata", fontsize=10)
    fig.subplots_adjust(left=0, right=1, bottom=0.1, top=0.92)
    fig.savefig(OUT / nome, facecolor=fig.get_facecolor())
    plt.close(fig)


if __name__ == "__main__":
    render("anteprima-trasmissione.png", 24, -62, False)
    render("anteprima-trasmissione-dettaglio.png", 30, -40, True)
    render("anteprima-trasmissione-alto.png", 90, -90, False)
