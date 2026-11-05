# 5. Controllo della quota

> **Bozza** (sottofasi 4.1–4.2, 5 novembre 2026, anticipata, lontano dal banco). Progetto e verifica in simulazione:
> `analisi/progetto_controllori.m` sul gemello digitale (`analisi/palombaro.slx`, capitolo 4); firmware 0.2 in
> `firmware/src/palombaro/` (compilato e provato con i test sul Mac, non ancora al banco). Da completare con le prove
> al banco (4.3–4.5) e il confronto simulazione–banco (4.6).

## 5.1 Architettura: due anelli in cascata

```
 h_rif ──┬──> [equilibrio stimato: p0 + ρg·h_rif] ──┐
         │                                            + ──> p_voluta ──> [PI pressione, 100 Hz] ──> servo ──> siringa ──> p
         └──> [PID / On-Off sulla quota, 33 Hz] ──────┘                         ▲                                    │
                     ▲  (h_mis − h_rif)                                         └──────── sensore di pressione ──────┘
                     └──────────── telecamera (156 ms di ritardo) <── h <── palombaro <── p
```

- **Anello interno** (ESP32, ogni 10 ms): un PI porta la pressione dell'aria al valore voluto muovendo il servo. Assorbe
  il gioco del servo, le pareti che cedono, la perdita d'aria e i disturbi sulla bottiglia.
- **Anello esterno** (ogni 30 ms, con la quota della telecamera): sceglie la pressione voluta come **equilibrio stimato
  alla quota voluta** (la retta p_eq = p0 + ρg·h della sezione 4.4) più una correzione sull'errore di quota. Il primo
  termine fa quasi tutto il lavoro; il PID deve solo vincere l'instabilità e correggere gli errori di p0.
- **p0** lo trova lo stato CALIBRAZIONE (5.4) o si dà dal Mac.

## 5.2 Progetto in frequenza dell'anello esterno

Con il modello linearizzato G_hp(s) (polo instabile 0,33 rad/s), l'anello interno chiuso approssimato con un primo
ordine di 80 ms e il ritardo della telecamera più mezzo periodo di campionamento (171 ms), i guadagni del PD
C(s) = K_p + K_d s/(1 + s/N) si sono cercati su una griglia: tra quelli che rispettano i criteri del foglio A4 in
simulazione lineare (sovraelongazione < 20 %, assestamento < 10 s) con almeno 45° di margine di fase, quello con
l'assestamento più breve.

