"""Test di pc/protocollo.py (righe del protocollo Mac ↔ ESP32, docs/protocollo.md), e delle righe nuove nella dashboard.

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc" / "dashboard"))

import protocollo as pr  # noqa: E402
from registro import analizza_riga  # noqa: E402


class Righe(unittest.TestCase):
    def test_componi_come_il_firmware(self):
        # stesso controllo del test del firmware: "Z,1" -> 'Z' ^ ',' ^ '1'
        self.assertEqual(pr.componi("Z,1"), f"$Z,1*{ord('Z') ^ ord(',') ^ ord('1'):02X}")

    def test_analizza_ritrova_tipo_e_campi(self):
        self.assertEqual(pr.analizza(pr.componi("T,7,1200,104285,1460,M,0,0.0,0.0,2392")),
                         ("T", ["7", "1200", "104285", "1460", "M", "0", "0.0", "0.0", "2392"]))

    def test_controllo_sbagliato_da_none(self):
        self.assertIsNone(pr.analizza("$S,1460*00"))

    def test_riga_non_del_protocollo_da_none(self):
        self.assertIsNone(pr.analizza("# testo per le persone"))

    def test_angolo_della_dashboard_diventa_comando_s(self):
        self.assertEqual(pr.comando_servo("146"), pr.componi("S,1460"))
        self.assertIsNone(pr.comando_servo("ciao"))


class RegistroNuovo(unittest.TestCase):
    def test_riga_t_diventa_una_misura(self):
        riga = "20:30:00.123 " + pr.componi("T,7,1200,104285,1455,M,0,0.0,0.0,2392")
        self.assertEqual(analizza_riga(riga),
                         {"tipo": "misura", "t": "20:30:00.123", "p": 104.285, "T": 23.92, "servo": 146})

    def test_servo_non_ancora_attivo(self):
        riga = "20:30:00.123 " + pr.componi("T,7,1200,104285,-1,M,0,0.0,0.0,2392")
        self.assertIsNone(analizza_riga(riga)["servo"])

    def test_cambio_di_stato_diventa_un_evento(self):
        riga = "20:30:00.123 " + pr.componi("X,MANUALE,SAFE,SENSORE")
        self.assertEqual(analizza_riga(riga),
                         {"tipo": "evento", "t": "20:30:00.123", "testo": "stato: MANUALE → SAFE (SENSORE)"})

    def test_riga_a_non_va_negli_eventi(self):
        riga = "20:30:00.123 " + pr.componi("A,1000,2392,100,0,0,0,POWERON,85,0,119")
        self.assertIsNone(analizza_riga(riga))


if __name__ == "__main__":
    unittest.main()
