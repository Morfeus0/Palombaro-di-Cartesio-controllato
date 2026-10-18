# Collegamenti del banco elettronico (sottofase 1.5)

> Stato al 18 ottobre 2026. Foto: `IMG_1841`, `IMG_1842` (banco dall'alto, cartella Download).

## Schema

```
 Alimentatore TKDY 5 V 3 A ── presa con morsetti verdi
     morsetto +  ── condensatore 1000 µF 25 V (gamba senza striscia) ── jumper ── servo ROSSO
     morsetto −  ── condensatore (gamba con la striscia)            ── jumper ── striscia blu "−" della breadboard

 Striscia blu "−" (lato riga a, colonne 30–45) = MASSA COMUNE:
     · jumper dal morsetto − dell'alimentatore
     · jumper da colonna 31 riga a (GND dell'ESP32)
     · filo BIANCO del cavo del sensore (GND del BMP280)
     · filo MARRONE del servo

 ESP32 (prima breadboard, pin in riga b e j; libera solo la riga a, dal lato del 3V3):
     colonna 30 riga a  3V3  ── filo ROSSO del sensore (VCC del BMP280)
     colonna 31 riga a  GND  ── jumper verso la striscia blu "−"
     colonna 38 riga a  D18  ── filo GIALLO del servo (segnale PWM)
     colonna 40 riga a  D21  ── filo VERDE del sensore (SDA)
     colonna 43 riga a  D22  ── filo GIALLO del sensore (SCL)
     USB-C              ── Mac (alimentazione dell'ESP32 e seriale)
```

## Regole

- Il **5 V del servo non passa mai dall'ESP32** né dalle strisce della breadboard: va dal morsetto + al servo.
- **Mai collegare il 5 V al 3V3**: il BMP280 funziona solo a 3,3 V. Controllo con il multimetro prima di ogni accensione: morsetto + e pin 3V3 non devono suonare.
- Condensatore elettrolitico: la **striscia chiara è il −**. Montato al contrario si può gonfiare e rompere.
- Nella breadboard vanno solo pin rigidi della misura giusta (pin a pettine, jumper). Fori rovinati: riga a, colonne 1, 2, 5, 6, 7, 8, 11, 14, 15.
- Il cavo del sensore è **ancorato al tavolo con il nastro** a circa 10 cm dalla breadboard: la trazione non deve arrivare ai pin. I tappi si avvitano girando la bottiglia, non il tappo.
- La calza del cavo del sensore (codina isolata lato breadboard) per ora non è collegata: si collegherà alla massa se compariranno disturbi.

## Ordine di accensione

1. USB dell'ESP32 al Mac (il servo resta senza alimentazione).
2. Caricare il programma, se serve.
3. Alimentatore nella presa: il servo va alla posizione comandata (90° all'avvio).

Spegnimento in ordine inverso: prima l'alimentatore del servo, poi l'USB.

## Programmi di prova (`firmware/src/`, un ambiente PlatformIO ciascuno)

| Ambiente | File | Cosa fa | Caricamento |
|---|---|---|---|
| `esp32dev` | `main.cpp` | prova del BMP280 del tappo (5 letture al secondo, diagnosi) | `pio run -e esp32dev -t upload --upload-port /dev/cu.usbserial-0001` |
| `banco` | `prova_banco.cpp` | BMP280 a 50 Hz + servo su GPIO 18; comandi dalla seriale: un numero 0–180 sposta il servo, `s` fa l'escursione completa; all'avvio stampa il motivo dell'ultimo riavvio (brownout) | `pio run -e banco -t upload --upload-port /dev/cu.usbserial-0001` |

## Misure (18 ottobre)

- BMP280 a **50 letture al secondo** stabili (oversampling della pressione ×4, temperatura ×1, standby 0,5 ms): rumore circa ±10 Pa.
- Servo MG996R con alimentatore separato e condensatore: escursioni complete e scatti 0°↔180° **senza riavvii né brownout** dell'ESP32, e senza disturbi sulla pressione.
