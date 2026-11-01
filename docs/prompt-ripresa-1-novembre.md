Ciao. Riprendo il progetto Palombaro di Cartesio controllato dalla chat precedente, chiusa la sera del 28 ottobre (ultimo commit f84b29b, già su GitHub). Dal 29 al 31 ottobre nessuna attività. Oggi è domenica 1 novembre e riprendo nel pomeriggio. Siamo nella fase F2 (sensori, visione, registrazione), milestone M2 entro domenica 8 novembre: «quota e pressione misurate 20 volte al secondo».

Prima di tutto leggi, per avere il quadro completo:
- Piano operativo/piano-operativo-palombaro.md: F2 (2.1–2.7, "Fatto quando"), registro dei rischi (R2, R5, R6, R8 aggiornati il 28);
- diario.md: le voci del 24 sera, del 27 e soprattutto del 28 ottobre;
- hardware/postazione-ripresa.md (risultati del blocco F e «28 ottobre: cosa è cambiato nella postazione»), hardware/collegamenti.md, hardware/calibrazione-servo.md, relazione/02-banco-sperimentale.md;
- docs/protocollo.md (bozza della 2.4, sezione 9: otto scelte da decidere);
- pc/telecamera.py, pc/tracking.py, pc/righello.py, pc/calibrazione.py, pc/postazione.py, pc/registra_seriale.py, pc/dashboard/ (server.py, static/telecamera.js), tests/;
- firmware/src/prova_banco.cpp;
- landing/progresso-dati.js (il bollettino).

Stato del banco alla fine del 28:
- Servo fissato con due fascette che passano sotto la tavoletta, ai lati del servo, sopra una matita e un cartone piegato: non bascula e le fascette non toccano il braccio a 36 né a 146. Resta il gioco noto di circa 1 ml quando tira.
- Sensore: il 28 non rispondeva perché i fili verde (SDA, colonna 40) e giallo (SCL, colonna 43) erano invertiti; sistemato.
- Circuito: la bottiglia piccola è stata tolta (mia decisione); il tubo B è tagliato a filo del vecchio tappo piccolo e infilato direttamente sulla punta della siringa. Il tubo B si era staccato dalla colla dove entra nel tappo del sensore (tirato verso la siringa): la sera del 28 l'ho richiuso con un collare di epossidica da 5 minuti. Il tappo del sensore è fuori dalla bottiglia; sulla bottiglia c'è il tappo normale e P1 è sul fondo. Il circuito d'ora in poi si apre e si chiude sfilando il tubo dalla siringa, non svitando il tappo.
- P1 è più pesante: il 28, chiudendo a 146 e tirando, si è staccato dal fondo a −1,85 kPa (servo 46); va a fondo già alla pressione della stanza. Senza la bottiglia piccola l'escursione 36 ↔ 146 dovrebbe salire a circa 2,9 kPa: il punto di chiusura va ricalcolato dopo aver misurato escursione e soglia.
- Telecamera: il supporto dell'iPhone è a terra, legato alla gamba del tavolo con due fascette (telefono e bottiglia si muovono insieme; è il mio salotto, quindi niente nastro né segni sul pavimento). Riferimento nuovo del 28 alle 21:21:48, colonna [757, 52, 385, 1027], pelo dell'acqua a circa 45 px dal bordo alto, circa 40 px per cm, 60 fps (a volte 30). Il metro non è più nell'inquadratura. F4 superata (luminosità entro l'1 % per 5 minuti). F9 non superata: rimettendo il telefono l'immagine si sposta di circa 45 px e si ingrandisce dell'1,2 %, probabilmente per l'«Inquadratura automatica» della Fotocamera Continuity (da spegnere: Centro di Controllo del Mac → «Effetti video»).
- Decisione del 28: niente inquadratura fissa, il programma si ricalibra a ogni sessione con «il palombaro fa da righello» (pc/righello.py): zero = P1 fermo sul fondo, scala = altezza del marcatore in pixel (ALTEZZA_MARCATORE_MM = 18, provvisoria). La dashboard mostra la quota in cm «(provv.)», ma non l'ho ancora vista dal vivo. Sul video del 24 il marcatore appare il 16 % più basso alla strozzatura della bottiglia (la bottiglia fa da lente anche in verticale): dopo lo spiedino va scritta la versione che segue questa deformazione.
- Spiedino: ne ho comprato uno lungo. Va segnato ogni 2 cm con un pennarello e infilato nella bottiglia aperta, lungo l'asse e accanto a P1, appoggiato sul fondo; serve una volta sola per l'altezza vera del marcatore, la deformazione lungo la colonna e le 5 quote note del «Fatto quando» della 2.3. Va fatto PRIMA di rimontare il tappo del sensore, con la bottiglia aperta. Della 2.3 manca anche la misura della latenza.

