#include <Arduino.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <esp_system.h>

// Banco elettronico minimo (sottofase 1.5): legge il BMP280 a 50 Hz e muove il servo su comando.
// Serve a verificare il "Fatto quando": pressione stabile ad almeno 50 Hz e servo che si muove
// senza far riavviare l'ESP32. Nella 2.5 lascia il posto al firmware vero.
//
// Collegamenti: BMP280 come in main.cpp (SDA 21, SCL 22, 3V3, GND); servo: giallo -> GPIO 18,
// rosso -> +5 V dell'alimentatore, marrone -> massa comune (alimentatore e ESP32).
// Comandi dalla seriale: un numero sposta il servo (entro i limiti); "s" fa un'escursione completa.
// Dal 21 ottobre (1.7) il braccio lungo è collegato alla siringa: il servo non esce mai da
// ANGOLO_MIN–ANGOLO_MAX e si muove sempre un grado alla volta, anche con i comandi singoli.

namespace {

constexpr int PIN_SDA = 21;
constexpr int PIN_SCL = 22;
constexpr int PIN_SERVO = 18;
// L'indirizzo dipende dal piedino SDO, che sulla scheda del tappo non è collegato (diario, 15 ottobre): il datasheet
// dice che lasciato libero l'indirizzo è indefinito. Fino al 1 novembre era sempre 0x76; alle 19:58 rispondeva a 0x77.
// Si provano tutti e due finché SDO non viene collegato alla massa.
constexpr uint8_t INDIRIZZI_BMP280[] = {0x76, 0x77};
constexpr uint8_t BMP280_REG_ID = 0xD0;
constexpr uint8_t BMP280_ID = 0x58;
constexpr uint8_t BMP280_REG_CTRL_MEAS = 0xF4;
constexpr uint8_t BMP280_MODO_NORMALE = 0x03;  // i due bit bassi di ctrl_meas
constexpr int SERVO_US_MIN = 500;   // impulso a 0°
constexpr int SERVO_US_MAX = 2400;  // impulso a 180°
constexpr int ANGOLO_CENTRO = 86;   // comando con il braccio verticale (misurato il 23 ottobre)
// Aumentando il comando il braccio va verso la siringa: spinge lo stantuffo e la pressione sale.
constexpr int SEMI_CORSA = 60;      // oltre ±60° dalla verticale la prolunga può urtare il servo
// Il minimo è 36 e non 26 (= centro − 60): il 23 ottobre, tirando fino a 26 con il circuito
// in depressione, la siringa si è spostata. A 36 lo stantuffo è a circa 18 ml, con margine dal bordo.
constexpr int ANGOLO_MIN = 36;
constexpr int ANGOLO_MAX = ANGOLO_CENTRO + SEMI_CORSA;
constexpr uint32_t PERIODO_LETTURA_US = 20000;  // 50 Hz
constexpr uint32_t PASSO_MS = 15;               // 1° ogni 15 ms: circa 1,8 s per 120°

// Tappe dell'escursione completa: un estremo, l'altro, poi di nuovo il centro.
constexpr int TAPPE_ESCURSIONE[] = {ANGOLO_MAX, ANGOLO_MIN, ANGOLO_CENTRO};
constexpr int NUMERO_TAPPE = sizeof(TAPPE_ESCURSIONE) / sizeof(TAPPE_ESCURSIONE[0]);

Adafruit_BMP280 bmp;
Servo servo;
int angolo = ANGOLO_CENTRO;     // ultimo angolo inviato al servo
int obiettivo = ANGOLO_CENTRO;  // dove sta andando, un grado alla volta
int tappa = -1;                 // tappa dell'escursione in corso; -1 nessuna escursione
uint32_t ultimaLetturaUs = 0;
uint32_t ultimoPassoMs = 0;
uint32_t inizioSecondoMs = 0;
uint32_t lettureNelSecondo = 0;
uint8_t indirizzo = INDIRIZZI_BMP280[0];  // quello a cui il sensore ha risposto l'ultima volta
bool sensoreOk = false;  // false finché il BMP280 non risponde: il servo funziona lo stesso

const char* nomeRiavvio(esp_reset_reason_t r) {
  switch (r) {
    case ESP_RST_POWERON: return "accensione";
    case ESP_RST_BROWNOUT: return "BROWNOUT (tensione scesa: alimentazione insufficiente)";
    case ESP_RST_SW: return "software";
    case ESP_RST_PANIC: return "errore del programma";
    case ESP_RST_EXT: return "pulsante EN";
    default: return "altro";
  }
}

// Controllo di collegamento, non di plausibilità (quella è letturaPlausibile() in main.cpp):
// rilegge il registro d'identità del chip. Senza risposta la libreria restituirebbe valori
// assurdi ma "validi" (19 e 21 ottobre: p circa 2,5 kPa, T circa 180 °C).
// Un registro del BMP280; -1 se il chip non risponde.
int leggiRegistro(uint8_t registro) {
  Wire.beginTransmission(indirizzo);
  Wire.write(registro);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom(indirizzo, static_cast<uint8_t>(1)) != 1) return -1;
  return Wire.read();
}

bool sensoreRisponde() { return leggiRegistro(BMP280_REG_ID) == BMP280_ID; }

