#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <driver/gpio.h>

// Prova di banco del BMP280 (sottofase 1.3, passo 4): verifica fili e saldature
// prima della colata di epossidica, e di nuovo dopo. Nella 2.5 lascia il posto al firmware vero.
//
// Collegamento di DIAGNOSI: sensore infilato nella riga a, colonne 3-8, accanto ai pin dell'ESP32
// su una seconda breadboard, con cavetti verso colonne mai usate: VCC D15, GND D2, SDA D18, SCL D19;
// CSB e SDO scollegati come sul sensore del tappo.

namespace {

constexpr int PIN_SDA = 18;
constexpr int PIN_SCL = 19;
// Solo per la diagnosi: pin che alimentano il sensore infilato direttamente accanto all'ESP32.
constexpr int PIN_VCC_PROVA = 15;
constexpr int PIN_MASSA_PROVA = 2;
constexpr int PIN_SDO_PROVA = 5;
// Bus lento per la diagnosi: con 1 m di cavo i fronti dei segnali sono più morbidi.
constexpr uint32_t I2C_HZ = 10000;
// CSB alto all'accensione: il BMP280 resta in I2C.
constexpr int PIN_CSB_PROVA = 17;
constexpr uint8_t REG_CHIP_ID = 0xD0;
constexpr uint8_t CHIP_ID_BMP280 = 0x58;
constexpr uint8_t CHIP_ID_BME280 = 0x60;
constexpr uint32_t PERIODO_STAMPA_MS = 200;

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

// Dice se una lettura è fisicamente credibile per il nostro banco: una lettura assurda
// vuol dire contatto intermittente, saldatura fredda o sensore guasto.
bool letturaPlausibile(float pressionePa, float temperaturaC) {
  // TODO: scegliere i limiti di pressione (in Pa) e temperatura (in °C) e restituire false fuori da essi.
  (void)pressionePa;
  (void)temperaturaC;
  return true;
}

// Con il pull-down interno dell'ESP32 (~45 kΩ) una linea resta alta solo se il filo arriva al sensore
// e il sensore è alimentato: sono i pull-up da 10 kΩ della scheda del BMP280 a tirarla su.
bool lineaAlta(int pin) {
  pinMode(pin, INPUT_PULLDOWN);
  delay(2);
  return digitalRead(pin) == HIGH;
}

// Elenca gli indirizzi che rispondono sul bus, provando anche SDA e SCL scambiati.
void scansionaBus(int pinSda, int pinScl) {
  Wire.begin(pinSda, pinScl);
  Wire.setClock(I2C_HZ);
  Serial.printf("  scansione con SDA=%d, SCL=%d:", pinSda, pinScl);
  int trovati = 0;
  for (uint8_t indirizzo = 1; indirizzo < 127; ++indirizzo) {
    Wire.beginTransmission(indirizzo);
    if (Wire.endTransmission() == 0) {
      Serial.printf(" 0x%02X", indirizzo);
      ++trovati;
    }
  }
  Serial.println(trovati == 0 ? " nessun dispositivo" : "");
  Wire.end();
}

// Prova di continuità del filo bianco (sul GPIO 23) senza multimetro: con SDA a 0 V e il pull-up
// sul GPIO 23, la corrente passa nel diodo di protezione GND->SDA del chip solo se il filo arriva
// davvero al GND del sensore; in quel caso il pin resta a ~0,6 V e legge basso.
bool massaCollegata() {
  pinMode(PIN_SDA, OUTPUT);
  digitalWrite(PIN_SDA, LOW);
  pinMode(PIN_MASSA_PROVA, INPUT_PULLUP);
  delay(2);
  const bool collegata = digitalRead(PIN_MASSA_PROVA) == LOW;
  pinMode(PIN_MASSA_PROVA, OUTPUT);
  digitalWrite(PIN_MASSA_PROVA, LOW);
  pinMode(PIN_SDA, INPUT);
  return collegata;
}

void diagnostica() {
  Wire.end();
  const bool sdaAlta = lineaAlta(PIN_SDA);
  const bool sclAlta = lineaAlta(PIN_SCL);
  Serial.printf("DIAGNOSTICA  SDA (GPIO %d): %s   SCL (GPIO %d): %s\n", PIN_SDA,
                sdaAlta ? "alta, ok" : "BASSA", PIN_SCL, sclAlta ? "alta, ok" : "BASSA");
  if (!sdaAlta && !sclAlta) {
    Serial.println("  entrambe basse: sensore non alimentato o pin non a contatto");
  }
  scansionaBus(PIN_SDA, PIN_SCL);
  scansionaBus(PIN_SCL, PIN_SDA);
}

// Spegne e riaccende il sensore alzando la sua massa (filo bianco sul GPIO 23): il BMP280 sceglie
// I2C o SPI solo all'accensione, guardando il CSB.
void riaccendiSensore() {
  Wire.end();
  digitalWrite(PIN_MASSA_PROVA, HIGH);
  delay(200);
  digitalWrite(PIN_MASSA_PROVA, LOW);
  delay(50);
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(I2C_HZ);
}

// Uscita a corrente minima (~5 mA): basta al sensore (<1 mA) e limita la corrente se fosse infilato al contrario.
void pinDiAlimentazione(int pin, int livello) {
  pinMode(pin, OUTPUT);
  gpio_set_drive_capability(static_cast<gpio_num_t>(pin), GPIO_DRIVE_CAP_0);
  digitalWrite(pin, livello);
}

[[noreturn]] void fermaConErrore(const char* messaggio) {
  Serial.println(messaggio);
  while (true) delay(1000);
}

}  // namespace

void setup() {
  Serial.begin(115200);
  pinDiAlimentazione(PIN_VCC_PROVA, HIGH);
  pinDiAlimentazione(PIN_MASSA_PROVA, LOW);
  // Prova: CSB e SDO lasciati scollegati, come sul sensore del tappo.
  pinMode(PIN_CSB_PROVA, INPUT);
  pinMode(PIN_SDO_PROVA, INPUT);
  delay(1000);
  riaccendiSensore();

  uint8_t indirizzo = cercaSensore();
  while (indirizzo == 0) {
    Serial.println("Nessun sensore a 0x76 o 0x77.");
    diagnostica();
    delay(2000);
    riaccendiSensore();
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
