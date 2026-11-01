#pragma once
// BMP280 nel tappo (sottofase 1.3): pressione e temperatura a 100 Hz (sovracampionamento ×2, decisione 7 della 2.4).
#include <cstdint>

namespace sensore {

struct Lettura {
  float pressionePa;
  float temperaturaC;
};

// Cerca il sensore a 0x76 e 0x77 (SDO libero sulla scheda del tappo) e lo configura; false se non risponde.
bool avvia();

// Una lettura dei registri (circa 0,5 ms sul bus a 400 kHz); false se la lettura non è credibile.
bool leggi(Lettura& l);

// Controllo di salute, una volta al secondo: il chip risponde con la sua identità ed è ancora in misura continua
// (dopo un riavvio da solo resta a riposo e dà sempre 85,51 kPa e 25,30 °C, come il 1 novembre alle 17:13).
bool sano();

uint8_t indirizzo();

}  // namespace sensore
