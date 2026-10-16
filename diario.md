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

## 2026-10-16 · sottofase 1.3 (diagnosi del sensore) · in corso, orari da compilare

**Materiale:**
- **Multimetro** (B14/E2) e **condensatori da 1000 µF** (B12/E1) già disponibili: non vanno comprati.
- **Arrivate le pipette** Pasteur di plastica da 3 ml (20 pezzi) per i palombari della 1.2.

**Fatto finora:**
- Riletta la prova rimasta in sospeso ieri sera (sensore di riferimento sulla seconda breadboard, CSB collegato al VCC): nessuna risposta, ma con una linea dati bassa, cioè un collegamento interrotto. **Correzione rispetto a ieri:** la scheda del BMP280 ha i pull-up da 10 kΩ su **entrambe** le linee dati, quindi una linea bassa vuol dire davvero filo interrotto. Le prove sul CSB di ieri sera non erano valide.
- Scritto un firmware di prova A/B (`firmware/src/main.cpp`): spegne e riaccende il sensore alternando CSB alto e CSB scollegato, e prima legge lo stato delle linee dati.
- La seconda breadboard è nuova e molto dura: i pin entrano solo forzando e possono finire di fianco alla molletta, senza contatto. L'ESP32 è stato rimontato sulla prima breadboard, nella zona mai usata (colonne 29 e seguenti).
- Sensore di riferimento infilato accanto all'ESP32, allineamento verificato in foto (`IMG_1718`, `IMG_1719`): le linee dati risultano comunque basse in entrambi i modi, quindi il sensore non è alimentato. Senza una misura diretta non si distingue tra contatto della breadboard e sensore danneggiato ieri.
- Il Mac per qualche minuto non vedeva l'ESP32: risolto cambiando porta USB.

**Decisione in corso:** smettere di provare il sensore di riferimento e usare il **multimetro** per tutte le verifiche di contatto. Sul tappo: tagliare i fili e risaldarli su un BMP280 nuovo con ponticello CSB → VCC, così da coprire sia l'ipotesi del chip guasto sia quella del CSB scollegato.
