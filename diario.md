# Diario di laboratorio: Palombaro di Cartesio

> Una voce per ogni sessione di lavoro (attività T1 del piano operativo).
> Modello: data · sottofase · ore → Fatto · Problemi · Decisioni (e perché) · Foto/file · Prossimo passo.

## 2026-10-08 → 2026-10-09 · fase F0 (approvazione e ordine) · ore: non registrate

**Fatto:**
- Gio 8 ott, 21:47: inviata per email al prof (Alessandro Giuseppi) la proposta del progetto, con il PDF della proposta completa in allegato (`Proposta_Palombaro_Cartesio_Caruso.pdf`) e il link al sito di presentazione con la simulazione interattiva (https://palombaro2169927.netlify.app/). Nel messaggio ho scritto anche un ripiego: se il progetto fosse troppo impegnativo per il corso, mi fermo al livello Base (On-Off, PID su un singolo anello e macchina a stati), con consegna entro dicembre per la convalida dei punti bonus.
- Gio 8 ott, 22:04: il prof ha risposto approvando il progetto ("va bene"). Per curiosità ha chiesto con cosa fosse fatto il sito. Ho risposto che l'ho realizzato con Claude, usando due plugin (skill) trovati su GitHub, "superpowers" e "ui-ux-pro-max". Il prof ha detto che forse prenderà spunto per rendere più accattivante la demo d'aula.
- Ven 9 ott, circa 20:00: inviato l'ordine su Amazon (carrello da 8 articoli, 119,76 € secondo la distinta; importo definitivo da verificare nella conferma d'ordine).

**F0 non ancora conclusa:** resta da comprare tutto il materiale nei negozi fisici (farmacia, supermercato, ferramenta, negozio di acquari, elettronica). La lista dettagliata, con le frasi da dire ai commessi, è in `hardware/lista-spesa-negozi.md`.

**Decisioni del prof:**
- Progetto approvato per email l'8 ottobre alle 22:04, senza modifiche richieste. Il piano prevedeva un incontro lunedì 12 ottobre (0.3): l'approvazione è arrivata già per email.
- Nel thread email non ci sono risposte alle domande preparate nel piano (0.1): formato e lunghezza della consegna, scadenza esatta e canale, esonero d'esame, vincoli sugli strumenti, dove fare la demo, controllo intermedio. Nel messaggio ho scritto che, se servono chiarimenti, ne parlerò in aula.

**Decisioni (e perché):**
- Ordine online subito, senza aspettare l'incontro: i componenti sono generici e riutilizzabili (reso Amazon gratuito).
- Tutto su Amazon, niente AliExpress, per evitare i dazi.

## 2026-10-10 · sottofase 1.1 · 1 h (conclusa alle 13:30)

**Fatto:**
- Creata la struttura del progetto e inizializzato git (primo commit `chore: struttura iniziale del progetto Palombaro di Cartesio`).
- Aggiunti `.gitignore` e questo diario.
- Creato l'ambiente virtuale Python (`.venv`) con OpenCV, pyserial, numpy, matplotlib; versioni congelate in `pc/requirements.txt`.
- Creato `pc/test_camera.py` per provare l'iPhone come webcam.
- Creato il progetto PlatformIO di prova in `firmware/` (ESP32 Dev Module, framework Arduino); compila (RAM 6,6 %, Flash 20,4 %).
- Creato il repository privato su GitHub e fatto il primo push (T2).
- Provato l'iPhone come webcam con `pc/test_camera.py`: funziona. Indice telecamera **0**, collegamento **Wi-Fi** (stessa rete del Mac) con Bluetooth attivo, senza cavo. Il contatore mostra la media dall'avvio, quindi sale piano: da 24,4 a 28,5 fps nei primi secondi, in avvicinamento ai 30 fps nominali (soglia del piano: 25 fps).

- Installato MATLAB R2026b (licenza accademica) con Simulink e Control System Toolbox. Verificato: `tf(1,[1 1])` stampa `1/(s+1)` (funzione di trasferimento a tempo continuo) e `simulink` apre la Start Page.

**Sottofase 1.1 chiusa:** OpenCV mostra il video dell'iPhone, PlatformIO compila, MATLAB apre Simulink.

**Problemi:**
- Il contatore fps di `pc/test_camera.py` è la media dall'avvio, non il valore istantaneo: sale lentamente verso i 30 fps. Per la misura vera (2.2) servirà una media mobile.

**Decisioni (e perché):**
- Video (`media/*.mp4`, `*.mov`) fuori da git perché pesanti; i CSV di `dati/` restano versionati per poter riprodurre i risultati.
- `Materiale teorico/` fuori da git: PDF pesanti e libri che non devono finire su un repository remoto.

**Foto/file:**

**Prossimo passo:** sottofase 1.2 (costruire e tarare il palombaro).

## 2026-10-10 · preparazione della 1.2 (acquisti nei negozi) · ore: da compilare

**Fatto:**
- Preparata `hardware/lista-spesa-negozi.md`: per ogni pezzo da comprare in negozio, a cosa serve, la frase da dire al commesso, i controlli prima di pagare e le alternative, con un giro consigliato per scadenze.
- Aggiunti alla distinta i pezzi nuovi emersi (carta vetrata, tronchesino, specifiche di viti e fascette). Trapano e punte da trapano restano fuori dalla distinta finché non controllo in casa cosa ho.
- Il bilancino (A7) è già ordinato su Amazon, arrivo previsto martedì 13 ottobre: serve per pesare i palombari nella 1.2.

**Prossimo passo:** i giri nei negozi (farmacia, supermercato e ferramenta entro lunedì 12), poi la 1.2 da martedì 13.

## 2026-10-12 · acquisti nei negozi (primo giro) · ore: da compilare

**Fatto:**
- Andato in farmacia e in ferramenta: comprato tutto quello previsto dalla lista, tranne il cavo a 4 conduttori, che in ferramenta non c'era.
- Le bottiglie non servono comprarle: ho già in casa una Levissima da 1,5 L (principale) e una da 0,5 L (aria extra).
- Aggiornati lista della spesa, distinta e relativi PDF.

**Problemi:**
- Cavo a 4 fili non trovato. Serve entro giovedì 15 mattina, quando arriva il sensore e si saldano i fili (1.3). Domani riprovo; alternativa gratuita: i 4 fili colorati di un vecchio cavo USB.

**Decisioni (e perché):**
- Per le prove di foratura uso il tappo di un'altra bottiglia, non quelli veri: ne ho uno solo per bottiglia.

**Prossimo passo:** vaschetta e cavo (martedì 13), negozio di acquari ed elettronica (entro mercoledì 14), poi la 1.2 con il bilancino che arriva martedì 13.

## 2026-10-15 · sottofasi 1.2 (inizio) e 1.3 (fori, saldature, prova del sensore) · 8 h 30

**Orario:** 12:30–14:30 e 15:30–22:00, cioè **2 h + 6 h 30 = 8 h 30** di lavoro effettivo.

**Divisione del tempo** (ricostruita dagli orari delle foto, quindi approssimata di ±15 min):

| Orario | Durata | Attività | Stima del piano |
|---|---|---|---|
| 12:30–13:15 | 45 min | 1.2, passi 0–2: acqua a riposo, controllo del bilancino, ispezione dei contagocce (troppo grandi), ordine delle pipette | 1.2 intera: 3 h |
| 13:15–14:30 | 1 h 15 | 1.3: preparazione del cavo, 4 fori per i fili e foro del tubo con il saldatore, carta vetrata | 1.3 intera: 3 h |
| 15:30–18:30 | 3 h | imparare a saldare da zero: cambio e stagnatura della punta, prove su filo di scarto, scheda BMP280 di prova, pre-stagnatura dei 4 fili veri | non prevista (prima volta) |
| 18:30–19:20 | 50 min | saldatura dei 4 fili sul BMP280 vero, rifusione dell'SCL, ispezione con foto | inclusa nella 1.3 |
| 19:20–22:00 | 2 h 40 | prova con l'ESP32 e diagnosi del sensore che non risponde | inclusa nella 1.3 |

**Fatto (1.2):**
- Passo 0: acqua dalla Levissima sigillata a temperatura ambiente; bicchiere graduato riempito a 600 ml (circa 12 cm) con la stessa acqua; bottiglia da 1,5 L lasciata sigillata nella vaschetta.
- Passo 1: bilancino verificato con le monete (dettagli in `hardware/taratura-palombaro.md`): ripetibilità ±0,02 g, nessun effetto della posizione, somma coerente. La prima pesata dopo l'accensione è falsata: bisogna aspettare 2–3 minuti.
- Passo 2: i contagocce di vetro comprati (lunghi 12,5 cm, tettarella da 22 e 28 mm) **non passano dal collo** della bottiglia (foro di circa 21 mm, uguale per quasi tutte le bottiglie d'acqua) e sarebbero comunque troppo lunghi per la corsa del palombaro. Ordinate su Amazon 20 pipette Pasteur di plastica da 3 ml (tettarella da 13 mm), in arrivo ven 16 ott.
- Il filo di rame è da 0,8 mm (0,45 g ogni 10 cm): con le pipette, che in polietilene galleggiano da sole, servono circa 50 cm di zavorra a pipetta.

**Fatto (1.3):**
- Cavo da allarme 4 × 0,22 tagliato a 1 m, guaina tolta per 8 cm (lato sensore) e 5 cm (lato breadboard). La calza è stata tagliata lato sensore e raccolta in una codina isolata lato breadboard, da collegare a GND nella 1.5.
- Colori: **rosso = VCC (3,3 V), bianco = GND, giallo = SCL, verde = SDA**.
- Tappo forato con la punta di scorta del saldatore (280 °C): 4 fori da circa 1,5 mm per i fili e uno per il tubo (pilota con il saldatore, poi allargato con la forbice). Il tubo entra stretto, non si sfila e lascia passare l'aria. Tappo carteggiato dentro e fuori (è in HDPE, su cui l'epossidica aderisce male). Si avvita bene sulla bottiglia.
- Tubo tagliato a circa 65 cm dal tappo; dentro sporge circa 1 cm.
- Imparato a saldare (stagno senza piombo Sn99,3, punta piatta piccola a 350 °C): stagnatura della punta, punte dei fili stagnate "ad ago", fili saldati in un foro. Prima di toccare il sensore vero ho fatto prove su filo di scarto e su un BMP280 di riserva.
- I 4 fili del tappo sono saldati sul BMP280 vero, con il chip verso il basso e le saldature sul lato delle scritte. Ispezione con foto da entrambi i lati: nessun ponte di stagno, foro del sensore pulito.
- Firmware di prova (`firmware/src/main.cpp`, libreria Adafruit BMP280) caricato sull'ESP32. Con il tempo è diventato un firmware di **diagnosi**: test delle linee con il pull-down, prova di continuità della massa tramite il diodo di protezione del chip, scansione completa del bus, riaccensione del sensore via software.

**Problemi (e cosa si è capito):**
1. **Saldatura fredda sul GND** del sensore del tappo: il pad di massa assorbe calore (piano di massa) e lo stagno si era appoggiato senza legarsi. Trovata con la prova del diodo ("filo bianco → GND: APERTO") e riparata rifondendo a 370 °C: poi la stessa prova dice "collegato".
2. **Il sensore del tappo continua a non rispondere** sul bus I²C, anche con tutti e 4 i fili verificati, il bus rallentato a 10 kHz e VCC, SCL e SDA rifusi.
3. **Un BMP280 nuovo (riferimento)** con il pettine saldato **funziona** se infilato direttamente accanto all'ESP32 e alimentato dai pin, **con il CSB tenuto alto dal programma**: indirizzo 0x76, chip ID 0x58, p = 101,67 kPa, T = 27,5 °C (scaldato dalla saldatura), rumore di ±2–3 Pa.
4. **Fori della breadboard allargati:** le punte stagnate del cavo, più grosse di un pin, allargano le mollette. Dopo, i pin sottili ci entrano senza fare contatto. Sulla prima breadboard sono rovinati i fori della **riga a, colonne 1, 2, 5, 6, 7, 8, 11, 14, 15**. Questo ha falsato diverse prove della serata.
5. **Ipotesi da verificare:** queste schede potrebbero aver bisogno del **CSB collegato al VCC** per restare in I²C. Il sensore nuovo ha risposto solo con il CSB alto; il sensore del tappo ha il CSB scollegato. Se è così, il sensore del tappo è sano e basta un ponticello CSB → VCC. L'ultima prova (sensore nuovo sulla seconda breadboard, CSB collegato al VCC con un cavetto) **non è stata letta**: l'ESP32 era già scollegato.
6. Il test "linea alta/bassa" non è affidabile su questa scheda: dalle letture sembra che **solo una delle due linee dati abbia la resistenza di pull-up**. La scansione I²C invece è affidabile, perché accende i pull-up interni dell'ESP32.
7. Una punta del saldatore usata per forare la plastica si è ricoperta di carbonio e non si stagna più: resta come punta "per la plastica".

**Decisioni (e perché):**
- Pipette di plastica invece dei contagocce di vetro: passano dal collo e si accorciano, così la corsa del palombaro raddoppia.
- Il tappo con il sensore è fatto su un tappo **gemello**, non su quello della bottiglia sigillata: è un pezzo intercambiabile.
- Bottiglie in serie (0,5 L tra siringa e 1,5 L) invece del raccordo a T: niente da comprare e un punto di perdita in meno. Da confermare nella 1.4.
- **Nella breadboard vanno solo pin rigidi della misura giusta:** sulle punte del cavo del sensore si salderanno pin a pettine, o si useranno cavetti jumper.
- Prima di dissaldare il sensore del tappo, verificare l'ipotesi del CSB con il sensore di riferimento.

**Foto** (nella cartella Download del Mac; da copiare in `media/2026-10-15/` se servono nella relazione):
- `IMG_1657`, `IMG_1658` (13:37): tappo con i 4 fori dei fili, prima del foro del tubo.
- `IMG_1659`, `IMG_1660` (13:50): foro del tubo riuscito, vista interna ed esterna.
- `IMG_1676` (18:02): scheda di prova con 4 fili saldati, vista dall'alto.
- `IMG_1677` (18:28): le 4 punte dei fili veri stagnate ad ago.
- `IMG_1679`, `IMG_1680` (18:57): saldature sul sensore vero, prima della rifusione dell'SCL.
- `IMG_1681`–`IMG_1684` (19:12): sensore vero saldato, lato saldature e viste laterali.
- `IMG_1686` (19:16): sensore vero, lato del chip.
- `IMG_1687` (19:30): punte lato breadboard stagnate; `IMG_1688`: contenuto del kit breadboard.
- `IMG_1695`, `IMG_1696` (19:50): ESP32 sulla breadboard con i 4 fili del cavo.
- `IMG_1701`–`IMG_1703` (20:53): sensore di riferimento con i cavetti jumper.
- `IMG_1705` (21:54): sensore di riferimento sulla seconda breadboard, con CSB collegato al VCC.

**Stato a fine giornata:**
- 1.2: passi 0–2 fatti, in attesa delle pipette (ven 16).
- 1.3: tappo forato e carteggiato, tubo montato, 4 fili saldati. **Sensore del tappo non funzionante**, causa da chiarire (CSB o chip guasto). Epossidica non ancora colata.
- Firmware: è rimasto in configurazione di diagnosi (sensore di riferimento su D15/D2/D18/D19, CSB e SDO scollegati). Prima di usarlo per il banco va ripulito, e c'è da completare `letturaPlausibile()`.

**Stima per le prossime attività** (da oggi: le attività manuali fatte per la prima volta richiedono circa **2,5 volte** la stima del piano, che si riduce quando i gesti sono già imparati):

| Attività | Stima |
|---|---|
| 1.3: prova del CSB con il sensore di riferimento | 15 min |
| 1.3: ponticello CSB → VCC sul sensore del tappo, oppure sostituzione del sensore | 30 min (ponticello) / 1 h (sostituzione) |
| 1.3: pin a pettine sulle punte lato breadboard e prova funzionale | 45 min |
| 1.3: colata di epossidica in due strati | 45 min + 24 h di indurimento |
| 1.3: verifica finale | 20 min |
| **Totale 1.3 restante** | **circa 2 h 30 – 3 h 30 di lavoro, più 24 h** |
| 1.2 con le pipette (piano: 3 h) | **4–5 h**, divise in due sessioni |

Calendario realistico: **ven 16** chiusura della diagnosi, sensore funzionante, colata di epossidica e inizio della 1.2 (circa 4–5 h). **Sab 17** taratura fine dei palombari (2–3 h). **Dom 18** verifica del tappo dopo le 24 h. La 1.2 slitta da ven 16 a sab 17; la 1.3 resta entro dom 18 solo se la colata si fa venerdì. La milestone M1 (dom 25) per ora regge, con un margine ridotto.

**Prossimo passo:** rileggere il sensore di riferimento con il CSB collegato al VCC (la prova rimasta in sospeso). Se risponde, ponticello CSB → VCC sul sensore del tappo e nuova prova.

## 2026-10-16 · sottofase 1.3 (sensore funzionante e colata di epossidica) · 5 h 10

**Orario:** 13:54–15:25 e 17:50–21:30, cioè **1 h 30 + 3 h 40 = 5 h 10**. Orari ricostruiti dai messaggi della sessione e dalle foto; tra le 15:25 e le 17:50 è stata contata una pausa.

**Divisione del tempo:**

| Orario | Durata | Attività |
|---|---|---|
| 13:54–15:25 | 1 h 30 | diagnosi con il sensore di riferimento: prova A/B del CSB, ESP32 spostato (breadboard nuova troppo dura), porta USB del Mac da cambiare. Conclusione: senza strumento di misura il banco non è affidabile |
| 17:50–18:30 | 40 min | multimetro: continuità dei 4 fili del tappo (integri, nessun corto), ponticello CSB → VCC sul sensore del tappo, isolamento con il nastro |
| 18:30–19:15 | 45 min | il sensore del tappo, alimentato a 3,28 V e con il CSB collegato, non risponde: **chip guasto**. Misurato il pull-up del CSB su un sensore nuovo (8,71 kΩ: il ponticello non serve), fili tagliati e risaldati sul sensore nuovo, prova riuscita |
| 19:15–20:50 | 1 h 35 | prove di funzionamento (soffio, dito, strette della bottiglia), posizionamento del sensore e del tubo, fissaggio, supporto per la colata |
| 20:50–21:30 | 40 min | prima e seconda colata di epossidica |

**Fatto:**
- **Multimetro e condensatori da 1000 µF** già disponibili: non vanno comprati.
- **Diagnosi chiusa con misure dirette:** sul sensore del tappo fili integri (continuità), nessun corto, 3,28 V tra VCC e GND, linee dati alte, CSB collegato al VCC, eppure nessuna risposta sul bus. Il chip si era danneggiato il 15 ottobre, quasi certamente per il calore delle rifusioni ripetute vicino al chip.
- **Sensore nuovo sul tappo:** fili tagliati a 2–3 mm dalla scheda guasta, rispellati, stagnati e saldati su un BMP280 nuovo. Il ponticello CSB → VCC non serve: la scheda ha già il pull-up sul CSB (8,71 kΩ misurati tra CSB e VCC).
- **Prove riuscite** (firmware `firmware/src/main.cpp`, commit `e50f261`): indirizzo 0x76, chip ID 0x58, p = 101,11 kPa, T = 27,3 °C (sensore caldo dopo le saldature), rumore ±2–3 Pa. Il soffio dà da −28 a +20 Pa, il dito vicino porta la temperatura da 27,8 a 30,5 °C.
- **Prima misura della pressione in bottiglia** (tappo avvitato su una bottiglia gemella, prima della colla): stringendo si arriva a **+2,5 kPa**, ma in meno di mezzo secondo la pressione torna a zero, e al rilascio scende fino a −1,2 kPa. È la perdita dai fori ancora aperti: la costante di tempo è sotto il mezzo secondo, e la 1.6 la vuole sopra i 30 minuti.
- **Montaggio interno:** tubo a circa 15 mm dalla faccia interna; scheda verticale con i pin verso il tappo e il chip rivolto lontano dal tubo; scheda **legata al tubo** con una fascetta del pane, passando per un foro di montaggio, con il chip libero. Prova nel collo di una bottiglia gemella superata.
- **Colata di epossidica** (5 minuti di lavorazione, maneggiabile dopo 20 minuti, indurimento completo in 2–3 ore a 20 °C): prima colata sulla faccia interna (strato sottile sui 5 fori), seconda sulla faccia esterna. Supporto: barattolo di vetro con cartoncino forato.