| | Valore |
|---|---|
| **PD scelto** | **K_p = 475 Pa/cm, K_d = 400 Pa·s/cm, N = 10 1/s** |
| margine di fase | 49° a 1,73 rad/s |
| margine di guadagno | 8,9 dB (verso l'alto); verso il basso K_p deve restare sopra ρg = 98 Pa/cm |
| margine di ritardo | 0,50 s (la telecamera ne usa 0,16) |
| PID | K_i = 11,9 Pa/(cm·s), cioè tempo integrale 40 s; margine di fase invariato (49°) |
| PI della pressione | K_p = 0,02 °/Pa, K_i = 0,4 °/(Pa·s): margine di fase 78°, assestamento 0,32 s senza sovraelongazione |

Figure: `analisi/figure/progetto_pd.png` (zona dei guadagni con il margine di fase, luogo delle radici, Bode).
Discretizzazione: Tustin per il derivativo filtrato, rettangoli per l'integrale (con Tustin un errore grande appena
finita una saturazione spingerebbe l'integrale nel verso sbagliato); anti-windup per «clamping».

## 5.3 Verifica nel gemello non lineare

Scenario di 120 s: P1 parte dal fondo; riferimento 5 → 10 → 15 cm a 0, 30 e 60 s; a 95 s si stringe la bottiglia
(2 ml tolti e tenuti). Gemello completo: rumore, ritardo e 60 Hz della telecamera, sensore a 100 Hz, servo a 200 °/s con
passi da 1° e 10° di gioco, perdita d'aria. Criteri del foglio A4: RMS < 5 mm, sovraelongazione < 20 %, assestamento
< 10 s (gradino 5 → 10 cm, fascia ±5 mm), disturbo riassorbito in < 10 s.

| Controllo | RMS | Sovraelong. | Assestamento | Disturbo | |
|---|---|---|---|---|---|
| On-Off ±5 mm, ±700 Pa | 16 mm | 49 % | — | — | ciclo limite di circa ±2 cm, periodo circa 6 s |
| On-Off ±10 mm, ±700 Pa | 21 mm | 62 % | — | — | a 15 cm il ciclo porta P1 sul fondo |
| solo P (475 Pa/cm) | 1,2 mm | 51 % | 11,6 s | 0 s | oscilla: senza derivativo lo smorzamento è solo l'attrito |
| **PD** | **0,1 mm** | **0,5 %** | **3,1 s** | **0 s** | ✅ |
| **PID** | **1,5 mm** | **5 %** | **2,7 s** | **0 s** | ✅ |
| PD, p0 sbagliato di 150 Pa | 4,0 mm | 0 % | 5,1 s | 0 s | errore fisso 150/475 ≈ 3 mm |
| **PID, p0 sbagliato di 150 Pa** | **1,1 mm** | 2,5 % | 3,0 s | 0 s | ✅ l'integrale toglie l'errore |

Il **«Fatto quando» della 4.1** (il PD soddisfa i criteri del foglio A4 in simulazione con ritardo e rumore realistici)
è raggiunto. Tre osservazioni:

- **Il disturbo non si vede:** la stretta di 2 ml (circa +0,3 kPa) la riassorbe l'anello interno in pochi decimi di
  secondo, prima che P1 si muova. È il vantaggio della cascata: la pressione è misurata direttamente e corretta
  subito, senza aspettare che l'errore compaia sulla quota (con 156 ms di ritardo).
- **L'On-Off deve avere un'ampiezza maggiore di ρg × la distanza da coprire** (490 Pa per 5 cm): con ±300 Pa, al primo
  tentativo, P1 non si staccava nemmeno dal fondo.
- **Per il banco si consiglia il PID:** la calibrazione dà p0 a meno di qualche decina di pascal e P1 si appesantisce
  di circa 0,2 kPa all'ora sul fondo in pressione; con il solo PD ogni 100 Pa di errore su p0 diventano 2 mm di errore
  fisso di quota.

## 5.4 Firmware 0.2

Moduli nuovi, scritti senza dipendenze dalla scheda e provati sul Mac con 30 test (`pio test -e protocollo`):

- `controllo`: PI della pressione, PID della quota (derivata filtrata **della misura**, così un cambio di riferimento
  non dà un colpo alla pressione), On-Off con isteresi.
- `supervisore`: regole di SAFE (sensore, sovrapressione, Mac muto 500 ms, telecamera muta 200 ms, P1 perso, errore
  oltre 6 cm per più di 5 s).
- `calibrazione`: trova p0 portando P1 sul fondo e scendendo a 30 Pa/s finché si stacca. Un test ha trovato un errore
  numerico vero: togliendo 0,3 Pa a ogni ciclo da 101 640 Pa in virgola mobile a 32 bit (come sull'ESP32) la rampa
  sbagliava di 3 Pa ogni 1000 cicli; ora la pressione si calcola dal tempo trascorso.

Il programma principale aggiunge gli stati CALIBRAZIONE e HOLD, i comandi `R` (quota voluta) e `K` (guadagni ed
equilibrio) e la riga di telemetria `C` con i tre termini del PID (`docs/protocollo.md`, sezione 10). Dal Mac i comandi
si mandano con `pc/comanda.py`.

## 5.5 Da fare al banco

1. **4.2:** caricare il firmware 0.2 e provare ogni passaggio di stato (CALIBRAZIONE → HOLD, telecamera coperta → SAFE
   `PERSO`, ponte fermato → SAFE `MAC_MUTO`, emergenza).
2. **4.4:** gradini di pressione con il solo anello interno (assestamento < 0,5 s, compensazione della perdita).
3. **4.3:** On-Off con due isteresi, ciclo limite da confrontare con la tabella qui sopra.
4. **4.5:** solo P, poi PD/PID; tenuta di 60 s entro ±1 cm (**M4**) e video.
