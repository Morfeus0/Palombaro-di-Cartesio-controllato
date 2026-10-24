"""Lettura del registro della seriale e scrittura dei comandi del servo (funzioni pure, testabili).

Il registro è quello scritto da pc/registra_seriale.py: ogni riga comincia con l'orario
"HH:MM:SS.mmm" seguito dalla riga della seriale. Ci interessano due tipi di righe:
  12:34:56.789 p = 101.300 kPa  T = 24.50 C  servo = 86     -> misura
  12:34:56.789 # inviato: 96                                 -> evento (commento del firmware o del registratore)
"""
import os
import re
from pathlib import Path

RIGA_MISURA = re.compile(
    r"^(\d\d:\d\d:\d\d\.\d{3}) p = (-?\d+(?:\.\d+)?) kPa\s+T = (-?\d+(?:\.\d+)?) C\s+servo = (\d+)\s*$"
)
RIGA_EVENTO = re.compile(r"^(\d\d:\d\d:\d\d\.\d{3}) # (.+?)\s*$")


def analizza_riga(riga: str) -> dict | None:
    """Trasforma una riga del registro in una misura o in un evento; None per tutto il resto."""
    misura = RIGA_MISURA.match(riga)
    if misura:
        orario, p, t, servo = misura.groups()
        return {"tipo": "misura", "t": orario, "p": float(p), "T": float(t), "servo": int(servo)}
    evento = RIGA_EVENTO.match(riga)
    if evento:
        orario, testo = evento.groups()
        return {"tipo": "evento", "t": orario, "testo": testo}
    return None


def valida_angolo(valore, minimo: int, massimo: int) -> int:
    """Accetta solo interi (anche come stringa di cifre) dentro [minimo, massimo]."""
    if isinstance(valore, bool) or not isinstance(valore, (int, str)):
        raise ValueError("l'angolo deve essere un numero intero")
    if isinstance(valore, str):
        if not valore.strip().isdigit():
            raise ValueError("l'angolo deve essere un numero intero")
        valore = int(valore.strip())
    if not minimo <= valore <= massimo:
        raise ValueError(f"l'angolo deve stare tra {minimo} e {massimo}")
    return valore


def scrivi_comando(percorso: Path, angolo: int) -> None:
    """Scrive il comando in modo atomico: il registratore legge e cancella il file ogni mezzo secondo.

    Se arrivano due comandi prima che il registratore li legga, vince l'ultimo: per un servo che va
    comunque verso l'ultima posizione richiesta è il comportamento giusto.
    """
    temporaneo = percorso.with_name(percorso.name + ".tmp")
    temporaneo.write_text(f"{angolo}\n", encoding="utf-8")
    os.replace(temporaneo, percorso)
