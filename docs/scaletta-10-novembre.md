# Scaletta della sessione al banco · martedì 10 novembre 2026

Preparata il 9 novembre (Claude), lontano dal banco. Obiettivo: verificare il piano C, caricare il firmware 0.2 e
provare al banco 4.2, 4.4, 4.3 e 4.5, fino al primo tentativo di **M4** (quota entro ±1 cm per 60 s).
Ordine dal capitolo 5 (sezione 5.5): la sicurezza prima dei controllori, l'anello interno prima di quello esterno.

**Chi fa cosa.** Gabriele: le mani sul banco (P1, tappo, tubo B, alimentatore) e `pc/telecamera.py` da Terminal.app.
Claude: caricamento del firmware, ponte e dashboard, tutti i comandi (`pc/comanda.py`), le registrazioni e i verdetti
(`pc/analisi_f4.py`), e il registro della seriale controllato a ogni messaggio.

**Decisioni già prese (9 novembre):** SAFE per errore di quota oltre 6 cm per più di 5 s; telecamera muta dopo
300 ms; PID come regolatore predefinito in HOLD. Il firmware compilato le ha già dentro.

---

## 0 · Accensione e P1 nella bottiglia (circa 20 min)

1. **USB della scheda al Mac**, alimentatore del servo ancora staccato. Claude carica il firmware 0.2:
   `pio run -e palombaro -t upload --upload-port /dev/cu.usbserial-0001` (cartella `firmware`), poi avvia ponte
   e dashboard in `dati/2026-11-10/` e manda `V`: deve rispondere `V,0.2,1`. Il CSV di ogni prova prende la versione
   da questa riga (la riga `# firmware:`).
2. **Tappo del sensore all'aria.** Se è avvitato sulla bottiglia, svitarlo girando la bottiglia, non il tappo, e
   appoggiarlo con la schedina in alto. Con il sensore all'aria della stanza Claude legge **la pressione della stanza
   e la temperatura** (servono al punto 1 e alla chiusura).
3. **P1 dal vasetto alla bottiglia, sempre dritto**: la tettarella in alto e l'apertura in basso, come sta nel
   vasetto. Perché: la bolla è l'aria chiusa nella tettarella; se P1 si inclina oltre l'orizzontale, l'aria esce
   dall'apertura e P1 va ritarato. Lo si cala nel collo della bottiglia tenendolo per la cima, con le dita asciutte, e
   lo si lascia andare solo quando l'apertura è sotto il pelo dell'acqua.
