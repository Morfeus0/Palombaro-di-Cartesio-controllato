"""Server della dashboard del banco, solo su localhost.

Legge il registro scritto da pc/registra_seriale.py e lo inoltra al browser (Server-Sent Events);
riceve dal browser i comandi del servo e li scrive nel file di comandi che il registratore inoltra
all'ESP32. Così la porta seriale resta di un solo programma, il registratore, e la dashboard si può
chiudere e riaprire senza disturbare la registrazione.

Dalla 2.1 mostra anche la telecamera: legge i file che scrive pc/telecamera.py (anteprime e stato) e gli passa i
comandi (colonna, riferimento, registrazione) come file in dati/<oggi>/telecamera/comandi/.

Uso (dalla cartella del progetto):
  .venv/bin/python pc/dashboard/server.py
  .venv/bin/python pc/dashboard/server.py --registro dati/2026-10-24/2026-10-24_seriale.log --porta 8780
Senza argomenti usa dati/<oggi>/<oggi>_seriale.log, dati/<oggi>/comandi.txt e dati/<oggi>/telecamera/.
"""
import argparse
import json
import logging
import sys
import time
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from registro import analizza_riga, scrivi_comando, valida_angolo

RADICE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RADICE / "pc"))
import postazione  # noqa: E402  (misure e comandi della telecamera, in comune con pc/telecamera.py)

