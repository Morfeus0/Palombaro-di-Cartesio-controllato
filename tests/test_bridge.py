"""Test di pc/bridge.py (ponte Mac ↔ ESP32 e registrazione degli esperimenti, sottofase 2.6).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import bridge as br  # noqa: E402
from protocollo import analizza  # noqa: E402


class Quota(unittest.TestCase):
    def test_datagramma_della_telecamera(self):
        self.assertEqual(br.leggi_datagramma(b"1523,1793560000.1234,0"), br.Quota(1523, 1793560000.1234, 0))

    def test_datagramma_rovinato_da_none(self):
        self.assertIsNone(br.leggi_datagramma(b"ciao"))
        self.assertIsNone(br.leggi_datagramma(b"1523,1793560000.1,7"))  # vista solo 0, 1, 2

    def test_z_con_eta_in_millisecondi(self):
        riga = br.riga_z(12, br.Quota(1523, 100.000, 0), adesso=100.018)
        self.assertEqual(analizza(riga), ("Z", ["12", "1523", "18", "0"]))


class Esperimento(unittest.TestCase):
    def test_nome_con_numero_progressivo(self):
        with tempfile.TemporaryDirectory() as cartella:
            c = Path(cartella)
            self.assertEqual(br.nome_esperimento(c, "2026-11-05", "manuale").name, "2026-11-05_manuale_01.csv")
            (c / "2026-11-05_manuale_01.csv").write_text("x")
            self.assertEqual(br.nome_esperimento(c, "2026-11-05", "manuale").name, "2026-11-05_manuale_02.csv")

    def test_nome_ripulito(self):
        with tempfile.TemporaryDirectory() as cartella:
            nome = br.nome_esperimento(Path(cartella), "2026-11-05", "Prova a mano!").name
            self.assertEqual(nome, "2026-11-05_prova-a-mano_01.csv")

    def test_riga_csv_unisce_telemetria_e_ultima_quota(self):
        campi = ["7", "1200", "104285", "1460", "M", "0", "0.0", "0.0", "2392"]
        riga = br.riga_csv(50.5, campi, br.Quota(1523, 50.48, 0))
        self.assertEqual(riga, "50.500,7,1200,104285,1460,M,1523,20,0")

    def test_riga_csv_senza_quota(self):
        campi = ["7", "1200", "104285", "1460", "M", "0", "0.0", "0.0", "2392"]
        self.assertEqual(br.riga_csv(50.5, campi, None), "50.500,7,1200,104285,1460,M,,,")


class Durata(unittest.TestCase):
    def test_durata_nei_parametri(self):
        self.assertEqual(br.durata("con il video, durata=120"), 120.0)
        self.assertIsNone(br.durata("senza limite"))


class Verifica(unittest.TestCase):
    def righe(self, secondi: float, buco: tuple[float, float] | None = None) -> list[str]:
        out, t = [], 0.0
        while t <= secondi:
            senza = buco is not None and buco[0] <= t < buco[1]
            eta = (t * 1000) % 17  # fotogrammi a 60 Hz: età della quota tra 0 e 17 ms
            coda = ",,," if senza else f",1500,{eta:.0f},0"
            out.append(f"{1000 + t:.3f},{int(t * 100)},{int(t * 1000)},104000,1460,M" + coda)
            t += 0.01
        return out

    def test_cinque_minuti_senza_buchi_superano(self):
        self.assertTrue(br.verifica(self.righe(5 * 60 + 1))["superato"])

    def test_un_buco_di_quota_non_supera(self):
        r = br.verifica(self.righe(5 * 60 + 1, buco=(100.0, 100.3)))
        self.assertFalse(r["superato"])
        self.assertGreaterEqual(r["buco_quota_s"], 0.29)

    def test_troppo_breve_non_supera(self):
        self.assertFalse(br.verifica(self.righe(60))["superato"])


if __name__ == "__main__":
    unittest.main()
