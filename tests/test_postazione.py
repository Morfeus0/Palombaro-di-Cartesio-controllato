"""Test di pc/postazione.py (misure della postazione di ripresa e comandi per la telecamera).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
Le immagini sono sintetiche: uno sfondo grigio chiaro con dentro quello che serve alla prova.
"""
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import postazione as p  # noqa: E402


def sfondo(alto: int = 100, largo: int = 80, livello: int = 200) -> np.ndarray:
    return np.full((alto, largo, 3), livello, dtype=np.uint8)


class Ritaglia(unittest.TestCase):
    def test_senza_rettangolo_restituisce_tutto(self):
        immagine = sfondo()
        self.assertIs(p.ritaglia(immagine, None), immagine)

    def test_limita_il_rettangolo_ai_bordi(self):
        self.assertEqual(p.ritaglia(sfondo(), (70, 90, 50, 50)).shape[:2], (10, 10))

    def test_rettangolo_fuori_dall_immagine(self):
        with self.assertRaises(ValueError):
            p.ritaglia(sfondo(), (500, 500, 10, 10))


class MisureDiLuce(unittest.TestCase):
    def test_luminosita_e_la_mediana(self):
        grigio = np.full((10, 10), 100, dtype=np.uint8)
        grigio[0, :3] = 255  # pochi pixel chiarissimi non spostano la mediana
        self.assertEqual(p.luminosita(grigio), 100.0)

    def test_riflessi_contano_solo_i_pixel_saturati(self):
        grigio = np.full((10, 10), 240, dtype=np.uint8)
        grigio[0, :5] = 252
        self.assertAlmostEqual(p.percentuale_riflessi(grigio), 5.0)

    def test_nitidezza_piu_alta_con_i_bordi_netti(self):
        netta = np.zeros((40, 40), dtype=np.uint8)
        netta[:, ::4] = 255  # righe come le tacche di un righello
        sfocata = np.full((40, 40), 64, dtype=np.uint8)
        self.assertGreater(p.nitidezza(netta), p.nitidezza(sfocata))


class Rosso(unittest.TestCase):
    def test_trova_il_marcatore_e_ignora_il_resto(self):
        immagine = sfondo()
        immagine[20:30, 30:40] = (30, 30, 200)    # rosso (BGR): il marcatore
        immagine[60:70, 30:40] = (200, 60, 30)    # blu: non conta
        immagine[80:90, 10:20] = (180, 180, 230)  # rosa pallido, poco saturo: non conta
        zone = p.zone_rosse(p.maschera_rosso(immagine))
        self.assertEqual(len(zone), 1)
        self.assertEqual((zone[0]["x"], zone[0]["y"], zone[0]["w"], zone[0]["h"]), (30, 20, 10, 10))

    def test_rosso_dall_altra_parte_dello_zero(self):
        immagine = sfondo()
        immagine[20:30, 30:40] = (60, 20, 200)  # rosso tendente al magenta: tinta 173 (su 180)
        self.assertEqual(len(p.zone_rosse(p.maschera_rosso(immagine))), 1)

    def test_il_rame_non_e_rosso(self):
        immagine = sfondo()
        immagine[20:30, 30:40] = (30, 92, 200)  # rosso-arancio del filo di rame sott'acqua: tinta 11
        self.assertEqual(p.zone_rosse(p.maschera_rosso(immagine)), [])

    def test_puntini_isolati_non_sono_zone(self):
        immagine = sfondo()
        immagine[50, 50] = (30, 30, 200)
        self.assertEqual(p.zone_rosse(p.maschera_rosso(immagine)), [])

    def test_scala_riporta_alla_piena_risoluzione(self):
        maschera = np.zeros((50, 50), dtype=np.uint8)
        maschera[10:20, 10:15] = 255
        zona = p.zone_rosse(maschera, scala=2.0)[0]
        self.assertEqual((zona["x"], zona["y"], zona["w"], zona["h"], zona["area"]), (20, 20, 10, 20, 200))

    def test_anteprima_colora_solo_i_pixel_rossi(self):
        immagine = sfondo()
        maschera = np.zeros(immagine.shape[:2], dtype=np.uint8)
        maschera[0, 0] = 255
        anteprima = p.anteprima_rosso(immagine, maschera)
        self.assertEqual(tuple(anteprima[0, 0]), (255, 0, 255))
        self.assertEqual(tuple(anteprima[5, 5]), (164, 164, 164))


class Serie(unittest.TestCase):
    def test_deriva(self):
        self.assertIsNone(p.deriva_percentuale([200.0]))
        self.assertAlmostEqual(p.deriva_percentuale([198.0, 200.0, 202.0]), 2.0)

    def test_statistiche_dei_fotogrammi(self):
        tempi = [0.0, 1 / 30, 2 / 30, 3 / 30 + 0.2]  # un buco di 200 ms in fondo
        stat = p.statistiche_fotogrammi(tempi)
        self.assertAlmostEqual(stat["fps"], 3 / tempi[-1])
        self.assertAlmostEqual(stat["intervallo_max_ms"], (1 / 30 + 0.2) * 1000)
        self.assertEqual(p.statistiche_fotogrammi([1.0]), {"fps": None, "intervallo_max_ms": None})


class Comandi(unittest.TestCase):
    def test_comandi_validi(self):
        self.assertEqual(p.valida_comando({"comando": "riferimento"}), {"comando": "riferimento"})
        self.assertEqual(p.valida_comando({"comando": "registra", "secondi": 120}), {"comando": "registra", "secondi": 120})
        roi = {"comando": "roi", "x": 800, "y": 100, "w": 300, "h": 860}
        self.assertEqual(p.valida_comando({**roi, "altro": 1}), roi)

    def test_comandi_non_validi(self):
        for dati in [None, [], {"comando": "spegni"}, {"comando": "registra", "secondi": 0},
                     {"comando": "registra", "secondi": "120"}, {"comando": "registra", "secondi": True},
                     {"comando": "roi", "x": 0, "y": 0, "w": 5, "h": 100}, {"comando": "roi", "x": -1, "y": 0, "w": 50, "h": 50}]:
            with self.subTest(dati=dati), self.assertRaises(ValueError):
                p.valida_comando(dati)

    def test_scritti_e_letti_in_ordine_senza_perderne(self):
        with tempfile.TemporaryDirectory() as cartella:
            c = Path(cartella) / "comandi"
            p.scrivi_comando(c, {"comando": "roi", "x": 1, "y": 2, "w": 30, "h": 40})
            p.scrivi_comando(c, {"comando": "registra", "secondi": 5})
            (c / "1.json").write_text("{rotto", encoding="utf-8")  # il più vecchio, e non valido
            comandi, errori = p.leggi_comandi(c)
            self.assertEqual([x["comando"] for x in comandi], ["roi", "registra"])
            self.assertEqual(len(errori), 1)
            self.assertEqual(list(c.iterdir()), [])
            self.assertEqual(p.leggi_comandi(Path(cartella) / "manca"), ([], []))

    def test_scrittura_atomica(self):
        with tempfile.TemporaryDirectory() as cartella:
            percorso = Path(cartella) / "stato.json"
            p.scrivi_atomico(percorso, b"{}")
            self.assertEqual(percorso.read_bytes(), b"{}")
            self.assertEqual([f.name for f in Path(cartella).iterdir()], ["stato.json"])


if __name__ == "__main__":
    unittest.main()
