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
