# Protocollo tra Mac ed ESP32 (sottofase 2.4)

> **Versione 1, rivista con Gabriele il 1 novembre 2026** (bozza del 27 ottobre, Claude). Tutte le proposte della
> sezione 9, più tre nuove nate dalle prove del 1 novembre, sono state **approvate** (sezione 9). Questo documento è il
> contratto per il firmware (2.5) e per il ponte sul Mac (2.6); dove il testo più sotto dice ancora «[da decidere]»,
> vale la decisione della sezione 9.

## 1. Chi fa cosa

```
 iPhone ──60 fps──> Mac: telecamera.py ──Z (UDP locale)──> ponte ──seriale USB──> ESP32
                       (riconosce P1, quota)                (unico     <──T, C, A──    (anelli di controllo,
 dashboard ──comandi (M, R, P, K, S, E)──────────────────>  padrone    ──registro──>   macchina a stati,
                                                             della       dati/…csv     sicurezza)
                                                             porta)
```

- **ESP32:** legge la pressione, fa girare i due anelli (interno sulla pressione a 100 Hz, esterno sulla quota a 30 Hz),
  la macchina a stati e i controlli di sicurezza. Decide **da solo** di andare in SAFE: non aspetta il permesso del Mac.
- **Mac:** misura la quota (telecamera e riconoscimento, 2.2), la manda all'ESP32 a ogni fotogramma, inoltra i comandi
  della dashboard e registra tutto. Non chiude anelli: se il Mac si blocca, l'ESP32 se ne accorge (sezione 6).
- **Il ponte** (2.6) è l'evoluzione di `pc/registra_seriale.py`: resta l'unico programma che apre la porta seriale.
  `telecamera.py` gli manda la quota con un pacchetto UDP su 127.0.0.1 (meno di 1 ms), perché il file dei comandi letto
  ogni mezzo secondo, che oggi basta per i comandi a mano, è troppo lento per 60 quote al secondo.

## 2. Collegamento

| | Proposta | Perché |
|---|---|---|
| Porta | USB seriale del CP2102 dell'ESP32 (`/dev/cu.usbserial-0001`), 8N1 | quella di oggi |
| Velocità **[da decidere]** | **460 800 baud** (oggi 115 200) | la telemetria a 100 Hz occupa circa 8 kB/s: a 115 200 baud (11,5 kB/s) è il 70 % del canale e ogni riga impiega circa 5 ms ad uscire; a 460 800 è il 17 % e meno di 1,5 ms. Il CP2102 la regge; se dà errori, 230 400 |
| Reset all'apertura | DTR e RTS bassi, come oggi | aprire la porta non deve riavviare l'ESP32 |

## 3. Formato dei messaggi

Una riga di testo ASCII per messaggio, come oggi: si legge con qualunque terminale e il registro resta comprensibile.

```
$TIPO,campo1,campo2,…*CC\n
```

- `$` inizio; `TIPO` una o due lettere maiuscole; campi separati da virgole, senza spazi;
- `*CC` controllo: XOR di tutti i byte tra `$` e `*` (esclusi), in due cifre esadecimali maiuscole (come le righe NMEA
  dei GPS); una riga con il controllo sbagliato si scarta e si conta (messaggio `A`);
- righe lunghe al massimo **96 caratteri**: oltre, si scartano;
- **numeri interi con unità fisse** (niente virgole decimali da interpretare), tranne i guadagni:

| Grandezza | Unità nel messaggio | Esempio |
|---|---|---|
| quota | decimi di millimetro dal fondo interno della bottiglia **[da decidere: fondo o tavolo]** | `1523` = 152,3 mm |
| pressione | pascal, assoluta | `101325` |
| comando del servo | decimi di grado **[da decidere]** | `860` = 86,0° |
| tempi | millisecondi | `18` |
| guadagni | numero con il punto | `0.0125` |

- Le righe che cominciano con `#` restano **testo libero per le persone** (gli eventi di oggi, per esempio
  `# BMP280 perso a 0x76`): il registro le tiene, i programmi le mostrano ma non le interpretano.

## 4. Dal Mac all'ESP32

