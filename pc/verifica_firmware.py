"""Il «Fatto quando» della 2.5 sul registro della seriale: periodo a 100 Hz regolare entro 1 ms e 30 minuti senza blocchi.

Il firmware 0.1 misura da sé quanto ogni ciclo si scosta da 10 ms e lo manda una volta al secondo nella riga A (il
massimo dell'ultimo secondo): la seriale e il Mac aggiungono ritardi loro, quindi gli orari di arrivo non servirebbero.
Dalle righe T si contano durata, righe perse (salti nel numero di sequenza) e riavvii. Si guarda il tratto dall'ultimo
avvio del firmware: un riavvio durante la prova la fa ricominciare, quindi i 30 minuti devono essere tutti di seguito.

Uso: .venv/bin/python pc/verifica_firmware.py dati/<giorno>/<registro>.log[.gz]
"""
import gzip
import sys
from pathlib import Path

from protocollo import analizza

SCARTO_MAX_US = 1000       # «Fatto quando»: irregolarità del periodo sotto 1 ms
DURATA_MIN_S = 30 * 60     # e 30 minuti senza bloccarsi


def riassunto(righe) -> dict:
    """Conta righe T, salti di sequenza, scarto massimo del periodo (dalle righe A), riavvii e cambi di stato."""
    def da_capo(avvii: int) -> dict:
        return {"t": 0, "persi": 0, "t_ms": [None, None], "scarto_max_us": 0, "ritardi": 0, "a": 0,
                "riavvii": avvii, "stati": []}

    r = da_capo(0)
    seq_prec = None
    for riga in righe:
        testo = riga[13:] if len(riga) > 13 and riga[2] == ":" else riga
        if "# palombaro" in testo:  # all'avvio la riga arriva attaccata ai caratteri del bootloader (115200 baud)
            r = da_capo(r["riavvii"] + 1)
            seq_prec = None
            continue
        analizzata = analizza(testo)
        if not analizzata:
            continue
        tipo, campi = analizzata
        if tipo == "T" and len(campi) >= 2:
            seq, t_ms = int(campi[0]), int(campi[1])
            if seq_prec is not None and seq > seq_prec + 1:
                r["persi"] += seq - seq_prec - 1
            seq_prec = seq
            r["t"] += 1
            r["t_ms"] = [t_ms if r["t_ms"][0] is None else r["t_ms"][0], t_ms]
        elif tipo == "A" and len(campi) >= 9:
            r["a"] += 1
            r["scarto_max_us"] = max(r["scarto_max_us"], int(campi[7]))
            r["ritardi"] = max(r["ritardi"], int(campi[8]))
        elif tipo == "X":
            r["stati"].append(" → ".join(campi[:2]) + f" ({campi[2]})" if len(campi) == 3 else ",".join(campi))
    inizio, fine = r["t_ms"]
    r["durata_s"] = 0.0 if inizio is None else (fine - inizio) / 1000
    r["superato"] = r["durata_s"] >= DURATA_MIN_S and r["scarto_max_us"] < SCARTO_MAX_US and r["ritardi"] == 0
    return r


def main() -> None:
    percorso = Path(sys.argv[1])
    apri = gzip.open if percorso.suffix == ".gz" else open
    with apri(percorso, "rt", encoding="utf-8", errors="replace") as f:
        r = riassunto(f)
    durata = r["durata_s"]
    print(f"{percorso.name}, dall'ultimo avvio: {r['t']} righe T in {durata / 60:.1f} minuti "
          f"({r['t'] / durata if durata else 0:.1f} al secondo), {r['persi']} perse in transito")
    print(f"scarto massimo del periodo: {r['scarto_max_us']} µs (limite {SCARTO_MAX_US}), "
          f"cicli in ritardo: {r['ritardi']}, avvii del firmware: {r['riavvii']}")
    if r["stati"]:
        print("cambi di stato: " + "; ".join(r["stati"]))
    print("FATTO QUANDO SUPERATO" if r["superato"] else "fatto quando NON ancora superato")


if __name__ == "__main__":
    main()