Da fare oggi, nell'ordine che ti propongo:
1. «Inquadratura automatica» spenta, telecamera accesa, controllo con il riferimento.
2. Spiedino nella bottiglia aperta: riferimento e foto, poi lo spiedino si toglie.
3. Tappo del sensore rimontato (collare indurito, tappo e cavo fermi, si gira la bottiglia), tubo B fissato al cartone con un'ansa morbida circa 10 cm sopra il tappo; prova di tenuta ed escursione; soglia di P1 e punto di chiusura.
4. F6 con «Registra 2 min» (P1 dal fondo a 2 cm sotto il pelo dell'acqua e ritorno, senza farlo riemergere): chiude 2.1 e 2.2.
5. Chiusura: diario (anche 29–31 ottobre «nessuna attività»), revisione settimanale T5 della settimana 26 ottobre – 1 novembre (è domenica), bollettino, piano, commit e push.

Calendario (solo i fatti, le decisioni sono mie): la 2.1 scadeva il 27 ottobre e la 2.2 il 30 (manca F6); la 2.3 scade oggi; la 2.4 è di oggi e domani 2 novembre; poi 2.5 (2–5 novembre), 2.6 (5–7) e M2 (domenica 8).

Ancora da discutere: le otto scelte del protocollo (docs/protocollo.md, sezione 9). Ancora miei: verdetto_postazione() in pc/postazione.py e letturaPlausibile() in firmware/src/main.cpp.

Come voglio lavorare:
- Rispondi sempre in italiano.
- Risparmiamo token: ogni tuo messaggio deve contenere tutti i passaggi dettagliati con spiegazioni complete. Sono un principiante: guidami tu, con riferimenti concreti (da quale punto di vista, quale pezzo, come riconoscerlo), un disegno quando serve e il perché di ogni passo. Una sola versione definitiva per blocco; se correggi qualcosa, scrivilo in cima come CORREZIONE.
- Chiedimi solo quello che serve perché funzioni: niente perfezionismo né estetica. Il resto si fa solo se un controllo misurato lo richiede.
- Ricorda i vincoli di casa: il banco è nel salotto, niente nastro o segni sul pavimento; sul tavolo del banco sì.
- Foto (.HEIC nella cartella Download): convertile con sips e guardale con parsimonia, e prima di segnalare un difetto verifica cos'è. Video (.MOV): analizzali con ffmpeg e salvali compressi in media/.
- ESP32 collegato al Mac: sei tu a caricare i programmi (pio run -e <ambiente> -t upload --upload-port /dev/cu.usbserial-0001 dalla cartella firmware) e a leggere la seriale. La registrazione la avvii tu, staccata dalla sessione, con pc/registra_seriale.py in dati/<data>/ (può partire da sola quando collego l'USB); controlla il registro a ogni mio messaggio (errori I²C, brownout, valori assurdi). La dashboard la accendi tu; pc/telecamera.py lo lancio io da Terminal.app.
- Se una prova fallisce due volte, fermati e cerca la causa con una misura o un conto. Verifiche di contatto, tensione o continuità: sempre con il multimetro.
- Tagli al piano e spostamenti di calendario li decido solo io: si segue il piano originale.
- A fine giornata: diario (orari e divisione del tempo per attività), bollettino landing/progresso-dati.js (storico compreso), piano, poi commit e push. Registri grandi compressi in .gz.

Primo passo: dimmi come spegnere l'Inquadratura automatica e verificare l'inquadratura, poi dammi i passaggi dettagliati per lo spiedino (come segnarlo, dove e come infilarlo rispetto a P1 e alla telecamera, cosa fotografare).
