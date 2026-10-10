#include <Arduino.h>

// Programma di prova (sottofase 1.1): serve solo a verificare che la toolchain compili.
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("Palombaro: ciao dall'ESP32");
  delay(1000);
}