4. **3–4 gocce di soluzione** (una goccia di detersivo in un cucchiaino d'acqua) sul pelo dell'acqua, contro la punta
   di P1 se è a galla: niente menisco che lo tenga su. Poi tappo del sensore avvitato girando la bottiglia, fermo del
   tubo B sul cartone con l'ansa.
5. **Alimentatore del servo.** Primo comando dalla dashboard: **la posizione in cui il servo si trova già** (il
   5 novembre è stato lasciato a 36). Il firmware non manda impulsi finché non riceve il primo comando, così il servo
   non salta.
6. **Chiusura del circuito: tubo B infilato con il servo all'angolo u_c della tabella.** Perché: chiudendo, la
   pressione nella bottiglia è quella della stanza, e ogni grado del servo vale poi circa 36 Pa. Conviene che la
   soglia di P1 cada intorno ai 60°, per avere circa 3 kPa sopra (CALIBRAZIONE, quote alte, SAFE a 146) e un po'
   di margine sotto. Soglia attesa: punto 1.

   | soglia attesa − pressione della stanza | u_c (tubo B infilato con il servo qui) |
   |---|---|
   | +0,5 kPa | 46 |
   | 0 | 60 |
   | −0,5 kPa | 74 |
   | −1,0 kPa | 88 |

   Formula: **u_c = 60 − (soglia attesa − stanza) / 0,036 kPa**.
7. Telecamera: iPhone in carica e senza risparmio energetico, poi `pc/telecamera.py`; Claude controlla che arrivi a
   **più di 55 fps** (regola del 5 novembre). Riquadro verde su P1 e quota circa 0,0 cm con P1 fermo sul fondo.

## 1 · Soglia di P1 (verifica del piano C, circa 10 min)

- **Soglia attesa:** il 5 novembre era **101,64 kPa con il sensore a 23,2 °C**. La soglia è la pressione **assoluta**
  alla quale la bolla ha il volume giusto: non dipende dalla stanza, ma dalla temperatura, che la sposta di circa
  **0,34 kPa per grado** (la bolla segue pV = nRT). Soglia attesa = 101,64 × (273,15 + T) / 296,35, con T la
  temperatura del sensore a circuito chiuso.
- Claude lancia `pc/anello_aperto.py dati/2026-11-10 --soglia-kpa <attesa> --solo-soglia`: P1 a fondo, poi gradini
  di 0,03 kPa ogni 12 s finché si stacca. È lo **stesso metodo del 5 novembre**, quindi il confronto è alla pari.
- **Verdetto del piano C:** se la soglia trovata è entro **0,2 kPa** da quella attesa (la deriva di un solo giorno
  in acqua), P1 nel vasetto non è cambiato e il piano C funziona. Se esce più bassa, P1 è più pesante (ha perso aria):
  decide Gabriele se ritararlo.
- **Se la soglia esce uguale alla pressione di partenza** (P1 si stacca al primo gradino), era più alta del previsto:
  si ripete con `--soglia-kpa` più alto di 0,5.

## 2 · Sottofase 4.2 · stati e sicurezza (circa 30 min)

Ogni prova si registra (Claude apre un CSV con `ESPERIMENTO` e lo chiude con `FINE`) e si annota la riga `X` del
registro. Da SAFE si esce solo con `M,MANUALE`; p0 resta in memoria, quindi poi basta `M,HOLD`.

**Prima della CALIBRAZIONE (regola nuova, 9 novembre):** il servo va portato in MANUALE fino a una pressione **poco
sopra la soglia** del punto 1, con P1 fermo sul fondo. Perché: la rampa parte 0,6 kPa sopra la pressione del momento
in cui si avvia la calibrazione. Se si parte più di 0,6 kPa sotto la soglia (per esempio con il servo a 36), P1 si
stacca appena la rampa comincia e il p0 trovato è troppo basso proprio di quella differenza. **Da stasera il firmware
se ne accorge** (decisione di Gabriele): se P1 supera 1 cm nei primi 3 s della discesa, annulla la calibrazione e va
in SAFE con il motivo `PARTENZA_BASSA` (prova h qui sotto). Errori più piccoli di circa 100 Pa non li vede, quindi la
regola resta.

| # | Transizione | Come la si provoca | Cosa deve succedere |
|---|---|---|---|
| a | rifiuti | `M,HOLD` prima di calibrare; `M,CALIBRAZIONE` con la telecamera chiusa | `NO,M,EQUILIBRIO`; `NO,M,QUOTA` |
| b | MANUALE → CALIBRAZIONE → HOLD | `M,CALIBRAZIONE` | +1,5 kPa e P1 sul fondo per almeno 6 s, poi rampa a −30 Pa/s; quando P1 supera 1,5 cm: `X,CALIBRAZIONE,HOLD,CALIBRATO` e P1 tenuto a 5 cm (PID). **p0 entro circa 100 Pa dalla soglia del punto 1** |
| c | HOLD → SAFE `PERSO` | mano ferma davanti a P1, tra telecamera e bottiglia, per 1 s | dopo circa 0,25 s `X,HOLD,SAFE,PERSO`; servo a 146 con la rampa, P1 a fondo |
| d | HOLD → SAFE `TELECAMERA_MUTA` | Ctrl+C su `pc/telecamera.py` | dopo 300 ms `X,HOLD,SAFE,TELECAMERA_MUTA` |
| e | HOLD → SAFE `MAC_MUTO` | Claude sospende il ponte per 0,8 s (`kill -STOP`, poi `-CONT`): la porta resta aperta e le righe aspettano nel buffer | dopo 500 ms `X,HOLD,SAFE,MAC_MUTO`. In 0,8 s la scheda manda circa 6 kB e non è certo che il buffer del Mac li tenga tutti: se la riga X manca, la prova vale lo stesso se le T dopo la ripresa hanno stato `S` e il servo va a 146 |
| f | HOLD → SAFE `ERRORE` | `K,Z,0,0,0,10` (anello esterno spento) e `R,1100`: P1 resta sul fondo, errore 11 cm | dopo 5 s `X,HOLD,SAFE,ERRORE` |
| g | qualsiasi → SAFE `EMERGENZA` | `E` | subito `X,…,SAFE,EMERGENZA` |
| h | CALIBRAZIONE → SAFE `PARTENZA_BASSA` | `M,MANUALE`, servo a 36 (circa 1 kPa sotto la soglia), poi `M,CALIBRAZIONE` | P1 a fondo, poi appena comincia la discesa si stacca: entro 3 s `X,CALIBRAZIONE,SAFE,PARTENZA_BASSA` e la riga `# calibrazione annullata…`. Poi si ripete la b nel modo giusto |

Dopo la f si rimette il PID: `K,Z,475,11.9,400,10`.

**Non provocate al banco:** `PRESSIONE` (oltre 106,5 kPa: il servo da solo non ci arriva, e non conviene) e
`SENSORE` (bisognerebbe staccare il sensore con tutto acceso). Sono provate dai test sul Mac. Se bastano, per il
«Fatto quando» della 4.2, lo decide Gabriele.

## 3 · Sottofase 4.4 · anello interno PI sulla pressione (circa 15 min)

Gradini di sola pressione **senza comandi nuovi nel firmware**: con l'anello esterno spento la pressione voluta è
p0 + ρg·h_rif, quindi ogni `R` è un gradino netto di ρg × la differenza di quota.

1. `K,E,<p0 + 500>`: un equilibrio finto 500 Pa sopra quello vero. Così anche la pressione più bassa della prova
   resta 600 Pa sopra la soglia e P1 resta fermo sul fondo; se si staccasse, con l'anello esterno spento salirebbe
   fino in cima.
2. `K,Z,0,0,0,10`, `M,HOLD`, poi `R,100` → `R,500` → `R,100` → `R,500` ogni 10 s (gradini di ±391 Pa), e 60 s fermi
   a `R,500` per vedere il servo compensare la perdita d'aria. L'errore di quota resta sotto i 5 cm, quindi niente SAFE.
3. Verdetto: `pc/analisi_f4.py <csv> --prova 4.4`. **Fatto quando:** assestamento sotto 0,5 s (fascia ±50 Pa, cioè
   un passo e mezzo del servo). Nel gemello: 0,22–0,28 s, errore medio nella tenuta 0,3 Pa.
4. Si rimette tutto: `K,E,<p0 vero>`, `K,Z,475,11.9,400,10`.

## 4 · Sottofase 4.3 · On-Off (circa 10 min)

- **Quota voluta 5 cm, non di più.** Dal fondo P1 si stacca solo con la pressione sotto p0, e l'On-Off toglie 700 Pa
  all'equilibrio della quota voluta: a 5 cm l'equilibrio è p0 + 490 Pa e si scende a p0 − 210 Pa, a 10 cm si
  resterebbe a p0 + 278 Pa e P1 non partirebbe mai (gemello, 9 novembre).
- `K,O,5,700` con `R,500` dal fondo, 90 s; poi `K,O,10,700`, 90 s.
- **Da aspettarsi:** a ogni scatto il servo va da un fine corsa all'altro (146 e 36), perché il PI riceve un salto di
  1400 Pa. È normale.
- Verdetto: `--prova 4.3`. Nel gemello: ±5 mm → **±2,2 cm, 6,1 s**; ±10 mm → **±3,0 cm, 7,9 s**.

## 5 · Sottofase 4.5 · solo P, PD, PID e M4 (circa 25 min)

Per ognuno: P1 a 5 cm, dopo 30 s `R,1000` (10 cm), poi 90 s fermi. Verdetto con `--prova 4.5`.

| Regolatore | Comando | Gemello (9 novembre) |
|---|---|---|
| solo P | `K,Z,475,0,0,10` | sovraelongazione 53 %, assestamento 13,9 s; oscilla di ±2,5 mm con periodo 4,8 s |
| PD | `K,Z,475,0,400,10` | 2 %, 3,3 s; M4 superata (RMS 0,9 mm) |
| PID | `K,Z,475,11.9,400,10` | 7 %, 2,9 s; M4 superata (RMS 1,4 mm) |

**M4:** con il regolatore migliore, una prova da 2 minuti con il video («Registra 2 min» nella dashboard; l'avvio
della registrazione ferma i fotogrammi per circa 184 ms, sotto i 300 ms della telecamera muta). Verdetto: «M4 quota
entro ±1 cm per … s di fila → SUPERATO» se il tratto continuo è di almeno 60 s.

## Fine sessione

Procedura di `hardware/collegamenti.md` («Fine sessione»), con P1 di nuovo nel vasetto (piano C), sempre dritto.
Prima di chiudere, Claude legge temperatura e pressione della stanza: serviranno alla prossima verifica.

**Se una prova fallisce due volte:** ci si ferma e si cerca la causa con una misura (regola del progetto).
