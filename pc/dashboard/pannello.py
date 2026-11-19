"""Sottofase 5.5: pannello di controllo nella dashboard (funzioni pure, testabili).

Il pannello manda all'ESP32 gli stessi comandi di pc/comanda.py (stato, quota voluta, guadagni, emergenza) e avvia o
ferma la registrazione del ponte. Le righe passano per i file che il ponte (pc/bridge.py) legge ogni 100 ms:
  - comandi del protocollo → aggiunti a dati/<oggi>/comandi.txt con '$' e controllo (come comanda.py);
  - registrazione → dati/<oggi>/esperimento.txt con «ESPERIMENTO <nome> <parametri>» oppure «FINE».
La validazione è la stessa di comanda.py: un comando sbagliato non arriva mai al ponte.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import comanda  # noqa: E402

NOME_ESPERIMENTO = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
DURATA_MAX_S = 1800
NOTE_MAX = 120


def prepara_comando(corpo: object) -> str:
    """Riga del protocollo pronta per il ponte; ValueError se il comando non è valido per il firmware 0.2."""
    if not isinstance(corpo, str) or not corpo.strip() or len(corpo) > 80:
        raise ValueError("il comando deve essere un testo breve, ad esempio R,1000")
    return comanda.prepara(corpo)


def riga_esperimento(azione: object, nome: object = None, durata: object = None, note: object = "") -> str:
    """«ESPERIMENTO <nome> <note>, durata=<s>» oppure «FINE»; ValueError per nomi o durate non validi."""
    if azione == "fine":
        return "FINE"
    if azione != "inizia":
        raise ValueError("azione: 'inizia' oppure 'fine'")
    if not isinstance(nome, str) or not NOME_ESPERIMENTO.match(nome):
        raise ValueError("nome: lettere minuscole, cifre e trattini, al massimo 40 caratteri (es. 5-4-onda)")
    if not isinstance(note, str) or len(note) > NOTE_MAX or any(c in note for c in "\n\r"):
        raise ValueError(f"note: una riga di al massimo {NOTE_MAX} caratteri")
    parametri = note.strip().replace(",", ";")
    if durata not in (None, ""):
        if isinstance(durata, bool) or not isinstance(durata, (int, float, str)):
            raise ValueError("durata in secondi")
        try:
            secondi = int(float(durata))
        except ValueError as errore:
            raise ValueError("durata in secondi") from errore
        if not 1 <= secondi <= DURATA_MAX_S:
            raise ValueError(f"durata fra 1 e {DURATA_MAX_S} s")
        parametri = f"{parametri}, durata={secondi}" if parametri else f"durata={secondi}"
    return f"ESPERIMENTO {nome} {parametri}".rstrip()


def manda_comando(cartella: Path, riga: str) -> Path:
    """Aggiunge la riga al file dei comandi del ponte, senza cancellare quelle non ancora lette."""
    return comanda.manda([riga], cartella)
