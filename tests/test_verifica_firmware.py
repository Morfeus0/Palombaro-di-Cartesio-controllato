"""Test di pc/verifica_firmware.py (il «Fatto quando» della 2.5 letto dal registro).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import verifica_firmware as vf  # noqa: E402
from protocollo import componi  # noqa: E402


def registro_finto(secondi: int, scarto_us: int = 80, salta: tuple[int, ...] = ()) -> list[str]:
    righe = ["20:00:00.000 # palombaro 0.1, protocollo 1, riavvio: POWERON, sensore presente"]
    for seq in range(secondi * 100 + 1):
        if seq in salta:
            continue
        righe.append("20:00:00.000 " + componi(f"T,{seq},{seq * 10},104285,1460,M,0,0.0,0.0,2392"))
        if seq % 100 == 0 and seq:
            righe.append("20:00:00.000 " + componi(f"A,{seq * 10},2392,100,0,0,0,POWERON,{scarto_us},0,119"))
    return righe


class Riassunto(unittest.TestCase):
    def test_trenta_minuti_regolari_superano(self):
        r = vf.riassunto(registro_finto(30 * 60))
        self.assertTrue(r["superato"])
        self.assertEqual(r["persi"], 0)
        self.assertAlmostEqual(r["durata_s"], 1800.0)

    def test_scarto_di_un_millisecondo_non_supera(self):
        self.assertFalse(vf.riassunto(registro_finto(30 * 60, scarto_us=1200))["superato"])

    def test_troppo_breve_non_supera(self):
        self.assertFalse(vf.riassunto(registro_finto(60))["superato"])

    def test_avvio_attaccato_ai_caratteri_del_bootloader(self):
        righe = ["20:00:00.000 x\ufffdx\ufffd# palombaro 0.1, protocollo 1, riavvio: POWERON, sensore presente"]
        self.assertEqual(vf.riassunto(righe)["riavvii"], 1)

    def test_un_riavvio_fa_ricominciare_la_prova(self):
        righe = registro_finto(30 * 60) + registro_finto(60)
        r = vf.riassunto(righe)
        self.assertFalse(r["superato"])
        self.assertEqual(r["riavvii"], 2)

    def test_conta_le_righe_perse(self):
        self.assertEqual(vf.riassunto(registro_finto(10, salta=(50, 51, 52)))["persi"], 3)


if __name__ == "__main__":
    unittest.main()
