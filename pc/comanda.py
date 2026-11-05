"""Manda comandi del protocollo all'ESP32 attraverso il ponte (firmware 0.2, sottofasi 4.2–4.5).

Il ponte (pc/bridge.py) inoltra così come sono le righe del file dei comandi che cominciano con '$': qui si aggiungono
'$' e il controllo (docs/protocollo.md) e si scrivono nel file dei comandi di oggi.

Uso:  .venv/bin/python pc/comanda.py "R,1000" "M,CALIBRAZIONE"
Comandi del firmware 0.2:
  M,MANUALE | M,CALIBRAZIONE | M,HOLD | M,SAFE    cambio di stato
  R,<quota in decimi di mm>                       quota voluta (100–1700, cioè 1–17 cm)
  K,P,<kp °/Pa>,<ki °/(Pa·s)>                     PI della pressione
  K,Z,<kp Pa/cm>,<ki Pa/(cm·s)>,<kd Pa·s/cm>,<N>  PID della quota (e lo sceglie per HOLD)
  K,O,<isteresi mm>,<ampiezza Pa>                 On-Off con isteresi (e lo sceglie per HOLD)
  K,E,<p0 Pa>                                     equilibrio con P1 sul fondo, senza calibrare
  S,<decimi di grado> | E | V                     servo in MANUALE, emergenza, versione
"""
import os
import sys
import time
from pathlib import Path

from protocollo import componi

TIPI = {"M", "R", "K", "S", "E", "V"}
STATI = {"MANUALE", "CALIBRAZIONE", "HOLD", "SAFE"}
ANELLI = {"P": 2, "Z": 4, "O": 2, "E": 1}      # quanti numeri vuole ogni K


def _numero(testo: str) -> bool:
    try:
        float(testo)
    except ValueError:
        return False
    return "," not in testo and testo.strip() == testo


def prepara(corpo: str) -> str:
    """La riga completa con '$' e il controllo; ValueError se il comando non è uno di quelli del firmware 0.2."""
    campi = corpo.strip().split(",")
    tipo, valori = campi[0], campi[1:]
    if tipo not in TIPI:
        raise ValueError(f"tipo sconosciuto: {tipo!r} (validi: {', '.join(sorted(TIPI))})")
    if tipo == "M" and (len(valori) != 1 or valori[0] not in STATI):
        raise ValueError(f"M vuole uno stato tra {', '.join(sorted(STATI))}")
    if tipo in ("R", "S") and (len(valori) != 1 or not valori[0].lstrip("-").isdigit()):
        raise ValueError(f"{tipo} vuole un numero intero")
    if tipo == "K":
        if not valori or valori[0] not in ANELLI or len(valori) - 1 != ANELLI[valori[0]]:
            raise ValueError("K vuole P,kp,ki | Z,kp,ki,kd,n | O,isteresi,ampiezza | E,p0")
        if not all(_numero(v) for v in valori[1:]):
            raise ValueError("i guadagni di K sono numeri con il punto, non con la virgola")
    if tipo in ("E", "V") and valori:
        raise ValueError(f"{tipo} non vuole campi")
    return componi(corpo.strip()).rstrip("\n")


def manda(righe: list[str], cartella: Path) -> Path:
    """Aggiunge le righe al file dei comandi del ponte, tutto in una volta (il ponte non lo trova mai a metà)."""
    file = cartella / "comandi.txt"
    vecchio = file.read_text(encoding="utf-8") if file.exists() else ""
    temporaneo = file.with_name(".comandi.txt.tmp")
    temporaneo.write_text(vecchio + "".join(r + "\n" for r in righe), encoding="utf-8")
    os.replace(temporaneo, file)
    return file


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    try:
        righe = [prepara(c) for c in sys.argv[1:]]
    except ValueError as errore:
        raise SystemExit(f"comando non mandato: {errore}")
    cartella = Path(__file__).resolve().parent.parent / "dati" / time.strftime("%Y-%m-%d")
    if not cartella.exists():
        raise SystemExit(f"{cartella} non esiste: il ponte è avviato?")
    file = manda(righe, cartella)
    for r in righe:
        print(f"mandato: {r}  ({file.name})")


if __name__ == "__main__":
    main()