STATICI = Path(__file__).resolve().parent / "static"
FILE_STATICI = {  # solo questi file si possono chiedere: niente percorsi arbitrari
    "/": ("index.html", "text/html; charset=utf-8"),
    "/style.css": ("style.css", "text/css; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
    "/grafico.js": ("grafico.js", "text/javascript; charset=utf-8"),
    "/telecamera.js": ("telecamera.js", "text/javascript; charset=utf-8"),
}
IMMAGINI_TELECAMERA = {"/api/telecamera/anteprima.jpg": "anteprima.jpg", "/api/telecamera/rosso.jpg": "rosso.jpg"}
FILE_RIFERIMENTO = RADICE / "pc" / "config" / "postazione_riferimento.jpg"
LUNGHEZZA_MAX_CORPO = 300
# Limiti della dashboard: la zona provata il 23 ottobre. Il firmware accetta 26–146, ma a 26 la siringa
# si è spostata: la dashboard resta tra 36 e 146 finché non si decide diversamente.
CONFIG = {"angoloMin": 36, "angoloMax": 146, "angoloCentro": 86}
STORIA_BYTE = 600_000  # circa 2 minuti di registro a 50 letture al secondo
PERIODO_LOTTO_S = 0.1
CSP = (
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; "
    "frame-ancestors 'none'; base-uri 'self'"
)

log = logging.getLogger("dashboard")


def leggi_storia(percorso: Path) -> tuple[list[dict], int]:
    """Ultime righe del registro (circa 2 minuti) e posizione da cui continuare a leggere."""
    if not percorso.exists():
        return [], 0
    dimensione = percorso.stat().st_size
    with percorso.open("rb") as f:
        f.seek(max(0, dimensione - STORIA_BYTE))
        dati = f.read()
    righe = dati.decode("utf-8", errors="replace").splitlines()
    if dimensione > STORIA_BYTE:
        righe = righe[1:]  # la prima riga è quasi sempre tagliata a metà
    voci = [v for v in (analizza_riga(r) for r in righe) if v]
    return voci, dimensione


class Gestore(BaseHTTPRequestHandler):
    registro: Path
    comandi: Path
    telecamera: Path

    def log_message(self, formato: str, *argomenti) -> None:
        log.debug(formato, *argomenti)

    def _intestazioni_comuni(self) -> None:
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")

    def _json(self, codice: int, corpo: dict) -> None:
        dati = json.dumps(corpo).encode("utf-8")
        self.send_response(codice)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dati)))
        self._intestazioni_comuni()
        self.end_headers()
        self.wfile.write(dati)

    def _file(self, dati: bytes, tipo: str) -> None:
        self.send_response(200)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(dati)))
        self.send_header("Cache-Control", "no-store")
        self._intestazioni_comuni()
        self.end_headers()
        self.wfile.write(dati)

    def do_GET(self) -> None:
        percorso = self.path.split("?", 1)[0]
        if percorso == "/api/config":
            self._json(200, {**CONFIG, "registro": self.registro.name})
        elif percorso == "/api/flusso":
            self._flusso()
        elif percorso == "/api/telecamera/stato":
            self._json(200, self._stato_telecamera())
        elif percorso in IMMAGINI_TELECAMERA or percorso == "/api/telecamera/riferimento.jpg":
            file = FILE_RIFERIMENTO if percorso.endswith("riferimento.jpg") else self.telecamera / IMMAGINI_TELECAMERA[percorso]
            try:
                self._file(file.read_bytes(), "image/jpeg")
            except OSError:
                self._json(404, {"errore": "immagine non disponibile"})
        elif percorso in FILE_STATICI:
            nome, tipo = FILE_STATICI[percorso]
            self._file((STATICI / nome).read_bytes(), tipo)
        else:
            self._json(404, {"errore": "pagina non trovata"})

    def _stato_telecamera(self) -> dict:
        """Lo stato scritto da pc/telecamera.py, con la sua età: se è vecchio il programma è fermo."""
        file = self.telecamera / "stato.json"
        try:
            stato = json.loads(file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            cartella = self.telecamera.relative_to(RADICE) if self.telecamera.is_relative_to(RADICE) else self.telecamera
            return {"presente": False, "cartella": str(cartella)}
        return {**stato, "presente": True, "eta_s": max(0.0, time.time() - file.stat().st_mtime)}

    def _corpo_json(self):
        lunghezza = int(self.headers.get("Content-Length", "0"))
        if not 0 < lunghezza <= LUNGHEZZA_MAX_CORPO:
            raise ValueError("richiesta vuota o troppo lunga")
        return json.loads(self.rfile.read(lunghezza))

    def do_POST(self) -> None:
        if self.path == "/api/telecamera/comando":
            self._comando_telecamera()
            return
        if self.path != "/api/servo":
            self._json(404, {"errore": "pagina non trovata"})
            return
        try:
            angolo = valida_angolo(self._corpo_json().get("angolo"), CONFIG["angoloMin"], CONFIG["angoloMax"])
        except (ValueError, json.JSONDecodeError, AttributeError) as errore:
            self._json(400, {"errore": str(errore)})
            return
        try:
            scrivi_comando(self.comandi, angolo)
        except OSError as errore:
            log.error("comando %s non scritto in %s: %s", angolo, self.comandi, errore)
            self._json(500, {"errore": "impossibile scrivere il file dei comandi"})
            return
        log.info("comando servo: %s", angolo)
        self._json(200, {"angolo": angolo})

    def _comando_telecamera(self) -> None:
        try:
            comando = postazione.valida_comando(self._corpo_json())
        except (ValueError, json.JSONDecodeError) as errore:
            self._json(400, {"errore": str(errore)})
            return
        try:
            postazione.scrivi_comando(self.telecamera / "comandi", comando)
        except OSError as errore:
            log.error("comando %s non scritto in %s: %s", comando, self.telecamera, errore)
            self._json(500, {"errore": "impossibile scrivere il comando per la telecamera"})
            return
        log.info("comando telecamera: %s", comando)
        self._json(200, comando)

    def _invia_evento(self, nome: str, dati: dict) -> None:
        self.wfile.write(f"event: {nome}\ndata: {json.dumps(dati)}\n\n".encode("utf-8"))
        self.wfile.flush()

    def _flusso(self) -> None:
        """Server-Sent Events: prima la storia recente, poi un lotto ogni 100 ms con le righe nuove."""
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self._intestazioni_comuni()
        self.end_headers()
        try:
            storia, posizione = leggi_storia(self.registro)
            self._invia_evento("storia", {"voci": storia, "registroPresente": self.registro.exists()})
            resto = b""
            ultimo_segnale = time.monotonic()
            while True:
                time.sleep(PERIODO_LOTTO_S)
                if not self.registro.exists():
                    if time.monotonic() - ultimo_segnale > 2:
                        self._invia_evento("stato", {"registroPresente": False})
                        ultimo_segnale = time.monotonic()
                    continue
                dimensione = self.registro.stat().st_size
                if dimensione < posizione:  # registro ricominciato da capo
                    posizione, resto = 0, b""
                if dimensione == posizione:
                    if time.monotonic() - ultimo_segnale > 15:
                        self.wfile.write(b": ancora qui\n\n")
                        self.wfile.flush()
                        ultimo_segnale = time.monotonic()
                    continue
                with self.registro.open("rb") as f:
                    f.seek(posizione)
                    nuovi = f.read(dimensione - posizione)
                posizione = dimensione
                righe = (resto + nuovi).split(b"\n")
                resto = righe.pop()  # l'ultima riga può essere ancora a metà
                voci = [analizza_riga(r.decode("utf-8", errors="replace").rstrip("\r")) for r in righe]
                voci = [v for v in voci if v]
                if voci:
                    self._invia_evento("lotto", {"voci": voci})
                    ultimo_segnale = time.monotonic()
        except (BrokenPipeError, ConnectionResetError):
            log.debug("browser disconnesso dal flusso")


def percorsi_di_oggi() -> tuple[Path, Path, Path]:
    giorno = date.today().isoformat()
    cartella = RADICE / "dati" / giorno
    return cartella / f"{giorno}_seriale.log", cartella / "comandi.txt", cartella / "telecamera"


def main() -> None:
    registro_oggi, comandi_oggi, telecamera_oggi = percorsi_di_oggi()
    parser = argparse.ArgumentParser(description="Dashboard del banco del palombaro (localhost)")
    parser.add_argument("--registro", type=Path, default=registro_oggi, help="file di registro da seguire")
    parser.add_argument("--comandi", type=Path, default=comandi_oggi, help="file di comandi del registratore")
    parser.add_argument("--telecamera", type=Path, default=telecamera_oggi, help="cartella di pc/telecamera.py")
    parser.add_argument("--porta", type=int, default=8780)
    argomenti = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")

    Gestore.registro = argomenti.registro.resolve()
    Gestore.comandi = argomenti.comandi.resolve()
    Gestore.comandi.parent.mkdir(parents=True, exist_ok=True)
    Gestore.telecamera = argomenti.telecamera.resolve()
    try:
        server = ThreadingHTTPServer(("127.0.0.1", argomenti.porta), Gestore)
    except OSError as errore:
        log.error("porta %s occupata o non disponibile: %s", argomenti.porta, errore)
        raise SystemExit(1) from errore
    server.daemon_threads = True
    log.info("dashboard su http://localhost:%s  (registro: %s)", argomenti.porta, Gestore.registro)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("dashboard chiusa")


if __name__ == "__main__":
    main()