// Il chip risponde ma si è riacceso da solo (1 novembre, 17:13; causa probabile: il piedino SDO libero): dopo un
// riavvio resta a riposo e i registri delle misure valgono 0x80000, che la libreria traduce sempre in 85,51 kPa e
// 25,30 °C. Lo si riconosce dal modo di misura in ctrl_meas, che non è più «normale».
bool sensoreARiposo() { return (leggiRegistro(BMP280_REG_CTRL_MEAS) & BMP280_MODO_NORMALE) != BMP280_MODO_NORMALE; }

// Misura più rapida della prova del tappo: circa 13 ms per lettura, quindi ben oltre i 50 Hz.
bool avviaSensore() {
  bool trovato = false;
  for (uint8_t candidato : INDIRIZZI_BMP280) {
    if (bmp.begin(candidato)) {
      indirizzo = candidato;
      trovato = true;
      break;
    }
  }
  if (!trovato) return false;
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X1,
                  Adafruit_BMP280::SAMPLING_X4, Adafruit_BMP280::FILTER_OFF,
                  Adafruit_BMP280::STANDBY_MS_1);
  return true;
}

void leggiComandi() {
  if (!Serial.available()) return;
  const String comando = Serial.readStringUntil('\n');
  if (comando.startsWith("s")) {
    tappa = 0;
    obiettivo = TAPPE_ESCURSIONE[tappa];
    Serial.printf("# escursione completa %d -> %d -> %d\n", ANGOLO_MAX, ANGOLO_MIN, ANGOLO_CENTRO);
  } else if (comando.length() > 0 && isDigit(comando[0])) {
    const int richiesto = comando.toInt();
    tappa = -1;
    obiettivo = constrain(richiesto, ANGOLO_MIN, ANGOLO_MAX);
    if (obiettivo != richiesto) {
      Serial.printf("# %d fuori dai limiti %d-%d: limitato a %d\n", richiesto, ANGOLO_MIN, ANGOLO_MAX, obiettivo);
    }
    Serial.printf("# servo verso %d gradi\n", obiettivo);
  }
}

// Avvicina il servo all'obiettivo di un grado ogni PASSO_MS, senza bloccare le letture.
// Arrivato, passa alla tappa successiva dell'escursione, se ce n'è una in corso.
void avanzaServo() {
  if (millis() - ultimoPassoMs < PASSO_MS) return;
  ultimoPassoMs = millis();
  if (angolo != obiettivo) {
    angolo += angolo < obiettivo ? +1 : -1;
    servo.write(angolo);
  } else if (tappa >= 0) {
    tappa = tappa + 1 < NUMERO_TAPPE ? tappa + 1 : -1;
    if (tappa >= 0) obiettivo = TAPPE_ESCURSIONE[tappa];
  }
}

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(20);
  delay(500);
  Serial.printf("# avvio, motivo dell'ultimo riavvio: %s\n", nomeRiavvio(esp_reset_reason()));

  Wire.begin(PIN_SDA, PIN_SCL);
  sensoreOk = avviaSensore();
  if (!sensoreOk) Serial.println("# ERRORE: BMP280 non trovato (0x76 e 0x77). Riprovo ogni secondo; il servo funziona lo stesso.");
  else Serial.printf("# BMP280 a 0x%02X\n", indirizzo);

  servo.setPeriodHertz(50);
  servo.attach(PIN_SERVO, SERVO_US_MIN, SERVO_US_MAX);
  servo.write(ANGOLO_CENTRO);
  Serial.printf("# servo al centro (%d), limiti %d-%d\n", ANGOLO_CENTRO, ANGOLO_MIN, ANGOLO_MAX);
  inizioSecondoMs = millis();
}

void loop() {
  leggiComandi();
  avanzaServo();

  if (sensoreOk && micros() - ultimaLetturaUs >= PERIODO_LETTURA_US) {
    ultimaLetturaUs += PERIODO_LETTURA_US;
    const float pressionePa = bmp.readPressure();
    const float temperaturaC = bmp.readTemperature();
    lettureNelSecondo++;
    Serial.printf("p = %.3f kPa  T = %.2f C  servo = %d\n", pressionePa / 1000.0f, temperaturaC, angolo);
  }

  if (millis() - inizioSecondoMs >= 1000) {
    inizioSecondoMs += 1000;
    if (sensoreOk && !sensoreRisponde()) {
      sensoreOk = false;
      Serial.printf("# BMP280 perso a 0x%02X: riprovo ogni secondo\n", indirizzo);
    } else if (sensoreOk && sensoreARiposo()) {
      sensoreOk = avviaSensore();
      ultimaLetturaUs = micros();
      Serial.println(sensoreOk ? "# BMP280 riavviato da solo: riconfigurato"
                               : "# BMP280 riavviato da solo: riconfigurazione fallita, riprovo ogni secondo");
    } else if (sensoreOk) {
      Serial.printf("# letture/s: %u\n", lettureNelSecondo);
      lettureNelSecondo = 0;
    } else if (avviaSensore()) {
      sensoreOk = true;
      ultimaLetturaUs = micros();
      Serial.printf("# BMP280 ritrovato a 0x%02X\n", indirizzo);
    } else {
      Serial.printf("# BMP280 assente (0x76 e 0x77)  servo = %d\n", angolo);
    }
  }
}
