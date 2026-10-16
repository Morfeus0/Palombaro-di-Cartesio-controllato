#include <Arduino.h>
#include <Wire.h>
#include <driver/gpio.h>

// Prova A/B del CSB (sottofase 1.3, diagnosi del 16 ott).
// Il BMP280 di riferimento è infilato nella riga a, colonne 3-8, accanto ai pin dell'ESP32,
// ed è alimentato dai pin stessi: VCC D5, GND TX2 (17), SCL RX2 (16), SDA D4, CSB D2, SDO D15.
// A ogni giro il sensore viene spento e riacceso alternando:
//   A: CSB a 3,3 V e SDO a 0 V (come quando ha funzionato il 15 ott);
//   B: CSB e SDO scollegati (come sul sensore del tappo).
// Il firmware di lettura e diagnosi del 15 ott è nel commit 7c0b77c.

namespace {

constexpr int PIN_VCC = 5;
constexpr int PIN_GND = 17;
constexpr int PIN_SCL = 16;
constexpr int PIN_SDA = 4;
constexpr int PIN_CSB = 2;
constexpr int PIN_SDO = 15;
constexpr uint32_t I2C_HZ = 100000;
constexpr uint32_t PAUSA_MS = 1500;
constexpr uint32_t SPENTO_MS = 200;
constexpr uint32_t AVVIO_MS = 50;

// Uscita a corrente minima (~5 mA): basta al sensore (<1 mA) e limita la corrente in caso di errori.
void uscitaDebole(int pin, int livello) {
  pinMode(pin, OUTPUT);
  gpio_set_drive_capability(static_cast<gpio_num_t>(pin), GPIO_DRIVE_CAP_0);
  digitalWrite(pin, livello);
}

// Il sensore si spegne portando la sua massa a 3,3 V; tutte le altre linee restano libere,
// così nessun pin a 0 V lo alimenta di traverso attraverso i diodi di protezione.
void spegniSensore() {
  Wire.end();
  for (int pin : {PIN_SDA, PIN_SCL, PIN_CSB, PIN_SDO}) pinMode(pin, INPUT);
  digitalWrite(PIN_GND, HIGH);
  delay(SPENTO_MS);
}

// Il BMP280 sceglie I2C o SPI all'accensione guardando il CSB: per questo lo si imposta prima.
void accendiSensore(bool csbPilotato) {
  if (csbPilotato) {
    uscitaDebole(PIN_CSB, HIGH);
    uscitaDebole(PIN_SDO, LOW);
  }
  digitalWrite(PIN_GND, LOW);
  delay(AVVIO_MS);
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(I2C_HZ);
}

// Il BMP280 risponde a 0x76 (SDO a massa) o a 0x77 (SDO a VCC): 0 se non risponde nessuno.
uint8_t cercaSensore() {
  for (uint8_t indirizzo : {0x76, 0x77}) {
    Wire.beginTransmission(indirizzo);
    if (Wire.endTransmission() == 0) return indirizzo;
  }
  return 0;
}

// Con il pull-down interno (~45 kΩ) una linea dati legge alta solo se il pin del sensore fa contatto
// e il sensore è alimentato: la tirano su le resistenze da 10 kΩ della sua scheda.
bool lineaAlta(int pin) {
  pinMode(pin, INPUT_PULLDOWN);
  delay(2);
  const bool alta = digitalRead(pin) == HIGH;
  pinMode(pin, INPUT);
  return alta;
}

void provaModo(bool csbPilotato) {
  spegniSensore();
  accendiSensore(csbPilotato);
  Wire.end();
  const bool sdaAlta = lineaAlta(PIN_SDA);
  const bool sclAlta = lineaAlta(PIN_SCL);
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(I2C_HZ);
  const uint8_t indirizzo = cercaSensore();
  Serial.print(csbPilotato ? "A (CSB alto, SDO basso)  " : "B (CSB e SDO scollegati) ");
  Serial.printf(" SDA %s  SCL %s  ->  ", sdaAlta ? "alta " : "BASSA", sclAlta ? "alta " : "BASSA");
  if (indirizzo != 0) {
    Serial.printf("risponde a 0x%02X\n", indirizzo);
  } else {
    Serial.println("NESSUNA RISPOSTA");
  }
}

}  // namespace

void setup() {
  Serial.begin(115200);
  uscitaDebole(PIN_VCC, HIGH);
  uscitaDebole(PIN_GND, HIGH);
  delay(500);
  Serial.println("Prova A/B del CSB");
}

void loop() {
  provaModo(true);
  delay(PAUSA_MS);
  provaModo(false);
  delay(PAUSA_MS);
}
