"""Test di pc/anello_aperto.py (fughe di P1 comandate dal Mac, 3.3).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import anello_aperto as aa  # noqa: E402

REGISTRO = (
    "17:21:02.513 $A,6110120,2270,100,0,0,0,POWERON,1,0,119*14\n"
    "17:21:02.542 $T,611002,6110149,101366,360,M,0,0.0,0.0,2270*0A\n"
    "17:21:02.552 $T,611003,6110159,101364,1060,M,0,0.0,0.0,2270*08\n"
    "17:21:02.562 $T,6110"
)


class Registro(unittest.TestCase):
    def test_ultima_riga_t_completa(self):
        self.assertEqual(aa.ultima_riga_t(REGISTRO), aa.Lettura(101.364, 106.0))

    def test_niente_righe_t(self):
        self.assertIsNone(aa.ultima_riga_t("17:21:02.513 $A,1,2,3\n"))


class Regolatore(unittest.TestCase):
    def test_pressione_bassa_spinge(self):
        self.assertEqual(aa.nuovo_angolo(80, 101.80, 102.00), 86)  # 0,2 kPa × 28°/kPa ≈ 6°

    def test_dentro_la_banda_non_si_muove(self):
        self.assertEqual(aa.nuovo_angolo(80, 102.00, 102.01), 80)

    def test_passo_minimo_di_un_grado(self):
        self.assertEqual(aa.nuovo_angolo(80, 102.03, 102.01), 79)

    def test_limiti_della_corsa(self):
        self.assertEqual(aa.nuovo_angolo(140, 101.0, 105.0), 146)
        self.assertEqual(aa.nuovo_angolo(40, 105.0, 101.0), 36)

    def test_passo_massimo(self):
        self.assertEqual(aa.nuovo_angolo(80, 101.0, 102.0), 80 + aa.PASSO_MAX_GRADI)


if __name__ == "__main__":
    unittest.main()
