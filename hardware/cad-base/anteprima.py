"""Anteprime delle geometrie effettive generate da JSCAD, senza ridisegnare i componenti."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

OUT = sorted(Path(__file__).resolve().parent.glob("bozza-[0-9]*"))[-1]  # revisione più recente
REVISIONE = json.loads((OUT / "verifica.json").read_text())["revisione"]
SCENA = json.loads((OUT / "scena.json").read_text())


def render(nome: str, elevazione: float, azimut: float, riferimenti: bool) -> None:
    fig = plt.figure(figsize=(15, 7), facecolor="#f4f2ec", dpi=150)
    ax = fig.add_subplot(111, projection="3d", facecolor="#f4f2ec")
    gruppi = SCENA if riferimenti else [p for p in SCENA if p["stampato"]]
    facce, colori = [], []
    for pezzo in gruppi:
        facce.extend(np.asarray(p) for p in pezzo["poligoni"])
        colori.extend([pezzo["colore"]] * len(pezzo["poligoni"]))
    superficie = Poly3DCollection(
        facce, facecolors=colori, linewidths=0, shade=True,
        lightsource=matplotlib.colors.LightSource(azdeg=315, altdeg=45),
    )
    superficie.set_clip_on(False)
    ax.add_collection3d(superficie)
    vertici = np.concatenate(facce)
    basso, alto = vertici.min(axis=0) - 5, vertici.max(axis=0) + 5
    ax.set(xlim=(basso[0], alto[0]), ylim=(basso[1], alto[1]), zlim=(basso[2], alto[2]))
    ax.set_box_aspect(alto - basso, zoom=1.5)
    ax.view_init(elev=elevazione, azim=azimut)
    ax.set_xlabel("x [mm]", labelpad=10)
    ax.set_ylabel("y [mm]")
    ax.set_zlabel("z [mm]")
    if elevazione == 90:
        ax.set_zticks([])
        ax.set_zlabel("")
        ax.grid(False)
    ax.set_title(f"PALOMBARO · BASE SERVO–SIRINGA\nREVISIONE {REVISIONE} · MISURE DEL SERVO CONFERMATE", pad=10)
    fig.text(0.06, 0.08, "Blu: supporti stampati   ·   Ocra: fermi rimovibili   ·   Grigio: componenti reali di riferimento", fontsize=10)
    fig.text(0.06, 0.04, "Servo verticale · braccio 35 mm · asticella 110 mm · siringa Ø21 mm · flangia 37,5 × 25 × 2 mm", fontsize=10)
    fig.subplots_adjust(left=0, right=1, bottom=0.15, top=0.9)
    fig.savefig(OUT / nome, facecolor=fig.get_facecolor())
    plt.close(fig)


if __name__ == "__main__":
    render("anteprima-assieme.png", 24, -62, True)
    render("anteprima-supporti.png", 28, -62, False)
    render("anteprima-alto.png", 90, -90, True)