| Tipo | Campi | Esempio | Quando | Cosa fa l'ESP32 |
|---|---|---|---|---|
| `Z` | seq, quota, età_ms, vista | `$Z,4711,1523,18,0*CC` | a ogni fotogramma (60 Hz) | tiene l'ultima quota con l'istante a cui si riferisce: arrivo − età. `vista`: 0 trovato, 1 buco breve (ultima posizione tenuta), 2 perso |
| `B` | seq | `$B,812*CC` | ogni 200 ms, sempre | battito: il Mac è vivo (sezione 6) |
| `M` | modalità | `$M,HOLD*CC` | dalla dashboard | chiede il cambio di stato: MANUALE, CALIBRAZIONE, HOLD, TRACKING, SAFE |
| `R` | quota di riferimento | `$R,1500*CC` | dalla dashboard | nuovo riferimento, accettato solo dentro i limiti della colonna |
| `P` | profilo, centro, ampiezza, periodo_ms | `$P,ONDA,1500,300,20000*CC` | dalla dashboard (F5) | profilo per TRACKING: `GRADINI` o `ONDA` |
| `K` | anello, kp, ki, kd, n | `$K,Z,0.8,0.05,1.2,10*CC` | dalla dashboard | guadagni dell'anello `P` (pressione) o `Z` (quota); `n` è il filtro sul derivativo |
| `S` | comando del servo | `$S,860*CC` | solo in MANUALE | porta il servo lì, con la stessa rampa di oggi |
| `E` | — | `$E*CC` | pulsante di emergenza | SAFE subito, da qualunque stato |
| `V` | — | `$V*CC` | all'apertura della porta | risponde con la versione |

- **L'età invece dell'orario.** Mac ed ESP32 hanno orologi diversi e sincronizzarli è complicato. Il Mac manda quanti
  millisecondi sono passati dall'arrivo del fotogramma all'invio (riconoscimento compreso, circa 2 ms); l'ESP32 toglie
  l'età dal momento in cui riceve la riga. La latenza della telecamera, dall'esposizione all'arrivo sul Mac, si misura
  nella 2.3 e si aggiunge come costante: è quella che servirebbe al predittore di Smith (extra).
- **Numero di sequenza** in `Z` e `B`: un salto vuol dire righe perse, che l'ESP32 conta (messaggio `A`).

## 5. Dall'ESP32 al Mac

| Tipo | Campi | Esempio | Quando |
|---|---|---|---|
| `V` | firmware, protocollo | `$V,0.1,1*CC` | all'avvio e su richiesta |
| `T` | seq, t_ms, p, u, stato, p_rif, pi_p, pi_i | `$T,9001,123456,101410,860,H,101420,-3.1,12.0*CC` | 100 Hz, sempre |
| `C` | seq, t_ms, quota usata, età_ms, quota_rif, pid_p, pid_i, pid_d, p_rif | `$C,301,123460,1523,21,1500,-18.4,2.2,-5.0,101420*CC` | a ogni passo dell'anello esterno (30 Hz), solo in HOLD e TRACKING |
| `A` | t_ms, T_centesimi, letture/s, err_controllo, err_formato, persi, riavvio | `$A,124000,2412,100,0,0,3,POWERON*CC` | 1 Hz |
| `X` | da, a, motivo | `$X,HOLD,SAFE,PERSO*CC` | a ogni cambio di stato |
| `OK` / `NO` | tipo, motivo | `$OK,R*CC` · `$NO,R,FUORI_LIMITI*CC` | risposta a ogni `M`, `R`, `P`, `K`, `S`, `E` |

- **Firmware 0.1 (2.5, 1 novembre):** `T` ha in fondo un campo in più, la **temperatura in centesimi di grado**
  (la dashboard la mostra a ogni lettura); `A` ha in fondo tre campi in più: **scarto massimo del periodo** nell'ultimo
  secondo (µs, |periodo − 10 ms|: il «Fatto quando» della 2.5), **cicli in ritardo** di più di un periodo dall'avvio, e
  l'**indirizzo** a cui risponde il sensore (118 = 0x76, 119 = 0x77, 0 = assente). In 0.1 `p_rif` e i termini del PI
  valgono 0; `u` vale −1 finché il servo non ha ricevuto il primo comando (decisione 11).
- `T` porta tutto quello che serve a disegnare e registrare l'anello interno; `C` quello dell'anello esterno, con i
  **tre termini del PID separati**, come chiede il piano, per vedere chi lavora.