**Problemi (e cosa si è capito):**
1. **La breadboard nuova** è così dura che i pin entrano solo forzando, e possono finire di fianco alla molletta, senza contatto: ha falsato le prove della sera del 15 sulla seconda breadboard.
2. **Correzione rispetto al 15:** la scheda del BMP280 ha i pull-up da 10 kΩ su **entrambe** le linee dati, quindi una linea bassa vuol dire davvero filo interrotto. Le prove sul CSB della sera del 15 non erano valide.
3. Per qualche minuto il Mac non vedeva l'ESP32: risolto cambiando porta USB.
4. **La colla a caldo non attacca al tubo in silicone** (materiale antiaderente): la scheda è fissata in modo meccanico con una fascetta.
5. Il tubo arrotolato nel barattolo faceva leva e piegava il pezzo interno: il tubo esterno va lasciato libero, non arrotolato stretto.
6. **L'epossidica non aderisce a PE e PP** (lo dicono le istruzioni): la tenuta si basa sul riempimento dei fori e sull'unione tra lo strato interno e quello esterno attraverso i fori. La verifica sarà il test di tenuta della 1.6.
7. Sulla faccia esterna i colletti attorno ai fili sono venuti bassi, uno strato sottile e non 1 cm. Se la 1.6 mostrerà perdite, si aggiunge una terza dose.
8. Il tubo esterno è rimasto piegato vicino al tappo durante l'indurimento: da controllare che non sia strozzato.
9. **Le pipette sono in ritardo:** arrivano **lunedì 19** e non oggi. Alle 15:25 nel diario avevo scritto per errore che erano arrivate.

**Decisioni (e perché):**
- Per ogni verifica di contatto si usa il **multimetro**: le prove indirette (pull-down, diodi di protezione) avevano ipotesi nascoste e hanno fatto perdere ore.
- Sostituire il sensore invece di continuare la diagnosi: un sensore costa poco più di un euro, la diagnosi stava costando ore.
- Niente ponticello CSB → VCC: è stato **misurato** che la scheda ha già il pull-up, ed è una saldatura in meno vicino al chip.
- Sensore verticale, con il chip rivolto lontano dal tubo e non verso il soffitto del tappo, dove si forma la condensa.
- Il sensore di riferimento delle prove del 15 resta da parte, con l'etichetta "da verificare"; quello vecchio del tappo, "guasto".

**Foto** (nella cartella Download del Mac):
- `IMG_1718`, `IMG_1719` (15:19): sensore di riferimento accanto all'ESP32, dall'alto e di lato.
- `IMG_1721`, `IMG_1722` (18:20): ponticello CSB → VCC sul vecchio sensore del tappo.
- `IMG_1730`–`IMG_1734` (19:38–19:42): posizionamento del sensore nuovo e del tubo dentro il tappo.
- `IMG_1736`–`IMG_1738` (20:22): supporto per la colata (barattolo con cartoncino forato).
- `IMG_1739`–`IMG_1741` (20:59): prima colata, faccia interna.
- `IMG_1743`–`IMG_1746` (21:31): seconda colata, faccia esterna.

**Stato a fine giornata:**
- 1.3: sensore funzionante e sigillato. **Mancano** la verifica dopo l'indurimento (prova con l'ESP32, prova di inclinazione a 45°, controllo del tubo esterno) e il taglio dei trefoli della calza che sporgono dalla guaina vicino al tappo.
- 1.2: ferma fino a lunedì 19 (pipette).

**Ore della 1.3 finora:** 7 h 45 (15 ott) + 5 h 10 (16 ott) = **circa 12 h 55**, contro le 3 h del piano. Di queste, circa 4 h 30 non si ripeteranno: imparare a saldare (3 h) e la diagnosi del primo sensore (1 h 30).

**Prossimo passo:** ricalibrare il piano del fine settimana (vedi la proposta in chat) e chiudere la 1.3 sabato mattina.

## 2026-10-17 · sottofasi 1.3 (chiusa) e 1.4 (tappo della bottiglia da 0,5 L) · 3 h 55

**Orario:** 16:15–20:10, senza pause: **3 h 55**. Divisione ricostruita dagli orari delle foto e dal registro della seriale.

**Calendario confermato** (le date di piano e bollettino sono aggiornate): sab 17 chiusura della 1.3 e 1.4 senza palombaro · dom 18 1.5 e 1.6 · lun 19 pipette, 1.2 parte 1 e chiusura della 1.4 · mar 20 1.2 parte 2 · mer 21 – gio 22 1.7 (decisione sul piano B giovedì) · ven 23 margine · sab 24 – dom 25 1.8 e M1. Rispetto alla proposta della sera del 16 ci sono due ritocchi: i pin a pettine sul cavo del sensore si saldano oggi, perché servono già per la prova con l'ESP32; la chiusura della 1.3 è stimata 1 h invece di 30 minuti.

**Divisione del tempo:**

