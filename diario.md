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
