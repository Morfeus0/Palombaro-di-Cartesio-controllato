#include <Arduino.h>
#include <Wire.h>

// Diagnosi del bus I²C del sensore nel tappo (21 ottobre: il BMP280 non risponde a 0x76).
// Senza aprire nulla dice se SDA e SCL arrivano al modulo (le sue resistenze di pull-up),
// se una linea è a massa (acqua, corto) e quali indirizzi rispondono. Ripete ogni 5 s.

namespace {

constexpr int PIN_SDA = 21;
constexpr int PIN_SCL = 22;
constexpr uint8_t REG_CHIP_ID = 0xD0;  // BMP280: 0x58, BME280: 0x60
constexpr uint32_t PERIODO_MS = 5000;

// Il pull-down interno (circa 45 kΩ) vince solo se manca il pull-up del modulo (circa 10 kΩ).
const char* statoLinea(int pin) {
  pinMode(pin, INPUT_PULLDOWN);
  delay(2);
  const bool altaConPullDown = digitalRead(pin);
  pinMode(pin, INPUT_PULLUP);
  delay(2);
  const bool altaConPullUp = digitalRead(pin);
  if (altaConPullDown && altaConPullUp) return "ALTA: pull-up del modulo presente (filo integro, modulo alimentato)";
  if (altaConPullUp) return "FLOTTANTE: nessun pull-up (filo interrotto o modulo senza alimentazione)";
  if (!altaConPullDown) return "BASSA: linea a massa (corto, acqua o modulo bloccato)";
  return "incoerente";
}

void scansiona() {
  Wire.begin(PIN_SDA, PIN_SCL);
  int trovati = 0;
  for (uint8_t indirizzo = 1; indirizzo < 127; indirizzo++) {
    Wire.beginTransmission(indirizzo);
    if (Wire.endTransmission() != 0) continue;
    trovati++;
    Wire.beginTransmission(indirizzo);
    Wire.write(REG_CHIP_ID);
    Wire.endTransmission(false);
    Wire.requestFrom(indirizzo, static_cast<uint8_t>(1));
    const int id = Wire.available() ? Wire.read() : -1;
    Serial.printf("# risponde 0x%02X, chip id 0x%02X\n", indirizzo, id);
  }
  if (trovati == 0) Serial.println("# nessun dispositivo risponde sul bus");
  Wire.end();
}

}  // namespace

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("# diagnosi I2C del sensore del tappo");
}

void loop() {
  Serial.printf("# SDA (GPIO %d): %s\n", PIN_SDA, statoLinea(PIN_SDA));
  Serial.printf("# SCL (GPIO %d): %s\n", PIN_SCL, statoLinea(PIN_SCL));
  scansiona();
  delay(PERIODO_MS);
}
