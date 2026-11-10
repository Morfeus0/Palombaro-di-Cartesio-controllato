"""Sottofase 4.6: banco del 10 novembre e gemello sovrapposti (figura per il capitolo 5).

Quattro confronti, ciascuno allineato all'evento che lo comanda:
- gradino di pressione con il PI di progetto (0,02/0,4) e con quello tarato al banco (0,02/0,1);
- On-Off ±1000 Pa a 5 cm, dall'ingresso in HOLD;
- PID: 5 cm, a 30 s gradino a 10 cm, dall'ingresso in HOLD.
Gemello: analisi/gemello-f4/banco-10nov/ (gioco 22°, chiusura a 116°, P1 pesante), da analisi/confronto_f4.m.

Uso:  .venv/bin/python analisi/confronto_f4.py
"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

RADICE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RADICE / "pc"))
import analisi_f4 as af  # noqa: E402

BANCO = RADICE / "dati" / "2026-11-10"
GEMELLO = RADICE / "analisi" / "gemello-f4" / "banco-10nov"
USCITA = RADICE / "analisi" / "figure" / "confronto_f4.png"


def campioni(percorso: Path):
    return af.apri(percorso)[1]


def da_hold(c):
    """Il tempo dall'ingresso in HOLD (prima riga con stato H)."""
    t0 = next(x.t for x in c if x.stato == "H")
    return [x._replace(t=x.t - t0) for x in c if x.t >= t0 - 1]


def intorno_al_primo_gradino(c, prima=1.0, dopo=4.0):
    """Tempo dal gradino e pressioni come variazione [Pa] rispetto alla voluta di prima: il gemello ha il p0 di
    ottobre (101,5 kPa), il banco quello del 10 novembre (99,2 kPa)."""
    g = af.gradini_pressione(c)[0]
    base = next(x.p_rif for x in c if x.t >= g.inizio - 0.1)
    return [x._replace(t=x.t - g.inizio, p=x.p - base, p_rif=x.p_rif - base)
            for x in c if g.inizio - prima <= x.t <= g.inizio + dopo]


def dal_gradino_di_quota(c):
    """Il tempo dal gradino della quota voluta (5 → 10 cm): al banco è arrivato a 38 s da HOLD, nel gemello a 30."""
    g = af.gradini_quota(c)[0]
    return [x._replace(t=x.t - g.inizio) for x in c if x.stato == "H"]


def pressione(asse, banco, gemello, titolo):
    for c, colore, nome in ((banco, "#d0282e", "banco"), (gemello, "#161616", "gemello")):
        asse.plot([x.t for x in c], [x.p for x in c], color=colore, lw=1.6, label=nome)
    asse.plot([x.t for x in banco], [x.p_rif for x in banco], "--", color="#6b6b6b", lw=1, label="voluta")
    asse.set_title(titolo, fontsize=10)
    asse.set_xlabel("s dal gradino")
    asse.set_ylabel("Pa rispetto a prima")


def quota(asse, banco, gemello, titolo, fino, asse_x="s da HOLD"):
    for c, colore, nome in ((banco, "#d0282e", "banco"), (gemello, "#161616", "gemello")):
        sel = [x for x in c if x.t <= fino]
        asse.plot([x.t for x in sel], [None if x.quota is None else x.quota * 100 for x in sel],
                  color=colore, lw=1.3, label=nome)
    rif = [x for x in banco if x.quota_rif is not None and x.t <= fino]
    asse.plot([x.t for x in rif], [x.quota_rif * 100 for x in rif], "--", color="#6b6b6b", lw=1, label="voluta")
    asse.set_title(titolo, fontsize=10)
    asse.set_xlabel(asse_x)
    asse.set_ylabel("cm")


def main() -> None:
    fig, assi = plt.subplots(2, 2, figsize=(13, 8))
    pressione(assi[0][0], intorno_al_primo_gradino(campioni(BANCO / "2026-11-10_4-4-gradini-pressione_01.csv")),
              intorno_al_primo_gradino(campioni(GEMELLO / "gemello_4-4_pi-progetto.csv.gz")),
              "PI di progetto (0,02 °/Pa, 0,4 °/(Pa·s)): gradino di +391 Pa")
    pressione(assi[0][1], intorno_al_primo_gradino(campioni(BANCO / "2026-11-10_4-4-gradini-pressione_06.csv")),
              intorno_al_primo_gradino(campioni(GEMELLO / "gemello_4-4_pi-tarato.csv.gz")),
              "PI tarato al banco (0,02, 0,1): gradino di +391 Pa")
    quota(assi[1][0], da_hold(campioni(BANCO / "2026-11-10_4-3-onoff-5mm-1000pa_01.csv")),
          da_hold(campioni(GEMELLO / "gemello_4-3_onoff-1000.csv.gz")), "On-Off ±5 mm, ±1000 Pa, quota voluta 5 cm", 90)
    quota(assi[1][1], dal_gradino_di_quota(campioni(BANCO / "2026-11-10_4-5-pid-m4_04.csv")),
          dal_gradino_di_quota(campioni(GEMELLO / "gemello_4-5_PID.csv.gz")), "PID: gradino da 5 a 10 cm (M4)", 85,
          "s dal gradino di quota")
    for riga in assi:
        for a in riga:
            a.grid(alpha=0.3)
            a.legend(fontsize=8, loc="best")
    fig.suptitle("Banco (10 novembre) e gemello con gioco 22°, chiusura a 116° e P1 pesante", fontsize=12)
    fig.tight_layout()
    fig.savefig(USCITA, dpi=120)
    print(f"figura: {USCITA}")


if __name__ == "__main__":
    main()
