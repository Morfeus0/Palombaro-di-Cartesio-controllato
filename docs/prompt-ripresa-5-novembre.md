Ciao. Riprendo il progetto Palombaro di Cartesio controllato dalla chat precedente, chiusa la sera del 1 novembre (ultimo commit 70011fe, già su GitHub). Dal 2 al 4 novembre nessuna attività. Oggi è giovedì 5 novembre. Siamo nella fase F2 (sensori, visione, registrazione): il 1 novembre ho chiuso 2.1, 2.2, 2.3, 2.4, 2.5 e 2.6; resta la **2.7, prova completa e milestone M2 entro domenica 8 novembre** («quota e pressione registrate ad almeno 20 Hz»). Il bollettino del 1 novembre dice 38 % fatto contro il 31 % previsto.

Prima di tutto leggi, per avere il quadro completo:
- Piano operativo/piano-operativo-palombaro.md: F2 (2.1–2.7 con i risultati del 1 novembre, la nota «preparata» della 2.7), F3 (3.1–3.6), Extra E4, registro dei rischi (R2, R4, R5, R6, R8 aggiornati il 1 novembre);
- diario.md: la voce del 1 novembre (con la sera) e la revisione settimanale T5 del 26 ottobre – 1 novembre;
- hardware/collegamenti.md (sezioni «Fine sessione» e SDO del sensore), hardware/postazione-ripresa.md («1 novembre: spiedino, F6…»), relazione/02-banco-sperimentale.md;
- docs/protocollo.md (versione 1: sezione 9 con le undici decisioni approvate, 9.1, campi in più di T e A del firmware 0.1);
- firmware/platformio.ini (ambienti `palombaro` e `protocollo`), firmware/src/palombaro/ (protocollo, sensore, siringa, principale), firmware/test/;
- pc/bridge.py (il ponte), pc/protocollo.py, pc/telecamera.py, pc/righello.py, pc/tracking.py, pc/latenza.py, pc/verifica_firmware.py, pc/config/spiedino.json, pc/dashboard/ (server.py, registro.py, static/app.js), tests/;
- landing/progresso-dati.js (il bollettino).

Stato del banco alla fine del 1 novembre:
- Scheda: firmware 0.1 (ambiente `palombaro`) caricato; 460 800 baud, righe del protocollo, un ciclo da 10 ms, stati MANUALE e SAFE. All'accensione il servo non riceve impulsi e resta dov'è (decisione 11): il primo comando dalla dashboard va dato con la posizione in cui il servo si trova già (di solito 146). Aprire la porta riavvia la scheda. Fatto quando della 2.5 superato: 30,5 minuti a 100 righe al secondo, nessuna persa, scarto del periodo 0 µs.
- Sensore: risponde all'indirizzo 0x77 perché il piedino SDO della schedina non è collegato (misurato a metà tensione il 1 novembre). Il firmware lo cerca a 0x76 e a 0x77, lo riconfigura se si riavvia da solo, e `letturaPlausibile()` (scritta da Claude) accetta 90–110 kPa e 0–50 °C. Mia decisione: niente ponticello SDO → GND per ora; ci ripensiamo se dà problemi nella fase 4. A ogni sessione segnalami se nel registro ricompaiono «perso/ritrovato» o una temperatura del sensore più di 3 °C sopra la stanza con la pressione ferma.
- Per la notte (procedura «Fine sessione» di hardware/collegamenti.md): tubo B sfilato dalla siringa, tappo del sensore svitato e appoggiato all'asciutto con la schedina in alto, tappo normale sulla bottiglia, P1 a galla nella bottiglia (mai estrarlo). Alimentatore del servo e USB staccati.
- P1: ritarato il 1 novembre togliendo e rimettendo acqua dentro (rame invariato). Con il circuito chiuso a 36 alla pressione della stanza si stacca dal fondo a circa +1,1 kPa (comando 84); a 146 si arriva a +3,6–4,0 kPa. Diventa più pesante stando sul fondo (almeno 0,85 kPa in 4 giorni dal 28 ottobre); per questo ora resta a galla tra una sessione e l'altra. Alla prima chiusura voglio rimisurare la soglia, per sapere con un numero quanto è cambiato stando a galla.
- Telecamera: «Inquadratura automatica» spenta; zoom regolato a mano sulla bottiglia; l'ultima colonna era [730, 116, 320, 918]. Il righello usa la tabella dello spiedino (pc/config/spiedino.json): a ogni sessione ricava da solo zero e scala da P1 fermo sul fondo (errore 1,3 mm su 12 quote note, rumore 0,32 mm, altezza del marcatore circa 18,5 mm). Ritardo misurato 156 ms (oltre la soglia di 150 ms di R5); nella prova della 2.6, 5 pause dei fotogrammi tra 57 e 256 ms in 6,7 minuti.
- Ponte (2.6): pc/bridge.py ha preso il posto di registra_seriale.py; riceve la quota da telecamera.py via UDP e la inoltra come `$Z`, manda il battito `$B` ogni 200 ms, scrive il registro come prima (la dashboard lo segue) e un CSV per esperimento. Preparato per la 2.7 ma non ancora provato al banco: «Registra 2 min» nella dashboard avvia insieme il video e il CSV dell'esperimento (file `esperimento.txt`, chiuso dopo la stessa durata).

