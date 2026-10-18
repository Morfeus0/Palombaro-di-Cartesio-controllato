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
// Comandi dalla seriale: un numero da 0 a 180 sposta il servo; "s" fa un'escursione completa.

namespace {

constexpr int PIN_SDA = 21;
constexpr int PIN_SCL = 22;
constexpr int PIN_SERVO = 18;
constexpr int SERVO_US_MIN = 500;   // impulso a 0°
constexpr int SERVO_US_MAX = 2400;  // impulso a 180°
constexpr int ANGOLO_INIZIALE = 90;
constexpr uint32_t PERIODO_LETTURA_US = 20000;  // 50 Hz
constexpr uint32_t PASSO_ESCURSIONE_MS = 15;    // 1° ogni 15 ms: circa 2,7 s per 180°

Adafruit_BMP280 bmp;
Servo servo;
int angolo = ANGOLO_INIZIALE;
int direzioneEscursione = 0;  // 0 ferma, +1 verso 180, -1 verso 0
uint32_t ultimaLetturaUs = 0;
uint32_t ultimoPassoMs = 0;
uint32_t inizioSecondoMs = 0;
uint32_t lettureNelSecondo = 0;

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

[[noreturn]] void fermaConErrore(const char* messaggio) {
  Serial.println(messaggio);
  while (true) delay(1000);
}

void muoviServo(int nuovoAngolo) {
  angolo = constrain(nuovoAngolo, 0, 180);
  servo.write(angolo);
}

void leggiComandi() {
  if (!Serial.available()) return;
  const String comando = Serial.readStringUntil('\n');
  if (comando.startsWith("s")) {
    direzioneEscursione = angolo < 180 ? +1 : -1;
    Serial.println("# escursione completa");
  } else if (comando.length() > 0 && isDigit(comando[0])) {
    direzioneEscursione = 0;
    muoviServo(comando.toInt());
    Serial.printf("# servo a %d gradi\n", angolo);
  }
}

// Escursione 0 -> 180 -> 0 un grado alla volta, senza bloccare le letture.
void avanzaEscursione() {
  if (direzioneEscursione == 0 || millis() - ultimoPassoMs < PASSO_ESCURSIONE_MS) return;
  ultimoPassoMs = millis();
  muoviServo(angolo + direzioneEscursione);
  if (angolo == 180) direzioneEscursione = -1;
  else if (angolo == 0) direzioneEscursione = 0;
}

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(20);
  delay(500);
  Serial.printf("# avvio, motivo dell'ultimo riavvio: %s\n", nomeRiavvio(esp_reset_reason()));

  Wire.begin(PIN_SDA, PIN_SCL);
  if (!bmp.begin(0x76)) fermaConErrore("ERRORE: BMP280 non trovato a 0x76.");
  // Misura più rapida della prova del tappo: circa 13 ms per lettura, quindi ben oltre i 50 Hz.
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X1,
                  Adafruit_BMP280::SAMPLING_X4, Adafruit_BMP280::FILTER_OFF,
                  Adafruit_BMP280::STANDBY_MS_1);

  servo.setPeriodHertz(50);
  servo.attach(PIN_SERVO, SERVO_US_MIN, SERVO_US_MAX);
  muoviServo(ANGOLO_INIZIALE);
  inizioSecondoMs = millis();
}

void loop() {
  leggiComandi();
  avanzaEscursione();

  if (micros() - ultimaLetturaUs >= PERIODO_LETTURA_US) {
    ultimaLetturaUs += PERIODO_LETTURA_US;
    const float pressionePa = bmp.readPressure();
    const float temperaturaC = bmp.readTemperature();
    lettureNelSecondo++;
    Serial.printf("p = %.3f kPa  T = %.2f C  servo = %d\n", pressionePa / 1000.0f, temperaturaC, angolo);
  }

  if (millis() - inizioSecondoMs >= 1000) {
    inizioSecondoMs += 1000;
    Serial.printf("# letture/s: %u\n", lettureNelSecondo);
    lettureNelSecondo = 0;
  }
}
