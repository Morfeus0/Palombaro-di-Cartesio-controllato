/* Dati del bollettino di avanzamento. È l'UNICO file da aggiornare ogni sera.

   Procedura serale (dal diario di laboratorio):
   1. `aggiornato` = data del diario ricevuto.
   2. Per ogni sottofase toccata, `fatto` = stima 0–100 rispetto al "Fatto quando" del piano operativo;
      `nota` = una riga in linguaggio semplice (cosa manca o cosa è successo).
   3. Prima di cambiare le stime, copiare in `storico` il valore di ieri ({ data, fatto }) letto
      nella pagina: il punto di oggi lo aggiunge la pagina da sola.
   4. Sommare in `oreEffettive` le ore del diario spese su quella sottofase (anche quelle della serata);
      in `oreUnaTantum` la parte che non si ripeterà (ad esempio imparare a saldare).
   5. Aggiornare `sintesi`, `diario` (in cima la voce nuova), `prossimi` e `rischi`.
   Le date sono AAAA-MM-GG; `ore` è l'impegno stimato nel piano operativo e fa da peso. */
window.PalombaroProgresso = Object.freeze({
  aggiornato: '2026-10-24',
  provvisorio: false, // true finché le stime non sono confrontate con il diario della sera
  consegna: '2026-12-13',
  scadenzaProf: '2026-12-31',
  oreAlGiorno: 2, // media dichiarata, tutti i giorni: base del prospetto di fine progetto

  sintesi: 'Secondo traguardo raggiunto (M1), un giorno prima della scadenza: il palombaro si muove con la siringa comandata dal motore. Nella prova di dieci minuti è sceso e risalito dieci volte su dieci, e con la nuova dashboard, la pagina di comando del banco, è stato tenuto a mano a mezz\'acqua. La bottiglia tiene ancora la pressione, un po\' meno dei primi giorni. Il sensore si è scollegato una volta avvitando il tappo ed è stato rimesso a posto in pochi minuti. Con la fase di costruzione chiusa il progetto è in anticipo di circa un giorno sul calendario. Le ore spese per costruire il banco sono state quasi il doppio del previsto: togliendo quelle una tantum, la fine prevista è il 30 dicembre, prima della scadenza del professore. Dalla settimana prossima si passa alla telecamera.',

  fasi: [
    {
      id: 'F0', nome: 'Approvazione e ordine',
      milestone: { id: 'M0', titolo: 'Progetto approvato e componenti ordinati',
        descrizione: 'Il professore approva l\'idea e arriva tutto il materiale necessario.' },
      sottofasi: [
        { id: '0.1', nome: 'Preparare la presentazione al professore', da: '2026-10-08', a: '2026-10-11', ore: 1.5, fatto: 100, nota: 'Proposta e sito inviati per email l\'8 ottobre.' },
        { id: '0.2', nome: 'Preparare la lista dei componenti', da: '2026-10-08', a: '2026-10-11', ore: 1.5, fatto: 100 },
        { id: '0.3', nome: 'Approvazione del professore', da: '2026-10-12', a: '2026-10-12', ore: 1, fatto: 100, nota: 'Approvato per email l\'8 ottobre, senza modifiche.' },
        { id: '0.4', nome: 'Ordinare e comprare i componenti', da: '2026-10-12', a: '2026-10-13', ore: 1, fatto: 100, nota: 'Chiusa il 19 ottobre con l\'arrivo delle pipette; il 19 comprate anche le siringhe da 20 ml.' },
        { id: '0.5', nome: 'Rivedere il piano', da: '2026-10-12', a: '2026-10-13', ore: 1, fatto: 0, saltata: true, nota: 'Non serviva: nessuna modifica richiesta.' },
      ],
    },
    {
      id: 'F1', nome: 'Costruzione del banco',
      milestone: { id: 'M1', titolo: 'Il palombaro si muove con la siringa comandata dal motore',
        descrizione: 'Bottiglia, siringa, motore ed elettronica montati e funzionanti insieme.' },
      sottofasi: [
        { id: '1.1', nome: 'Ambiente di lavoro e programmi', da: '2026-10-12', a: '2026-10-14', ore: 2.5, fatto: 100, oreEffettive: 1, nota: 'Chiusa il 10 ottobre in un\'ora: iPhone come telecamera a circa 30 fps.' },
                { id: '1.2', nome: 'Costruire e tarare il palombaro', da: '2026-10-13', a: '2026-10-20', ore: 3, fatto: 100, oreEffettive: 6.4, nota: 'Chiusa il 23 ottobre con il solo palombaro principale: comandato dal motore va a fondo e risale 5 volte su 5. I palombari di riserva non si fanno, per risparmiare tempo.' },
        { id: '1.3', nome: 'Tappo con il sensore di pressione', da: '2026-10-15', a: '2026-10-17', ore: 3, fatto: 100, oreEffettive: 16.47, oreUnaTantum: 4.5, nota: 'Chiusa il 17 ottobre. Il 21 la schedina del sensore si è bagnata di condensa: asciugata, funziona; domani lo smalto protettivo.' },
        { id: '1.4', nome: 'Circuito dell\'aria', da: '2026-10-17', a: '2026-10-19', ore: 2, fatto: 100, oreEffettive: 3.15, nota: 'Chiusa il 19 ottobre: spingendo la siringa da 20 ml il palombaro scende, tirandola risale.' },
        { id: '1.5', nome: 'Elettronica minima', da: '2026-10-18', a: '2026-10-18', ore: 3, fatto: 100, oreEffettive: 0.58, nota: 'Chiusa il 18 ottobre: pressione letta 50 volte al secondo, il motore si muove senza far riavviare la scheda.' },
        { id: '1.6', nome: 'Prova di tenuta della bottiglia', da: '2026-10-18', a: '2026-10-18', ore: 1.5, fatto: 100, oreEffettive: 0.32, nota: 'Chiusa il 18 ottobre al primo tentativo: dopo 10 minuti resta il 93 % della pressione (ne bastava il 70 %).' },
                { id: '1.7', nome: 'Meccanica motore e siringa', da: '2026-10-17', a: '2026-10-22', ore: 3, fatto: 100, oreEffettive: 7.2, nota: 'Chiusa il 23 ottobre: il motore cambia la pressione di 2,6 kPa e torna sempre allo stesso punto (entro un centesimo di kPa). A ogni cambio di direzione perde circa 10 gradi, da correggere nel programma.' },
                { id: '1.8', nome: 'Prova d\'insieme e video', da: '2026-10-24', a: '2026-10-25', ore: 2, fatto: 100, oreEffettive: 1.2, nota: 'Chiusa il 24 ottobre: il palombaro scende e risale 10 volte su 10 comandato dal motore, e si tiene a mezz\'acqua a mano da una nuova dashboard. Video registrati.' },
      ],
    },
    {
      id: 'F2', nome: 'Sensori, visione, registrazione',
      milestone: { id: 'M2', titolo: 'Quota e pressione misurate 20 volte al secondo',
        descrizione: 'La telecamera trova il palombaro e il computer registra tutte le misure.' },
      sottofasi: [
        { id: '2.1', nome: 'Postazione di ripresa', da: '2026-10-26', a: '2026-10-27', ore: 1.5, fatto: 0 },
        { id: '2.2', nome: 'Riconoscimento del palombaro nel video', da: '2026-10-27', a: '2026-10-30', ore: 4, fatto: 0 },
        { id: '2.3', nome: 'Calibrazione della misura', da: '2026-10-30', a: '2026-11-01', ore: 2, fatto: 0 },
        { id: '2.4', nome: 'Regole di dialogo computer–scheda', da: '2026-11-01', a: '2026-11-02', ore: 1.5, fatto: 0 },
        { id: '2.5', nome: 'Programma di base della scheda', da: '2026-11-02', a: '2026-11-05', ore: 4, fatto: 0 },
        { id: '2.6', nome: 'Registrazione dei dati', da: '2026-11-05', a: '2026-11-07', ore: 3, fatto: 0 },
        { id: '2.7', nome: 'Prova completa e video', da: '2026-11-08', a: '2026-11-08', ore: 2, fatto: 0 },
      ],
    },
    {
      id: 'F3', nome: 'Modello matematico',
      milestone: { id: 'M3', titolo: 'Modello matematico verificato sui dati',
        descrizione: 'Le equazioni descrivono davvero come si comporta il banco reale.' },
      sottofasi: [
        { id: '3.1', nome: 'Equazioni del sistema', da: '2026-11-09', a: '2026-11-10', ore: 3, fatto: 0 },
        { id: '3.2', nome: 'Misura dei parametri da fermo', da: '2026-11-10', a: '2026-11-11', ore: 2, fatto: 0 },
        { id: '3.3', nome: 'Esperimenti senza controllo', da: '2026-11-11', a: '2026-11-12', ore: 2, fatto: 0 },
        { id: '3.4', nome: 'Stima dei parametri dai dati', da: '2026-11-12', a: '2026-11-13', ore: 3, fatto: 0 },
        { id: '3.5', nome: 'Gemello digitale in Simulink', da: '2026-11-13', a: '2026-11-14', ore: 3, fatto: 0 },
        { id: '3.6', nome: 'Verifica e capitolo della relazione', da: '2026-11-15', a: '2026-11-15', ore: 1, fatto: 0 },
      ],
    },
    {
      id: 'F4', nome: 'Controllo di base',
      milestone: { id: 'M4', titolo: 'Quota stabile per un minuto (livello Base)',
        descrizione: 'Il controllore tiene il palombaro fermo entro 1 cm: il risultato minimo garantito.' },
      sottofasi: [
        { id: '4.1', nome: 'Progetto dei controllori al computer', da: '2026-11-16', a: '2026-11-17', ore: 3, fatto: 0 },
        { id: '4.2', nome: 'Logica di sicurezza', da: '2026-11-17', a: '2026-11-18', ore: 2, fatto: 0 },
        { id: '4.3', nome: 'Controllo On-Off', da: '2026-11-18', a: '2026-11-19', ore: 2, fatto: 0 },
        { id: '4.4', nome: 'Controllo della pressione', da: '2026-11-19', a: '2026-11-20', ore: 2, fatto: 0 },
        { id: '4.5', nome: 'Controllo della quota e video', da: '2026-11-20', a: '2026-11-22', ore: 3, fatto: 0 },
        { id: '4.6', nome: 'Confronto con la simulazione', da: '2026-11-22', a: '2026-11-22', ore: 1, fatto: 0 },
      ],
    },
    {
      id: 'F5', nome: 'Controllo avanzato',
      milestone: { id: 'M5', titolo: 'Precisione di 5 mm e inseguimento (livello Target)',
        descrizione: 'Due anelli di controllo in cascata: il palombaro segue anche una quota che cambia.' },
      sottofasi: [
        { id: '5.1', nome: 'PID digitale completo', da: '2026-11-23', a: '2026-11-25', ore: 3, fatto: 0 },
        { id: '5.2', nome: 'Controllo in cascata', da: '2026-11-25', a: '2026-11-27', ore: 3, fatto: 0 },
        { id: '5.3', nome: 'Filtro sulla misura della telecamera', da: '2026-11-27', a: '2026-11-28', ore: 2, fatto: 0 },
        { id: '5.4', nome: 'Quote che cambiano nel tempo', da: '2026-11-29', a: '2026-11-30', ore: 2, fatto: 0 },
        { id: '5.5', nome: 'Pannello di controllo', da: '2026-11-30', a: '2026-12-02', ore: 3, fatto: 0 },
        { id: '5.6', nome: 'Misure dei tempi reali', da: '2026-12-02', a: '2026-12-03', ore: 2, fatto: 0 },
        { id: '5.7', nome: 'Modello della logica di supervisione', da: '2026-12-03', a: '2026-12-04', ore: 2, fatto: 0 },
        { id: '5.8', nome: 'Taratura finale e video', da: '2026-12-05', a: '2026-12-06', ore: 3, fatto: 0 },
      ],
    },
    {
      id: 'F6', nome: 'Validazione e relazione',
      milestone: { id: 'M6', titolo: 'Consegna interna',
        descrizione: 'Relazione, codice, dati e video pronti per il professore.' },
      sottofasi: [
        { id: '6.1', nome: 'Campagna di esperimenti finale', da: '2026-12-07', a: '2026-12-08', ore: 3, fatto: 0 },
        { id: '6.2', nome: 'Elaborazione dei dati e grafici', da: '2026-12-08', a: '2026-12-09', ore: 3, fatto: 0 },
        { id: '6.3', nome: 'Video dimostrativo', da: '2026-12-09', a: '2026-12-10', ore: 2, fatto: 0 },
        { id: '6.4', nome: 'Stesura della relazione', da: '2026-12-07', a: '2026-12-12', ore: 8, fatto: 0 },
        { id: '6.5', nome: 'Sito aggiornato con i dati reali', da: '2026-12-11', a: '2026-12-11', ore: 1.5, fatto: 0, facoltativa: true },
        { id: '6.6', nome: 'Prova generale della demo', da: '2026-12-12', a: '2026-12-12', ore: 1, fatto: 0 },
        { id: '6.7', nome: 'Consegna interna', da: '2026-12-13', a: '2026-12-13', ore: 1, fatto: 0 },
      ],
    },
  ],

  // Valori di fine giornata dei giorni passati, in percentuale (il punto di oggi è calcolato).
  storico: [
    { data: '2026-10-08', fatto: 2.3 },
    { data: '2026-10-09', fatto: 4.2 },
    { data: '2026-10-10', fatto: 6.5 },
    { data: '2026-10-12', fatto: 6.8 },
    { data: '2026-10-15', fatto: 8.8 },
    { data: '2026-10-16', fatto: 9.9 },
    { data: '2026-10-17', fatto: 11.3 },
    { data: '2026-10-18', fatto: 16.2 },
    { data: '2026-10-19', fatto: 18.0 },
    { data: '2026-10-21', fatto: 18.4 },
    { data: '2026-10-23', fatto: 21.3 },
  ],

  diario: [
    { data: '2026-10-24', testo: [
      'Secondo traguardo raggiunto (M1), un giorno prima della scadenza: il palombaro si muove con la siringa comandata dal motore.',
      'Prova di 10 minuti: il motore spinge e tira per dieci volte, e il palombaro scende e risale tutte le dieci volte. Registrato il video.',
      'Pronta la prima versione della dashboard, la pagina di comando del banco: un cursore per muovere il motore, la pressione in diretta, i grafici e gli avvisi. Con questa il palombaro è stato tenuto a mano a mezz\'acqua.',
      'La bottiglia tiene ancora la pressione (79 % dopo 10 minuti, ne serve il 70 %), un po\' meno dei giorni scorsi dopo le tante aperture del tappo. Il sensore si è scollegato una volta avvitando il tappo: rimesso a posto in pochi minuti.',
      'Scritta la bozza del capitolo della relazione sul banco sperimentale. Dalla settimana prossima si passa alla telecamera.',
    ] },
    { data: '2026-10-23', testo: [
      'Serata lunga, quasi sei ore: motore e siringa montati sulla tavoletta e collegati da un\'asticella d\'acciaio. Il motore spinge e tira lo stantuffo, e la scheda legge la pressione intanto.',
      'Le fascette non bastavano a tenere ferma la siringa: ora la bloccano delle viti. L\'asticella, un po\' storta, è stata rifatta con un filo nuovo.',
      'Prima calibrazione: da un estremo all\'altro il motore cambia la pressione di 2,4 kPa; con 50 ml d\'acqua in più nella bottiglia (meno aria da comprimere) si arriva a 2,6, sopra i 2,5 richiesti. Ripetendo la corsa cinque volte, la pressione torna uguale entro un centesimo di kPa.',
      'A ogni cambio di direzione il motore "perde" circa 10 gradi prima che lo stantuffo si muova: è un difetto costante, che si potrà correggere nel programma.',
      'Il palombaro era finito sul fondo e nella bottiglia si era formata schiuma: bottiglia nuova e palombaro ritarato. Ora, comandato dal motore, scende e risale cinque volte su cinque. Le sottofasi del palombaro e della meccanica sono chiuse.',
    ] },
    { data: '2026-10-22', testo: ['Nessuna attività registrata.'] },
    { data: '2026-10-21', testo: [
      'Quasi tre ore di lavoro (il 20 era giorno di riposo). Il sensore di pressione non rispondeva: con un piccolo programma di prova e il multimetro si sono trovati un filo di massa allentato sulla basetta e, aprendo il tappo, la schedina del sensore umida.',
      'Asciugata con il phon, la schedina funziona di nuovo, 50 letture al secondo per un\'ora. Nella bottiglia l\'aria è satura d\'acqua: domani una mano di smalto trasparente la proteggerà dalla condensa.',
      'Il programma della scheda ora controlla ogni secondo che il sensore risponda, e lo segnala subito se si perde.',
      'Il palombaro, fermo due giorni a galla, non scendeva più con la siringa: la punta asciutta si attacca di nuovo al pelo dell\'acqua, e la pressione esterna era calata. Con un colpetto si stacca e va a fondo: durante il controllo non dovrà mai riemergere.',
      'Meccanica: misure del motore e della siringa, braccio lungo finito, posizione del motore segnata sulla tavoletta. In serata l\'asticella d\'acciaio è stata tagliata.',
    ] },
    { data: '2026-10-19', testo: [
      'Circa cinque ore di lavoro. Arrivate le pipette, l\'ultimo materiale che mancava: primo traguardo (M0) raggiunto. Si accorciano a 6 cm, tenendo la tettarella e un pezzo di gambo per il filo di rame. Comprate e misurate due siringhe da 20 ml.',
      'Con la siringa nuova la pressione sale di 4 kPa, come previsto. Una perdita dal tappo, dopo averlo aperto per mettere dentro il palombaro, è stata trovata e chiusa: la bottiglia tiene di nuovo per ore.',
      'I palombari scendono stringendo la bottiglia con la mano, ma non con la siringa. Dopo molti tentativi l\'ipotesi è che la tensione superficiale li tenga attaccati al pelo dell\'acqua: si prova domani con una goccia di detersivo.',
      'Alle 20:25 il sensore di pressione ha smesso di rispondere. Ricontrollato in serata, funziona: era quasi certamente un collegamento mosso durante le prove.',
      'Alle 21:51 la svolta: con il marcatore rifatto senza pieghe e un po\' di detersivo sciolto in acqua, il palombaro scende spingendo la siringa e risale tirandola. Circuito dell\'aria chiuso!',
    ] },
    { data: '2026-10-18', testo: [
      'Prima parte della giornata (un\'ora e tre quarti): misurati i volumi d\'aria e montato il circuito con le due bottiglie e la siringa.',
      'Prova di tenuta superata al primo colpo: dopo 10 minuti la bottiglia conserva il 93 % della pressione, e dopo 17 minuti è ancora lì.',
      'Collegato il motore con la sua alimentazione e un condensatore: si muove da un estremo all\'altro senza far riavviare la scheda, che intanto legge la pressione 50 volte al secondo.',
      'Le misure di siringa e braccetti mostrano che la corsa del motore non basta: va scelta una soluzione prima del montaggio.',
      'In serata (42 minuti), rifatti i conti: la bottiglia grande si gonfia un po\' sotto pressione e "assorbe" parte dell\'aria spinta. Per muovere il palombaro su tutta l\'altezza servono 2–2,5 kPa.',
      'Riempita d\'acqua la bottiglia piccola: ora 10 ml di siringa danno 2 kPa, il doppio di prima, e il circuito non perde.',
      'Incollati due braccetti del motore uno sull\'altro per allungare il braccio. Decisa una siringa da 20 ml, che con la stessa corsa sposta il doppio dell\'aria: si compra lunedì, e il montaggio sulla tavoletta si fa mercoledì con le sue misure.',
    ] },
    { data: '2026-10-17', testo: [
      'Quasi quattro ore di lavoro: il tappo con il sensore è finito e verificato. La colla ha fatto presa e il sensore, collegato alla scheda, misura bene.',
      'Sui fili del sensore sono stati saldati dei piccoli connettori rigidi, così si collegano alla scheda senza rovinarla. Ogni filo è stato controllato con il multimetro.',
      'Spingendo l\'aria con la siringa la pressione sale come previsto dai calcoli e si mantiene per minuti: ieri, senza colla, spariva in mezzo secondo.',
      'Inclinando la bottiglia piena oltre i 45 gradi, l\'acqua resta a circa 3 cm dal sensore.',
      'Preparato e sigillato il tappo della seconda bottiglia, quella dell\'aria in più; un filo tirato per sbaglio ha insegnato a fissare il cavo al tavolo.',
    ] },
    { data: '2026-10-16', testo: [
      'Cinque ore di lavoro: il sensore di pressione nel tappo ora funziona e vede la pressione dentro la bottiglia (stringendola si arriva a 2,5 kPa).',
      'Con il multimetro si è visto che il primo sensore si era guastato, quasi certamente per il calore delle saldature ripetute: è stato sostituito con uno nuovo, saldato al primo colpo.',
      'Il tappo è stato sigillato con la colla epossidica, in due strati; domani la verifica a colla indurita.',
      'Le pipette per il palombaro sono in ritardo: arrivano lunedì 19. Il fine settimana si usa per le attività che non ne hanno bisogno.',
    ] },
    { data: '2026-10-15', testo: [
      'Giornata lunga, 8 ore e mezza: tappo della bottiglia forato per i fili e per il tubo dell\'aria, che entra stretto e non perde.',
      'Imparato a saldare da zero (tre ore di prove su pezzi di scarto), poi saldati i 4 fili sul sensore di pressione vero.',
      'Il sensore nel tappo non risponde ancora. Una saldatura difettosa è stata trovata e rifatta; resta da provare un collegamento che potrebbe mancare, altrimenti si cambia il sensore.',
      'I contagocce di vetro non passano dal collo della bottiglia: ordinate pipette di plastica da 3 ml, arrivano il 16. Bilancino controllato con le monete: affidabile a ±0,02 g.',
    ] },
    { data: '2026-10-12', testo: [
      'Primo giro di acquisti in farmacia e ferramenta.',
      'Bottiglie e vaschetta di contenimento già in casa; il bilancino è arrivato in anticipo.',
    ] },
    { data: '2026-10-10', testo: [
      'Ambiente di lavoro pronto con quattro giorni di anticipo: l\'iPhone fa da telecamera a circa 30 fotogrammi al secondo, il programma per la scheda compila, MATLAB e Simulink funzionano.',
    ] },
    { data: '2026-10-09', testo: ['Ordinati online i componenti elettronici: schede, motori, sensori, alimentatore.'] },
    { data: '2026-10-08', testo: ['Il professore approva il progetto per email, senza modifiche.'] },
  ],

  prossimi: [
    'Lunedì 26 – martedì 27: postazione di ripresa con la telecamera (con un nastro di livello di un altro colore, per non confonderlo con il marcatore rosso del palombaro).',
    'Martedì 27 – venerdì 30: riconoscimento del palombaro nel video.',
    'Venerdì 30 – lunedì 2: calibrazione della misura della quota e regole di dialogo tra computer e scheda.',
  ],

  rischi: [
    { titolo: 'Più ore del previsto per ogni attività', livello: 'alto',
      nota: 'Il tappo con il sensore ha richiesto circa 15 ore contro le 3 previste. Il 18 elettronica e prova di tenuta hanno richiesto meno delle ore stimate, ma il 19 il palombaro ne ha prese più di 5 contro le 3 previste per tutta la sottofase, e il 21 il guasto del sensore un\'ora e venti. Togliendo le ore una tantum la fine prevista è il 4 gennaio, oltre la scadenza del professore (31 dicembre): ritardo di circa 3 giorni. Si prosegue con il piano originale.' },
    { titolo: 'La siringa cambia la pressione meno del necessario', livello: 'basso',
      nota: 'Con il motore montato la siringa dà 2,6 kPa (misurato il 23, dopo 50 ml d\'acqua in più nella bottiglia), sopra i 2,5 richiesti.' },
    { titolo: 'Meccanica del motore imprecisa', livello: 'basso',
      nota: 'Misurato il 23: la pressione torna allo stesso valore entro un centesimo di kPa, quindi il piano B (motore passo-passo con vite) non serve secondo il criterio del piano. Resta un gioco di circa 10 gradi a ogni cambio di direzione, da compensare nel programma.' },
    { titolo: 'Palombaro difficile da tarare', livello: 'basso',
      nota: 'Tarato e verificato con il motore il 23. Il suo punto di equilibrio però cambia di giorno in giorno (meteo, temperatura, aria che si scioglie nell\'acqua): il programma dovrà ritrovarlo a ogni avvio.' },
    { titolo: 'Umidità e contatti del sensore di pressione', livello: 'medio',
      nota: 'Il 21 la condensa, il 24 un contatto mosso avvitando il tappo: entrambi risolti in pochi minuti, e ora sia la scheda sia la dashboard avvisano subito. Lo smalto protettivo si mette quando il banco è finito. La tenuta della bottiglia è scesa dal 93 al 79 % dopo 10 minuti: ancora sopra il 70 % richiesto.' },
  ],
});