Avvio della sessione (la parte al banco la faccio io, guidami tu):
1. USB della scheda al Mac; tu avvii il ponte e la dashboard, io la telecamera da Terminal.app (`.venv/bin/python pc/telecamera.py`).
2. Prima di avvitare il tappo del sensore: 3–4 gocce di soluzione sul pelo dell'acqua (contro il menisco di P1 a galla); poi tappo fermo e bottiglia che gira, fermo del tubo B sul cartone con l'ansa.
3. Alimentatore del servo; dalla dashboard il primo comando con la posizione attuale del servo, poi 36; «Azzera», tubo B infilato: circuito chiuso a 36; 146 per mandare P1 a fondo (colpetto se resta in cima).
4. Soglia di P1 rimisurata; riquadro verde su P1 e quota circa 0,0 cm con P1 fermo sul fondo.

Da fare (2.7, dal piano):
1. Tre prove registrate in modalità manuale con «Registra 2 min» (proposte: salita e tenuta a metà bottiglia; su e giù tre volte; tenuta nel terzo superiore), controllate con `pc/bridge.py verifica`.
2. Video di M2 (Claude): il video della prova migliore con quota e pressione scritte sopra, compresso in media/.
3. Bozza del capitolo «Architettura, sensori e comunicazione» della relazione (Claude).
4. Domenica 8: revisione settimanale T5; eventuale aggiornamento al prof (T6).
Poi F3 dal 9 novembre (3.1 modello fisico e linearizzazione, 3.2 parametri statici…).

Calendario (solo i fatti, le decisioni sono mie): la 2.7 è di domenica 8 novembre; F3 va dal 9 al 15 novembre.

Ancora da decidere (miei): il piano B della telecamera (R5, webcam USB da circa 20 €) per il ritardo di 156 ms e le pause; il ponticello SDO → GND solo se servirà nella fase 4; l'Extra E4 (palombaro che non va più riequilibrato), quando saremo a buon punto.

Come voglio lavorare:
- Rispondi sempre in italiano.
- Risparmiamo token: ogni tuo messaggio deve contenere tutti i passaggi dettagliati con spiegazioni complete. Sono un principiante: guidami tu, con riferimenti concreti (da quale punto di vista, quale pezzo, come riconoscerlo), un disegno quando serve e il perché di ogni passo. Una sola versione definitiva per blocco; se correggi qualcosa, scrivilo in cima come CORREZIONE.
- Il codice lo scrivi sempre tu, anche le funzioni lasciate a mio nome (per esempio `verdetto_postazione()` in pc/postazione.py): io decido le scelte a parole, con le opzioni e i numeri che mi dai.
- Chiedimi solo quello che serve perché funzioni: niente perfezionismo né estetica. Il resto si fa solo se un controllo misurato lo richiede.
- Ricorda i vincoli di casa: il banco è nel salotto, niente nastro o segni sul pavimento; sul tavolo del banco sì.
- Foto (.HEIC nella cartella Download): convertile con sips e guardale con parsimonia, e prima di segnalare un difetto verifica cos'è. Video (.MOV): analizzali con ffmpeg e salvali compressi in media/.
- ESP32 collegato al Mac: sei tu a caricare i programmi (dalla cartella firmware: `pio run -e palombaro -t upload --upload-port /dev/cu.usbserial-0001`) e a leggere la seriale. Il ponte (`pc/bridge.py`) e la dashboard li avvii tu, staccati dalla sessione; tieni sveglio il Mac durante le prove lunghe (caffeinate). Controlla il registro a ogni mio messaggio (errori, brownout, valori assurdi, sensore perso). pc/telecamera.py lo lancio io da Terminal.app.
- Se una prova fallisce due volte, fermati e cerca la causa con una misura o un conto. Verifiche di contatto, tensione o continuità: sempre con il multimetro.
- Tagli al piano e spostamenti di calendario li decido solo io: si segue il piano originale.
- La giornata non si chiude finché non lo dico io. A fine giornata: diario (orari e divisione del tempo per attività), bollettino landing/progresso-dati.js (storico compreso), piano, poi commit e push. Registri grandi compressi in .gz.

Primo passo: dimmi cosa collegare e in che ordine per riaccendere il banco con il firmware 0.1 e il ponte, come rimontare il tappo con le gocce di soluzione e chiudere il circuito, e come rimisurare la soglia di P1. Poi le tre prove della 2.7.
