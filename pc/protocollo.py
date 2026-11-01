"""Righe del protocollo tra Mac ed ESP32 (docs/protocollo.md, versione 1): "$TIPO,campo,campo*CC".

CC è lo XOR dei byte tra '$' e '*' in due cifre esadecimali, come nel firmware (firmware/src/palombaro/protocollo.cpp).
"""
from functools import reduce


def controllo(corpo: str) -> int:
    return reduce(lambda cc, b: cc ^ b, corpo.encode("ascii"), 0)


def componi(corpo: str) -> str:
    """La riga completa, senza '\\n'."""
    return f"${corpo}*{controllo(corpo):02X}"


def analizza(riga: str) -> tuple[str, list[str]] | None:
    """(tipo, campi) di una riga valida; None se non è del protocollo o il controllo non torna."""
    riga = riga.strip()
    if not riga.startswith("$") or len(riga) < 5 or riga[-3] != "*":
        return None
    corpo = riga[1:-3]
    try:
        if int(riga[-2:], 16) != controllo(corpo):
            return None
    except ValueError:
        return None
    tipo, *campi = corpo.split(",")
    return tipo, campi


def comando_servo(angolo: str) -> str | None:
    """L'angolo intero scritto dalla dashboard (36–146) come comando S in decimi di grado; None se non è un intero."""
    angolo = angolo.strip()
    return componi(f"S,{int(angolo) * 10}") if angolo.isdigit() else None
