# 3. Architettura, sensori e comunicazione

> **Bozza** (T4, sottofase 2.7, 5 novembre 2026). Da rifinire in F6: figure (schema a blocchi disegnato, fotogramma
> annotato, grafico di M2), riferimenti incrociati. I numeri vengono da `diario.md`, `docs/protocollo.md`,
> `hardware/collegamenti.md`, `hardware/postazione-ripresa.md` e dai file in `dati/`; il video di M2 è
> `media/2026-11-05_M2_quota-e-pressione-prova-04.mp4`.

## 3.1 Panoramica

Il sistema misura due grandezze, la **quota** del palombaro P1 e la **pressione** dell'aria nella bottiglia, e ne
comanda una sola, l'**angolo del servo** che muove lo stantuffo della siringa. Le misure stanno su due macchine diverse:
la pressione la legge il microcontrollore, la quota la calcola il computer dalle immagini di una telecamera.

```
 iPhone (Fotocamera Continuity) ──60 fps──> Mac: telecamera.py ──quota (UDP locale)──> ponte (bridge.py)
                                              riconosce P1, righello                   unico padrone della seriale
                                                                                            │  460 800 baud
 dashboard (browser) ──comandi──> file dei comandi ──────────────────────────────────────>  │  righe di testo
                                                                                            ▼  con controllo
                                       registro e CSV per esperimento <── righe T, A, X ── ESP32
                                                                                            │ I²C        │ PWM
                                                                                         BMP280        servo ──> siringa
                                                                                       (nel tappo)
```

La divisione dei compiti segue una regola: **chi chiude un anello di controllo deve poter decidere da solo** di
mettere il banco in sicurezza. Per questo gli anelli (nella fase 4) girano sull'ESP32, che ha la pressione in casa e un
ciclo regolare, mentre il Mac fornisce la quota e registra.

## 3.2 Misura della pressione

- **Sensore:** BMP280 su una schedina incollata nel tappo della bottiglia, collegato all'ESP32 in I²C con un cavo a
  4 fili (sottofase 1.3). Misura pressione assoluta e temperatura dell'aria sopra l'acqua.
- **Frequenza e rumore:** 100 letture al secondo con sovracampionamento ×2; il rumore misurato con la pressione ferma
  è di circa **2,5 Pa** (deviazione standard), contro i ±15 Pa ammessi dal protocollo. Per confronto, l'equilibrio di P1
  si sposta di 1 cm ogni 98 Pa (capitolo 4), quindi il rumore vale circa 0,25 mm di quota equivalente.
- **Indirizzo instabile:** il piedino SDO della schedina, che sceglie l'indirizzo I²C, non è collegato. Il 1 novembre
  il multimetro lo ha trovato a metà tensione: il chip ha cambiato indirizzo da 0x76 a 0x77, si è scaldato fino a 39 °C
  e una volta si è riavviato da solo restando su valori di fabbrica (85,51 kPa, 25,30 °C). Il firmware cerca il sensore
  a tutti e due gli indirizzi, lo riconfigura se si riavvia e scarta le letture fuori da 90–110 kPa e 0–50 °C. Il
  rimedio definitivo (ponticello SDO → GND) è rimandato a quando servirà (decisione di Gabriele).
- **Umidità:** il sensore vive nell'aria satura della bottiglia. La condensa lo ha fatto tacere due volte (21 e 24
  ottobre); per questo tra una sessione e l'altra il tappo si svita e si lascia all'asciutto.

## 3.3 Misura della quota

**Ripresa.** Un iPhone usato come telecamera del Mac (Fotocamera Continuity) riprende la bottiglia a 1920 × 1080 e
60 fotogrammi al secondo, letti da `pc/telecamera.py` con ffmpeg. Esposizione e messa a fuoco non si possono bloccare
dal Mac (verificato il 24 ottobre): si tiene costante la scena (luce artificiale, tende chiuse) e si è spenta
l'«Inquadratura automatica», che cambiava lo zoom da sola.