- Lo stato è una lettera: `M` MANUALE, `C` CALIBRAZIONE, `H` HOLD, `T` TRACKING, `S` SAFE.
- **Banda:** `T` circa 55 caratteri × 100 + `C` circa 70 × 30 + `A` ≈ 7,7 kB/s verso il Mac; `Z` circa 25 × 60 + `B`
  ≈ 1,6 kB/s verso l'ESP32.

## 6. Sicurezza: cosa succede se qualcosa smette di arrivare

| Condizione | In MANUALE | In CALIBRAZIONE, HOLD, TRACKING |
|---|---|---|
| nessuna riga valida dal Mac da **500 ms** (né `Z` né `B`) | il servo resta dov'è | **SAFE** (`X,…,SAFE,MAC_MUTO`) |
| nessuna `Z` nuova da **200 ms** (telecamera ferma, riconoscimento bloccato) | niente | **SAFE** (`TELECAMERA_MUTA`) |
| `Z` con `vista = 2` (perso) | niente | **SAFE** (`PERSO`): il riconoscimento ha già scavalcato i buchi fino a 0,25 s |
| sovrapressione oltre **+3,5 kPa** o sensore senza risposta | servo fermo e avviso `#` | **SAFE** (`PRESSIONE` / `SENSORE`) |
| `E` dal Mac | SAFE | SAFE |

- **Da SAFE si esce solo con un `M` dal Mac**, mai da soli: dopo un problema decide una persona.
- **Cosa fa SAFE [da decidere]:** la proposta del progetto dice «risalita» (servo a tirare: P1 sale). Però P1 a galla
  si asciuga in punta e torna il menisco (21 ottobre: dopo due giorni non scendeva più), e la regola del banco è che non
  deve mai riemergere. Proposta: **SAFE = servo a 146 con la rampa, P1 a fondo**. Sul fondo la bolla è compressa,
  l'equilibrio è stabile (24 ottobre, 23:44) e P1 resta bagnato; +2,6 kPa sono innocui per bottiglie e tubi.
- L'ESP32 continua a mandare `T` e `A` anche in SAFE: dal Mac si vede sempre cosa sta succedendo.

## 7. Regole di lettura (per entrambi i lati)

1. Si legge senza bloccare: i caratteri si accumulano finché arriva `\n`.
2. Riga senza `$` iniziale: testo (`#`) o rumore, non si interpreta.
3. Controllo sbagliato, campi mancanti o di troppo, numeri non validi: riga scartata, contatore +1. Mai un valore
   «indovinato».
4. Valori fuori dai limiti (quota fuori colonna, guadagni negativi, servo fuori 36–146): `$NO,…,FUORI_LIMITI` e nessun
   effetto.
5. Tipo sconosciuto: `$NO,<tipo>,SCONOSCIUTO`.

## 8. Cosa cambia rispetto a oggi

- Il firmware `banco` (`prova_banco.cpp`) e la dashboard di oggi restano come sono finché il firmware 0.1 (2.5) non
  funziona: il nuovo è un ambiente PlatformIO separato. Poi `pc/dashboard/registro.py` impara a leggere le righe `T`.
- Il comando del servo in decimi di grado chiede `writeMicroseconds()` invece di `write()`: 1 µs vale circa 0,1°,
  cioè circa 0,02 ml. Oggi il passo minimo è 1°, circa 0,18 ml e 35 Pa: grosso per un PI sulla pressione.
- **Pressione a 100 Hz [da decidere]:** con il sovracampionamento di oggi (×4) il BMP280 impiega circa 13 ms per
  misura, quindi fa al massimo circa 75 letture al secondo, non 100. Con ×2 ne servono circa 7,5 ms: 100 Hz sì, con un
  po' più di rumore (da misurare, oggi ±10 Pa). L'alternativa è l'anello interno a 50 Hz.

## 9. Decisioni (1 novembre 2026, tutte approvate da Gabriele)

