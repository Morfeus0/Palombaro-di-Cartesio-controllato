# Collegamenti del banco elettronico (sottofase 1.5)

> Stato al 24 ottobre 2026. Foto: `IMG_1841`, `IMG_1842` (banco dall'alto, cartella Download).

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
- **Verde nella colonna 40 (SDA), giallo nella colonna 43 (SCL):** il 28 ottobre erano invertiti e il sensore non rispondeva. Etichette di nastro vicino ai fori.
- **Prima di accendere, continuità tra il metallo del pin bianco del sensore e il GND dell'ESP32** (deve suonare). Il 21 ottobre il jumper GND (colonna 31 → striscia blu) era allentato: senza massa il BMP280 tace, ma le linee SDA e SCL restano alte e sembrano a posto.
- **Il sensore vive nell'aria satura della bottiglia:** se la schedina si bagna (condensa, detersivo) il chip risponde all'accensione e sparisce appena misura. Mai stringere la bottiglia con l'acqua al collo; detersivo lontano dal tappo; tappo aperto quando il banco resta fermo per giorni.
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
| `banco` | `prova_banco.cpp` | BMP280 a 50 Hz + servo su GPIO 18; comandi dalla seriale: un numero sposta il servo **entro `ANGOLO_CENTRO` ± 60°** (centro 86 dal 23 ottobre; dal 24 ottobre limiti **36–146**: a 26 la siringa si era spostata), un grado ogni 15 ms; `s` fa l'escursione completa. Stampa il motivo dell'ultimo riavvio; se il sensore non risponde (o smette di rispondere: rilegge il registro d'identità ogni secondo) scrive `# BMP280 assente/perso`, riprova ogni secondo e il servo funziona lo stesso | `pio run -e banco -t upload --upload-port /dev/cu.usbserial-0001` |
| `diagnosi` | `diagnosi_i2c.cpp` | ogni 5 s: stato delle linee SDA e SCL (pull-up del modulo presente, linea a massa o flottante) e scansione di tutti gli indirizzi I²C con il chip ID | `pio run -e diagnosi -t upload --upload-port /dev/cu.usbserial-0001` |

## Misure (18 ottobre)

- BMP280 a **50 letture al secondo** stabili (oversampling della pressione ×4, temperatura ×1, standby 0,5 ms): rumore circa ±10 Pa.
- Servo MG996R con alimentatore separato e condensatore: escursioni complete e scatti 0°↔180° **senza riavvii né brownout** dell'ESP32, e senza disturbi sulla pressione.

## Guasto del sensore del 21 ottobre (risolto)

- **Sintomi:** «BMP280 non trovato a 0x76», poi valori fissi senza senso (p = 2,48 kPa, T = 179,76 °C), come il 19 alle 20:25.
- **Diagnosi** (programma `diagnosi`, multimetro): SDA e SCL alte grazie ai pull-up del modulo (fili rosso, verde e giallo integri), nessun dispositivo sul bus. Pin bianco → GND dell'ESP32: **non suonava**, jumper GND allentato; reinserito, suona. Il chip però rispondeva all'accensione e spariva entro un secondo, con valori assurdi (156 kPa, 182 °C).
- **Tappo aperto: schedina umida.** Continuità dei 4 fili fino alla schedina e nessun corto. VCC–GND (stessa polarità dei puntali) da 45,5 a 122,9 kΩ dopo il phon tiepido; CSB–VCC 8,7–9,2 kΩ (il pull-up della scheda, come il 16). Riacceso alle 18:59:51: 50 letture al secondo, rumore ±7 Pa, nessuna perdita fino alle 19:55.
- Il giunto del pin bianco (trefoli non stagnati sotto, rame scoperto, niente manicotto) è stato rifatto, ma non era il guasto.
- **Da fare:** smalto trasparente su schedina e saldature, con il chip coperto dal nastro durante la verniciatura; manicotto di colla a caldo sul giunto del pin bianco, con il filo dritto.

## Programmi sul PC (dal 24 ottobre)

| Programma | Cosa fa | Avvio (dalla cartella del progetto) |
|---|---|---|
| `pc/registra_seriale.py` | registra la seriale su `dati/<giorno>/<giorno>_seriale.log` e inoltra all'ESP32 i comandi scritti in `dati/<giorno>/comandi.txt`; è l'unico programma che apre la porta | `nohup .venv/bin/python pc/registra_seriale.py dati/<giorno>/<giorno>_seriale.log 21600 dati/<giorno>/comandi.txt > /dev/null 2>&1 &` |
| `pc/dashboard/server.py` | dashboard su **http://localhost:8780**: segue il registro e scrive i comandi del servo (36–146) nel file dei comandi | `.venv/bin/python pc/dashboard/server.py` (Ctrl+C per chiuderla; la registrazione continua) |
| `pc/telecamera.py` | unico programma che apre la telecamera dell'iPhone: anteprime, misure della postazione, video di prova; dal 27 ottobre cerca P1 in ogni fotogramma (posizione nello stato per la dashboard e nel file `_fotogrammi.csv` dei video) | da **Terminal.app** (ha il permesso della telecamera): `.venv/bin/python pc/telecamera.py` |
| `pc/tracking.py` | riconoscimento di P1 su un video registrato: scrive `<video>_marcatore.csv` e il riassunto (trovato %, buchi, perdite, velocità); con `--annotato` scrive il video con il riquadro | `.venv/bin/python pc/tracking.py <video.mp4> [--annotato media/<nome>.mp4]` |
| `pc/calibrazione.py` | da pixel a centimetri (2.3): `metro` misura rotazione della telecamera e scala lungo il metro dall'immagine di riferimento; `punti` adatta il modello della quota a punti di quota nota. Scrive `pc/config/calibrazione.json` | `.venv/bin/python pc/calibrazione.py metro` · `.venv/bin/python pc/calibrazione.py punti X Y H X Y H …` |
