# Bozza: messaggio al prof con il video di M4 e la richiesta di stampa 3D

Preparata il 12 novembre (Claude). **La manda Gabriele.** Il paragrafo sul pezzo da stampare è da completare con la
descrizione del CAD che fornisce Gabriele (segnaposto tra parentesi quadre).

- **A:** Alessandro Giuseppi (lo stesso thread della proposta dell'8 ottobre)
- **Allegato:** `media/2026-11-10_M4_quota-tenuta-entro-1-cm_mail.mp4` (64 s, 21,4 MB, 1080p: versione ricompressa per
  stare sotto i 25 MB di Gmail; l'originale da 31 MB resta in `media/`)
- **Oggetto:** Palombaro di Cartesio: quota tenuta entro 1 cm, e una richiesta di stampa 3D

---

Gentile Professore,

le scrivo per aggiornarla sul progetto del palombaro di Cartesio prima di giovedì, con un video di un minuto in
allegato.

**Il punto a cui sono arrivato.** Il 10 novembre il banco ha tenuto il palombaro alla quota scelta con la cascata PI
sulla pressione e PID sulla quota: in due prove è rimasto entro ±1 cm per 88,7 s e 81,9 s, con un errore RMS di circa
3,5 mm. È il criterio del livello base che mi ero dato (un minuto entro un centimetro), raggiunto con una decina di
giorni di anticipo. Nel video si vedono insieme la bottiglia, il servo che muove la siringa e i grafici di quota e
pressione.

**La direzione da qui.** Il limite principale ora è meccanico: tra servo e siringa c'è un gioco di circa 22°, perché
il corpo del servo si solleva e il collegamento cede a ogni cambio di verso. Questo rallenta l'anello della pressione e
fa ondeggiare il palombaro di qualche millimetro. Prima di considerare chiuso il livello base voglio sistemare la
trasmissione; poi, con il tempo che resta, passare al livello avanzato: errore sotto i 5 mm e inseguimento di quote
che cambiano nel tempo.

**Il pezzo da stampare.** Per questo vorrei approfittare della sua disponibilità a stampare un componente in 3D. Ho
pensato a un supporto unico per servo e siringa, con un coperchio che blocca il servo e gli impedisce di muoversi a
ogni cambio di direzione. [Descrizione del CAD: forma, ingombri, come si fissa alla tavoletta, eventuale immagine
allegata.]

Per progettarlo nel modo giusto le chiederei:

1. Quali sono le dimensioni massime stampabili (larghezza × profondità × altezza)?
2. Con quale materiale stamperebbe (PLA, PETG o altro)?
3. In che formato preferisce il file (STL, STEP, 3MF)?
4. Con la sua stampante, di quanto escono di solito più piccoli fori e sedi rispetto al disegno? Mi serve per sapere
   quanto gioco lasciare negli incastri, ad esempio tra il servo e la sua sede.
5. Per le viti è meglio prevedere fori passanti con dadi, oppure fori più piccoli in cui avvitare direttamente?
6. Che tempi servirebbero per la stampa, una volta che le mando il file?

La ringrazio per la disponibilità. Cordiali saluti,
Gabriele Caruso

---

## Note per Gabriele

- **M4 e la parola «chiudere»:** il 12 novembre hai deciso di non dichiarare ancora M4 finché il servo non è sistemato.
  Il testo dice che il criterio è stato raggiunto (vero: due volte, 88,7 e 81,9 s) e che prima di considerare chiuso
  il livello base vuoi sistemare la trasmissione: così resta coerente con la decisione. Se preferisci dirlo raggiunto
  e basta, togli la frase «Prima di considerare chiuso il livello base…».
- **Allegato:** l'originale (31 MB) superava il limite di 25 MB di Gmail. Ricompresso il 12 novembre in due passate
  (H.264 a 2,6 Mbit/s, audio 96 kbit/s, stessa risoluzione, durata e audio): 21,4 MB, nessuna differenza visibile su
  testi e grafici. Allegare la versione `_mail`.
- **Video di M2:** il messaggio di M2 (`docs/messaggio-M2.md`) non è mai partito. Questa mail non lo cita; se vuoi
  allegare anche quello (5,6 MB), aggiungi una riga nel primo paragrafo.