| # | Domanda | Proposta |
|---|---|---|
| 1 | Velocità della seriale | 460 800 baud |
| 2 | Testo con controllo, oppure binario | testo con controllo (leggibile, banda sufficiente) |
| 3 | Cosa fa SAFE | P1 a fondo, non risalita |
| 4 | `Z` a ogni fotogramma (60 Hz) o a 30 Hz | 60 Hz: l'anello esterno a 30 Hz usa la più fresca, con meno ritardo |
| 5 | Zero della quota | **cambiata il 1 novembre:** centro del marcatore con P1 fermo sul fondo (lo zero che `pc/righello.py` ritrova da solo), in decimi di millimetro |
| 6 | Servo in decimi di grado | sì, con `writeMicroseconds()` |
| 7 | Pressione a 100 Hz con sovracampionamento ×2, o anello interno a 50 Hz | ×2 a 100 Hz, se il rumore misurato resta sotto ±15 Pa |
| 8 | Dove gira il filtro α-β (5.3) | si decide nella 5.3; il protocollo va bene in tutti e due i casi (se gira sul Mac, `Z` prende un campo velocità) |
| 9 | Soglia di sovrapressione che porta in SAFE | **+5,0 kPa** (era +3,5): a 146 si arriva a +3,6–4,0 kPa. Con il motivo `PRESSIONE` SAFE **ferma** il servo invece di portarlo a 146 |
| 10 | Sensore fermo, riavviato o che non risponde | **SAFE** (`SENSORE`), con il conteggio nella telemetria `A` |
| 11 | Servo all'accensione | **non si muove** (nessun impulso) finché il Mac non manda il primo comando: oggi a ogni riavvio, anche solo riaprendo la porta, saltava a 86 |

Fuori dal protocollo: il ritardo della telecamera (156 ms) supera la soglia di 150 ms del rischio R5; il piano B (webcam
USB) resta da decidere a parte.

### 9.1 Cosa dicono le misure del 1 novembre (per la revisione, Claude)

Le proposte della tabella restano da decidere con Gabriele; qui solo i fatti nuovi che le riguardano.

- **3 · SAFE:** dopo il riequilibrio del 1 novembre P1 **galleggia alla pressione della stanza** (si stacca dal fondo a circa +1,1 kPa). Una «risalita» lo porterebbe al pelo dell'acqua, dove il menisco lo trattiene. Confermata la proposta: SAFE = servo all'estremo che spinge (146), P1 a fondo.
- **4 · `Z` a 60 Hz:** la telecamera ha dato 59 fps per 2 minuti senza interruzioni; il riconoscimento costa 1,5 ms per fotogramma. Latenza misurata alle 20:10: **156 ms** in mediana (138–266), dallo schermo all'arrivo del fotogramma. È l'età tipica di `Z` quando lascia il Mac (più 1–2 ms di riconoscimento): va bene per il campo `età_ms`, ma nel progetto del controllo (fase 4) pesa più dei 66 ms stimati. Il limite «nessuna `Z` nuova da 200 ms» della sezione 6 riguarda gli intervalli tra fotogrammi (al massimo 47 ms misurati), non l'età, e resta valido.
- **5 · Zero della quota:** il programma (`pc/righello.py`) ora misura la quota **sopra il centro del marcatore con P1 fermo sul fondo**, non sopra il fondo interno della bottiglia: è lo zero che si ritrova da solo a ogni sessione. Proposta aggiornata: `Z` in millimetri sopra quella posizione. Il fondo della bottiglia è circa 52 mm più in basso (spiedino).
- **7 · Pressione a 100 Hz:** con il sovracampionamento ×4 a 50 Hz il rumore misurato è **2,5 Pa** (deviazione su 500 letture, 1 novembre). Con ×2 dovrebbe restare sotto 4 Pa, molto sotto i ±15 Pa del criterio: da confermare con una misura nella 2.5.
- **8 · Filtro α-β:** al bordo delle costole della bottiglia il centro del marcatore salta di 35–47 px (circa 1 cm) in un solo fotogramma, perché la rifrazione ne nasconde un pezzo. Il filtro (dove che giri) deve sopportare salti isolati di questa ampiezza.
- **Sezione 6, sovrapressione oltre +3,5 kPa → SAFE:** senza la bottiglia piccola, con il circuito chiuso a 36, a 146 si arriva a **+3,6–4,0 kPa** (1 novembre). Con la proposta «SAFE = servo a 146» la soglia scatterebbe da sola: va alzata (bottiglie e tubi reggono ben di più) oppure SAFE va fermato prima di 146.
- **Nuovo, sezione 6:** il 1 novembre il BMP280 si è riavviato da solo e per 3 minuti ha dato valori fissi (85,51 kPa, 25,30 °C) rispondendo all'identità. Il firmware del banco ora lo riconosce dal registro `ctrl_meas`; nel firmware vero (2.5) un sensore «a riposo» o con valori fissi dovrebbe portare a SAFE e comparire nella telemetria come errore del sensore.

