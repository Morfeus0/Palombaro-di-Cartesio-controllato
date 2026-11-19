"""Sottofase 4.7: giudica le prove del gemello con gioco variabile (analisi/soglia_gioco.m) come la 4.4 al banco.

Per ogni taratura del PI (progetto 0,02/0,4 e tarato 0,02/0,1) e ogni gioco simulato stampa l'assestamento
peggiore dei gradini di pressione e quanti gradini rispettano il criterio della 4.4 (< 0,5 s), con gli stessi
criteri di pc/analisi_f4.py. Scrive anche la tabella in analisi/gemello-f4/soglia-gioco/riassunto.md.

Uso:  .venv/bin/python pc/soglia_gioco.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from analisi_f4 import apri, gradini_pressione  # noqa: E402

CARTELLA = Path(__file__).resolve().parent.parent / "analisi" / "gemello-f4" / "soglia-gioco"
NOME = re.compile(r"gemello_pi-(?P<taratura>\w+)_gioco-(?P<gioco>\d+)\.csv\.gz$")


def giudica(percorso: Path) -> tuple[float | None, int, int, float]:
    """Assestamento peggiore (None se un gradino non si assesta), gradini superati, gradini, sovraelongazione max %."""
    _, campioni = apri(percorso)
    gradini = gradini_pressione(campioni)
    if not gradini:
        raise ValueError(f"nessun gradino di pressione in {percorso.name}")
    tempi = [g.assestamento for g in gradini]
    peggiore = None if any(t is None for t in tempi) else max(tempi)
    superati = sum(g.superato for g in gradini)
    sovra = 100 * max(g.sovraelongazione for g in gradini)
    return peggiore, superati, len(gradini), sovra


def main() -> int:
    file = sorted(CARTELLA.glob("gemello_pi-*_gioco-*.csv.gz"))
    if not file:
        print(f"Nessuna prova in {CARTELLA}: lanciare prima analisi/soglia_gioco.m", file=sys.stderr)
        return 1
    righe = ["| PI | gioco [°] | assestamento peggiore [s] | gradini < 0,5 s | sovraelongazione max |",
             "|---|---:|---:|---:|---:|"]
    for percorso in file:
        m = NOME.search(percorso.name)
        if not m:
            continue
        peggiore, ok, totale, sovra = giudica(percorso)
        testo = "non si assesta" if peggiore is None else f"{peggiore:.2f}".replace(".", ",")
        righe.append(f"| {m['taratura']} | {int(m['gioco'])} | {testo} | {ok}/{totale} | {sovra:.0f} % |")
    tabella = "\n".join(righe)
    print(tabella)
    (CARTELLA / "riassunto.md").write_text(
        "# Gemello: assestamento della 4.4 al variare del gioco\n\n"
        "Generato da `pc/soglia_gioco.py` sulle prove di `analisi/soglia_gioco.m`.\n\n" + tabella + "\n",
        encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
