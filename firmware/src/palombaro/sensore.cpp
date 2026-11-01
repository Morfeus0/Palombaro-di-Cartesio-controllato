#include "sensore.h"

#include <Adafruit_BMP280.h>
#include <Arduino.h>
#include <Wire.h>

namespace sensore {
namespace {

constexpr int PIN_SDA = 21;
constexpr int PIN_SCL = 22;
constexpr uint32_t BUS_HZ = 400000;
constexpr uint8_t INDIRIZZI[] = {0x76, 0x77};
constexpr uint8_t REG_ID = 0xD0;
constexpr uint8_t ID_BMP280 = 0x58;
constexpr uint8_t REG_CTRL_MEAS = 0xF4;
constexpr uint8_t MODO_NORMALE = 0x03;

Adafruit_BMP280 bmp;
uint8_t indirizzoAttuale = 0;

int leggiRegistro(uint8_t registro) {
  Wire.beginTransmission(indirizzoAttuale);
  Wire.write(registro);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom(indirizzoAttuale, static_cast<uint8_t>(1)) != 1) return -1;
  return Wire.read();
}

// Dice se una lettura è fisicamente credibile per il nostro banco: una lettura assurda vuol dire contatto
// intermittente, chip riavviato o guasto (19 e 21 ottobre: 2,48 kPa e 179,76 °C; 1 novembre: 85,51 kPa e 25,30 °C).
// Una lettura non credibile porta in SAFE con il motivo SENSORE (decisione 10 della 2.4).
// Limiti larghi apposta: devono scartare i guasti, non fermare il banco per il meteo o per un tappo scaldato.
// - pressione: stanza tra 100,5 e 101,6 kPa finora, fino a 3 kPa in meno con il brutto tempo e +4 kPa di siringa
//   (la sovrapressione vera ha il suo controllo, a 106,5 kPa); 110 kPa è il fondo scala del BMP280;
// - temperatura: nel tappo 21–27 °C, 39 °C la sera del 1 novembre con il chip scaldato da SDO libero ma la pressione
//   giusta: si accetta, perché è la pressione che serve al controllo.
// Le firme dei guasti cadono fuori: 2,48 kPa (bus rotto) e 85,51 kPa (chip riavviato) per la pressione, 179,76 °C per
// la temperatura.
constexpr float PRESSIONE_MIN_PA = 90000.0f;
constexpr float PRESSIONE_MAX_PA = 110000.0f;
constexpr float TEMPERATURA_MIN_C = 0.0f;
constexpr float TEMPERATURA_MAX_C = 50.0f;

bool letturaPlausibile(float pressionePa, float temperaturaC) {
  if (isnan(pressionePa) || isnan(temperaturaC)) return false;
  return pressionePa >= PRESSIONE_MIN_PA && pressionePa <= PRESSIONE_MAX_PA &&
         temperaturaC >= TEMPERATURA_MIN_C && temperaturaC <= TEMPERATURA_MAX_C;
}

}  // namespace

bool avvia() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(BUS_HZ);
  for (uint8_t candidato : INDIRIZZI) {
    if (bmp.begin(candidato)) {
      indirizzoAttuale = candidato;
      // circa 7 ms per misura (temperatura ×1, pressione ×2, attesa 0,5 ms): una misura nuova a ogni ciclo da 10 ms
      bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X1, Adafruit_BMP280::SAMPLING_X2,
                      Adafruit_BMP280::FILTER_OFF, Adafruit_BMP280::STANDBY_MS_1);
      return true;
    }
  }
  indirizzoAttuale = 0;
  return false;
}

bool leggi(Lettura& l) {
  if (indirizzoAttuale == 0) return false;
  l.temperaturaC = bmp.readTemperature();
  l.pressionePa = bmp.readPressure();
  return letturaPlausibile(l.pressionePa, l.temperaturaC);
}

bool sano() {
  if (indirizzoAttuale == 0) return false;
  if (leggiRegistro(REG_ID) != ID_BMP280) return false;
  const int ctrl = leggiRegistro(REG_CTRL_MEAS);
  return ctrl >= 0 && (ctrl & MODO_NORMALE) == MODO_NORMALE;
}

uint8_t indirizzo() { return indirizzoAttuale; }

}  // namespace sensore