| Orario | Durata | Attività |
|---|---|---|
| 16:15–16:30 | 15 min | 1.3: controllo della colla (prova dell'unghia), ispezione del tappo, prova del soffio nel tubo |
| 16:30–16:55 | 25 min | 1.3: trefoli tagliati, continuità del filo bianco con il multimetro, primo pin a pettine (rosso) |
| 16:55–17:10 | 15 min | 1.3: altri tre pin a pettine |
| 17:10–17:55 | 45 min | 1.3: pulizia del flussante, continuità e corti dei 4 fili, colla a caldo sui giunti (rifatta sul giallo) |
| 17:55–18:15 | 20 min | 1.3: prova con l'ESP32; il pin rosso si sfila alle 18:02, ricerca del guasto, ancoraggio del cavo |
| 18:15–18:30 | 15 min | 1.3: prova di pressione con la siringa, inclinazione a 45° |
| 18:30–18:55 | 25 min | 1.4: due fori nel tappo della 0,5 L |
| 18:55–19:30 | 35 min | 1.4: sbavature, carteggiatura, tubi A e B, supporto, prima colata (19:30) |
| 19:30–20:10 | 40 min | 1.4: attesa, seconda colata (19:55), prova del soffio |

**Stima contro tempo reale:** chiusura della 1.3 stimata 1 h, reale **2 h 15** (fattore 2,25). 1.4 finora 1 h 40, contro 2 h del piano per l'intera sottofase.

**Fatto (1.3, chiusa):**
- **Colla indurita** dentro e fuori (prova dell'unghia sulla goccia avanzata e sul tappo). Ingrandendo le foto: forellino del BMP280 pulito, scheda verticale e legata, nessuna crepa né bolla, tubo esterno curvo ma con sezione rotonda. Con il soffio l'aria passa bene.
- **Trefoli:** tagliati per errore i trefoli scoperti del filo bianco vicino al sensore (erano fuori dalla saldatura); continuità del bianco verificata con il multimetro (suona), nessun corto verso giallo e rosso. Poi tagliati i trefoli della calza all'estremità della guaina.
- **Pin a pettine** saldati sulle 4 punte lato breadboard, usando la prima breadboard come morsa: saldatura parallela sul lato corto del pin, 350 °C. Tutte e quattro lucide e ben bagnate. Sul pin rosso il flussante bruciato aveva annerito il lato lungo: pulito. **Continuità dei 4 fili** dal pad del sensore al pin e **nessun corto** tra le 6 coppie (multimetro). Giunti isolati con un manicotto di colla a caldo lungo circa 1 cm.
- **Collegamento sull'ESP32:** rosso colonna 30 (3V3), bianco 31 (GND), verde 40 (D21), giallo 43 (D22), tutti in riga a, l'unica libera.
- **Prova con l'ESP32:** 0x76, chip ID 0x58, p = 100,93 kPa, rumore di pochi pascal. Firmware invariato (`firmware/src/main.cpp`); corretto solo il commento sul CSB.
- **Prova di pressione** (registro in `dati/2026-10-17/2026-10-17_prova-siringa-tappo_01.log`): 10 ml spinti con la siringa nella bottiglia vuota da 1,5 L danno **+670 Pa**, che scendono a +580 Pa e si stabilizzano. Boyle prevede circa +670 Pa. Dopo 30 s resta l'85 %; il calo è quasi tutto nei primi 10 s e poi la curva si appiattisce, come per il raffreddamento dell'aria compressa, non per una perdita. Negli ultimi 10 s cala di circa 1 Pa/s: **τ ≥ 10 minuti** circa, contro meno di 0,5 s del 16 senza colla. Il τ vero (≥ 30 min richiesti) lo dirà la 1.6.
- **Inclinazione:** bottiglia da 1,5 L piena fino alla spalla, inclinata di circa 50–55°: la superficie dell'acqua resta circa **3 cm sotto il collo**, quindi lontana dal sensore.

**Fatto (1.4, in corso):**
- Tappo gemello della bottiglia da 0,5 L: 2 fori a 10 mm di distanza (pilota con la punta "per la plastica" a 280 °C, poi allargati con la forbice), tubo stretto nel foro. Sbavature tolte, zona centrale carteggiata dentro e fuori, anello di tenuta e filettatura lasciati puliti.
- Tubi: **A** = pezzo nuovo da 50 cm (verso la siringa); **B** = l'estremità libera dei 65 cm che escono dal tappo con il sensore. Le due bottiglie restano unite per sempre da B. Monconi interni di circa 1 cm, dritti.
- Colate di epossidica: faccia interna alle 19:30, faccia esterna alle 19:55, applicata dopo 2–3 minuti di attesa perché si addensasse: i colletti questa volta sono rimasti attorno ai tubi. Prova del soffio dopo la seconda colata: entrambi i monconi liberi.
- Tubo rimasto: circa 3 m.

**Problemi (e cosa si è capito):**
1. **Il pin rosso si è sfilato dalla breadboard** alle 18:02:18, mentre il tappo veniva avvitato sulla bottiglia: il cavo ruotato ha tirato il pin. Il registro lo mostra bene: da quell'istante 2382 letture identiche (85,51 kPa, 25,30 °C) ed errori di timeout I²C (`Error 263`), con il programma che scriveva comunque "ok", perché `letturaPlausibile()` è ancora da scrivere. La prova con la siringa delle 18:02 è andata persa e rifatta alle 18:16.
2. **"Lo stantuffo non torna indietro" non dice niente sulla tenuta:** +0,7 kPa su uno stantuffo da circa 1,65 cm² spingono con circa 0,1 N, mentre la guarnizione ha bisogno di qualche newton per scorrere. Era una mia indicazione sbagliata. La tenuta si giudica solo dalla pressione misurata.
3. Il blocchetto di plastica del pin rosso si è fuso e sfilato (troppo calore vicino alla plastica): rimesso e bloccato dalla colla a caldo. Sugli altri tre pin il saldatore è stato appoggiato dal lato dell'isolante, con tocchi da 3 secondi al massimo.
4. La colla a caldo del giallo era stata stesa su tutto il filo, per un'indicazione poco chiara: tolta e rifatta solo sul giunto, perché un filo rigido spinge sul pin.
5. Il sensore segnava circa 30 °C a inizio prova (tappo al sole o in mano), poi è sceso verso 26 °C.

**Decisioni (e perché):**
- **Il cavo del sensore va ancorato al tavolo con il nastro** a circa 10 cm dalla breadboard, con i fili laschi fino ai pin: la trazione e la torsione si fermano sul nastro. **Il tappo si avvita tenendolo fermo e girando la bottiglia.**
- Prima la misura con il multimetro, poi la colla a caldo: con la colla sopra, rifare una saldatura è molto più scomodo.
- Una lettura I²C riuscita (indirizzo e chip ID giusti, pressione che varia) vale come prova dei 4 contatti: è una prova diretta di funzionamento, non una prova indiretta.
- Bottiglie in serie confermate: siringa → A → 0,5 L → B → 1,5 L.

**Foto** (nella cartella Download del Mac):
- `IMG_1777`–`IMG_1781` (16:20): tappo con il sensore a colla indurita, facce interna ed esterna, tubo piegato.
- `IMG_1782` (16:27): faccia interna dopo il taglio dei trefoli del filo bianco.
- `IMG_1784`–`IMG_1786` (16:52): primo pin a pettine (rosso).
- `IMG_1787`–`IMG_1792` (17:08): i quattro pin saldati.
- `IMG_1795`–`IMG_1798` (17:42–17:50): colla a caldo sui giunti.
- `IMG_1799` (18:24): prova di inclinazione.
- `IMG_1801`–`IMG_1804` (18:51): fori nel tappo della 0,5 L.
- `IMG_1805`–`IMG_1807` (19:00): tubi montati dritti.
- `IMG_1809`–`IMG_1812` (20:02): dopo le due colate.

**Stato a fine giornata:**
- **1.3 chiusa:** colla indurita, 4 fili integri, sensore asciutto a 45°.
- 1.4: tappo della 0,5 L sigillato, in indurimento (completo verso le 22–23). Mancano la misura dei volumi (con bottiglie gemelle, per non bagnare quelle del banco), la prova della siringa sul circuito completo e, lunedì, il palombaro.
- 1.7 non cominciata: slitta a domani, durante la 1.5, o a mercoledì come da calendario.
- `letturaPlausibile()` ancora da scrivere: il guasto delle 18:02 ne è l'esempio perfetto (valori bloccati, salto di 15 kPa e di 3 °C in un decimo di secondo).

**Ore della 1.3 in totale:** 7 h 45 (15 ott) + 5 h 10 (16 ott) + 2 h 15 (17 ott) = **circa 15 h 10**, contro le 3 h del piano.

**Prossimo passo:** domenica 18, prova della siringa sul circuito con le due bottiglie (tappo indurito), misura dei volumi, poi 1.5 (servo con alimentatore separato e condensatore) e 1.6 (tenuta a +2 kPa per 10 minuti).

## 2026-10-18 · sottofasi 1.4, 1.6 (chiusa), 1.5 (chiusa), 1.7 (misure) · prima parte, 1 h 45

**Orario:** 15:20–17:05, cioè **1 h 45**. Sessione in pausa per circa due ore (crediti esauriti); la giornata prevede 5 ore in tutto. Divisione dagli orari annotati e dai registri della seriale.

| Orario | Durata | Attività |
|---|---|---|
| 15:20–15:25 | 5 min | 1.4: volumi d'aria con bottiglie gemelle |
| 15:25–15:33 | 8 min | 1.4: montaggio del circuito (due bottiglie, elettronica, USB) |
| 15:33–15:42 | 9 min | 1.4: prova della siringa (15:38) |
| 15:42–16:01 | 19 min | 1.6: prova di tenuta (fascetta chiusa alle 15:44, tagliata alle 16:01) |
| 16:01–16:32 | 31 min | 1.5: controllo dell'alimentatore, cablaggio del servo e del condensatore, controlli con il multimetro |
| 16:32–16:36 | 4 min | 1.5: prova del servo (programma `prova_banco.cpp`) |
| 16:36–17:05 | 29 min | 1.7: misure di siringa, squadrette, servo, tavoletta, asticelle |

**Fatto (1.4):**
- **Volumi:** acqua nella bottiglia principale fino all'inizio della spalla (segnata con nastro rosso). Camera d'aria **200 ml**, bottiglia piccola **550 ml**, tubi circa 15 ml (A 50 cm, B 65 cm, diametro interno 4 mm): in tutto circa **765 ml**.
- **Circuito montato:** siringa → tubo A → bottiglia da 0,5 L → tubo B → bottiglia da 1,5 L con il sensore. La bottiglia da 0,5 L è fissata con lo scotch: vuota è troppo leggera e cade.
- **Prova della siringa (15:38):** 10 ml danno **+1,02 kPa** a regime (picco iniziale +1,14 kPa). Boyle con 765 ml prevede +1,32 kPa: il volume "efficace" è di circa **990 ml**, perché pareti delle bottiglie e tubo in silicone cedono sotto pressione (e forse lo stantuffo non spinge tutti i 10 ml). **Guadagno misurato: circa 0,10 kPa per ml di siringa.**

**Fatto (1.6, chiusa):** due cariche di siringa (la seconda tenendo piegato il tubo A), tubo A chiuso con una fascetta su una piega alle 15:44:00. Pressione ambiente 101,19 kPa.

| Ora | Sovrapressione | Rispetto all'inizio |
|---|---|---|
| 15:44:00 | +1,78 kPa | 100 % |
| 15:46:30 | +1,63 kPa | 92 % (assestamento di pareti e tubo, poi la curva si ferma) |
| 15:54:00 (10 min) | +1,66 kPa | **93 %** (il piano chiede ≥ 70 %) |
| 16:01:20 (17 min) | +1,71 kPa | 96 % |

Alle 16:01:23, tagliata la fascetta, la pressione è tornata a 101,21 kPa, cioè allo zero di partenza. **τ di molte ore**, ben oltre i 30 minuti richiesti. Registro: `dati/2026-10-18/2026-10-18_seriale.log` (manca un minuto, 15:49:30–15:50:30: la registrazione si è fermata da sola ed è stata riavviata).

**Fatto (1.5, chiusa):**
- Alimentatore TKDY: tensione ai morsetti verificata con il multimetro, polarità giusta.
- Condensatore da 1000 µF **25 V** nei morsetti verdi (gamba lunga accorciata e gambe aperte a V; striscia nel −), insieme ai jumper. Servo: rosso al morsetto +, marrone alla striscia blu "−" della breadboard, giallo a **D18** (colonna 38, riga a). Masse comuni sulla striscia blu "−": morsetto −, GND dell'ESP32 (jumper da colonna 31, riga a) e filo bianco del sensore (spostato lì). Schema in `hardware/collegamenti.md`.
- Controlli di continuità prima di accendere: tutti giusti (morsetto − con GND e con il bianco; nessun corto + e −; nessun collegamento tra il 5 V e il 3V3).
- Programma `firmware/src/prova_banco.cpp` (ambiente `banco` in `platformio.ini`: `pio run -e banco -t upload`): BMP280 a 50 Hz (oversampling ×4, standby 0,5 ms), servo comandato dalla seriale, motivo dell'ultimo riavvio stampato all'avvio.
- **Prova (16:33–16:35):** escursione lenta 0°→180°→0° e scatti 0°/180°/90°, due volte. **Nessun riavvio, nessun brownout**; **50 letture al secondo** stabili per 138 s; rumore della pressione circa ±10 Pa, uguale a servo fermo e in movimento. Registro: `dati/2026-10-18/2026-10-18_prova-servo.log`.

**Fatto (1.7, misure, da ricontrollare nella prossima sessione):** vedi `hardware/calibrazione-servo.md`.

**Problemi (e cosa si è capito):**
1. La registrazione in background si è fermata da sola dopo circa 18 minuti (motivo non chiaro): da ora va lanciata staccata dalla sessione (`nohup ... &`).
2. Due misure della siringa non tornano tra loro (gomma 67 mm contro asta 46 mm per 10 ml; diametro esterno "6,5 cm" impossibile): da rifare.
3. **Problema di progetto emerso dalle misure:** con il braccio più lungo delle squadrette (16,75 mm) la corsa massima dello stantuffo è circa 33 mm, cioè 5–7 ml, sotto gli 8 ml del piano. E con il guadagno misurato (0,10 kPa/ml) anche 10 ml danno solo circa 1 kPa, mentre tenere il palombaro su tutta la colonna d'acqua (circa 25 cm) richiede circa ρ·g·0,25 m ≈ 2,5 kPa. Va deciso come recuperare (dettagli e opzioni in `hardware/calibrazione-servo.md`).

**Decisioni (e perché):**
- Condensatore da 25 V invece di 10 V: più margine sui picchi del motore.
- Masse comuni sulla striscia blu "−" della breadboard: la corrente del servo non passa dall'ESP32, il collegamento di massa porta solo il riferimento del segnale.
- I programmi di prova stanno in `firmware/src/`, uno per ambiente PlatformIO (`esp32dev` = prova del tappo, `banco` = 1.5), invece che in `firmware/test/` (cartella che PlatformIO riserva ai test automatici).

**Foto** (cartella Download): `IMG_1836` squadrette; `IMG_1837`–`IMG_1840` asticelle a Z; `IMG_1841`, `IMG_1842` banco elettronico dall'alto.

**Stato alla pausa (17:05):** 1.5 e 1.6 chiuse, in anticipo sul calendario. 1.4 manca solo del palombaro (lunedì). 1.7 avviata: misure fatte, geometria da decidere. Sull'ESP32 è caricato `prova_banco.cpp`. Il circuito pneumatico è montato e il servo, alimentato a parte, è fermo a 90°.

## 2026-10-18 · sottofasi 1.4 e 1.7 · seconda parte, 42 min

**Orario:** 21:15–21:57, **42 min** (foto alle 22:01). **Totale della giornata: 1 h 45 + 42 min = 2 h 27**, contro le 5 ore previste. La sera si è chiusa prima del previsto: il montaggio sulla tavoletta aspetta la siringa nuova, di cui non si conoscono ancora marca e misure.

| Orario | Durata | Attività |
|---|---|---|
| 21:15–21:40 | 25 min | 1.7: prolunga del braccio (due squadrette incollate con l'epossidica e 3 perni di rame) |
| 21:40–21:50 | 10 min | 1.4: 500 ml d'acqua nella bottiglia da 0,5 L, ESP32 collegato (21:45), controllo della registrazione |
| 21:50–21:57 | 7 min | 1.4 e 1.7: prova del guadagno con la siringa a mano |

**Analisi prima di lavorare (conti in `hardware/calibrazione-servo.md`):**
- **Le pareti cedono:** le prove del 17 e del 18 danno lo stesso risultato. Il circuito si comporta come se avesse circa **210–235 ml d'aria in più**, quasi tutti per il rigonfiamento della bottiglia da 1,5 L (circa 2 ml per kPa). Togliere aria dalla 0,5 L raddoppia il guadagno, ma non lo moltiplica per 3–4 come era stato stimato.
- **Quanta pressione serve:** spostare l'equilibrio del palombaro di 10 cm richiede 0,98 kPa. La fascia utile della bottiglia è di circa 15 cm (acqua circa 22 cm, palombaro circa 3,5 cm), quindi servono **almeno 2,0 kPa, comodi 2,5**. I 25 cm di stamattina erano troppi.
- La proposta (`landing/sim.js`: 310 ml d'aria in tutto, circa 3,3 kPa con 10 ml) era coerente, ma non contava né la bottiglia extra da 550 ml né le pareti che cedono.
- **Conseguenza:** il braccio lungo da solo non basta. Servono meno aria e tutta la corsa, e con una siringa da 20 ml avanza margine.

**Fatto (1.7):**
- **Prolunga del braccio:** due squadrette a doppio braccio (una del servo di scorta) sovrapposte, con le facce di contatto carteggiate, epossidica e 3 perni di filo di rame nei fori che combaciano. Dalle foto i mozzi sono a circa 24 mm, quindi i fori del braccio libero sono a circa 32, 35, 38 e 41 mm dal mozzo che va sul servo: si lavora con quello a circa 35 mm. Le due squadrette sono in linea e incollate piatte. Il mozzo scanalato e i fori liberi sono rimasti puliti.
- I perni sporgono di circa 6 mm da un lato solo: quel lato va verso l'esterno, e sul servo si monta la squadretta con il mozzo scanalato dal lato dei perni a filo. Dopo l'indurimento si accorciano a circa 2 mm.

**Fatto (1.4): meno aria e prova del guadagno.**
- 500 ml d'acqua nella bottiglia da 0,5 L: restano circa 50 ml d'aria. La bottiglia sta in piedi sul tavolo, più in basso del tappo della 1,5 L, e ora non cade più.
- **Prova (21:50–21:57):** circuito chiuso con la siringa a mano a 10 ml, poi spinta a passi di 2 ml e ritorno, 30 s per passo.
- **Risultato: 10 ml danno +2,02 kPa, cioè 0,20 kPa/ml** (il doppio di stamattina; previsto circa 0,21). Volume efficace circa 512 ml contro circa 276 ml d'aria vera: le pareti valgono ancora circa 235 ml.
- **Nessuna perdita:** andata e ritorno coincidono entro circa 60 Pa (precisione delle tacche a mano, circa 0,3 ml). Alla fine resta +20 Pa, compatibile con l'aria scaldata di 0,1 °C.
- Registro: `dati/2026-10-18/2026-10-18_seriale-sera.log`, 50 letture al secondo, dalle 21:45 alle 22:00.

**Decisioni (e perché):**
- **Siringa da 20 ml** (2 pezzi in farmacia lunedì 19): con la stessa corsa (circa 58 mm) sposta circa 18 ml, cioè **circa 3,6 kPa**. Il margine si potrà spendere rimettendo un po' d'aria nella 0,5 L, per avere meno pascal per passo del servo (è il «volume d'aria regolabile» della proposta). Con la 10 ml si arrivava a circa 1,9 kPa, al limite.
- La siringa da 10 ml resta come siringa a mano: per le prove di lunedì con il palombaro, e di scorta.
- **Il «Fatto quando» della 1.7 diventa in pressione:** escursione ≥ 2,5 kPa, ripetibile entro ±25 Pa. Aggiornati anche i vincoli del piano e il rischio R3.
- **Il montaggio di servo e siringa sulla tavoletta è rinviato a mercoledì 21**, con la siringa in mano e misurata. Le posizioni sono già pronte in `hardware/calibrazione-servo.md`.
- Saltate le misure della siringa da 10 ml: con la 20 ml non servono più.

**Foto** (cartella Download): `IMG_1843`–`IMG_1845` (22:01), prolunga incollata vista di lato e dalle due facce.

**Stato a fine giornata:**
- 1.5 e 1.6 chiuse. 1.4 manca solo del palombaro (lunedì), con una siringa a mano che ora sposta il doppio della pressione.
- 1.7: geometria decisa, prolunga in indurimento, siringa da comprare.
- `letturaPlausibile()` ancora da scrivere.

**Ore:** 1.7 finora 29 + 25 = **54 min**. 1.4 circa **2 h 19** (2 h 02 + 17 min).

**Prossimo passo:** lunedì 19, dopo la lezione:
- farmacia: due siringhe da 20 ml «senza ago, cono Luer semplice, a tre pezzi»;
- con le pipette: 1.2 parte 1 e chiusura della 1.4 con il palombaro;
- mercoledì 21: misure della 20 ml, montaggio sulla tavoletta e asticella. Prima va verificato quali attrezzi ci sono per piegare e tagliare il filo inox: pinza, seghetto o lima.

## 2026-10-19 · sottofasi 1.2 (palombari), 1.4 (chiusa), 1.6 (tenuta rifatta), 1.7 (siringa da 20 ml) · circa 5 h 35

**Orario:** circa **16:25–21:30**. L'inizio non è stato annotato: è stimato dal primo messaggio della sessione. In tutto circa **5 h 05**. In mattinata, lezione in aula magna (8:30–11:00, non contata). Divisione ricostruita dal registro della seriale (`dati/2026-10-19/2026-10-19_seriale.log.gz`, compresso perché sono 30 MB di testo) e dagli orari annotati; dopo le 20:25 il registro non ha più la pressione (vedi problema 6).

| Orario | Durata | Attività |
|---|---|---|
| ~16:25–17:20 | 55 min | 1.2 e 1.7: preparazione, misure di pipetta e siringa da 20 ml, costruzione e pesate di P1, prova nella bottiglia gemella |
| 17:20–17:25 | 5 min | 1.4: prima prova con P1 nella bottiglia con il sensore (circuito chiuso alle 17:21:49): P1 non scende |
| 17:25–17:55 | 30 min | 1.4 e 1.6: ricerca della perdita, tappo stretto, prova di tenuta (17:41–17:52) |
| 17:55–17:57 | 2 min | 1.4: prova ripetuta, P1 fermo anche a +4,0 kPa |
| 17:58–19:30 | 1 h 32 | 1.2: tentativi di taratura di P1 (gocce, bollicine, ugello, tagli di rame) |
| 19:30–19:33 | 3 min | 1.2: misura con la «pompa»: P1 fermo anche a +12–14 kPa |
| 19:33–20:15 | 42 min | 1.2: secondo palombaro R1 (senza ugello, 50 cm di rame) e prove con la siringa |
| 20:15–20:25 | 10 min | 1.2: R1 affondato, recuperato aspirando con la siringa (fino a circa −4 kPa) |
| 20:25–21:30 | 1 h 05 | 1.2: altri tentativi con P1, con il sensore ormai guasto (non ce ne siamo accorti) |

**Fatto (1.7, siringa da 20 ml):** comprate due siringhe **PIC Solution** da 20 ml.
- Distanza tra le tacche 0 e 20: **70 mm**, cioè **3,5 mm/ml** (area 2,86 cm², diametro interno circa 19,1 mm). Il controllo con la gomma torna: 15 mm a 0 ml, 85 mm a 20 ml.
- Diametro esterno circa 20 mm, alette 38 mm, disco di spinta 28 mm. L'asta è a croce, con nervature che sporgono 7 mm.
- Il tubo A entra sul cono come sulla 10 ml.
- **Nel circuito, 20 ml spinti danno +4,0 kPa** (17:55–17:57): 0,20 kPa/ml, come previsto.
- Mancano la lunghezza del cilindro (dalle alette alla punta del cono) e lo spessore delle alette.

**Fatto (1.2, palombari):**
- **Pipette arrivate: la 0.4 è chiusa e con lei la milestone M0** (tutto il materiale disponibile).
- **Pipetta intera:** 15 cm. Tettarella 4 cm per 1,3 cm; gambo 11 cm, largo 8 mm vicino alla tettarella e 3 mm in punta. Tacche fino a 3 ml (lo 0 a 3,8 cm dalla punta, il 3 a 0,9 cm dalla tettarella). Era previsto fin dal 15 ottobre di accorciarla, ma non era stato detto chiaramente all'acquisto.
- **P1:**
  - gambo tagliato 2 cm sotto la tettarella (palombaro lungo circa 6 cm, foro di circa 6–7 mm);
  - 55 cm di rame (**2,35 g**) e nastro rosso in cima; **m_secco = 3,05 g**;
  - in seguito, **ugello**: 15 mm di punta di un'altra pipetta incollati nel foro con la colla a caldo.
- **R1:** come P1 ma senza ugello, con **50 cm** di rame.
- **Pesate con l'acqua dentro (non affidabili):**
  - m_pieno 5,34–5,40 g;
  - m_tarato 5,14 g (sporge 2–3 mm, serve una stretta fortissima), 5,91 g (affonda), **5,44 g** (nella gemella scende con una stretta e risale dal fondo);
  - V_materiali: 2,00 g con il primo metodo e −5,12 g con il secondo, entrambi non validi.
  - m_tarato (5,44) è più di m_pieno (5,37): impossibile. Durante le pesate esce acqua dal foro largo.
- **Bottiglia gemella:** P1 a 5,44 g scende con una stretta della mano e risale dal fondo. È il «Fatto quando» della 1.2 com'è scritto oggi, ma una stretta della mano vale 10–20 kPa: non dice niente sul funzionamento con la siringa.

**Fatto (1.4 e 1.6, circuito):**
- **Prima prova (17:21–17:25):** la pressione sale solo a +2,06 kPa e poi si svuota da sola, con **τ ≈ 1 minuto**. Era una **perdita dal tappo della bottiglia principale**, svitato per mettere dentro P1 e non riavvitato abbastanza.
- Stretto il tappo: **prova di tenuta 17:41–17:52, dopo 10 minuti resta il 94 %**, τ di circa 4–5 ore. Il «Fatto quando» della 1.6 è confermato.
- Imparata la **pompa**: il tubo piegato a mano fa da valvola, e la siringa si può ricaricare. Raggiunti +14 kPa, e −4 kPa tirando invece di spingere.
- **Il «Fatto quando» della 1.4 non è ancora raggiunto:** nessun palombaro è sceso con la siringa entro +4 kPa. P1 non scende neanche a +12–14 kPa. R1 scende a circa +8–10 kPa; con 2 cm di rame in più affonda anche a pressione zero.

**Problemi (e cosa si è capito):**
1. **Dopo aver svitato una bottiglia va rifatta la prova di tenuta.** Procedura per chiudere: tubo A sfilato, bottiglia tenuta dal fondo (mai dal corpo), tappo appoggiato dritto e prima girato all'indietro fino allo scatto del filetto, ultimo quarto di giro deciso. Poi prova rapida: siringa da 20 a 12 ml, e tra 10 s e 40 s il calo deve essere sotto 0,05 kPa.
2. **Stringere la bottiglia con il tubo collegato la mette in pressione:** punte di **+18, +24, +25 e +27 kPa**, oltre la scala del BMP280 (110 kPa).
3. **La mano scalda il tappo**: 1 °C vale circa 0,34 kPa in una bottiglia chiusa e sembra una perdita. Anche il sapone sul tappo, asciugando, lo raffredda. Le prove di tenuta si fanno a mani ferme.
4. **Tarare il palombaro con le gocce non funziona.** La fascia utile vale circa 0,02–0,03 g d'acqua, meno di una goccia (circa 0,05 g), e le pesate da bagnato oscillano di qualche centesimo. Dal foro largo esce acqua a ogni spostamento, e anche prendere P1 per la tettarella la schiaccia. In più, le mie indicazioni (bollicine «grandi come una lenticchia», «1,5–2 mm fuori», «una bollicina in meno») erano troppo grossolane o ambigue.
5. **Ipotesi principale, da verificare domani: la tensione superficiale.** Quando la punta sporge dall'acqua, il menisco attorno alla tettarella asciutta tiene il palombaro con una forza fino a circa 0,072 N/m × 41 mm ≈ **3 mN (circa 0,3 g)**. La siringa a +4 kPa toglie solo circa 0,08 g di spinta (a +12 kPa circa 0,24 g). Spiega tutto:
   - con la mano (10–20 kPa) scende, con la siringa no;
   - tutto sott'acqua affonda, appena sporge non lo smuove niente;
   - muovendo la siringa in fretta si vedono solo «micromovimenti».

   Prova: un colpetto sulla bottiglia sotto pressione. Rimedio: **una goccia di detersivo per i piatti** nell'acqua, che fa bagnare la plastica.
6. **Guasto del sensore (scoperto rileggendo il registro a fine giornata):**
   - **20:20:42**: l'ESP32 si riavvia per **brownout**, senza servo in movimento.
   - **20:25:07**: errori di timeout I²C (`Error 263`, poi `Error -1`), poi valori senza senso (p circa 2,5 kPa, T circa 180 °C).
   - **20:42:42**: al riavvio, «BMP280 non trovato a 0x76».
   - Nei 4 minuti prima, la temperatura del sensore è salita da 25,3 a 26,7 °C.
   - **Ipotesi:**
     - acqua sul sensore, perché la bottiglia è stata stretta molte volte con l'acqua fino al collo, e richiusa (una corrente di dispersione spiegherebbe sia il brownout sia il calore);
     - oppure un pin sfilato dalla breadboard per il cavo attorcigliato dalle molte aperture del tappo, come il 17 ottobre.
   - In entrambi i casi `letturaPlausibile()`, ancora da scrivere, avrebbe dato l'allarme subito.

**Decisioni (e perché):**
- **Siringa da 20 ml confermata:** +4,0 kPa con tutta la corsa.
- **Proposta per il «Fatto quando» della 1.2, in kPa:** nella bottiglia con il sensore, il palombaro scende con una sovrapressione **tra +2 e +7 kPa** e risale dal fondo a pressione zero, 5 volte. Sotto i 2 kPa non risale dal fondo; sopra i 7 kPa il sensore va fuori scala. Il circuito si può chiudere già in pressione (con la pompa), e il servo lavora attorno a quel punto: nella fase 4 diventa lo stato CALIBRAZIONE.
- **Registratore della seriale nel progetto** (`pc/registra_seriale.py`): lo scratchpad della sessione si svuota.
- **D'ora in poi:** i palombari si tengono per il rame o per il gambo, mai per la tettarella; si tarano direttamente nella bottiglia dove verranno usati; la correzione fine si fa con il rame (2 mm = 0,009 g).

**Controllo serale (21:20–21:40), dopo un odore di bruciato:** tutte le alimentazioni staccate (USB, alimentatore del servo, pistola e saldatore non collegati); nessun pezzo caldo, annerito o fuso; fonte dell'odore non trovata, probabilmente non il banco. Tappo asciutto. Con l'ESP32 di nuovo collegato (21:31:12) il **BMP280 risponde subito**: 101,59 kPa, 23,5 °C, 50 letture al secondo, nessun errore né brownout; temperatura ferma per 45 s (nessuna corrente di dispersione); prova del soffio alle 21:31:56 superata (p ±50 Pa, T +2,9 °C e poi di nuovo giù). Registro: `dati/2026-10-19/2026-10-19_controllo-sera.log`. **Falso allarme**: il guasto delle 20:25 era quasi certamente un contatto instabile (pin o cavo mossi durante le tante aperture del tappo).

**Prova finale con il detersivo (21:42–21:57): P1 funziona con la siringa ✅**
- **Marcatore rifatto** senza pieghe, ben aderente: le pieghe del nastro trattenevano aria. Già così P1 scende a circa +5,7–6,0 kPa (prima non scendeva neanche a +12–14), ma sul fondo non risale finché la pressione non torna vicino a zero: l'isteresi del menisco.
- **Detersivo:** una goccia pura va a fondo senza sciogliersi (è più densa dell'acqua). Funziona invece la **soluzione** (una goccia in un cucchiaino d'acqua), messa **sul pelo dell'acqua** e **strofinata sulla punta di P1**.
- **Risultato (21:51–21:56):** con **una sola corsa della siringa (da 20 a 0 ml), senza la pompa**, P1 scende spingendo e risale tirando, più volte di fila. La pressione resta tra 0 e circa +3,6 kPa. Nessun errore del sensore. **Il «Fatto quando» della 1.4 è raggiunto.**
- Ipotesi della tensione superficiale **confermata**: si vedeva a occhio l'acqua che «tirava su» P1 un attimo prima che si staccasse.
- Registro: `dati/2026-10-19/2026-10-19_prova-detersivo.log`. Le soglie esatte di discesa e risalita sono da misurare domani con calma.

**Stato a fine giornata:**
- **1.4 chiusa.** P1 tarato, con la pressione neutra nella fascia giusta (circa +2…+3,5 kPa). Sensore funzionante (vedi controllo serale); il guasto delle 20:25 resta da spiegare: domani controllare i pin a fondo e il cavo ancorato.
- 1.2: P1 (con ugello) e R1 costruiti, non ancora utilizzabili con la siringa. R2 da fare.
- 1.4: circuito verificato (+4,0 kPa, tenuta ok), ma il palombaro non scende ancora con la siringa.
- 1.7: siringa da 20 ml misurata.
- `letturaPlausibile()` ancora da scrivere.

**Ore:** 1.2 circa 4 h 17 + 15 min (detersivo e prova finale); 1.4 circa 35 min + 15 min; 1.7 circa 10 min. Controllo serale del sensore circa 20 min. **Totale della giornata: circa 5 h 35** (16:25–21:57, con il controllo).

**Prossimo passo (martedì 20):**
1. Pin del sensore spinti a fondo e cavo ancorato; registrazione con il controllo degli errori.
2. P1: misurare con calma le soglie (pressione di discesa dalla superficie e di risalita dal fondo, 5 volte), cioè il «Fatto quando» in kPa della 1.2.
3. R1 tarato nella stessa bottiglia (detersivo sulla punta, rame per la correzione fine).
4. Mercoledì 21: 1.7, montaggio di servo e siringa da 20 ml.

## 2026-10-20 · giornata di riposo

Nessuna attività sul progetto (altri impegni e materie).

## 2026-10-21 · guasto del sensore (umidità), diagnosi di P1, 1.7 (misure e prolunga) · circa 2 h 55

**Orario:** circa **17:00–19:55**, su 3 ore disponibili. L'inizio è stimato dal primo messaggio della sessione; il resto viene dal registro della seriale (`dati/2026-10-21/2026-10-21_seriale.log.gz`) e dalle foto.

| Orario | Durata | Attività |
|---|---|---|
| ~17:00–17:15 | 15 min | 1.7: lettura del piano del giorno |
| 17:15–17:34 | 19 min | 1.2: osservazione di P1 (a galla), siringa sfilata alle 17:10 circa, controlli del multimetro su 5 V e 3V3, ESP32 collegato |
| 17:34–17:46 | 12 min | sensore: «non trovato», diagnosi delle linee I²C, pin bianco reinserito (risponde dalle 17:40:56 alle 17:41:34) |
| 17:46–17:52 | 6 min | 1.2: prova di P1 con la siringa (senza dati di pressione: sensore già perso) |
| 17:52–18:59 | 1 h 07 | sensore: jumper GND, saldatura del pin bianco rifatta, tappo aperto e schedina umida, continuità e misure in ohm, asciugatura |
| 18:59–19:55 | 56 min | 1.7: misure del Blocco 2, prolunga (perni e braccio libero), asticella, linee sulla tavoletta, servo posizionato e contorno tracciato (Blocco 4, passi 1–2) |

**Fatto (1.2, P1 dopo due giorni):**
- Il circuito era rimasto chiuso dal 19 sera con la siringa collegata. Togliendo la siringa (17:10) P1 non si è mosso: dentro c'era già la pressione della stanza, come atteso con una perdita di τ ≈ 4–5 ore.
- Pressione della stanza **100,65 kPa**, contro circa **101,55** del 19 sera: **0,9 kPa in meno**.
- Siringa a 20 ml, tubo rinfilato alle 17:46, spinta 2 ml alla volta fino a 0: **P1 non scende**. Scende con un **colpetto** sulla bottiglia o con una **spinta rapida** della siringa, staccandosi sempre **di colpo**: a quella pressione è già più pesante dell'acqua, ma il **menisco** lo trattiene. La punta, rimasta fuori dall'acqua due giorni, si è asciugata.

**Fatto (sensore, R8):**
- All'avvio «BMP280 non trovato a 0x76». Programma di diagnosi nuovo (`firmware/src/diagnosi_i2c.cpp`, ambiente `diagnosi`): **SDA e SCL alte** grazie ai pull-up del modulo, quindi rosso, verde e giallo integri; **nessun dispositivo** sul bus.
- Firmware del banco: se il sensore manca **non si blocca più**, riprova ogni secondo e controlla ogni secondo il registro d'identità del chip (`# BMP280 assente/perso/ritrovato`). Così la perdita del sensore si vede subito nel registro e non produce più valori falsi senza avviso.
- Multimetro: pin bianco → GND dell'ESP32 **non suonava**. Il **jumper GND** (colonna 31 → striscia blu) era allentato: reinserito, suona.
- Il chip però rispondeva all'accensione e spariva entro un secondo, con valori assurdi (156 kPa, 182 °C). Rifatta la saldatura del pin bianco (trefoli sotto non stagnati, rame scoperto a S, niente manicotto): nessun cambiamento.
- **Tappo aperto: la schedina era umida.** Continuità dei 4 fili fino alla schedina e nessun corto. Misure in ohm prima e dopo il phon tiepido: VCC–GND da 45,5 a 122,9 kΩ; CSB–VCC 8,68 e 9,16 kΩ (il pull-up della scheda, come il 16).
- **Alle 18:59:51 il sensore funziona:** 50 letture al secondo per un'ora, p = 100,67–100,77 kPa (rumore ±7 Pa), temperatura scesa da 33 a 25 °C dopo il phon, nessuna perdita.

**Fatto (1.7):**
- Misure: fori della prolunga a **32, 35, 38, 41 mm** dal mozzo (si usa il 35); l'asticella entra nel foro **senza gioco**; servo sdraiato su un fianco largo con l'alberino a **9 mm** dalla tavoletta; alette della siringa 38 × **12 mm**, spessore 1–2 mm; nervatura dello stantuffo circa 1 mm; cilindro 103 mm.
- **Prolunga finita:** perni di rame accorciati a circa 2 mm, braccio libero della squadretta che va sul servo tagliato a circa 6,5 mm dal mozzo (avrebbe urtato la tavoletta).
- Geometria del montaggio decisa con le misure (servo sdraiato, siringa su distanziali da 11 mm con le alette verticali, stantuffo a circa 11 ml con il braccio verticale): `hardware/calibrazione-servo.md`, sezione 8.
- Firmware del banco: servo limitato a ±60° dal centro (30–150 finché c0 non è misurato), un grado ogni 15 ms anche con i comandi singoli.
- Linee a matita sulla tavoletta (asse della siringa a 100 mm dal bordo vicino, alberino a 25 mm dal bordo sinistro), servo posizionato e contorno tracciato: **Blocco 4, passi 1 e 2 completati**.
- **Asticella tagliata** in serata, dopo un primo tentativo fallito con le forbici.

**Problemi (e cosa si è capito):**
1. **Umidità sul sensore.** Nella bottiglia l'aria è satura: quando la stanza si raffredda la condensa si forma sulle superfici più fredde, e il 19 la bottiglia era stata stretta molte volte con l'acqua al collo e il detersivo era entrato dal collo. Con la schedina umida il chip risponde da fermo e si blocca appena misura. È la spiegazione più probabile anche del guasto del 19 alle 20:25 (rischio R8).
2. **Due guasti sovrapposti** (jumper GND allentato e schedina umida): ognuno da solo bastava a fermare il sensore, e per questo i primi rimedi sembravano non funzionare.
3. **Il menisco torna** quando la punta del palombaro si asciuga. Con 0,9 kPa di meno dal meteo la corsa della siringa non basta più a strapparlo. La superficie è "appiccicosa" (un'isteresi): durante il controllo il palombaro non deve mai riemergere.
4. **La continuità pin bianco–GND al primo giro non era stata misurata**, e per qualche minuto la diagnosi ha cercato il guasto nel cavo. Misurata davvero, ha trovato subito il jumper allentato. Lezione: ogni controllo della lista si misura, anche quando sembra ovvio.
5. **L'asticella d'acciaio con le forbici non si taglia** (niente lima in casa); tagliata poi in serata.
6. Le indicazioni per le misure M4 e M5 e per il Blocco 4 erano poco chiare. Riscritte con riferimenti concreti (bordo vicino, bordo sinistro) e disegni.

**Decisioni (e perché):**
- **Il firmware non si ferma più senza sensore** e verifica ogni secondo che il chip risponda: il controllo di plausibilità dei valori resta `letturaPlausibile()`, ma un sensore "muto" ora si vede subito.
- **Smalto trasparente** su schedina e saldature (chip coperto con il nastro durante la verniciatura): è la difesa contro la condensa. Regole nuove: mai stringere la bottiglia con l'acqua al collo, detersivo lontano dal tappo, tappo aperto quando il banco resta fermo per giorni.
- **Soglie di P1 da misurare con il palombaro già sott'acqua**, non dalla superficie (altrimenti si misura il menisco).
- **Alette della siringa verticali:** con la flangia da 12 mm, in orizzontale non sporgerebbero dal cilindro e non si potrebbero bloccare.
- **Calendario invariato:** si prosegue con il piano originale, senza tagli né spostamenti; giovedì 22 restano la calibrazione e la decisione sul piano B (R3). Eventuali tagli li decide solo Gabriele.

**Foto** (cartella Download): `IMG_1902`–`IMG_1904` (18:06) pin bianco prima della nuova saldatura; `IMG_1906`–`IMG_1908` (18:32) sensore nel tappo aperto.

**Stato a fine giornata:**
- Sensore funzionante; tappo fuori dalla bottiglia per la notte.
- 1.7: prolunga e misure fatte, asticella tagliata, servo posizionato con il contorno tracciato (si riparte dal passo 3 del Blocco 4, il fissaggio); stantuffo e siringa da fare.
- 1.2: soglie di P1 e taratura di R1 ancora da fare.
- `letturaPlausibile()` ancora da scrivere.

**Ore:** 1.2 circa 25 min; sensore (1.3) circa 1 h 19; 1.7 circa 1 h 11. **Totale circa 2 h 55.**

**Prossimo passo (giovedì 22):**
1. Comprare lo smalto trasparente.
2. Smalto sul sensore (chip coperto), un'ora d'asciugatura, prova di funzionamento; tappo sulla bottiglia con la procedura e la prova rapida di tenuta; punta di P1 ribagnata con la soluzione.
3. 1.7: fissaggio del servo e c0 (Blocco 4, passi 3–6), piega a L dell'asticella a 110 mm (se non è già fatta), foro nella nervatura e tacca nel disco, siringa sui distanziali, prove a vuoto.
4. Come da calendario: calibrazione comando → kPa e decisione sul piano B (R3). Venerdì 23 resta il giorno di margine.

## 2026-10-22 · nessuna attività registrata

Nel progetto non ci sono registri né note per giovedì 22 (da confermare con Gabriele).

## 2026-10-23 · sottofasi 1.7 (chiusa) e 1.2 (chiusa) · circa 5 h 40

**Orario:** circa **18:20–23:59**. La divisione viene dal registro della seriale (`dati/2026-10-23/2026-10-23_seriale.log.gz`), dagli orari delle foto e dai comandi inviati al servo; i confini tra un blocco e l'altro sono approssimati di ±10 minuti. Lo smalto sul sensore è rimandato (decisione di Gabriele: si fa quando il banco funziona, per risparmiare tempo).

| Orario | Durata | Attività |
|---|---|---|
| 18:20–18:57 | 37 min | 1.7: servo riposizionato (alberino verso il bordo lontano), 5 viti come pioli, colla a caldo |
| 18:57–19:14 | 17 min | 1.7: registrazione, braccio verticale, c0 = 86 e direzione, firmware aggiornato |
| 19:14–20:09 | 55 min | 1.7: asticella raddrizzata, M6, foro nella lamella dello stantuffo, tacca nel disco, distanziali |
| 20:09–21:05 | 56 min | 1.7: asticella agganciata, siringa sui distanziali e allineata, asticella nuova più dritta, distanziali incollati e fascette |
| 21:05–21:50 | 45 min | 1.7: prove a vuoto; la siringa scivolava, bloccata con viti e nastro isolante; tabella comando → ml |
| 21:50–22:40 | 50 min | 1.7: isteresi (136 → 86 contro 36 → 86) e ricerca della causa; 1.2: P1 trovato sul fondo |
| 22:40–22:48 | 8 min | circuito: tappo chiuso (22:43), prova rapida di tenuta superata |
| 22:48–23:04 | 16 min | 1.7: prima calibrazione; 1.2: misura su P1 tirando fino a 26 |
| 23:04–23:22 | 18 min | 1.2: bottiglia cambiata (schiuma di detersivo), P1 ritarato |
| 23:22–23:35 | 13 min | 1.7 e 1.2: calibrazione con prova di tenuta, ripetibilità su 5 cicli |
| 23:35–23:59 | 24 min | 1.7: +50 ml d'acqua nella bottiglia grande, menisco tornato (detersivo diluito), prova finale |

**Fatto (1.7, chiusa):**
- **Montaggio:** servo sdraiato su un fianco largo, alberino verso il bordo lontano, bloccato da 5 viti e colla a caldo; prolunga con il braccio verticale e la vite centrale; asticella da 110 mm con la Z nel foro a 35 mm e la L in un foro da 1,5 mm nella lamella dello stantuffo, fatto con lo spezzone d'acciaio scaldato; tacca nel disco di spinta; siringa n. 2 su due distanziali di cartone, bloccata con fascette, viti e nastro isolante attorno all'aletta in basso.
- **c0 = 86**; aumentando il comando il braccio va verso la siringa e la pressione sale. Firmware con `ANGOLO_CENTRO = 86` (limiti 26–146).
- **Comando → ml** (tubo staccato): 86 ≈ 11, 96 ≈ 9,5, 106 ≈ 7, 116 ≈ 6, 126 ≈ 4,5, 136 ≈ 3 ml, entro ±0,5 ml dal modello.
- **Calibrazione** (bottiglia nuova, chiusura a 36): da 36 a 146 la pressione sale di 2,37 kPa; gioco tra andata e ritorno 15–90 Pa. Tabella in `hardware/calibrazione-servo.md`, sezione 9.
- **Ripetibilità:** 5 cicli 36 ↔ 146 con escursione 2,403–2,421 kPa (**±9 Pa**). Dopo **50 ml d'acqua in più** nella bottiglia grande (meno aria nel circuito): **2,64–2,66 kPa** su 3 cicli (**±11 Pa**). **Il «Fatto quando» della 1.7 è raggiunto**: escursione ≥ 2,5 kPa, ripetibile entro ±25 Pa. Il criterio del rischio R3 (ripetibilità peggiore di ±25 Pa) non scatta.

**Fatto (1.2, chiusa):**
- P1 era sul fondo con la bottiglia aperta: rispetto al 21, stanza +0,6 kPa, acqua più fredda di circa 1,5 °C, un po' d'aria della bolla disciolta. Tirando fino a −2,2 kPa si stacca appena dal fondo.
- Bottiglia cambiata (si era formata schiuma di detersivo), P1 ritarato con il metodo del 19. **Soglie misurate con il servo:** va a fondo a circa **+2,2 kPa**, risale dal fondo a circa **+0,4 kPa**. **5 discese e 5 risalite su 5** (scende in circa 2 s, risale in circa 2,5 s), poi altre 3 su 3 dopo l'acqua aggiunta.
- È la **proposta di «Fatto quando» in kPa** del 19 (scende tra +2 e +7 kPa, risale dal fondo entro zero, 5 volte). **R1 e R2 non si fanno** (decisione di Gabriele).

**Problemi (e cosa si è capito):**
1. **Istruzioni poco chiare:** il verso dell'alberino («verso sinistra» intendeva la posizione, non la direzione), la tacca nel disco, i buchi nei distanziali poi corretti, le misure M4 e M5. Il contorno del servo è stato rifatto una volta. Da qui in avanti: riferimenti concreti, disegni, una sola versione definitiva per ogni blocco.
2. **Le fascette non bastano** a tenere la siringa: il cilindro di plastica liscia scivola, il cartone cede. Servono fermi rigidi sull'aletta (viti).
3. **Zona morta di circa 10° a ogni inversione** (gioco più attrito di primo distacco della gomma): circa 1 ml, cioè 150–200 Pa nella prima prova e 15–90 Pa nella seconda. È ripetibile, quindi si può compensare nel programma (compensazione del gioco).
4. **Estremo 26:** tirando fino a 26 con il circuito in depressione la siringa si è spostata e la pressione è risalita di colpo di 0,24 kPa. Proposta: limite minimo a 36 (da decidere).
5. **Il punto di equilibrio del palombaro cambia di giorno in giorno** di 1–2 kPa (meteo, temperatura, aria disciolta): il 21 era troppo leggero, il 23 troppo pesante. Lo stato CALIBRAZIONE dovrà ritrovarlo a ogni avvio.
6. **Detersivo:** troppo fa schiuma (bottiglia da cambiare); l'acqua aggiunta senza detersivo lo diluisce e il menisco torna. Bastano 3–4 gocce di soluzione sul pelo dell'acqua.
7. **Tenuta in peggioramento:** la prova rapida a +2,4–2,6 kPa ha dato 0,044, poi 0,074, poi 0,103 kPa tra 10 e 40 s (limite 0,05), dopo diverse aperture del tappo. Va rifatta la prova di 10 minuti della 1.6 e, se serve, stretto meglio il tappo.

**Decisioni (e perché):**
- **Smalto sul sensore rimandato** a quando il banco funziona (Gabriele): il sensore asciutto ha funzionato tutta la sera.
- **R1 e R2 non si fanno** (Gabriele): si risparmia tempo, P1 basta.
- **+50 ml d'acqua** nella bottiglia grande (meno aria nel circuito): l'escursione passa da 2,41 a 2,64 kPa. P1 va a fondo alla stessa pressione e risale un po' prima.
- **Il gioco non si corregge adesso in meccanica:** è ripetibile e si misura bene con il sensore; si valuterà la compensazione nel programma.

**Foto** (cartella Download): `IMG_1948`–`IMG_1951` servo con le viti; `IMG_1952`–`IMG_1954` asticella curva; `IMG_1955`–`IMG_1958` foro e tacca nello stantuffo; `IMG_1960`–`IMG_1964` siringa sui distanziali; `IMG_1965`–`IMG_1966` asticella nuova.

**Stato a fine giornata:** banco montato e calibrato; 1.2 e 1.7 chiuse; circuito chiuso con la bottiglia nuova; registrazione fermata alle 23:59.

**Ore:** 1.7 circa 4 h 57; 1.2 circa 42 min. **Totale circa 5 h 40.**

**Prossimo passo (sabato 24 – domenica 25, 1.8 e milestone M1):**
1. Prova di tenuta di 10 minuti (1.6) e tappo stretto meglio se serve.
2. Decidere il limite minimo del servo (36?) e lo smalto quando il banco funziona.
3. 1.8: comando manuale della posizione via seriale, prova di 10 minuti con P1, video di M1.

## 2026-10-24 · sottofase 1.8 (chiusa) e milestone M1 · circa 1 h 12

**Orario:** circa **15:10–16:22**. Divisione dal registro della seriale (`dati/2026-10-24/2026-10-24_seriale.log.gz`) e dagli orari dei video. Mentre si collegava il banco è stata scritta la bozza della dashboard (lavoro di Claude, non contato nelle ore).

| Orario | Durata | Attività |
|---|---|---|
| 15:10–15:24 | 14 min | A: ESP32 collegato (registrazione dalle 15:24); B: inizio dello scambio dei tappi |
| 15:24–15:38 | 14 min | B: tappo del sensore; il sensore si perde alle 15:28:48 avvitando il tappo, pin reinseriti, di nuovo a posto alle 15:35:03 |
| 15:38–15:50 | 12 min | C: prova di tenuta di 10 minuti |
| 15:50–16:06 | 16 min | D: circuito richiuso alla pressione della stanza, 10 cicli con P1, video di M1 |
| 16:06–16:22 | 16 min | E: P1 tenuto a mano a mezz'acqua dalla dashboard (16:14–16:16), video; limite del servo portato a 36 |

**Fatto (1.8, chiusa, e M1):**
- **Comando manuale via seriale:** dalla nuova **dashboard** su localhost (`pc/dashboard/`): cursore verticale (in alto tira e P1 sale), passi di 2° e 10°, posizioni fisse, tastiera; letture in diretta di pressione, sovrapressione e temperatura; due grafici (sovrapressione e comando) con mirino; elenco degli eventi; stato del registro e del sensore, con l'allarme "valori fuori scala" (il caso dei 2,5 kPa e 180 °C). Il server legge il registro e scrive il file dei comandi: la porta seriale resta del solo registratore. Limiti 36–146. 8 test del modulo che legge il registro.
- **C, tenuta di 10 minuti:** a 146 la sovrapressione passa da +1,69 a +1,34 kPa, cioè **resta il 79 %** (τ ≈ 43 min; il requisito è il 70 %). Il 18 e il 19 era il 93–94 %: dopo le tante aperture del tappo tiene un po' peggio.
- **D, prova di 10 minuti:** 10 cicli 36 ↔ 146, **P1 scende e risale 10 volte su 10**, escursione 2,62–2,67 kPa, nessun errore del sensore. Video di M1: `media/2026-10-24_M1_palombaro-comandato-dal-servo.mp4` (2 min, sincronizzato con il registro entro un secondo).
- **E, prova a mano:** P1 tenuto a mezz'acqua comandando il servo con la dashboard (262 comandi in 70 s, pressione attorno a +1,3…+1,7 kPa). Video: `media/2026-10-24_prova-E_palombaro-a-mano-dalla-dashboard.mp4`.
- **Firmware del banco:** `ANGOLO_MIN = 36` (prima 26), caricato alle 16:22 («limiti 36-146»).
- **Bozza del capitolo 2** della relazione: `relazione/02-banco-sperimentale.md`.

**Problemi (e cosa si è capito):**
1. **Il sensore si è perso avvitando il tappo** (15:28:48, errori I²C e poi la solita firma 2,48 kPa / 180 °C). Pin e jumper reinseriti e ESP32 riacceso: di nuovo a posto. Il cavo non deve ruotare né tirare: si tiene fermo il tappo e si gira la bottiglia.
2. **Il circuito si era chiuso sotto la pressione della stanza** (−0,9 kPa), perché il servo si è mosso con il tubo già infilato durante la riaccensione: a 146 si arrivava solo a +1,7 kPa e P1 non scendeva. Riaperto e richiuso a 36 alla pressione della stanza: tutto a posto.
3. **Meteo:** la stanza era a 100,90 kPa (101,31 il 23 sera). Con il circuito chiuso alla pressione della stanza, a 146 si arriva proprio alla soglia di P1 del giorno prima: ha funzionato, anche grazie al tappo scaldato dalle mani (26,4 °C). Il punto di lavoro va ritrovato a ogni avvio.
4. **Dashboard:** il numero del comando non seguiva i comandi dati da fuori (le sequenze automatiche). Corretto: segue anche gli "inviato" del registro.
5. **Per la fase 2:** il nastro rosso del livello dell'acqua ha lo stesso colore del marcatore di P1, quindi va cambiato prima del riconoscimento per colore.

**Decisioni (e perché):**
- **Limite inferiore del servo a 36** (Gabriele): a 26 la siringa si era spostata; a 36 lo stantuffo resta a circa 18 ml.
- **Dashboard come base del prodotto finale** (Gabriele): oggi comanda l'angolo; il verso del cursore è già quello del futuro comando della quota.

**Stato a fine giornata:** **M1 raggiunta** (il palombaro si muove con la siringa comandata dal servo), un giorno prima della scadenza di domenica 25. F1 chiusa.

**Ore:** 1.8 circa 1 h 12.

### Revisione settimanale (T5), 19–25 ottobre
- **Milestone della settimana:** M1 **raggiunta** il 24 ottobre (scadenza 25).
- **Ore della settimana:** 19: 5 h 35 · 20: 0 · 21: 2 h 55 · 22: 0 · 23: 5 h 40 · 24: 1 h 12 → **circa 15 h 20**, contro le circa 14 h previste (2 h al giorno). Tutta la fase F1: circa 36 h contro le 20 h del piano; la differenza viene soprattutto dal tappo con il sensore (circa 16 h, di cui 4,5 una tantum per imparare a saldare) e dal palombaro (circa 6 h).
- **Rischi:** R2 (tenuta) peggiorata ma nei limiti (79 %); R3 (gioco del servo) non scatta, resta la zona morta di circa 10° da compensare; R6 (palombaro) chiuso con P1, punto di lavoro che cambia con meteo e temperatura; R8 (acqua sull'elettronica) attivo, smalto da fare.
- **Settimana prossima (F2, dal piano):** 2.1 postazione di ripresa (lun 26 – mar 27), 2.2 riconoscimento del palombaro nel video (mar 27 – ven 30), 2.3 calibrazione della misura (ven 30 – dom 1), 2.4 regole di dialogo computer–scheda (dom 1 – lun 2). Prima della 2.1: nastro del livello di un altro colore.

## 2026-10-24 (sera) · sottofase 2.1 (postazione di ripresa, in corso) · circa 4 h 56

**Orario:** **16:38–23:45**, con una pausa lunga nel pomeriggio. Gli orari vengono dai messaggi della sessione, dal registro della seriale (`dati/2026-10-24/2026-10-24_seriale_sera.log.gz`, dalle 22:30), dal registro della telecamera (`dati/2026-10-24/telecamera/telecamera.log`) e dalla foto `IMG_2006` (22:02). Tra le 17:14 e le 20:05 non ci sono registri: la durata dei blocchi A e B è stimata.

| Orario | Durata | Attività |
|---|---|---|
| 16:38–17:14 | 36 min | 2.1: lettura del piano della postazione, decisioni (vaschetta tolta, bottiglie sul tavolo) |
| 17:14–20:05 | circa 40 min effettivi (stima) | blocco A (etichetta tolta, riga nera del livello) e blocco B (misure); un urto alla bottiglia ha fatto schiuma |
| 20:05–21:38 | 1 h 33 | blocco C: bottiglia sulla diagonale del tavolo, cartone dietro, bottiglia piccola dietro il cartone, segni |
| 21:38–22:15 | 37 min | metro da sarta su un'asta di cartone accanto alla bottiglia, Livella, foto della postazione |
| 22:15–22:36 | 21 min | blocchi D ed E: iPhone in orizzontale nell'angolo opposto, sonda della telecamera, programma della telecamera, colonna disegnata |
| 22:36–22:49 | 13 min | blocco F: avvio del banco, P1 che non risale a 36, circuito richiuso a 66 |
| 22:49–23:00 | 11 min | prova 1 (riferimento alle 22:52, 2 minuti di video con P1 sul fondo), prova 2 iniziata |
| 23:00–23:16 | 16 min | incidente: bottiglia piccola rovesciata spostando la tavoletta, bottiglia grande inclinata, acqua sul sensore; asciugatura e riaccensione |
| 23:16–23:32 | 16 min | circuito richiuso a 96 per misurare il distacco di P1: spingendo la pressione non sale |
| 23:32–23:45 | 13 min | servo rimontato con il nastro isolante (si solleva ancora), spegnimento |

**Fatto (programmi, lavoro di Claude, non contato nelle ore):**
- `pc/telecamera.py`: unico programma che apre la telecamera, come il registratore per la seriale. Prende i fotogrammi dall'iPhone con ffmpeg nel formato vero (1920 × 1080), scrive anteprima, stato e video di prova con l'orario di ogni fotogramma in `dati/<giorno>/telecamera/`, e si ricollega da solo se l'iPhone tace per 5 secondi.
- `pc/postazione.py`: misure della postazione (luminosità, riflessi, nitidezza, maschera del rosso) e comandi tra dashboard e telecamera; 26 test in tutto con quelli della dashboard.
- Dashboard: pannello «Telecamera» (immagine dal vivo, guide, colonna da disegnare, riferimento sovrapposto per differenza, maschera del rosso, misure e controlli, «Salva riferimento» e «Registra 2 min»); pannello dei comandi sempre tutto visibile nella finestra; sovrapressione con «Azzera» vicino ai comandi.
- `pc/sonda_telecamera.swift`: elenca i formati delle telecamere e dice se esposizione, fuoco e bilanciamento si possono bloccare.
- Piano della 2.1 in `hardware/postazione-ripresa.md`.

**Fatto (postazione):**
- **Misure:** P1 lungo 7,3–7,5 cm, acqua a 25 cm dal tavolo, circonferenze della bottiglia 28 / 25 / 28,4 cm (diametri 8,9 / 8,0 / 9,0: strozzatura a metà altezza). Corsa del marcatore 7–23 cm, lente a 15 cm (misurata circa 16).
- **Disposizione:** tavolo 60 × 60 cm, bottiglia e iPhone sulla diagonale (85 cm), distanza prevista lente–asse della bottiglia circa 50 cm; cartone marrone dietro, bottiglia piccola dietro il cartone; metro da sarta su un'asta di cartone in piedi accanto alla bottiglia, con lo 0 in alto, reso verticale con la Livella dell'iPhone.
- **Telecamera:** la sonda, lanciata con il permesso concesso, conferma che dal Mac **non si bloccano esposizione, fuoco e bilanciamento**. L'iPhone manda **60 fotogrammi veri al secondo** anche chiedendone 30 (176 in 2,98 s, nessuno ripetuto). Inquadratura di circa 33,5 cm in altezza, **0,31 mm per pixel**; immagine ruotata di 1,5° (si corregge nel programma con la calibrazione della 2.3).
- **Prova 1 (video del 22:52–22:54, P1 fermo sul fondo):** 58,6 fps, nessun buco oltre 0,5 s (intervallo massimo 97 ms); luminosità della colonna ferma a 87 per 2 minuti (deriva 0 %); marcatore trovato in tutti i 1172 campioni, **rumore del centro 0,28 px, cioè circa 0,09 mm** (la simulazione stimava 0,3 mm). Tacche dei millimetri del metro leggibili sul riferimento a piena risoluzione (verificato tra 12 e 21 cm).

**Problemi (e cosa si è capito):**
1. **ffmpeg ripeteva i fotogrammi:** circa 580 al secondo invece di 30, con una coda che cresceva e l'immagine sempre più in ritardo. Risolto chiedendo a ffmpeg di passare ogni fotogramma una volta sola (`-fps_mode passthrough`).
2. **Telefono in verticale:** la Fotocamera Continuity offre solo formati orizzontali, e in verticale il Mac ritagliava una striscia di circa 18 cm. Va tenuto in orizzontale.
3. **Il filo di rame di P1 risultava «rosso».** Misurato sull'immagine: tinta del marcatore da −4 a 6, del rame da 8 a 16 (su 180). Soglia del rosso portata da 10 a 6. Il rosso fuori dalla colonna non conta, perché P1 si cerca solo lì. Resta una zona minuscola in cima alla colonna (il filo rosso del cavo del sensore): la colonna va disegnata dal pelo dell'acqua in giù, non dal tappo.
4. **P1 più pesante di sera.** Alle 22:43, con il circuito chiuso a 36, a −0,3 kPa P1 si è staccato dal fondo solo dopo più di 10 secondi (il 23 bastava +0,4 kPa). L'aria nel tappo è scesa da 26,4 °C (24 pomeriggio) a 24 °C e poi a 23 °C. Richiuso a 66 (a 36 −0,65 kPa, a 146 +2,0 kPa) ha funzionato. Il punto di chiusura va scelto ogni sessione: è il lavoro dello stato CALIBRAZIONE.
5. **Incidente alle 23:00:40:** spostando la tavoletta, il tubo A ha rovesciato la bottiglia piccola, che con il tubo B ha inclinato la grande; l'acqua saponata ha bagnato il sensore. Alle 23:01:23 il sensore si è bloccato con la solita firma (85,51 kPa, 25,30 °C). Alimentatore e USB staccati, tappo aperto, phon tiepido; **riacceso alle 23:15:48, funziona** (101,20 kPa ± 10 Pa, 50 letture al secondo). Resta il rischio dei residui di sapone sulla schedina.
6. **Il servo si solleva spingendo.** Alle 23:32, da 56 a 146 la pressione è salita solo fino a quella della stanza (101,08 kPa invece di circa 102,3): sembrava una perdita in pressione, ma era il servo che si spostava. La colla a caldo non fa presa sulla plastica del servo, e le viti come pioli impediscono che scivoli ma non che rotoli sullo spigolo. Rimontato con il nastro isolante (asticella staccata e riattaccata, siringa mossa): si solleva ancora.
7. A bottiglia aperta P1 sul fondo è rimasto giù (sul fondo la bolla è più compressa, e a sovrapressione zero è un equilibrio stabile), poi alle 23:44 è risalito da solo: **non ha perso aria** nella caduta.

**Decisioni (e perché):**
- **Vaschetta tolta, bottiglie sul tavolo** (Gabriele): la parete di 9–10 cm avrebbe nascosto P1 sul fondo, e i lavori che potevano versare acqua sono finiti.
- **«Bloccare esposizione e messa a fuoco» diventa «scena costante e controllo F4»** (Gabriele): il blocco non è possibile dal Mac. Scena costante vuol dire luce artificiale, tende chiuse, TV spenta ed effetti video spenti.
- **Filo a piombo tolto** (Gabriele): la verticale la dà il metro, reso verticale con la Livella.
- **Metro con lo 0 in alto e cartone marrone senza foglio bianco** (Gabriele): si cambia solo se un controllo lo richiede.
- **Telecamera a 60 fps:** è quello che l'iPhone manda comunque; la misura a 60 Hz non impedisce un anello esterno a 30 Hz.
- **Regole nuove:** prima di spostare la tavoletta si sfila il tubo A; la bottiglia piccola va fissata al tavolo con il nastro.

**Foto** (cartella Download): `IMG_2006` (22:02), la postazione con il metro su un'asta.

**Stato a fine giornata:**
- 2.1: blocchi A–E fatti; del blocco F superati F1, F2 (rotazione 1,5° accettata), F3, F5 e F7, F8 fatto, F4 solo per 2 minuti; restano **F6** (P1 su tutta la colonna, il «Fatto quando»), F9 (ripetibilità) e F10.
- Servo da fissare di nuovo e taratura da ricontrollare (braccio verticale a 86, volumi a 36, 86 e 146, escursione 36 ↔ 146 di circa 2,6 kPa).
- Tappo del sensore fuori dalla bottiglia ad asciugare; bottiglia con il tappo normale; ESP32 staccato.
- `letturaPlausibile()` e `verdetto_postazione()` ancora da scrivere (Gabriele).

**Ore:** 2.1 circa 4 h 27 (di cui circa 40 min stimati); sensore bagnato circa 16 min; servo circa 13 min. **Totale circa 4 h 56.**

**Prossimo passo (domenica 25):**
1. Servo fissato con due fascette che passano sotto la tavoletta e sopra il servo, con il cartone piegato in mezzo.
2. Controlli della taratura: braccio verticale a 86, volumi della siringa, escursione 36 ↔ 146 ripetuta due volte.
3. Poi, come da piano (lunedì 26 – martedì 27): colonna ridisegnata dal pelo dell'acqua, prove F6 e F9 per chiudere la 2.1.

## 2026-10-25 · nessuna attività al banco

Preparati da Claude (circa 17:00) i passaggi per fissare il servo con le fascette, per i controlli della taratura (braccio verticale a 86, volumi a 36, 86 e 146, escursione 36 ↔ 146) e per scegliere il punto di chiusura del circuito per P1. Dashboard e registrazione erano pronte, ma l'ESP32 non è stato collegato: impegni personali di Gabriele. **Ore: 0.**

## 2026-10-26 · nessuna attività registrata

## 2026-10-27 · lavoro di Claude: dashboard, 2.2, parte della 2.3, bozza della 2.4 · 0 h di Gabriele

**Orario:** circa **18:45–19:35**, dagli orari dei file. Banco fermo (impegni personali di Gabriele): tutto il lavoro è di Claude, su richiesta di Gabriele, e non è contato nelle ore. Il servo resta da fissare: **la 2.1 non è chiusa alla sua scadenza (martedì 27)**; nessuno spostamento di calendario deciso.

| Orario | Durata | Attività |
|---|---|---|
| 18:45–19:05 | 20 min | dashboard: telecamera sempre visibile mentre si scorrono i dati |
| 19:05–19:20 | 15 min | 2.2: `pc/tracking.py` con i test, prova sui video del 24, video annotato, riconoscimento dal vivo in `pc/telecamera.py` e nella dashboard |
| 19:20–19:30 | 10 min | 2.3: `pc/calibrazione.py`, rotazione e scala dal metro del riferimento |
| 19:30–19:35 | 5 min | 2.4: bozza di `docs/protocollo.md` |

**Fatto (dashboard):** su schermo largo tre colonne (comandi, telecamera, dati): comandi e telecamera restano fermi mentre scorrono letture, grafici ed eventi; su schermo stretto, quando l'immagine esce dalla finestra, compare una miniatura dal vivo in basso a destra (un clic riporta all'immagine grande). Misure e controlli della postazione in una scheda nuova, «Postazione». Provata con dati finti a 1440, 1100 e 375 pixel di larghezza.

**Fatto (2.2, in corso):**
- `pc/tracking.py`: centro della zona rossa più grande dentro la colonna; buchi fino a 0,25 s scavalcati con l'ultima posizione, oltre P1 è «perso»; scartate le zone oltre 8000 pixel e i salti più veloci di quanto P1 possa muoversi. 18 test.
- **Video del 24:** P1 trovato nel **100 %** dei fotogrammi in 2 + 2 minuti da fermo e nei 41 s in cui sale dal fondo al pelo dell'acqua (circa 20 cm, nessun buco). Circa 1,3 ms per fotogramma, cioè fino a circa 760 fotogrammi al secondo. Video di prova: `media/2026-10-24_2.2_riconoscimento-P1-che-sale.mp4`. Righe per fotogramma in `dati/2026-10-24/telecamera/*_marcatore.csv.gz`.
- **Dal vivo:** `pc/telecamera.py` cerca P1 in ogni fotogramma (60 al secondo, provato facendogli leggere il video 05 come se fosse l'iPhone); la dashboard disegna il riquadro verde con la quota in pixel e la riga «Palombaro»; i video di prova salvano anche la posizione di P1.
- Manca il «Fatto quando» su 2 minuti di movimento nella scena attuale: si fa con il video di F6.

**Fatto (2.3, la parte possibile dalle immagini):**
- **Rotazione** della telecamera **1,45°** (bordo del metro, pendenza −0,0254): la quota si calcola lungo la verticale vera.
- **Rumore** con P1 fermo: 0,15–0,43 px, cioè circa **0,05–0,14 mm** (la simulazione stimava 0,3 mm).
- `pc/calibrazione.py` (13 test): rotazione, scala a tratti lungo il metro, modello prospettico della quota da punti noti; valori in `pc/config/calibrazione.json`.

**Fatto (2.4, bozza):** `docs/protocollo.md`: righe di testo con controllo XOR, quota a ogni fotogramma con la sua età, telemetria a 100 Hz con i termini del PID, SAFE deciso dall'ESP32; otto scelte da decidere insieme.

**Problemi e scoperte:**
1. **La pelle della mano risulta «rossa».** Nel video 03 del 24 una mano davanti alla telecamera dava una posizione falsa in cima alla bottiglia. Rimedio: area massima e salto massimo. Ora nessuna posizione falsa.
2. **Il metro accanto alla bottiglia non dà la scala di P1.** Lungo il metro la scala passa da 3,42 px/mm in alto a 3,04 in basso (−12 %): il metro non è parallelo all'immagine (iPhone inclinato o asta che pende, circa 10°). E P1 appare circa il 15 % più grande del metro (più vicino alla telecamera, dietro l'acqua che fa da lente): calibrando con il metro la quota sbaglierebbe di 1–3 cm.
3. **Il BMP280 con il sovracampionamento di oggi (×4) arriva a circa 75 letture al secondo**, non alle 100 del piano (2.5).

**Da discutere nei prossimi giorni (Gabriele):**
- Calibrazione della 2.3 **nel piano di P1**, con uno spiedino segnato ogni 2 cm nella bottiglia (proposta di Claude) al posto del metro accanto alla bottiglia.
- Le otto scelte della bozza del protocollo (sezione 9 di `docs/protocollo.md`), tra cui la velocità della seriale, SAFE con P1 a fondo invece della risalita, e la pressione a 100 Hz.

**Stato a fine giornata:** 2.1 ferma al 70 % (servo da fissare, poi F4, F6, F9); 2.2 scritta e provata sui video registrati; 2.3 per un terzo; 2.4 in bozza. Programmi di prova spenti, nessun programma in esecuzione.

**Ore di Gabriele:** 0.

**Prossimo passo:**
1. Al banco: servo con le fascette, controlli della taratura, punto di chiusura per P1 (passaggi del 25), poi F4, F6 (chiude anche la 2.2) e F9.
2. Discutere calibrazione e protocollo.

## 2026-10-28 · servo, circuito e tappo del sensore (riparato), 2.1 (F4 superata, F9 no) · circa 2 h 45

**Orario:** circa **18:45–21:30**. Divisione dal registro della seriale (`dati/2026-10-28/2026-10-28_seriale.log.gz`, 18:51–19:35), dal registro della telecamera e dagli orari delle foto; i confini sono approssimati di ±5 minuti. Il servo era già stato fissato prima (foto `IMG_2122`–`IMG_2125`, 18:42): quel tempo non è registrato. Spesa: squadretta da 35 cm, fascette da 30 e 20 cm, nastro biadesivo.

| Orario | Durata | Attività |
|---|---|---|
| 18:45–18:54 | 9 min | accensione; sensore assente dall'avvio: fili verde (SDA) e giallo (SCL) invertiti, sistemati alle 18:54 |
| 18:54–19:13 | 19 min | 1.7: controlli del servo (prima non si muoveva: alimentazione e fili), spazi, prova di spinta |
| 19:13–19:21 | 8 min | soglia di P1 con il circuito chiuso a 146: perdita forte, tappi stretti, P1 si stacca a 46 |
| 19:21–19:31 | 10 min | 1.4: bottiglia piccola tolta (decisione di Gabriele), prove di tenuta, prova delle bolle |
| 19:31–19:46 | 15 min | 1.3: tappo del sensore smontato, collare di epossidica |
| 19:46–19:53 | 7 min | 2.1: telecamera, colonna dal pelo dell'acqua |
| 19:53–20:01 | 8 min | 2.1: F4 |
| 20:01–21:21 | 80 min | 2.1: ripetibilità del telefono (squadretta, poi supporto legato alla gamba del tavolo), riferimento nuovo |
| 21:21–21:30 | 9 min | 2.1: F9, foto `IMG_2137`–`IMG_2139`, decisione sulla misura della quota |

**Fatto:**
- **Servo fissato** con due fascette che passano sotto la tavoletta, ai lati del servo, sopra una matita e un cartone piegato: non bascula, le fascette non toccano il braccio a 36 né a 146. Resta il gioco noto di circa 1 ml quando tira, e un piccolo movimento del servo in tiro, sostenibile.
- **Sensore:** non rispondeva per i fili SDA e SCL invertiti sulla breadboard; sistemato, 50 letture al secondo, ±7 Pa.
- **Soglia di P1:** con il circuito chiuso a 146 e tirando a passi di 10°, P1 si stacca dal fondo a **−1,85 kPa** (servo 46). Il 23 si staccava a +0,4 kPa: oggi va a fondo già alla pressione della stanza (è sceso aprendo il tappo di riserva). Aria nel tappo a 23 °C.
- **Bottiglia piccola tolta** (decisione di Gabriele): tubo B tagliato a filo del suo tappo e infilato direttamente sulla siringa. Meno aria nel circuito, quindi più escursione (prevista circa 2,9 kPa).
- **Perdita trovata:** prova delle bolle con l'acqua saponata a circa +2,5 kPa: l'aria esce **dove il tubo B entra nel tappo del sensore**; il tubo, tirato per arrivare alla siringa, si è staccato dalla colla. Riparato con un **collare di epossidica** sulla colla vecchia e sul tubo carteggiati; indurisce durante la notte.
- **F4 superata:** luminosità della colonna ferma tra 97 e 98 per 5 minuti e 17 secondi (deriva 1 %), dopo un solo evento alle 19:55.
- **Supporto dell'iPhone legato alla gamba del tavolo** con due fascette: telefono e bottiglia si muovono insieme, a terra non resta niente. Riferimento nuovo alle 21:21:48: pelo dell'acqua visibile in cima all'immagine, circa 40 px per cm, 60 fotogrammi al secondo.
- **Programmi (Claude):** `pc/righello.py` con 10 test: il palombaro fa da righello (zero = P1 fermo sul fondo, scala = altezza del marcatore in pixel); quota in cm dal vivo nella dashboard (provvisoria). Il riconoscimento misura anche l'altezza del marcatore con la frazione di pixel.

**Problemi (e cosa si è capito):**
1. **Fili SDA e SCL invertiti:** etichette di nastro vicino ai fori (colonna 40 verde SDA, colonna 43 giallo SCL).
2. **La perdita era nel tappo, non nella siringa:** stringendo il tubo vicino alla siringa la pressione calava lo stesso (prova di Gabriele). Costante di tempo da circa 1,5 minuti (19:21) a circa 3–6 secondi (19:26–19:28) dopo aver portato il tubo B fino alla siringa. Il giunto del tappo non deve mai portare trazione: domani fermo del tubo al cartone con un'ansa.
3. **F9 non superata:** rimettendo il telefono l'immagine si sposta di circa 45 px in verticale e 11 in orizzontale (circa 1 cm alla bottiglia), con un ingrandimento dell'1,2 %. Le cause probabili sono la pinza e l'**«Inquadratura automatica»** della Fotocamera Continuity, che ritaglia e ingrandisce da sola: da spegnere nel Centro di Controllo del Mac, in «Effetti video».
4. **Il marcatore cambia altezza lungo la bottiglia:** sul video del 24 è alto 64 px sul fondo e in cima, ma solo 53,5 px alla strozzatura (diametro 8,0 cm invece di 9): la bottiglia fa da lente anche in verticale. La quota «semplice» di stasera ne risente; la versione che segue la deformazione si scrive dopo la prova con lo spiedino.
5. **Il salotto è abitato:** niente segni né nastro sul pavimento; segni sul tavolo del banco sì.

**Decisioni (Gabriele):**
- **Bottiglia piccola tolta.**
- **Niente inquadratura fissa:** il programma si ricalibra a ogni sessione usando P1 («il palombaro fa da righello»); lo spiedino segnato ogni 2 cm serve una volta sola, per l'altezza vera del marcatore e per le 5 quote note del «Fatto quando» della 2.3. Gabriele compra uno spiedino lungo.
- **Squadretta** per ora non usata; supporto legato al tavolo.

**Stato a fine giornata:** tappo del sensore fuori dalla bottiglia, con l'epossidica che indurisce; bottiglia con il tappo normale, P1 sul fondo; ESP32 staccato, registrazione ferma alle 19:35.

**Ore:** 1.3 circa 24 min; 1.4 circa 18 min; 1.7 circa 19 min; 2.1 circa 1 h 44. **Totale circa 2 h 45.**

**Prossimo passo:**
1. «Inquadratura automatica» spenta; tappo rimontato con il fermo del tubo; prova di tenuta e nuova escursione; punto di chiusura per P1.
2. Spiedino nella bottiglia (10 minuti, tappo aperto): altezza vera del marcatore e 5 quote note.
3. F6 con «Registra 2 min»: chiude 2.1 e 2.2.
4. Da discutere: le otto scelte del protocollo (2.4).

## 2026-10-29 → 2026-10-31 · nessuna attività

## 2026-11-01 · P1 riequilibrato, spiedino, F6, firmware 0.1, ponte: chiuse 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 · circa 3 h 15 registrate

**Orario:** dalle **11:13** (inizio della sessione) a oltre le 18:15. Divisione dal registro della seriale (`dati/2026-11-01/2026-11-01_seriale.log.gz`), dal registro della telecamera e dagli orari dei video. **Tra le 11:47 e le 16:57 l'USB era staccato:** riequilibrio di P1 con diverse pause, orari non registrati (scelta di Gabriele).

| Orario | Durata | Attività |
|---|---|---|
| 11:13–11:30 | 17 min | ripresa; fili del tappo e del servo ricollegati, multimetro; prova in aria (sensore 50 letture/s, ±2,5 Pa; 52 comandi al servo senza riavvii) |
| 11:30–11:47 | 17 min | tappo montato, circuito chiuso a 146, tirata a passi fino a 36 (−2,2 kPa): P1 resta sul fondo; circuito riaperto |
| 11:47–16:57 | non registrata | P1 ritarato togliendo e rimettendo acqua dentro (rame invariato), con diverse pause |
| 16:57–17:05 | 8 min | tappo e circuito richiusi; prova manuale: P1 tenuto a mano a metà bottiglia |
| 17:05–17:16 | 11 min | telecamera, «Inquadratura automatica» spenta; sensore bloccato alle 17:13, ESP32 riavviato alle 17:16 |
| 17:16–17:43 | 27 min | P1 sul fondo, spiedino segnato, circuito aperto e bottiglia svitata, zoom sulla bottiglia, colonna ridisegnata |
| 17:43–17:55 | 12 min | spiedino nella bottiglia, due video (01 e 02, con due zoom) |
| 17:55–18:03 | 8 min | bottiglia richiusa, fermo del tubo, circuito chiuso a 36, 146 per mandare giù P1 |
| 18:03–18:13 | 10 min | F6: video 05 (77 s) e 06 (120 s) |
| 18:25–19:26 | — | Gabriele fuori; Claude: righello con la tabella, firmware, documenti |
| 19:26–20:05 | 39 min | firmware caricato; sensore che si scalda e sparisce: spegnimento, multimetro, diagnosi I²C (indirizzo 0x77), SDO misurato a metà tensione |
| 20:05–20:08 | 3 min | circuito richiuso a 36, a 146 +3,66 kPa |
| 20:08–20:13 | 5 min | 2.3: ritardo della telecamera (video 07, telefono davanti allo schermo del Mac) |
| 20:13–20:20 | 7 min | chiusura anticipata e ripresa; 2.4: revisione delle undici scelte, tutte approvate |
| 20:20–20:29 | — | Claude: firmware 0.1 (2.5) e programmi sul Mac |
| 20:29–20:34 | 5 min | 2.5 al banco: primo comando, movimenti, emergenza, rifiuto in SAFE, ritorno in MANUALE |
| 20:34–21:00 | — | 2.5: prova di 30 minuti senza toccare il banco; Claude: `letturaPlausibile()` |
| 21:00–21:50 | — | Claude: ponte (2.6); Gabriele: iPhone staccato e poi rimesso |
| 21:50–21:59 | 9 min | 2.6 al banco: telecamera riavviata, primo comando 146, esperimento di 6,7 minuti |
| 21:59–22:47 | — | Claude: documenti, preparazione della 2.7; fine giornata |

**Fatto:**
- **Prova in aria (11:30):** il sensore risponde subito dopo il ricollegamento, 50 letture al secondo, rumore 2,5 Pa; stanza a 100,68 kPa, 23,2 °C.
- **P1 troppo pesante:** chiuso a 146 e tirato fino a 36 (−2,19 kPa), non si stacca. Il 28 si staccava a −1,85 kPa con la stanza a 101,2 kPa: in 4 giorni, a temperatura uguale, è diventato più pesante di almeno 0,85 kPa (aria della bolla sciolta). In depressione la corsa 146 → 36 dà solo 2,2 kPa: le pareti si incurvano verso l'interno, e i primi 10° dopo l'inversione non fanno niente (zona morta).
- **P1 riequilibrato** da Gabriele togliendo e rimettendo acqua dentro P1 (rame invariato): ora si stacca dal fondo a circa **+1,09 kPa** (101,79 kPa assoluti, comando 84) e in 7 s arriva in cima.
- **Corsa in pressione senza bottiglia piccola:** chiuso a 36, a 146 si arriva a circa **+4 kPa** (+3,6 kPa subito dopo l'ultima chiusura, poi cede di qualche centinaio di Pa nel primo mezzo minuto e circa 40 Pa al minuto dopo).
- **Prova manuale:** P1 tenuto a metà bottiglia comandando il servo dalla dashboard (234 comandi in 5 minuti).
- **Telecamera:** «Inquadratura automatica» spenta (l'immagine intera è circa il 25 % più larga di quella del 28); zoom poi regolato a mano da Gabriele sulla bottiglia. 59 fps, nessuna interruzione.
- **Spiedino (2.3):** 13 segni da 0 a 24 cm letti sui video 01 e 02 (`pc/config/spiedino.json`). La bottiglia deforma l'immagine a tratti: 2 cm valgono da 46 px (strozzatura) a 106 px (subito sopra); una scala unica sbaglia fino a 5 mm. Rileggendo il video 02 con la tabella del 01, con solo zero e scala: **errore massimo 1,3 mm su 12 quote note**. Altezza vera del marcatore circa **18,5 mm**.
- **F6 (2.1) e 2.2 chiuse:** video 05 (77 s) e 06 (120 s): P1 dal fondo a circa 2 cm sotto il pelo dell'acqua, **trovato nel 99,9 % dei fotogrammi a 59 fps, nessuna perdita**; nel video 06, 42 s lontano dal fondo e 10 passaggi a metà colonna. **Rumore** con P1 fermo sul fondo: **0,32 mm**. Video: `media/2026-11-01_F6_2.2_P1-comandato-a-mano-2-minuti.mp4`, `media/2026-11-01_2.3_spiedino-ogni-2-cm.mp4`.
- **Ritardo della telecamera (2.3):** mediana **156 ms** (da 138 a 266 ms, deviazione 14 ms, 239 cambi; 148 ms da nero a bianco, 163 da bianco a nero), dallo schermo del Mac all'arrivo del fotogramma nel programma, compreso il ritardo dello schermo (circa 10–17 ms). La simulazione stimava 66 ms; il registro dei rischi fa scattare R5 sopra i 150 ms.
- **Programmi (Claude):** righello con la tabella dello spiedino (zero e scala da P1 fermo sul fondo, quota non più «provvisoria»); limite di area del marcatore da 8000 a 16000 px; pagina lampeggiante e analisi per la latenza (`pc/latenza.html`, `pc/latenza.py`); firmware del banco che riconosce il sensore riavviato e lo riconfigura (compilato, non ancora caricato). **75 test.**

**Problemi (e cosa si è capito):**
1. **Il sensore si è riavviato da solo alle 17:13:01** ed è rimasto a riposo: 85,509 kPa e 25,30 °C fissi per 3 minuti, la stessa firma del 24 sera. Sono i valori di fabbrica dei registri (0x80000) dopo un riavvio del chip; il chip risponde all'identità, quindi il firmware non lo vedeva. Tra le 17:15 e le 17:16 i comandi al servo sono stati dati senza una pressione vera. Riavviando l'ESP32 è tornato a posto. Causa: un calo dell'alimentazione del sensore (contatto o umidità), da capire.
2. **P1 «perso» sul fondo:** contro la parete la bottiglia allarga il marcatore fino a 9200 px rossi, oltre il limite contro la mano (8000). Limite portato a 16000; sul video della mano del 24 nessuna posizione falsa.
3. **Bordi delle costole:** il centro del marcatore salta di 35–47 px in un fotogramma quando un pezzo è nascosto dalla rifrazione. Non è una perdita, ma è rumore sulla quota: da filtrare nel controllo (5.3).
4. **P1 ha toccato la superficie per mezzo secondo** in F6: riportato giù subito, senza effetto del menisco.
6. **Il sensore si scalda da solo e cambia indirizzo (19:12–19:58).** Dalle 19:12, con il servo fermo a 146, la temperatura del sensore è salita da 23 a 39 °C mentre la pressione restava ferma a 103,7 kPa (l'aria non si scaldava: si scaldava il chip). Dopo il caricamento del firmware nuovo (19:26) il sensore è sparito e ricomparso 6 volte in 4 minuti, poi più niente, neanche togliendo l'alimentazione. Il programma di diagnosi (19:58): SDA e SCL a posto, il chip risponde con l'identità giusta ma all'indirizzo **0x77** invece di 0x76. Sulla scheda del tappo il piedino **SDO** (che sceglie l'indirizzo) non è collegato (15 ottobre), e il datasheet dice che non va lasciato libero. **Misurato con il multimetro: SDO tra 0,3 e 3 V, cioè a metà, libero.** Spiega i salti d'indirizzo, il calore (un ingresso a metà tensione fa passare corrente) e probabilmente il riavvio delle 17:13. Rimedio nel firmware del banco: il sensore si cerca a 0x76 e a 0x77 (dalle 19:59 a 0x77, 50 letture al secondo, 23,4 °C).
5. **Chiusura poco sotto la pressione della stanza** (−0,2 kPa) alle 18:01: probabilmente la bottiglia stretta mentre si infilava il tubo. Nessun effetto.

**Decisioni (Gabriele):**
- **Prova manuale prima dello spiedino** (quindi il tappo si è svitato una volta in più).
- **P1 riequilibrato** togliendo e rimettendo acqua dentro (il rame non si tocca).
- **Extra E4:** trovare un modo per non dover più riequilibrare il palombaro, quando il progetto sarà a buon punto.
- **Zoom regolato a mano** sulla bottiglia (si cambia solo a mano).
- **SDO del sensore: per ora solo il rimedio nel programma**, niente ponticello SDO → GND. Ci si ripensa se diventa un problema nel controllo automatico (fase 4); Claude segnala a ogni sessione se nel registro ricompaiono «perso/ritrovato» o una temperatura del sensore più di 3 °C sopra la stanza con la pressione ferma.

**Stato alle 20:15 (prima della sera):** circuito chiuso a 36, servo a 146 (+3,66 kPa); sensore a 0x77. **2.1, 2.2 e 2.3 chiuse** (la 2.3 nel giorno della scadenza). Il ritardo della telecamera (156 ms) supera la soglia di 150 ms del rischio R5: **decisione di Gabriele** sul piano B (webcam USB).

**Ore:** al banco circa **3 h 15** registrate (11:13–11:47, 16:57–18:15, 19:26–20:34 e 21:50–21:59); il riequilibrio di P1 non è contato (orari non registrati), né le attese della prova di 30 minuti. Per sottofase, circa: 2.1 0 h 20, 2.2 0 h 10, 2.3 0 h 45, 2.4 0 h 07, 2.5 0 h 05, 2.6 0 h 09, manutenzione del banco (1.2, 1.4, sensore) 1 h 24, fermata e ripresa 0 h 15.

**Sera (dalle 20:15): 2.4 chiusa, 2.5 avviata.**
- **2.4 (20:15–20:20):** rivista con Gabriele, approvate tutte le proposte della sezione 9 più tre nuove (soglia di SAFE a +5 kPa, SAFE se il sensore si ferma, servo fermo all'accensione).
- **2.5, firmware 0.1 (Claude, 20:20–20:29):** quattro moduli in `firmware/src/palombaro/`, test del protocollo sul Mac, registratore a 460 800 baud e dashboard aggiornati, `pc/verifica_firmware.py`. Riaprendo la porta a 115 200 baud (20:16) l'ESP32 si era riavviato e il servo era saltato a 86: è il motivo della decisione 11.
- **Al banco (20:29–20:34):** 100 righe al secondo, nessuna persa, scarto del periodo 0 µs; 16 comandi su 16 accettati; emergenza → SAFE e servo da 116 a 146 con la rampa in mezzo secondo; in SAFE il comando della dashboard è rifiutato (`NO,S,SAFE`); ritorno in MANUALE con `M`. Un primo invio dell'emergenza non è partito: file dei comandi scritto in modo non atomico e letto vuoto dal registratore (il ponte della 2.6 non userà più il file).
- **«Fatto quando» della 2.5 superato:** dalle 20:29:01 alle 20:59:35: **183 072 righe T in 30,5 minuti (100,0 al secondo), nessuna persa, scarto massimo del periodo 0 µs** (il limite è 1000), nessun ciclo in ritardo, nessun riavvio, nessun errore di controllo o di formato; le letture del sensore sempre 100 al secondo (`pc/verifica_firmware.py`, registro `dati/2026-11-01/2026-11-01_firmware01_30min.log.gz`). Lo scarto è nullo perché il ciclo si risveglia sul battito di FreeRTOS (1 ms, dal quarzo): misura la regolarità dei risvegli, non quanto dura ogni ciclo. **2.5 chiusa.**
- **2.6, ponte (Claude, 21:01–21:04):** `pc/bridge.py` al posto del registratore (unico padrone della porta; quota dalla telecamera via UDP e inoltro come `$Z`; battito `$B` ogni 200 ms; CSV per esperimento con i metadati), invio della quota da `telecamera.py`; 100 test.
- **2.6 al banco (21:50–21:59):** iPhone rimesso, telecamera riavviata, primo comando 146. esperimento `dati/2026-11-01/2026-11-01_manuale_01.csv.gz` (21:51:57–21:58:39, P1 comandato a mano dalla dashboard): **6,7 minuti, 40 212 righe (100 al secondo), nessuna riga della scheda persa** (intervallo massimo 12 ms sull'orologio della scheda); P1 mai perso, dal fondo a 18,7 cm; età della quota 11 ms tipica, 28 ms al 99 %. **5 pause della quota oltre 50 ms** (100, 90, 57, 11 e 198 ms; età massima 256 ms; 60 righe su 40 212): coincidono con pause dei fotogrammi in arrivo dall'iPhone (153 ms all'avvio di una registrazione video, 252 ms alle 21:54:00 insieme a una pausa di 63 ms di tutto il Mac). Il criterio stretto («senza buchi» a 20 Hz) non passa per la telecamera; **decisione di Gabriele: 2.6 superata**, pause annotate sotto R5. **2.6 chiusa.**
- **`letturaPlausibile()`** scritta da Claude su richiesta di Gabriele (che non scrive codice): pressione tra 90 e 110 kPa, temperatura tra 0 e 50 °C (i 39 °C del chip scaldato da SDO si accettano: la pressione era giusta). Caricata alle 21:00, sensore regolare.

**Stato a fine giornata (22:47):** ponte, dashboard e registrazione fermati; scheda con il firmware 0.1 (sensore a 0x77), servo fermo a 146 (nessun impulso dall'ultimo riavvio delle 22:20), circuito chiuso, P1 sul fondo. **Chiuse 2.1, 2.2, 2.3, 2.4, 2.5 e 2.6.** Pronto per la 2.7, ma non provato al banco: «Registra 2 min» nella dashboard avvia anche il file dell'esperimento del ponte (`esperimento.txt`, `durata=`), con un test.

**Prossimo passo (2.7, scadenza domenica 8):** tre prove registrate in modalità manuale (salita e tenuta, su e giù, più in alto) con «Registra 2 min»; video di M2 con quota e pressione sovrapposte (Claude); bozza del capitolo «Architettura, sensori e comunicazione» (Claude). Da decidere (Gabriele): piano B della telecamera (R5, webcam USB).

### Revisione settimanale (T5), 26 ottobre – 1 novembre
- **Milestone:** nessuna in scadenza; M2 è per domenica 8 novembre.
- **Sottofasi:** 2.1 chiusa il 1 novembre (scadenza 27 ottobre, +5 giorni); 2.2 chiusa il 1 novembre (scadenza 30 ottobre, +2 giorni); 2.3 chiusa il 1 novembre, il giorno della scadenza (errore 1,3 mm, rumore 0,32 mm, ritardo 156 ms); **in anticipo:** 2.4 (scadenza 2 novembre), 2.5 (scadenza 5 novembre: 30 minuti a 100 Hz, scarto del periodo 0 µs) e 2.6 (scadenza 7 novembre: 6,7 minuti registrati; 5 pause della quota fino a 0,26 s dovute alla telecamera, considerata superata da Gabriele) chiuse il 1 novembre.
- **Ore della settimana (Gabriele):** 26: 0 · 27: 0 · 28: 2 h 45 · 29–31: 0 · 1: circa 3 h 15 registrate (il riequilibrio di P1 non è contato). **Totale circa 6 h.** Il 27 ha lavorato solo Claude (dashboard, 2.2, parte della 2.3, bozza della 2.4).
- **Rischi:** R2 (tenuta) a posto dopo il collare; R4 (riconoscimento) nessuna perdita, salti ai bordi delle costole da filtrare; R5 (telecamera) 59 fps senza interruzioni, ma **ritardo 156 ms, oltre la soglia di 150 ms** (decisione di Gabriele sul piano B, webcam USB); R6 (palombaro) attivo: deriva di circa 0,2 kPa al giorno, riequilibrato il 1 novembre, Extra E4; R8 (elettronica) il sensore si è riavviato da solo, firmware aggiornato e da caricare. R9 (ritardo generale) scatta quando «una fase slitta di più di 3 giorni»: la 2.1 è finita 5 giorni dopo la sua scadenza, la fase F2 scade l'8 novembre. **Decisione di Gabriele.**
- **Settimana prossima (dal piano):** 2.4, 2.5 e 2.6 già chiuse; resta la 2.7, prova completa e **M2** (dom 8). Poi F3 (dal 9 novembre): 3.1 modello fisico, 3.2 parametri statici. Le decisioni sul calendario sono di Gabriele.

## 2026-11-02 → 2026-11-04 · nessuna attività

## 2026-11-05 · P1 affondato e ritarato, 2.7 (prove e video, M2 raggiunta), 3.2 e 3.3 anticipate · circa 2 h 50

**Orario:** dalle **15:21** (inizio della sessione) alle **18:10**. Divisione dal registro del ponte (`dati/2026-11-05/2026-11-05_bridge.log.gz`), dal registro della telecamera e dagli orari dei file.

| Orario | Durata | Attività |
|---|---|---|
| 15:21–15:39 | 18 min | ripresa; ponte e dashboard avviati (Claude); P1 trovato sul fondo con la bottiglia aperta |
| 15:39–15:44 | 5 min | USB collegato, sensore nell'aria della stanza: 101,61 kPa, 22,3 °C |
| 15:44–15:51 | 7 min | gocce di soluzione, tappo, circuito chiuso a 146, tirata a passi fino a 36 (−2,8 kPa): P1 resta sul fondo |
| 15:51–16:08 | 17 min | P1 estratto con la siringa da 10 ml usata come ventosa (tubo A sullo spiedino), ritarato togliendo 2 gocce d'acqua dall'interno, reinserito |
| 16:08–16:15 | 7 min | circuito chiuso a 36; P1 va a fondo a 126 (+2,3 kPa), si stacca a 56 (+0,15 kPa) |
| 16:15–16:32 | 17 min | telecamera; prove 1 e 2 della 2.7 (a mano, linguetta della dashboard); linguetta allungata (Claude) |
| 16:32–16:55 | 23 min | prova 3; 30 fps: diagnosi con `pc/misura_fps.py`, iPhone ricollegato, di nuovo 59 fps; prova 4 (M2) |
| 16:55–17:05 | 10 min | Claude: video di M2 (`pc/video_esperimento.py`) |
| 17:05–17:16 | 11 min | 3.2: soglia dal fondo (58°, +0,19 kPa), 5 minuti di tenute a mano |
| 17:16–17:38 | 22 min | Claude: analisi della 3.2 (`pc/equilibrio.py`), programma della 3.3, correzione del righello; Gabriele: telecamera riavviata |
| 17:38–18:07 | 29 min | 3.3: prove automatiche (fermata e richiusura a 56, prima serie di 7 prove, richiusura a 66, seconda serie di 6) |
| 18:07–18:10 | 3 min | chiusura |

**Fatto:**
- **P1 affondato (R6).** Dopo 4 giorni a galla con la bottiglia aperta P1 era sul fondo. Con il sensore nell'aria: stanza a **101,61 kPa** (100,70 il 1 novembre) e **22,3 °C** (23,2). Meteo e freddo spostano la soglia da +1,09 a circa −0,13 kPa: bastano a tenerlo sul fondo, non a farlo affondare dalla superficie. Con il circuito chiuso a 146 e tirato fino a 36 (**98,78 kPa, −2,8 kPa**) non si stacca: **ha perso almeno il 2,7 % dell'aria** (circa 0,05 ml), più di tre volte la deriva solita. Ipotesi: bollicine attaccate fuori dopo la ritaratura del 1 novembre (come dopo quella del 23 ottobre), un forellino in alto, aria uscita dall'ugello per una botta. La colla a caldo dell'ugello è in basso, dove dentro c'è acqua: non c'entra.
- **Estrazione di P1 senza inclinarlo:** siringa da 10 ml con il tubo A legato allo spiedino, appoggiato sulla cima della tettarella e aspirato di 2–3 ml («ventosa»). **Ritaratura:** due gocce d'acqua tolte stringendo la tettarella fuori dall'acqua. Esito: va a fondo a 126 (+2,3 kPa) e si stacca dal fondo a 56 (+0,15 kPa, 101,79 kPa assoluti).
- **2.7, quattro prove** (`2026-11-05_prova_01…04.csv.gz`, «Registra 2 min»): 100 righe al secondo, nessuna persa, P1 tra il fondo e 18,5 cm. Prove 1–3 a **30 fps**: pause dei fotogrammi di 51–63 ms. Nella 2 P1 «perso» per 7,8 s sul fondo, appoggiato alla parete con il marcatore quasi di taglio. **Prova 4 a 58,7 fps:** età della quota 10 ms mediana, 26 ms al 99 %; oltre 50 ms solo nei primi 0,65 s (avvio della scrittura del video). **M2 raggiunta** (decisione di Gabriele). Video: `media/2026-11-05_M2_quota-e-pressione-prova-04.mp4`.
- **30 fps:** l'iPhone dichiara 1920 × 1080 a 60 fps e il programma li chiede; carica, risparmio energetico, effetti video e luce non cambiavano niente a telecamera aperta. `pc/misura_fps.py` (ffmpeg da solo) ha misurato **59,0 fps** dopo che l'iPhone si era ricollegato (indici delle telecamere cambiati). Regola: iPhone in carica e senza risparmio energetico prima di aprire la telecamera, e fps sopra 55 prima di registrare.
- **Linguetta della dashboard:** da 139 px a 458, poi 304, poi **224 px** (richiesta di Gabriele: si comanda trascinando sul trackpad).
- **3.2 anticipata (decisione di Gabriele):** pressione di equilibrio a 7 quote (soglia dal fondo e medie tra due passaggi verso l'alto alla stessa quota, nelle prove 1, 3, 4 e nelle tenute): **pendenza 0,098 ± 0,010 kPa/cm, teoria ρg 0,0978**. Le medie su finestre fisse di 4 s davano 0,129, falsate dall'oscillazione. `analisi/parametri.md`. Mancano masse e volumi.
- **3.3 anticipata e chiusa (decisione di Gabriele: partenze automatiche dal fondo e dalla superficie, invece che a mano da quote diverse):** `pc/anello_aperto.py` regola la pressione dal Mac (circa 28° per kPa, 4 correzioni al secondo), trova la soglia (**101,64 kPa**), fa gradini sotto la soglia (P1 scappa in su) e sopra l'equilibrio in superficie (scappa in giù), un CSV per prova. **12 prove valide su 13** in `dati/anello-aperto/`: 8 in su (−0,12 e −0,26 kPa: P1 parte dopo 4,4–5,7 s e arriva in cima in 5–6 s), 4 in giù (in 3,5–5,2 s). La 7 non vale: la pressione non scendeva sotto la soglia. P1 mai perso.
- **Righello corretto:** con P1 a galla per molti minuti i campioni sul fondo uscivano dalla memoria e la quota in superficie risultava 12,7 cm invece di circa 19. Ora i campioni sul fondo si tengono a parte (test nuovo, prima rosso). Le prove della 2.7 non ne sono toccate (P1 tornava spesso sul fondo).
- **Programmi nuovi (Claude):** `pc/video_esperimento.py`, `pc/equilibrio.py`, `pc/anello_aperto.py`, `pc/misura_fps.py`. **123 test** passano.

**Problemi (e cosa si è capito):**
1. **Primo comando 86** due volte: il cursore della dashboard parte da 86 e il pulsante «Centro» manda 86. Nessun danno (tubo sfilato), ma il servo salta.
2. **Passi della soglia troppo veloci** (2–10 s invece di 15): vicino alla soglia P1 «esita» anche 20 s prima di staccarsi. Le soglie misurate a mano sono un po' basse.
3. **In depressione le pareti della bottiglia rientrano piano** e la pressione risale (da 101,54 a 101,68 kPa in 3 minuti a 36°): con la soglia vicina alla pressione della stanza la depressione disponibile si esaurisce. Rimedio: chiudere il circuito più in alto (56, poi 66).
4. **P1 si appesantisce sul fondo in pressione:** soglia da 101,83 (17:08) a circa 101,64 kPa (17:52) dopo una decina di minuti a +3 kPa.
5. **Il circuito a 36 era a −0,28 kPa** dopo un'ora: piccola perdita nei tratti in pressione (R2).
6. Temperatura del sensore nella bottiglia 22,7–23,6 °C con la stanza a 22,3–22,6: sotto i 3 °C di allarme. Nessun «perso» o «ritrovato» per tutta la sessione.

**Decisioni (Gabriele):**
- P1 ritarato (2 gocce) invece di lavorare in depressione.
- **M2 raggiunta** con la prova 4.
- **3.2 e 3.3 anticipate** al 5 novembre; **3.3 con partenze automatiche** dal fondo e dalla superficie.
- **Conservazione di P1 tra le sessioni: piano C** (fuori dall'acqua, dritto, in un vasetto chiuso con carta umida), da verificare alla prossima sessione con la soglia.
- Linguetta della dashboard a 224 px.
- Claude non chiede più se chiudere la giornata: lo dice Gabriele.

**Stato a fine giornata (18:10):** ponte e dashboard fermati; telecamera da chiudere (Gabriele); circuito chiuso a 66, servo a 36; P1 da mettere nel vasetto. Ultima soglia di riferimento per il piano C: **101,64 kPa a 17:52, sensore a 23,2 °C**, stanza circa 101,66 kPa.

**Ore:** circa **2 h 50** al banco (15:21–18:10), comprese le attese durante il lavoro di Claude. Per sottofase, circa: manutenzione di P1 (1.2) 0 h 45, 2.7 0 h 50, 3.2 0 h 25, 3.3 0 h 40, ripresa e chiusura 0 h 10.

**Prossimo passo:** bozza del capitolo «Architettura, sensori e comunicazione» (Claude) e revisione settimanale (domenica 8). Prossima sessione al banco probabilmente lunedì 9: soglia di P1 dal vasetto (verifica del piano C). Poi 3.1 e 3.4 (identificazione dalle fughe registrate).

**Sera (circa 19:30–20:55): lavoro di Claude al computer, banco smontato; Gabriele decide.** Orari dai file.

| Orario | Durata | Attività |
|---|---|---|
| 19:30–19:58 | 28 min | 3.1: equazioni, linearizzazione, Routh; `analisi/modello.m` provato in MATLAB |
| 19:58–20:05 | 7 min | 2.7: bozza del capitolo 3 (architettura, sensori, comunicazione) |
| 20:05–20:20 | 15 min | 3.4: identificazione (tre metodi, l'ultimo buono); 3.2 seconda parte |
| 20:20–20:30 | 10 min | 3.5: gemello in Simulink e verifica; capitolo 4 (modello) |
| 20:30–20:53 | 23 min | 4.1 in simulazione; firmware 0.2 con i test; `pc/comanda.py`; protocollo; capitolo 5 (controllo) |

**Fatto (sera):**
- **3.1:** G(s) = −b_p/(m_eff s² + c s − k), con k/b_p = ρg; polo instabile **0,346 rad/s** con i parametri stimati; Routh: **K_p > ρg = 98 Pa/cm**, e con il ritardo della telecamera K_d < 3201 Pa·s/cm e (senza derivativo) K_p < 1332 Pa/cm.
- **3.4:** dalle 12 fughe **λ = 0,326 rad/s** (0,29–0,36), **R² 0,981–0,999**. Il primo metodo (simulare il sistema instabile) divergeva; il secondo dava un attrito negativo; il terzo fissa il punto d'arrivo di ogni fuga con la fisica, (p − p0)/ρg, e funziona.
- **3.2 (seconda parte):** siringa 0,16 ml/°; il circuito si comporta come circa 640 ml d'aria, di cui circa 200 veri: il resto lo fanno le pareti.
- **3.5:** gemello `analisi/palombaro.slx`; ripete le fughe (10 su 12 con R² ≥ 0,83) e la pressione della prova 4 (R² 0,89).
- **4.1 in simulazione:** cascata PI sulla pressione + equilibrio stimato + PID sulla quota (475 Pa/cm, 11,9 Pa/(cm·s), 400 Pa·s/cm). Nel gemello il PD tiene P1 entro 0,1 mm e cambia quota di 5 cm in 3,1 s; il PID resiste a un p0 sbagliato di 150 Pa (1,1 mm); la stretta di 2 ml la assorbe l'anello interno; il solo P oscilla (51 %); l'On-Off fa un ciclo limite di ±2 cm.
- **4.2 (codice):** firmware 0.2 compilato, non caricato: CALIBRAZIONE (trova p0 da solo), HOLD, regole di SAFE; 30 test sul Mac. Un test ha trovato un errore numerico vero (la rampa in float a 32 bit perdeva 3 Pa ogni 1000 cicli).
- **Capitoli:** bozze 03 (architettura), 04 (modello e identificazione) e 05 (controllo, parte senza banco).
- **Test:** 119 in Python, 30 nel firmware.

**Correzioni di Claude durante la sera:** la data scritta per errore «6 novembre» nei file nuovi, corretta in 5; il modello Simulink che all'apertura rimetteva i parametri predefiniti sopra quelli delle prove; la scelta del PD (prima «margine massimo», lento; poi «più veloce con almeno 45°»).

**Decisioni (Gabriele):** **F3 chiusa e M3 raggiunta** (10 giorni prima); **fase 4 avviata per la parte senza banco**; aggiornare piano e bollettino e fare il commit solo alla chiusura. Da decidere: errore troppo grande → SAFE (proposta 6 cm per 5 s); telecamera muta dopo 200 o 300 ms; PID come controllore predefinito al banco (proposta di Claude).

**Ore:** Gabriele circa 2 h 50 al banco (sopra); la sera è lavoro di Claude, non contato.

**Prossimo passo:** domenica 8 revisione settimanale (fasi 2 e 3). Al banco (probabilmente lunedì 9): soglia di P1 dal vasetto (verifica del piano C), poi firmware 0.2: calibrazione, transizioni di sicurezza (4.2), gradini di pressione (4.4), On-Off (4.3), P e PID (4.5) verso **M4**.

## 2026-11-06 → 2026-11-08 · nessuna attività

### Revisione settimanale (T5), 2–8 novembre (scritta lunedì 9 novembre)
- **Milestone:** **M2 raggiunta il 5 novembre** (scadenza domenica 8, tre giorni prima): quota e pressione registrate a 100 righe al secondo, nessuna persa, età della quota 10 ms mediana a 58,7 fps. **M3 raggiunta lo stesso giorno** (scadenza domenica 15, dieci giorni prima), decisione di Gabriele.
- **Sottofasi:** 2.7 chiusa il 5 novembre (scadenza 8). Tutta F3 (dal piano: 9–15 novembre) chiusa il 5 novembre: 3.2 e 3.3 al banco, 3.1, 3.4 e 3.5 la sera al computer. In anticipo dalla F4 (dal piano: 16–22 novembre): **4.1 fatta in simulazione** (scadenza 17); **4.2 in corso**, firmware 0.2 compilato e provato sul Mac, manca la prova delle transizioni al banco.
- **Ore della settimana (Gabriele):** 2–4: 0 · 5: circa 2 h 50 · 6–8: 0. **Totale circa 2 h 50**, contro le circa 14 h della stima (2 h al giorno). Il lavoro al computer della sera del 5 è di Claude e non è contato. Le ore sono poche ma il calendario è avanti: una sessione al banco ben preparata ha chiuso una milestone e mezza fase.
- **Rischi:** R2 (tenuta) piccola perdita nei tratti in pressione (−0,28 kPa in un'ora a 36); in depressione le pareti rientrano e la pressione risale: si chiude il circuito più in alto. R4 (riconoscimento) un «perso» di 7,8 s con P1 fermo contro la parete, mai in movimento; righello della superficie corretto. R5 (telecamera) i 30 fps sono stati risolti con la regola «iPhone in carica, niente risparmio energetico, oltre 55 fps prima di registrare»; il **ritardo di 156 ms resta oltre la soglia di 150 ms** e il piano B (webcam USB) resta da decidere (Gabriele); nel progetto dei controllori il ritardo è già dentro (margine di ritardo 0,50 s). R6 (palombaro) **attivo**: P1 affondato dopo 4 giorni a galla (almeno il 2,7 % dell'aria persa), ritarato; tra le sessioni piano C (vasetto), da verificare il 10 novembre. R8 (elettronica) nessun «perso» o «ritrovato» del sensore, temperatura sotto i 3 °C di allarme. **R9 non scatta:** nessuna fase in ritardo, F2 finita in tempo e F3 in anticipo.
- **Settimana prossima:** dal piano, 9–15 novembre sarebbe F3, già chiusa. Sessione al banco martedì 10 con la scaletta `docs/scaletta-10-novembre.md`: soglia di P1 (piano C), firmware 0.2 e transizioni di sicurezza (4.2), gradini di pressione (4.4), On-Off (4.3), solo P, PD e PID (4.5) fino al primo tentativo di **M4** (dal piano: domenica 22). Anticipare la F4 è una decisione di Gabriele presa il 5 novembre («fase 4 avviata per la parte senza banco»); le date della parte al banco le decide Gabriele.
- **T6:** il messaggio al professore con il video di M2 (previsto intorno all'8 novembre) non è ancora partito: bozza preparata il 9 novembre (`docs/messaggio-M2.md`), lo manda Gabriele.

## 2026-11-09 · lavoro di Claude: decisioni della 4.2, analisi della fase 4, scaletta del 10 · 0 h di Gabriele al banco

**Orario:** circa **19:35–20:40**, dagli orari dei file. Banco rimandato a martedì 10 (Gabriele non poteva andarci): tutto il lavoro al computer è di Claude, su richiesta di Gabriele, che ha preso le decisioni a parole. Non è contato nelle ore.

| Orario | Durata | Attività |
|---|---|---|
| 19:35–19:45 | 10 min | ripresa: stato dal diario e dal piano; le tre decisioni della 4.2 |
| 19:45–19:50 | 5 min | 4.2: telecamera muta a 300 ms nel firmware (test prima rosso), protocollo; ponte con i riferimenti nel CSV |
| 19:50–20:06 | 16 min | `pc/analisi_f4.py` con i test; prove della fase 4 nel gemello (`analisi/esporta_gemello_f4.m`) e correzioni trovate con quelle |
| 20:06–20:12 | 6 min | scaletta del 10 novembre, revisione settimanale, bozza del messaggio di M2 |
| 20:12–20:30 | 18 min | spiegazioni a Gabriele (controllo della calibrazione, video di M2) |
| 20:30–20:40 | 10 min | 4.2: controllo della partenza della CALIBRAZIONE (test prima rossi), protocollo, scaletta, capitolo 5 |

**Fatto:**
- **Decisioni della 4.2 nel firmware:** SAFE per errore di quota oltre **6 cm per più di 5 s**; **PID** come regolatore predefinito in HOLD (già così); **telecamera muta dopo 300 ms** invece di 200. Correzione di Claude prima della scelta: aveva scritto che le pause più lunghe dei fotogrammi erano di 63 ms, ma nel protocollo ce ne sono di **184 ms** (avvio della registrazione video, 5 novembre) e **256 ms** (Mac fermo, 1 novembre). Con 200 ms la seconda avrebbe portato in SAFE. Il test del supervisore ora prova 184, 256 e 301 ms.
- **Controllo della partenza della CALIBRAZIONE** (decisione di Gabriele: «meglio controllare la calibrazione che già ci ha causato parecchi problemi»). Rileggendo il codice: la rampa parte 0,6 kPa sopra la pressione del momento in cui si avvia la calibrazione; se si parte più in basso (per esempio servo a 36), P1 si stacca subito e il firmware salvava un p0 troppo basso senza accorgersene. Ora, se P1 supera 1 cm nei primi 3 s della discesa, la calibrazione si annulla e si va in SAFE con il motivo nuovo `PARTENZA_BASSA`. 3 test nuovi (prima rossi), **33 test del firmware**, compilato (Flash 24,9 %), non caricato.
- **Ponte:** il CSV di ogni prova ha due colonne in più in fondo, `p_rif_pa` (pressione voluta) e `quota_rif_dmm` (quota voluta, solo in HOLD); la riga `# firmware:` viene dalla riga V invece di essere scritta fissa «0.1».
- **`pc/analisi_f4.py`:** dà il verdetto dei «Fatto quando» appena finita una prova (`--prova 4.3`, `4.4` o `4.5`): assestamento dei gradini di pressione (fascia ±50 Pa, circa un passo e mezzo del servo), tenuta della pressione con la deriva del servo, ampiezza e periodo del ciclo limite dell'On-Off, gradini di quota e tenuta di **M4** (il tratto continuo più lungo entro ±1 cm). 23 test.
- **Gemello:** le prove della scaletta fatte girare in Simulink e salvate come CSV del ponte (`analisi/gemello-f4/`, compressi). Verdetti: gradini di ±391 Pa assestati in **0,22–0,28 s**; On-Off ±5 mm a 5 cm **±2,2 cm, 6,1 s** (±10 mm: ±3,0 cm, 7,9 s); PD e PID superano M4 (RMS 0,9 e 1,4 mm); solo P sovraelongazione 53 %. Serviranno anche per il confronto della 4.6.
- **Tre cose trovate con il gemello:** (1) un gradino arrivato in due righe consecutive era contato due volte; (2) nel PD un picco su e giù nello stesso istante dava una divisione per zero, e faceva cadere anche l'analisi delle altre prove; entrambi corretti con i loro test. (3) **L'On-Off a 10 cm non parte dal fondo:** l'equilibrio a 10 cm è p0 + 978 Pa e l'On-Off toglie solo 700 Pa, quindi P1 resta sul fondo (90 s nel gemello). Al banco si prova a 5 cm.
- **Soglia di P1 per il piano C:** `pc/anello_aperto.py --solo-soglia`, lo stesso metodo del 5 novembre (gradini di 0,03 kPa ogni 12 s). Da confrontare correggendo per la temperatura (circa 0,34 kPa per grado).
- **Scaletta del 10 novembre** (`docs/scaletta-10-novembre.md`): accensione, P1 dal vasetto, angolo di chiusura del circuito in base alla soglia attesa, soglia, transizioni della 4.2 (dalla a alla h), 4.4 con l'anello esterno spento (`K,Z,0,0,0,10` e un equilibrio finto 500 Pa più alto, così P1 resta sul fondo), 4.3, 4.5 e M4.
- **Revisione settimanale** (2–8 novembre) e **bozza del messaggio di M2** (`docs/messaggio-M2.md`, lo manda Gabriele se vuole: gli aggiornamenti al prof non sono stati concordati).
- **Test:** 147 in Python, 33 nel firmware.

**Problema (di metodo):** il primo comando MATLAB è rimasto «appeso» 6 minuti: MATLAB aveva finito, ma un suo servizio (MathWorksServiceHost) teneva aperta la pipe verso `tail`. Ora MATLAB si lancia scrivendo su un file.

**Decisioni (Gabriele):** errore → SAFE a 6 cm per 5 s; telecamera muta a 300 ms (dopo la correzione); PID predefinito; controllo della partenza della calibrazione nel firmware; sessione al banco spostata a martedì 10.

**Ore:** Gabriele 0 h al banco; il lavoro della sera è di Claude, non contato.

**Prossimo passo:** martedì 10 al banco con la scaletta: soglia di P1 (piano C), firmware 0.2 caricato, transizioni della 4.2 (compresa `PARTENZA_BASSA`), 4.4, 4.3, 4.5 e primo tentativo di **M4**. Da decidere (Gabriele): se mandare il messaggio di M2; se le transizioni `PRESSIONE` e `SENSORE`, provate solo sul Mac, bastano per il «Fatto quando» della 4.2.

## 2026-11-10 · firmware 0.2 al banco: 4.2, 4.4, 4.3, 4.5 e criterio di M4 superato; video di M4; 4.6 · circa 2 h 45

| Orario | Durata | Attività |
|---|---|---|
| 17:33–17:55 | 22 min | accensione, firmware 0.2 caricato; SAFE `SENSORE` all'avvio e difetto del servo in SAFE corretto; P1 trovato vuoto nel vasetto e riempito di nuovo (1.2) |
| 17:55–18:16 | 21 min | soglia di P1 (99,12 kPa), chiusura a 116°, telecamera di nuovo a 60 fps, zero del righello rifatto con P1 sul fondo |
| 18:16–18:50 | 34 min | 4.2: rifiuti, due calibrazioni, SAFE per `PERSO`, `TELECAMERA_MUTA`, `MAC_MUTO`, `ERRORE`, `EMERGENZA`; pause della telecamera e soglie; iPhone collegato con il cavo |
| 18:50–19:16 | 26 min | 4.4: gradini di pressione, misura del gioco del servo (22°), video del gioco (Gabriele), taratura del PI |
| 19:16–19:23 | 7 min | 4.3: On-Off ±700 Pa (diverge) e ±1000 Pa con due isteresi |
| 19:23–20:15 | 52 min | 4.5: solo P, PD, PID; tre prove interrotte (colonna ridisegnata, ponte fermo all'avvio del video, P1 contro la parete); prova di M4 con il video del banco e quello esterno di Gabriele |

Sera (circa 20:15–22:40, Claude al computer, non contato): video di M4 con HyperFrames, 4.6 (gemello rifatto con le condizioni del banco), capitolo 5, chiusura.

**Fatto:**
- **Firmware 0.2 caricato.** All'avvio il sensore ha smesso di rispondere per un attimo (17:37:04, SAFE `SENSORE`, poi tornato da solo). Lì si è visto un **difetto**: SAFE comandava il servo a 146 anche se non aveva mai ricevuto un comando, cioè lo accendeva di colpo senza rampa (collegando l'alimentatore sarebbe scattato da 36 a 146). Corretto: senza un comando SAFE lo lascia spento; provato subito con `E` a servo spento.
- **Piano C fallito:** P1 nel vasetto, dritto con l'ugello appoggiato sulla carta umida, era **quasi vuoto d'acqua** e il fondo del vasetto bagnato: la carta ha fatto da stoppino. Riempito di nuovo da Gabriele. Soglia misurata con lo stesso metodo del 5 novembre (`pc/anello_aperto.py --solo-soglia`): **99,12 kPa**, cioè 1,52 kPa sotto la stanza (100,64): P1 è pesante. Decisione di Gabriele: **niente gocce da togliere**, si lavora con la chiusura più alta (116°: soglia intorno a 60°, circa 2,5 kPa di corsa sopra). In depressione un grado vale circa 26 Pa invece di 36.
- **Telecamera:** a 1080p l'iPhone mandava 30 fps anche a ffmpeg da solo (`pc/misura_fps.py`: 30,0 fps a 1080p, 58,4 a 720p); tornato a 60 dopo averlo fatto ricollegare. Il righello aveva preso lo zero con P1 in superficie (all'avvio P1 era in cima): riavviato con P1 sul fondo. Con P1 pesante, alla pressione della stanza P1 resta dov'è (sul fondo resta sul fondo, in cima galleggia).
- **4.2 · stati e sicurezza**, tutte le transizioni provocabili: rifiuti `NO,M,EQUILIBRIO` e `NO,M,QUOTA`; CALIBRAZIONE → HOLD due volte, **p0 = 99 168 e 99 174 Pa** (soglia a mano 99 120: 48 e 54 Pa; ripetibilità 6 Pa), e subito dopo P1 tenuto a 5 cm (ultimi 60 s: RMS 0,6 mm); SAFE `PERSO` con la striscia di carta (0,23 s), `TELECAMERA_MUTA` (Ctrl+C, quota vecchia 503 ms), `MAC_MUTO` (ponte sospeso), `ERRORE` (`K,Z,0,0,0,10` e `R,1100`: 5 s oltre 6 cm), `EMERGENZA` (servo spento e acceso). `PARTENZA_BASSA` non si può provocare con questo P1 (la depressione disponibile è troppo poca); `PRESSIONE` è oltre la corsa del servo.
- **Soglie del Mac e della telecamera** (4 caricamenti del firmware): la telecamera da 300 a 500, poi 600 ms (con soglie uguali un Mac fermo risultava sempre `TELECAMERA_MUTA`, perché la quota si conta dal fotogramma); poi, su richiesta di Gabriele («sii più chill»), **Mac 2 s e telecamera 2,5 s**: in una pausa il PI della pressione tiene l'ultima pressione voluta e P1 deriva piano. Test del supervisore aggiornati ogni volta (prima rossi).
- **Pause della telecamera:** senza cavo 4 pause lunghe in 45 minuti (fino a 0,8 s); con l'iPhone collegato al Mac 5 minuti puliti (massimo 185 ms), poi di nuovo pause fino a 1,9 s, e l'iPhone che si è bloccato del tutto alle 19:45 (13,5 s). In quel caso `telecamera.py` si chiudeva da solo: **difetto corretto** (ffmpeg che non risponde si chiude con la forza e la telecamera si riapre; test prima rosso). **L'avvio della registrazione video ferma tutto il Mac per circa 1 s** (il ponte stesso si è fermato 1,15 s alle 19:29:48: SAFE `MAC_MUTO`).
- **Gioco del servo (R3):** gradini di 10° avanti e indietro tra 90 e 100: la pressione non si muove; scendendo da 100 a passi di 2° la pressione resta ferma fino a 78°: **circa 22° di gioco** (il 23 ottobre 10°), circa 550 Pa a vuoto; nello stesso verso circa 25 Pa/°. Video di Gabriele: l'asta agganciata allo stantuffo sale e scende prima di spingere, il braccio del servo con l'epossidica fa gioco, il servo si solleva nonostante le 5 fascette.
- **4.4 · PI della pressione:** gradini di ±391 Pa con P1 sul fondo (`K,E,p0+500`, `K,Z,0,0,0,10`). Progetto 0,02/0,4: sovraelongazione 50–60 %, 1,4 s. Provati 0,02/0,05 (2 s), **0,02/0,1 (0,9–1,1 s, 2–5 %, scelto)**, 0,04/0,1 (1,1–1,3 s). Tenuta: errore medio 0,3 Pa con la perdita compensata. **«Fatto quando» (< 0,5 s) non raggiunto** per il gioco.
- **4.3 · On-Off** a 5 cm: con ±700 Pa l'oscillazione cresce fino alla superficie (SAFE `ERRORE`: la spinta massima vale l'equilibrio a 12,1 cm); con **±1000 Pa** (decisione di Gabriele) ciclo limite **±4,6 cm, 11,3 s** (isteresi ±5 mm) e **±4,7 cm, 11,8 s** (±10 mm). La «tirata» va a fine corsa e arriva solo a circa 100 Pa sotto p0. **«Fatto quando» raggiunto.**
- **4.5:** solo P oscilla (±5,4 cm, 9,7 s); PD entro ±1 cm per 89,7 s ma RMS 6 mm; **PID: entro ±1 cm per 88,7 s (19:53) e 81,9 s (20:11), ultimi 60 s errore massimo 6,0 e 7,9 mm, RMS 3,4–3,5 mm.** **Criterio di M4 superato due volte**, la seconda con il video del banco e quello esterno di servo e siringa (Gabriele). A 10 cm il PID ondeggia di circa ±4 mm ogni 4 s (il gioco).
- **Video di M4** (Claude, HyperFrames, `media/m4-video/`): 64 s con la bottiglia, il video di Gabriele sincronizzato (inizio alle 20:10:42,1, trovato sul movimento del servo all'ingresso in HOLD e controllato sul gradino), i grafici di quota e pressione dai dati veri e il suono del servo; `media/2026-11-10_M4_quota-tenuta-entro-1-cm.mp4`.
- **4.6 · confronto con il gemello** (`analisi/confronto_f4.m`, `analisi/confronto_f4.py`, figura `analisi/figure/confronto_f4.png`): con gioco 22°, chiusura a 116° e P1 pesante il gemello riproduce l'ondeggiamento del PID (±3,1 mm ogni 4,3 s contro ±4,4 mm ogni 4 s), l'assestamento lento (18 s contro 16) e il PI tarato (1,5 s contro 1). Non riproduce il picco del PI di progetto (stantuffo che si incolla, non modellato) né l'On-Off ±700 divergente (depressione utile minore al banco). Capitolo 5: sezioni 5.5 (prove al banco) e 5.6 (confronto).
- **Webcam:** cercata (Logitech C922 circa 80–90 €, ELP con zoom circa 95 €); **decisione di Gabriele: niente spesa**; l'iPad non può fare da Fotocamera Continuity.
- **Test:** 148 in Python, 33 nel firmware.

**Problemi (e cosa si è capito):**
1. Una sequenza di Claude ha dato per scontato P1 sul fondo prima di una prova: P1 era salito in superficie e HOLD è stato rifiutato. Ora ogni prova parte mandando P1 sul fondo.
2. Ridisegnare la colonna durante una prova ferma le quote (SAFE): durante le prove la dashboard non si tocca.
3. P1 contro la parete della bottiglia: il marcatore sul bordo si vede e non si vede (due `PERSO` di fila); risolto con un colpetto alla bottiglia.
4. Lo zero del righello si prende dalla posizione ferma più bassa: con P1 inclinato sul fondo sotto pressione è circa 6 mm più in basso che con P1 dritto.

**Decisioni (Gabriele):** P1 riempito senza togliere gocce, chiusura a 116°; iPhone sul cavo; niente webcam (niente spesa); soglie del Mac e della telecamera a 2 e 2,5 s; meccanica (R3) alla prossima sessione, oggi solo software; PI a 0,02/0,1; On-Off a ±1000 Pa; video di M4 con il video esterno; controllo della calibrazione (`PARTENZA_BASSA`) caricato.

**Ore:** Gabriele circa **2 h 45** al banco (17:33–20:15, stimato dal registro). Per sottofase, circa: 1.2 (P1) 0 h 20, 4.2 1 h 00, 4.4 0 h 25, 4.3 0 h 10, 4.5 0 h 50. La sera è lavoro di Claude, non contato.

**Questioni aperte (da riprendere alla prossima sessione, Claude le richiede):** vedi `docs/prompt-ripresa-11-novembre.md`.
