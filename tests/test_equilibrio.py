"""Test di pc/equilibrio.py (pressione di equilibrio in funzione della quota, 3.2).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import equilibrio as eq  # noqa: E402


class Equilibrio(unittest.TestCase):
    def test_oscillazione_attorno_alla_quota_da_la_pressione_di_equilibrio(self):
        # P1 oscilla di ±2 cm attorno a 10 cm; la pressione oscilla in anticipo di un quarto di periodo
        t = np.arange(0, 40, 0.01)
        quota = 10 + 2 * np.sin(2 * np.pi * t / 5)
        dp = 1.2 + 0.098 * (quota - 10) + 0.4 * np.cos(2 * np.pi * t / 5)
        punti = eq.punti_di_equilibrio("sintetico", t, quota, dp)
        self.assertEqual(len(punti), 1)
        self.assertAlmostEqual(punti[0].quota_cm, 10, delta=0.05)
        self.assertAlmostEqual(punti[0].dp_kpa, 1.2, delta=0.02)

    def test_tratto_troppo_corto_scartato(self):
        t = np.arange(0, 10, 0.01)
        self.assertEqual(eq.punti_di_equilibrio("corto", t, 10 + np.sin(t), np.ones_like(t)), [])

    def test_retta_esatta(self):
        z = np.array([0.0, 5.0, 10.0, 15.0])
        s, q0, _, _ = eq.retta(z, 0.2 + 0.098 * z)
        self.assertAlmostEqual(s, 0.098)
        self.assertAlmostEqual(q0, 0.2)


if __name__ == "__main__":
    unittest.main()
