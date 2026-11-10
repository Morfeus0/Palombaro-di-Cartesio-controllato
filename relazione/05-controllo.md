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

Moduli nuovi, scritti senza dipendenze dalla scheda e provati sul Mac con 33 test (`pio test -e protocollo`):

- `controllo`: PI della pressione, PID della quota (derivata filtrata **della misura**, così un cambio di riferimento
  non dà un colpo alla pressione), On-Off con isteresi.
- `supervisore`: regole di SAFE (sensore, sovrapressione, Mac muto 2 s, telecamera muta 2,5 s, P1 perso, errore
  oltre 6 cm per più di 5 s; le due soglie del Mac e della telecamera sono state allargate al banco il 10 novembre, vedi
  5.5). La soglia della telecamera era 200 ms: il 9 novembre è passata a 300 ms perché le pause
  misurate arrivano a 184 ms (avvio della registrazione video) e 256 ms (Mac fermo); 300 ms al buio, con il polo
  instabile a 0,33 rad/s, fanno crescere l'errore di circa il 10 %.
- `calibrazione`: trova p0 portando P1 sul fondo e scendendo a 30 Pa/s finché si stacca. Un test ha trovato un errore
  numerico vero: togliendo 0,3 Pa a ogni ciclo da 101 640 Pa in virgola mobile a 32 bit (come sull'ESP32) la rampa
  sbagliava di 3 Pa ogni 1000 cicli; ora la pressione si calcola dal tempo trascorso. Un secondo controllo (9 novembre)
  riconosce una calibrazione avviata con la pressione troppo bassa: se P1 si stacca nei primi 3 s della discesa, la
  rampa è partita già sotto la soglia e p0 uscirebbe troppo basso, quindi la calibrazione si annulla (SAFE,
  `PARTENZA_BASSA`). Prima il firmware salvava quel p0 sbagliato senza accorgersene.

Il programma principale aggiunge gli stati CALIBRAZIONE e HOLD, i comandi `R` (quota voluta) e `K` (guadagni ed
equilibrio) e la riga di telemetria `C` con i tre termini del PID (`docs/protocollo.md`, sezione 10). Dal Mac i comandi
si mandano con `pc/comanda.py`.

## 5.5 Prove al banco (10 novembre)

Condizioni: P1 riempito di nuovo (si era svuotato nel vasetto), più pesante del previsto: soglia **99,12 kPa** con la
stanza a 100,64, quindi circuito chiuso a **116°** e lavoro in leggera depressione; iPhone collegato con il cavo.
Verdetti di `pc/analisi_f4.py` sui CSV del ponte (`dati/2026-11-10/`).

**Stati e sicurezza (4.2).** Provate al banco tutte le transizioni provocabili: rifiuti di HOLD senza p0
(`NO,M,EQUILIBRIO`) e di CALIBRAZIONE senza quota (`NO,M,QUOTA`); CALIBRAZIONE → HOLD due volte, con **p0 = 99 168 e
99 174 Pa** contro i 99 120 della soglia misurata a mano (48 e 54 Pa, ripetibilità 6 Pa); SAFE per `PERSO` (0,23 s
dopo aver coperto P1), `TELECAMERA_MUTA`, `MAC_MUTO` (ponte sospeso), `ERRORE` (oltre 6 cm per 5 s), `EMERGENZA` e,
per caso all'avvio, `SENSORE`. Non provocabili: `PRESSIONE` (oltre la corsa del servo) e `PARTENZA_BASSA` (con questo
P1 la depressione disponibile è troppo poca), provate solo sul Mac. Le soglie del Mac e della telecamera, partite a
500 e 300 ms, sono finite a **2 s e 2,5 s**: l'avvio della registrazione video ferma il Mac fino a 1,15 s e l'iPhone ha
pause fino a 1,9 s; in una pausa il PI della pressione tiene l'ultima pressione voluta e P1 deriva lentamente.
Due difetti trovati e corretti: SAFE accendeva il servo a 146 senza rampa se non aveva mai ricevuto un comando, e
`telecamera.py` si chiudeva invece di riaprire l'iPhone bloccato.

**Gioco del servo.** Misurato con gradini del servo in MANUALE: **circa 22°** a ogni inversione (il 23 ottobre 10°),
cioè circa 550 Pa di comando senza effetto; nello stesso verso circa 25 Pa/°. Il video esterno mostra tre cause:
l'asta agganciata allo stantuffo con un gancio che prima ruota, il braccio del servo incollato che cede, il servo che
si solleva.

**Anello interno (4.4).** Gradini di ±391 Pa con l'anello esterno spento (`K,Z,0,0,0,10`, `K,E` = p0 + 500 Pa):

