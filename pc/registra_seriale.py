"""Registra la seriale dell'ESP32 su file, riaprendo la porta se l'USB viene staccato.

Uso: python registra_seriale.py <file_uscita> <secondi> <file_comandi> [baud]
Ogni riga: orario con millisecondi + riga della seriale. DTR e RTS restano bassi: nessun riavvio.
Se compare <file_comandi>, le sue righe vengono inviate all'ESP32 (es. "90") e il file cancellato:
così si comanda il servo senza fermare la registrazione.
Con il firmware 0.1 (2.5) si passa 460800 come baud: le righe del file dei comandi che sono un angolo intero (quelle
della dashboard, 36–146) diventano il comando del protocollo "$S,<decimi>*CC"; le righe che cominciano con "$" passano
così come sono.
Da lanciare staccato dalla sessione (nohup ... &): il 18 ottobre una registrazione in background
si è fermata da sola dopo 18 minuti.
"""
import os
import sys
import time
from typing import TextIO

import serial

from protocollo import comando_servo

PORTA = "/dev/cu.usbserial-0001"
uscita, durata, comandi = sys.argv[1], float(sys.argv[2]), sys.argv[3]
baud = int(sys.argv[4]) if len(sys.argv) > 4 else 115200
BAUD_PROTOCOLLO = 460800  # firmware 0.1: righe del protocollo (docs/protocollo.md)
fine = time.time() + durata


def orario(t: float) -> str:
    return time.strftime("%H:%M:%S", time.localtime(t)) + f".{int(t % 1 * 1000):03d}"


def invia_comandi(s: serial.Serial, f: TextIO) -> None:
    if not os.path.exists(comandi):
        return
    with open(comandi, encoding="utf-8") as c:
        righe = [r.strip() for r in c if r.strip()]
    os.remove(comandi)
    for r in righe:
        if baud == BAUD_PROTOCOLLO and not r.startswith("$"):
            r = comando_servo(r) or r
        s.write((r + "\n").encode())
        f.write(f"{orario(time.time())} # inviato: {r}\n")


with open(uscita, "a", encoding="utf-8") as f:
    while time.time() < fine:
        try:
            s = serial.Serial()
            s.port, s.baudrate, s.timeout = PORTA, baud, 0.5
            s.dtr = s.rts = False
            s.open()
            f.write(f"{orario(time.time())} # porta aperta\n")
            while time.time() < fine:
                invia_comandi(s, f)
                riga = s.readline()
                if riga:
                    f.write(f"{orario(time.time())} {riga.decode('utf-8', errors='replace').rstrip()}\n")
                    f.flush()
            s.close()
        except (serial.SerialException, OSError):
            time.sleep(2)
