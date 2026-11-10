Ciao. Riprendo il progetto Palombaro di Cartesio controllato dalla chat chiusa la sera di martedì 10 novembre (commit su GitHub). Il 10 al banco il firmware 0.2 ha tenuto P1 a 10 cm entro ±1 cm per 88,7 e 81,9 s di fila: **criterio di M4 superato due volte**, con il video `media/2026-11-10_M4_quota-tenuta-entro-1-cm.mp4`. Fase F4 quasi chiusa con 12 giorni di anticipo; il bollettino dice 64 % contro il 43 % previsto.

Prima di tutto leggi: `diario.md` (voci del 9 e del 10 novembre), `relazione/05-controllo.md` (5.5 prove al banco, 5.6 confronto con il gemello), il piano operativo (F4 e registro dei rischi R3, R5, R6), `docs/protocollo.md` (soglie aggiornate: Mac muto 2 s, telecamera muta 2,5 s).

**Questioni aperte da chiedermi subito, una per una, con le opzioni e i numeri (decido io):**
1. **Dichiarare M4 raggiunta?** Criterio superato due volte (ultimi 60 s: errore massimo 6,0 e 7,9 mm, RMS 3,4–3,5 mm), video pronto. Restano aperte la 4.4 (assestamento 1 s invece di 0,5) e due transizioni della 4.2 provate solo sul Mac.
2. **Messaggio al professore:** bozza in `docs/messaggio-M2.md`; ora c'è anche il video di M4. Mandarne uno solo con i due video? (Lo mando io.)
3. **4.2:** `PRESSIONE` (oltre la corsa del servo) e `PARTENZA_BASSA` (non provocabile con P1 pesante) provate solo dai test sul Mac: bastano per chiudere la 4.2?
4. **Meccanica del servo (R3), gioco salito a 22°:** come sistemarla (asta agganciata allo stantuffo con un gancio, braccio del servo con l'epossidica che cede, servo che si solleva: viti nelle alette invece delle fascette?). Guidami passo passo, con riferimenti fisici e disegni. Dopo: rimisurare il gioco a passi di 2° e rifare la 4.4 (< 0,5 s). In alternativa o in aggiunta: compensazione del gioco nel firmware.
5. **Conservazione di P1 tra le sessioni (R6):** il piano C (vasetto con carta umida) lo ha svuotato. Proposta: dritto nel vasetto ma **sospeso**, con la punta in aria che non tocca niente. Oppure a galla nella bottiglia (perde aria) o sul fondo (si appesantisce).
6. **P1 pesante:** soglia 99,12 kPa, 1,5 kPa sotto la stanza (si lavora chiudendo a 116°, la depressione utile è poca). Togliere una goccia prima della fase 5?
7. **Telecamera (R5):** niente webcam (deciso). Restano le pause fino a 1,9 s con il cavo e il blocco del Mac all'avvio del video: provare a ridurre il carico di `telecamera.py` (analisi dell'immagine meno frequente durante le prove)?
8. **Riconoscimento:** lo zero del righello si prende con P1 inclinato sul fondo (circa 6 mm sotto P1 dritto); P1 contro la parete viene perso. Da sistemare per la fase 5?
9. **Calendario:** la F4 è chiusa quasi tutta 12 giorni prima. Anticipare la F5 (TRACKING, PID digitale completo, SFC, analisi real-time)? Le date le decido io.

Stato del banco a fine sessione: firmware 0.2 con le correzioni del 10 (soglie 2/2,5 s, SAFE senza servo acceso, controllo `PARTENZA_BASSA`); PI tarato a 0,02/0,1 (va rimandato con `K,P,0.02,0.1` a ogni avvio, il firmware parte da 0,02/0,4); p0 da ricalibrare a ogni sessione (il 10: 99,17 kPa con la chiusura a 116°); iPhone collegato al Mac con il cavo.

Come voglio lavorare: come nelle sessioni precedenti (italiano; tutti i passaggi spiegati; il codice lo scrivi tu; diagnosi con una misura dopo due prove fallite; non chiedermi di chiudere la giornata; calendario e tagli li decido io). MATLAB va lanciato con l'uscita su file, mai in una pipe.
