"""Lettura del registro della seriale e scrittura dei comandi del servo (funzioni pure, testabili).

Il registro è quello scritto da pc/registra_seriale.py: ogni riga comincia con l'orario
"HH:MM:SS.mmm" seguito dalla riga della seriale. Ci interessano due tipi di righe:
  12:34:56.789 p = 101.300 kPa  T = 24.50 C  servo = 86     -> misura
  12:34:56.789 # inviato: 96                                 -> evento (commento del firmware o del registratore)
Dal firmware 0.1 (2.5) arrivano anche le righe del protocollo (docs/protocollo.md):
  12:34:56.789 $T,seq,t_ms,p_Pa,servo_decimi,stato,...,T_centesimi*CC   -> misura
  12:34:56.789 $X,da,a,motivo*CC  e  $OK/$NO/$V                          -> evento
"""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import protocollo  # noqa: E402

RIGA_MISURA = re.compile(
    r"^(\d\d:\d\d:\d\d\.\d{3}) p = (-?\d+(?:\.\d+)?) kPa\s+T = (-?\d+(?:\.\d+)?) C\s+servo = (\d+)\s*$"
)
RIGA_EVENTO = re.compile(r"^(\d\d:\d\d:\d\d\.\d{3}) # (.+?)\s*$")
RIGA_PROTOCOLLO = re.compile(r"^(\d\d:\d\d:\d\d\.\d{3}) (\$.+?)\s*$")


def _da_protocollo(orario: str, tipo: str, campi: list[str]) -> dict | None:
    """Misura dalle righe T, evento dalle risposte e dai cambi di stato; le righe A restano solo nel registro."""
    if tipo == "T" and len(campi) >= 9:
        servo = int(campi[3])
        temperatura = int(campi[8]) / 100 if len(campi) > 8 else 0.0
        return {"tipo": "misura", "t": orario, "p": int(campi[2]) / 1000, "T": temperatura,
                "servo": round(servo / 10) if servo >= 0 else None}
    if tipo == "X" and len(campi) == 3:
        return {"tipo": "evento", "t": orario, "testo": f"stato: {campi[0]} → {campi[1]} ({campi[2]})"}
    if tipo in ("OK", "NO", "V"):
        return {"tipo": "evento", "t": orario, "testo": " ".join([tipo, *campi])}
    return None


def analizza_riga(riga: str) -> dict | None:
    """Trasforma una riga del registro in una misura o in un evento; None per tutto il resto."""
    misura = RIGA_MISURA.match(riga)
    if misura:
        orario, p, t, servo = misura.groups()
        return {"tipo": "misura", "t": orario, "p": float(p), "T": float(t), "servo": int(servo)}
    nuova = RIGA_PROTOCOLLO.match(riga)
    if nuova:
        orario, testo = nuova.groups()
        analizzata = protocollo.analizza(testo)
        return _da_protocollo(orario, *analizzata) if analizzata else None
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