## 10. Firmware 0.2 (5 novembre, Claude, compilato e provato sul Mac, non ancora al banco)

Cosa aggiunge alla versione 1 del protocollo, senza cambiare il formato delle righe:

| Riga | Formato e unità | Note |
|---|---|---|
| `M` | `MANUALE`, `CALIBRAZIONE`, `HOLD`, `SAFE` | CALIBRAZIONE e HOLD si accettano solo fuori da SAFE, con il sensore e la quota fresca e dopo almeno un `S` (servo attivo); HOLD solo se p0 è noto (da CALIBRAZIONE o da `K,E`). Risposte nuove: `NO,M,QUOTA`, `NO,M,SERVO_FERMO`, `NO,M,EQUILIBRIO` |
| `R` | quota voluta in decimi di mm, da 100 a 1700 (1–17 cm) | `NO,R,FUORI_LIMITI` fuori |
| `K,P` | `kp` [°/Pa], `ki` [°/(Pa·s)] | PI della pressione |
| `K,Z` | `kp` [Pa/cm], `ki` [Pa/(cm·s)], `kd` [Pa·s/cm], `n` [1/s] | PID della quota; lo sceglie per HOLD |
| `K,O` | `isteresi` [mm], `ampiezza` [Pa] | On-Off; lo sceglie per HOLD |
| `K,E` | `p0` [Pa, assoluta] tra 90 000 e 110 000 | equilibrio con P1 sul fondo, senza calibrare |
| `T` | `p_rif` = pressione voluta [Pa], `pi_p` [°], `pi_i` [°] | prima valevano 0; in MANUALE e SAFE restano 0 |
| `C` | seq, t_ms, quota_dmm, età_ms, quota_rif_dmm, pid_p, pid_i, pid_d [Pa], p_rif [Pa] | in HOLD, ogni 30 ms (anello esterno a circa 33 Hz) |
| `X` | motivi nuovi: `CALIBRATO` (CALIBRAZIONE → HOLD), `CALIBRAZIONE` (fallita → SAFE), `MAC_MUTO`, `TELECAMERA_MUTA`, `PERSO`, `ERRORE` | |

**Guadagni iniziali** (dal progetto in simulazione, `analisi/progetto_controllori.m`): PI 0,02 °/Pa e 0,4 °/(Pa·s);
PID 475 Pa/cm, 11,9 Pa/(cm·s), 400 Pa·s/cm, N = 10; On-Off ±5 mm e ±700 Pa.

**CALIBRAZIONE** (`firmware/src/palombaro/calibrazione.cpp`): +1,5 kPa finché P1 è fermo sul fondo da 3 s (almeno
6 s), poi rampa a −30 Pa/s da +0,6 kPa sopra la pressione di partenza; quando P1 supera 1,5 cm, p0 = pressione voluta
+ 30 Pa/s × 4 s (il tempo che P1 impiega a salire fino a 1,5 cm); se la rampa scende di 3 kPa senza stacco → SAFE.

**Servo:** rampa di 0,7° per ciclo in MANUALE e SAFE (come la 0.1), 2,0° per ciclo (200 °/s) in CALIBRAZIONE e HOLD.

**Da decidere (Gabriele):**
1. **Errore troppo grande troppo a lungo → SAFE (`ERRORE`):** proposta 6 cm per più di 5 s (dalla simulazione della
   proposta).
2. **Telecamera muta dopo 200 ms (decisione già presa il 1 novembre):** il 5 novembre l'avvio della registrazione video
   ha fermato i fotogrammi per 184 ms, e il 1 novembre c'è stata una pausa di 256 ms con il Mac fermo. Con 200 ms
   quella del 1 novembre avrebbe portato in SAFE; con 300 ms nessuna delle due. La soglia è `supervisore::Soglie`.