**Riconoscimento** (`pc/tracking.py`, 2.2). Il marcatore di P1 è un nastro rosso. In ogni fotogramma, dentro la
colonna d'acqua disegnata a mano, si cercano i pixel rossi nello spazio HSV e si prende il centro della zona rossa più
grande. Le difese: si scartano zone più piccole di 300 pixel (un filo) o più grandi di 16 000 (una mano davanti
all'obiettivo) e i salti più veloci di quanto P1 possa muoversi; i buchi fino a 0,25 s si coprono con l'ultima
posizione, oltre P1 è «perso». Costo: circa 1,3 ms per fotogramma.

**Righello** (`pc/righello.py`, 2.3). La bottiglia fa da lente, in modo diverso a ogni altezza: 2 cm di quota valgono
da 46 a 106 pixel. Una sola volta si è fotografato uno spiedino segnato ogni 2 cm dentro la bottiglia; la sua tabella
pixel → millimetri si riusa in ogni sessione, ricavando solo lo **zero** (P1 fermo sul fondo) e la **scala**
(l'altezza apparente del marcatore sul fondo). Così il telefono può spostarsi tra una sessione e l'altra.

| Caratteristica | Valore | Come |
|---|---|---|
| Errore della quota | **1,3 mm** al massimo su 12 quote note | spiedino, video del 1 novembre |
| Rumore con P1 fermo | **0,32 mm** | 15 s sul fondo |
| Fotogrammi | 59 al secondo | registro della telecamera |
| Ritardo dalla scena al programma | **156 ms** (138–266) | schermo del Mac che lampeggia ripreso dall'iPhone (`pc/latenza.py`) |

Il ritardo è più del doppio di quanto previsto nella proposta (66 ms) e supera la soglia di 150 ms del rischio R5:
è il limite principale dell'anello sulla quota (capitolo 4, controllore PD).

**Problemi visti nelle prove.** Contro la parete, sul fondo, la bottiglia allarga il marcatore fino a 9200 pixel
(limite portato da 8000 a 16 000) oppure lo mostra quasi di taglio, e P1 risulta «perso» finché sta fermo lì (7,8 s in
una prova del 5 novembre). Ai bordi delle costole il centro del marcatore salta di 35–47 pixel in un fotogramma:
rumore da filtrare nel controllo. Il 5 novembre per mezz'ora l'iPhone ha mandato 30 fotogrammi al secondo invece di 60;
ricollegato, è tornato a 60: prima di registrare si controlla il numero nella dashboard. Lo stesso giorno si è
corretto un errore del righello, che dopo molti minuti con P1 in superficie perdeva la misura dell'altezza sul fondo.

## 3.4 Comunicazione tra Mac ed ESP32

Il protocollo (`docs/protocollo.md`, 2.4) è stato deciso con queste scelte, tutte approvate il 1 novembre:

- **Righe di testo** `$TIPO,campo,…*CC`, con il controllo XOR dei byte come nelle frasi NMEA dei GPS: si leggono con
  qualunque terminale, il registro resta comprensibile e una riga rovinata si riconosce e si scarta. Numeri interi con
  unità fisse (pascal, decimi di millimetro, decimi di grado).
- **460 800 baud:** la telemetria a 100 Hz occupa circa 8 kB/s, il 17 % del canale (a 115 200 sarebbe il 70 %).
- **Dal Mac:** la quota `Z` a ogni fotogramma, il battito `B` ogni 200 ms, i comandi (`S` angolo del servo, `M` stato,
  `R` riferimento, `K` guadagni, `E` emergenza). **Dall'ESP32:** `T` a 100 Hz (pressione, comando, stato, temperatura),
  `A` a 1 Hz (diagnostica: letture al secondo, errori, regolarità del ciclo, indirizzo del sensore), `X` a ogni cambio
  di stato, `OK`/`NO` a ogni comando.
- **L'età invece dell'orario.** I due orologi non sono sincronizzati; la quota viaggia con la sua età in millisecondi
  (dall'arrivo del fotogramma all'invio) e l'ESP32 la sottrae all'istante di ricezione. Il ritardo della telecamera
  si aggiunge come costante.
- **Sicurezza:** in un anello automatico, 500 ms senza righe dal Mac, 200 ms senza quote, P1 perso, sovrapressione
  oltre +5 kPa o sensore muto portano in **SAFE**, deciso dall'ESP32 da solo; si esce solo con un comando di una
  persona. SAFE manda P1 sul fondo (servo spinto), dove l'equilibrio è stabile e P1 resta bagnato. All'accensione il
  servo **non riceve impulsi** finché il Mac non lo comanda: prima, a ogni riapertura della porta, saltava a 86°.

## 3.5 Firmware dell'ESP32

Il firmware 0.1 (`firmware/src/palombaro/`, 2.5) ha quattro moduli: protocollo, sensore, siringa (servo con rampa e
limiti 36–146°) e programma principale. Gira in un ciclo da **10 ms** che si risveglia sul battito di FreeRTOS. Stati
implementati: MANUALE e SAFE; CALIBRAZIONE, HOLD e TRACKING arriveranno con i controllori (fase 4). Il protocollo ha
test automatici che girano sul Mac.

**Verifica (1 novembre):** 30,5 minuti di funzionamento senza toccare il banco: **183 072 righe T, 100 al secondo,
nessuna persa**, nessun ciclo in ritardo, scarto massimo del periodo 0 µs, nessun errore di controllo o di formato.

## 3.6 Ponte, registrazione e dashboard

`pc/bridge.py` (2.6) è l'unico programma che apre la porta seriale:

- scrive **ogni riga** della seriale nel registro della giornata con l'orario al millisecondo;
- riceve la quota da `telecamera.py` con un pacchetto UDP locale (meno di 1 ms) e la inoltra subito come `Z`;
- inoltra i comandi che la dashboard scrive in un file;
- su richiesta apre un **file CSV per esperimento** (`dati/<giorno>/<giorno>_<nome>_NN.csv`, con intestazione di
  metadati), con una riga per ogni riga T (100 al secondo) e l'ultima quota ricevuta con la sua età.

La **dashboard** (pagina locale nel browser) mostra pressione, comando, quota e immagine della telecamera, e comanda il
servo con una linguetta e con pulsanti a passi fissi. Il pulsante «Registra 2 min» avvia insieme il video e il file
dell'esperimento. Il 5 novembre si è aggiunto un programma che comanda le prove da solo, regolando la pressione
(`pc/anello_aperto.py`, sottofase 3.3).

## 3.7 Verifica: milestone M2

**Criterio:** quota e pressione registrate insieme ad almeno 20 Hz.

| Prova (5 novembre) | Durata | Righe | Telecamera | Età della quota | Esito |
|---|---|---|---|---|---|
| 1 · salita e tenuta a metà | 120 s | 12 001, 100/s | 30 fps | 20 ms mediana | 9 pause dei fotogrammi da 51–52 ms |
| 2 · su e giù tre volte | 87 s | 8 704 | 30 fps | — | P1 «perso» 7,8 s fermo sul fondo |
| 3 · tenuta nel terzo superiore | 120 s | 12 001 | 30 fps | — | P1 mai perso, pause da 50–63 ms |
| **4 · salita e tenute** | **120 s** | **12 001** | **58,7 fps** | **10 ms mediana, 26 ms al 99 %** | **superata** |

Nella prova 4 l'età della quota resta sotto i 50 ms per **119,3 s su 120**; l'unica pausa (fino a 185 ms) è nei primi
0,65 s, quando parte la scrittura del video. La pressione è registrata a 100 Hz senza buchi in tutte le prove.
**M2 è stata raggiunta il 5 novembre**, tre giorni prima della scadenza. Il video della prova 4 mostra la bottiglia con
il riquadro del riconoscimento, i valori di quota, sovrapressione e comando e i loro grafici, sincronizzati con
l'orario di ogni fotogramma (`pc/video_esperimento.py`).

## 3.8 Limiti e lezioni

- **Il ritardo della telecamera** (156 ms) è il limite più importante: con un polo instabile di circa 0,35 rad/s il
  margine c'è, ma restringe i guadagni del derivativo (capitolo 4). Il piano B è una webcam USB (rischio R5).
- **La frequenza dei fotogrammi va controllata** a ogni sessione: a 30 fps il criterio dei 20 Hz è al limite.
- **Le difese del riconoscimento** (aree, salti, buchi) costano poco e hanno evitato posizioni false; i casi rimasti
  (P1 di taglio contro la parete) avvengono con P1 fermo sul fondo, dove la quota è comunque nota.
- **Registrare tutto, sempre:** il registro di ogni riga ha permesso di ricostruire a posteriori ogni problema
  (sensore riavviato, comandi inattesi, pause del Mac) senza ripetere le prove.
