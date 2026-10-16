#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

// Prova di banco del BMP280 sul tappo (sottofase 1.3): verifica fili e saldature
// prima della colata di epossidica, e di nuovo dopo. Nella 2.5 lascia il posto al firmware vero.
//
// Collegamenti: rosso -> 3V3, bianco -> GND, verde -> GPIO 21 (SDA), giallo -> GPIO 22 (SCL).
// Sul sensore il CSB è collegato al VCC con un ponticello (I2C fisso), l'SDO è libero.

namespace {

constexpr int PIN_SDA = 21;
constexpr int PIN_SCL = 22;
constexpr uint8_t REG_CHIP_ID = 0xD0;
constexpr uint8_t CHIP_ID_BMP280 = 0x58;
constexpr uint8_t CHIP_ID_BME280 = 0x60;
constexpr uint32_t PERIODO_STAMPA_MS = 200;
constexpr uint32_t PAUSA_RIPROVA_MS = 2000;

Adafruit_BMP280 bmp;
float pressioneIniziale = NAN;

// Il BMP280 risponde a 0x76 (SDO a massa) o a 0x77 (SDO a VCC): 0 se non risponde nessuno.
uint8_t cercaSensore() {
  for (uint8_t indirizzo : {0x76, 0x77}) {
    Wire.beginTransmission(indirizzo);
    if (Wire.endTransmission() == 0) return indirizzo;
  }
  return 0;
}

// Il registro 0xD0 dice quale chip c'è davvero: 0x58 BMP280, 0x60 BME280.
uint8_t leggiChipId(uint8_t indirizzo) {
  Wire.beginTransmission(indirizzo);
  Wire.write(REG_CHIP_ID);
  if (Wire.endTransmission(false) != 0) return 0;
  if (Wire.requestFrom(static_cast<int>(indirizzo), 1) != 1) return 0;
  return Wire.read();
}

// Con il pull-down interno (~45 kΩ) una linea dati legge alta solo se il filo arriva al sensore
// e il sensore è alimentato: la tirano su le resistenze da 10 kΩ della sua scheda.
bool lineaAlta(int pin) {
  pinMode(pin, INPUT_PULLDOWN);
  delay(2);
  const bool alta = digitalRead(pin) == HIGH;
  pinMode(pin, INPUT);
  return alta;
}

void stampaDiagnostica() {
  Wire.end();
  const bool sdaAlta = lineaAlta(PIN_SDA);
  const bool sclAlta = lineaAlta(PIN_SCL);
  Wire.begin(PIN_SDA, PIN_SCL);
  Serial.printf("Nessun sensore.  verde/SDA: %s  giallo/SCL: %s\n", sdaAlta ? "alta" : "BASSA",
                sclAlta ? "alta" : "BASSA");
  if (!sdaAlta || !sclAlta) {
    Serial.println("  linea bassa: sensore non alimentato o filo che non fa contatto (misura col multimetro)");
  } else {
    Serial.println("  linee alte ma nessuna risposta: sensore alimentato, chip che non risponde");
  }
}

// Dice se una lettura è fisicamente credibile per il nostro banco: una lettura assurda
// vuol dire contatto intermittente, saldatura fredda o sensore guasto.
bool letturaPlausibile(float pressionePa, float temperaturaC) {
  // TODO: scegliere i limiti di pressione (in Pa) e temperatura (in °C) e restituire false fuori da essi.
  (void)pressionePa;
  (void)temperaturaC;
  return true;
}

[[noreturn]] void fermaConErrore(const char* messaggio) {
  Serial.println(messaggio);
  while (true) delay(1000);
}

}  // namespace

void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(PIN_SDA, PIN_SCL);

  uint8_t indirizzo = cercaSensore();
  while (indirizzo == 0) {
    stampaDiagnostica();
    delay(PAUSA_RIPROVA_MS);
    indirizzo = cercaSensore();
  }
  const uint8_t chipId = leggiChipId(indirizzo);
  Serial.printf("Sensore a 0x%02X, chip ID 0x%02X", indirizzo, chipId);
  if (chipId == CHIP_ID_BMP280) {
    Serial.println(" (BMP280)");
  } else if (chipId == CHIP_ID_BME280) {
    Serial.println(" (BME280: pressione e temperatura funzionano uguale)");
  } else {
    fermaConErrore("\nERRORE: chip ID sconosciuto. Possibile sensore guasto o contatto incerto.");
  }

  if (!bmp.begin(indirizzo, chipId)) fermaConErrore("ERRORE: inizializzazione del sensore fallita.");
  // Filtro interno spento: per la prova vogliamo vedere subito il soffio o la stretta della bottiglia.
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X2,
                  Adafruit_BMP280::SAMPLING_X16, Adafruit_BMP280::FILTER_OFF,
                  Adafruit_BMP280::STANDBY_MS_63);
  delay(100);
  pressioneIniziale = bmp.readPressure();
}

void loop() {
  const float pressionePa = bmp.readPressure();
  const float temperaturaC = bmp.readTemperature();
  Serial.printf("p = %.2f kPa  dp = %+5.0f Pa  T = %.2f C  %s\n", pressionePa / 1000.0f,
                pressionePa - pressioneIniziale, temperaturaC,
                letturaPlausibile(pressionePa, temperaturaC) ? "ok" : "SOSPETTA");
  delay(PERIODO_STAMPA_MS);
}
