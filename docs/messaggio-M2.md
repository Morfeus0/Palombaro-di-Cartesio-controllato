# Bozza: messaggio al prof dopo M2 (T6)

Preparata il 9 novembre (Claude). **Lo manda Gabriele, se vuole.** Il piano prevede questi aggiornamenti «se concordati
il 12 ottobre», ma l'incontro non c'è stato (approvazione per email l'8 ottobre): non c'è un accordo, quindi mandarlo
è una scelta. Il testo è breve apposta: non chiede risposte.

- **A:** Alessandro Giuseppi (lo stesso thread della proposta dell'8 ottobre)
- **Allegato:** `media/2026-11-05_M2_quota-e-pressione-prova-04.mp4` (2 minuti, 5,6 MB)
- **Oggetto:** Palombaro di Cartesio: aggiornamento, misure e modello pronti

---

Gentile Professore,

le mando un breve aggiornamento sul progetto del palombaro di Cartesio, con un video di due minuti in allegato.

- **Misure (5 novembre):** quota del palombaro dalla telecamera a 60 fotogrammi al secondo e pressione nella bottiglia
  a 100 campioni al secondo, registrate insieme senza perdite. Nel video si vedono entrambe sopra la ripresa, mentre
  muovo il palombaro a mano dalla siringa comandata dal servo.
- **Modello:** dalle fughe del palombaro in anello aperto ho identificato il polo instabile (0,33 rad/s) e ho
  costruito un gemello digitale in Simulink, che ripete le prove registrate.
- **Controllo:** ho progettato nel gemello una cascata con un PI sulla pressione e un PID sulla quota, e il firmware
  con la macchina a stati e le regole di sicurezza è pronto per le prove al banco, che iniziano in questi giorni.

Il prossimo traguardo è tenere il palombaro a una quota scelta, entro un centimetro per un minuto, previsto entro il
22 novembre; le manderò un video anche di quello.

Cordiali saluti,
Gabriele Caruso