| PI (kp °/Pa, ki °/(Pa·s)) | Sovraelongazione | Assestamento (±50 Pa) |
|---|---|---|
| 0,02 · 0,4 (progetto) | 50–60 % | 1,4 s |
| 0,02 · 0,05 | 0–8 % | 1,9–2,1 s |
| **0,02 · 0,1 (scelto)** | **2–5 %** | **0,9–1,1 s** |
| 0,04 · 0,1 | 3–5 % | 1,1–1,3 s |

La perdita d'aria è compensata (errore medio 0,3 Pa in 60 s); il «Fatto quando» (< 0,5 s) **non è raggiunto**: con
22° di gioco l'integrale si carica mentre lo stantuffo non si muove.

**On-Off (4.3).** A 5 cm con ±700 Pa l'oscillazione **cresce** fino alla superficie (SAFE `ERRORE`): la spinta
massima vale l'equilibrio a 12,1 cm e P1, che arriva in ritardo, lo supera. Con ±1000 Pa il ciclo è stabile:
**±4,6 cm intorno a 5,3 cm, 11,3 s** (isteresi ±5 mm) e **±4,7 cm, 11,8 s** (±10 mm). La «tirata» va a fine corsa
(36°) e arriva solo a circa 100 Pa sotto p0: è lei a dettare il periodo, l'isteresi conta poco.

**Anello esterno (4.5) e M4.** P1 a 5 cm, gradino a 10 cm, 90 s fermi:

| Regolatore | Gradino 5 → 10 cm | A 10 cm |
|---|---|---|
| solo P | sovraelongazione 119 %, non si assesta | oscilla di ±5,4 cm, periodo 9,7 s |
| PD | 38 %, non si assesta entro ±5 mm | entro ±1 cm per 89,7 s, RMS 6,0 mm |
| **PID** | 23–25 %, 16 s | **entro ±1 cm per 88,7 e 81,9 s; ultimi 60 s: errore max 6,0 e 7,9 mm, RMS 3,4–3,5 mm** |

Il criterio di **M4** (60 s entro ±1 cm) è superato due volte con il PID, la seconda con il video
(`media/2026-11-10_M4_quota-tenuta-entro-1-cm.mp4`). A 10 cm il PID ondeggia di circa ±4 mm ogni 4 s: è l'impronta
del gioco. A 5 cm, dopo la calibrazione e prima di ogni gradino, la tenuta era più stretta (RMS 0,6 mm).

## 5.6 Confronto con il gemello (4.6)

Le stesse prove sono state rifatte nel gemello con le condizioni misurate: gioco di 22°, circuito chiuso a 116° con
p0 1,5 kPa sotto la stanza, PI tarato (`analisi/confronto_f4.m`); i CSV escono nel formato del ponte e li giudica lo
stesso programma. Figura: `analisi/figure/confronto_f4.png`.

| Prova | Banco | Gemello aggiornato | Gemello di progetto |
|---|---|---|---|
| PI 0,02/0,4, gradino 391 Pa | 1,4 s, 50–60 % | 0,35 s, 2–6 % | 0,25 s, 5 % |
| PI 0,02/0,1 | 0,9–1,1 s, 2–5 % | 1,5 s, 2–5 % | — |
| On-Off ±700 Pa | diverge | ±3,5 cm, 9,8 s | ±2,2 cm, 6,1 s |
| On-Off ±1000 Pa | ±4,6 cm, 11,3 s | ±3,7 cm, 8,6 s | — |
| solo P a 10 cm | ±5,4 cm, 9,7 s | ±3,1 cm, 6,3 s | ±2,5 mm, 4,8 s |
| PD a 10 cm | RMS 6,0 mm | RMS 1,9 mm | RMS 0,9 mm |
| PID a 10 cm | RMS 3,4–4,0 mm, ±4,4 mm ogni 3,8–4,6 s, 16 s | RMS 2,2 mm, ±3,1 mm ogni 4,3 s, 18 s | RMS 1,4 mm, 2,9 s |

Con il gioco e la depressione misurati il gemello passa dalle prestazioni del progetto a **quasi quelle del banco**:
stesso ondeggiamento del PID, stesso assestamento lento del gradino, stessa risposta del PI tarato. Restano due
differenze, e indicano cosa manca nel modello:
1. **Il picco del PI di progetto** (190 Pa al banco, nessuno nel gemello): lo stantuffo che si incolla e parte di colpo
   (attrito statico), non modellato.
2. **L'On-Off ±700 Pa divergente al banco e stabile nel gemello:** al banco la depressione utile era minore (le pareti
   della bottiglia rientrano piano, già visto nella 3.5) e P1 più pesante del previsto.

**Conclusione per il controllo di base:** il progetto in frequenza regge, il limite è meccanico. Con il gioco ridotto
(fissaggio di asta, braccio e servo, rischio R3) ci si aspetta di tornare verso le prestazioni del gemello di progetto;
in alternativa, una compensazione del gioco nel firmware.
