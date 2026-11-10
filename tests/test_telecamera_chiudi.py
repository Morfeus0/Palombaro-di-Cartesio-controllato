"""Test di SorgenteIphone.chiudi in pc/telecamera.py (10 novembre).

Con l'iPhone bloccato ffmpeg non risponde a terminate(): prima wait(timeout=5) lanciava TimeoutExpired e
telecamera.py si chiudeva invece di riaprire la telecamera. Ora dopo 5 s ffmpeg si chiude con kill().
Uso: .venv/bin/python -m unittest tests.test_telecamera_chiudi
"""
import subprocess
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import telecamera  # noqa: E402


class FfmpegBloccato:
    """Un processo finto che ignora terminate() e si ferma solo con kill()."""

    def __init__(self):
        self.ucciso = False
        self.terminato = False

    def poll(self):
        return 0 if self.ucciso else None

    def terminate(self):
        self.terminato = True

    def kill(self):
        self.ucciso = True

    def wait(self, timeout=None):
        if not self.ucciso:
            raise subprocess.TimeoutExpired("ffmpeg", timeout)
        return -9


class Chiudi(unittest.TestCase):
    def test_ffmpeg_bloccato_si_chiude_con_kill(self):
        sorgente = object.__new__(telecamera.SorgenteIphone)
        sorgente.processo = FfmpegBloccato()
        sorgente.chiudi()                      # non deve lanciare TimeoutExpired
        self.assertTrue(sorgente.processo.terminato)
        self.assertTrue(sorgente.processo.ucciso)


if __name__ == "__main__":
    unittest.main()
