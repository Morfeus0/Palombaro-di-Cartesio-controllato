"""Test di pc/video_esperimento.py (video di un esperimento con i dati sovrapposti, 2.7).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import video_esperimento as ve  # noqa: E402

CSV = [
    "# esperimento: prova\n",
    "t_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista\n",
    "100.00,1,10,101640,1460,M,0,12,0\n",
    "100.01,2,20,102660,930,M,1120,8,0\n",
    "100.02,3,30,102700,930,M,,,\n",
]


class LetturaEsperimento(unittest.TestCase):
    def test_unita_e_riferimento(self):
        c = ve.leggi_esperimento(CSV, riferimento_pa=101640)
        self.assertEqual(len(c), 2)  # la riga senza quota si scarta
        self.assertAlmostEqual(c[1].quota_cm, 11.2)
        self.assertAlmostEqual(c[1].dp_kpa, 1.02)
        self.assertAlmostEqual(c[1].comando, 93.0)


class Sincronia(unittest.TestCase):
    def setUp(self):
        self.c = ve.leggi_esperimento(CSV, riferimento_pa=101640)
        self.tempi = [x.t for x in self.c]

    def test_primo_campione_dopo_il_fotogramma(self):
        self.assertEqual(ve.campione_al(self.c, self.tempi, 100.005).t, 100.01)

    def test_oltre_la_fine_resta_l_ultimo(self):
        self.assertEqual(ve.campione_al(self.c, self.tempi, 999.0).t, 100.01)


class Numeri(unittest.TestCase):
    def test_virgola_e_segno(self):
        self.assertEqual(ve.virgola(1.024, 2, segno=True), "+1,02")
        self.assertEqual(ve.virgola(-0.3, 1), "−0,3")


if __name__ == "__main__":
    unittest.main()
