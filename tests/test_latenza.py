"""Test di pc/latenza.py (latenza della telecamera, 2.3).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))
import latenza as la  # noqa: E402


def segnale_finto(ritardo_s: float, fps: float = 60.0, durata_s: float = 20.0, inizio: float = 1_793_550_000.123):
    """Schermo che cambia ogni 0,5 s, visto dalla telecamera con `ritardo_s` di ritardo."""
    t = inizio + np.arange(0, durata_s, 1 / fps)
    bianco = np.floor((t - ritardo_s) / la.PERIODO_S) % 2 == 1
    return t, np.where(bianco, 200.0, 20.0)


class Latenze(unittest.TestCase):
    def test_ritrova_il_ritardo_entro_un_fotogramma(self):
        t, luce = segnale_finto(0.110)
        lat, _ = la.latenze(t, luce)
        self.assertGreater(len(lat), 30)
        self.assertAlmostEqual(float(np.median(lat)), 0.110, delta=1 / 60)

    def test_distingue_il_verso_dei_cambi(self):
        t, luce = segnale_finto(0.080)
        _, verso = la.latenze(t, luce)
        self.assertTrue(verso.any() and (~verso).any())

    def test_schermo_che_non_lampeggia_da_errore(self):
        t = np.arange(0, 5, 1 / 60)
        with self.assertRaises(ValueError):
            la.latenze(t, np.full(t.size, 100.0))


if __name__ == "__main__":
    unittest.main()
