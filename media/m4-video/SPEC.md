# Video di M4 · Palombaro di Cartesio (10 novembre 2026)

GOAL:    il professore vede, in un minuto, il sistema completo (bottiglia, siringa, servo) tenere P1 a 10 cm
         entro ±1 cm per più di 60 s, con i numeri veri sullo schermo.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    64 s x 30 = 1920 fotogrammi. Nessuna musica (nessuna fonte); suono vero del servo dal video esterno
         nei tratti a tempo reale.
LOOK:    fondo #EFEFEC pieno (il muro della stanza), inchiostro #161616, grigio #6B6B6B per le etichette,
         un solo accento rosso #D0282E (il colore del marcatore di P1): linea della quota, fascia ±1 cm, numero
         finale. Inter 900 per titoli e numeri (96 px titolo, 120 px quota dal vivo, 220 px numero finale,
         tracking -2 %), Inter 700/400 per il resto (28-44 px). Cifre tabular-nums. Niente ombre, niente
         bordi, niente card: video e grafici a filo su una griglia con margini di 72 px e spazi di 40 px.
OBJECTS: la bottiglia vera (video del banco ritagliato, P1 con il marcatore rosso), siringa e servo veri
         (video di Gabriele), due grafici: quota con la quota voluta e la fascia ±1 cm; pressione con la
         pressione voluta.
MOTION:  entrata dei testi: y 24 → 0 px e opacità, 15 fotogrammi, power3.out, sfalsati di 5 fotogrammi;
         i grafici si disegnano con il tempo dei dati (nessuna animazione propria); conteggio finale
         42 fotogrammi, power2.out, poi fermo.
SHOTS:   0-4,5 s   apertura: titolo a sinistra, la bottiglia con P1 che sale a destra (20:11:01-20:11:05).
         4,5-20,5  1 · calibrato: HOLD, P1 dal fondo a 5 cm (20:11:00-20:11:16, tempo reale, audio).
         20,5-38,5 2 · gradino a 10 cm (20:11:37-20:11:55, tempo reale, audio: lo scatto del servo).
         38,5-57,5 3 · un minuto a 10 cm, ×4 (20:11:55-20:13:11), contatore «entro ±1 cm da … s».
         57,5-64   chiusura: 81,9 s di fila entro ±1 cm; ultimi 60 s: errore max 7,9 mm, RMS 3,4 mm.
BANNED:  fondo scuro, bagliori, gradienti, card e bordi, tutto centrato, tutto che entra insieme, testi che
         si muovono mentre si leggono, etichette maiuscole in monospace, numeri senza fonte.
QA:      4 s (titolo leggibile, P1 visibile); 12 s (P1 a 5 cm, grafico che cresce); 22 s (gradino in arrivo);
         30 s (servo mosso, quota oltre 10 cm); 50 s (contatore sopra 40 s); 60 s (numero finale fermo).
