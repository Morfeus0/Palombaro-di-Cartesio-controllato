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
  aggiornato: '2026-10-17',
  provvisorio: false, // true finché le stime non sono confrontate con il diario della sera
  consegna: '2026-12-13',
  scadenzaProf: '2026-12-31',
  oreAlGiorno: 2, // media dichiarata, tutti i giorni: base del prospetto di fine progetto

  sintesi: 'Il tappo con il sensore di pressione è finito: la colla ha fatto presa, il sensore risponde e anche con la bottiglia molto inclinata l\'acqua resta a 3 cm di distanza. Una prima prova con la siringa mostra che il tappo ora trattiene la pressione per minuti, non più per frazioni di secondo. È pronto anche il tappo della seconda bottiglia, quella dell\'aria in più: la colla indurisce stanotte. Il calendario regge: domani elettronica e prova di tenuta, lunedì arrivano le pipette per il palombaro. Le ore invece restano il punto debole: chiudere il tappo ha richiesto 2 ore e un quarto contro l\'ora prevista, e la sottofase è arrivata a 15 ore contro 3. Anche togliendo le ore che non si ripeteranno, a questo ritmo e con 2 ore al giorno si finirebbe verso fine gennaio: per stare entro il 31 dicembre servono circa 3 ore e mezza al giorno, oppure un lavoro più veloce nelle prossime attività.',

  fasi: [
    {
      id: 'F0', nome: 'Approvazione e ordine',
      milestone: { id: 'M0', titolo: 'Progetto approvato e componenti ordinati',
        descrizione: 'Il professore approva l\'idea e arriva tutto il materiale necessario.' },
      sottofasi: [
        { id: '0.1', nome: 'Preparare la presentazione al professore', da: '2026-10-08', a: '2026-10-11', ore: 1.5, fatto: 100, nota: 'Proposta e sito inviati per email l\'8 ottobre.' },
        { id: '0.2', nome: 'Preparare la lista dei componenti', da: '2026-10-08', a: '2026-10-11', ore: 1.5, fatto: 100 },
        { id: '0.3', nome: 'Approvazione del professore', da: '2026-10-12', a: '2026-10-12', ore: 1, fatto: 100, nota: 'Approvato per email l\'8 ottobre, senza modifiche.' },
        { id: '0.4', nome: 'Ordinare e comprare i componenti', da: '2026-10-12', a: '2026-10-13', ore: 1, fatto: 95, nota: 'Tutto disponibile tranne le pipette, in ritardo: arrivano lunedì 19.' },
        { id: '0.5', nome: 'Rivedere il piano', da: '2026-10-12', a: '2026-10-13', ore: 1, fatto: 0, saltata: true, nota: 'Non serviva: nessuna modifica richiesta.' },
      ],
    },
    {
      id: 'F1', nome: 'Costruzione del banco',
      milestone: { id: 'M1', titolo: 'Il palombaro si muove con la siringa comandata dal motore',
        descrizione: 'Bottiglia, siringa, motore ed elettronica montati e funzionanti insieme.' },
      sottofasi: [
        { id: '1.1', nome: 'Ambiente di lavoro e programmi', da: '2026-10-12', a: '2026-10-14', ore: 2.5, fatto: 100, oreEffettive: 1, nota: 'Chiusa il 10 ottobre in un\'ora: iPhone come telecamera a circa 30 fps.' },
        { id: '1.2', nome: 'Costruire e tarare il palombaro', da: '2026-10-13', a: '2026-10-20', ore: 3, fatto: 15, oreEffettive: 0.75, nota: 'Bilancino verificato; i contagocce non passavano dal collo della bottiglia. Le pipette sono in ritardo: arrivano lunedì 19.' },
        { id: '1.3', nome: 'Tappo con il sensore di pressione', da: '2026-10-15', a: '2026-10-17', ore: 3, fatto: 100, oreEffettive: 15.15, oreUnaTantum: 4.5, nota: 'Chiusa il 17 ottobre: colla indurita, fili controllati con il multimetro, sensore asciutto anche con la bottiglia inclinata a 50°.' },
        { id: '1.4', nome: 'Circuito dell\'aria', da: '2026-10-17', a: '2026-10-19', ore: 2, fatto: 40, oreEffettive: 1.67, nota: 'Tappo della seconda bottiglia forato, tubi montati e sigillati con la colla. Mancano la prova con la siringa a colla indurita e, lunedì, il palombaro.' },
        { id: '1.5', nome: 'Elettronica minima', da: '2026-10-18', a: '2026-10-18', ore: 3, fatto: 15, nota: 'Il sensore è già collegato alla scheda con connettori solidi e viene letto; mancano il motore e la misura della velocità di lettura.' },
        { id: '1.6', nome: 'Prova di tenuta della bottiglia', da: '2026-10-18', a: '2026-10-18', ore: 1.5, fatto: 0, nota: 'Prima prova indicativa: la pressione si mantiene per almeno 10 minuti; ne servono 30. La prova vera è domenica.' },
        { id: '1.7', nome: 'Meccanica motore e siringa', da: '2026-10-17', a: '2026-10-22', ore: 3, fatto: 0 },
        { id: '1.8', nome: 'Prova d\'insieme e video', da: '2026-10-24', a: '2026-10-25', ore: 2, fatto: 0 },
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
  ],

  diario: [
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
    'Domenica 18: prova della siringa con le due bottiglie, misura dei volumi d\'aria, elettronica minima (scheda, motore e sensore insieme) e prova di tenuta della bottiglia.',
    'Lunedì 19: arrivano le pipette, si costruiscono i palombari e si chiude il circuito dell\'aria.',
    'Martedì 20: taratura fine dei palombari.',
  ],

  rischi: [
    { titolo: 'Più ore del previsto per ogni attività', livello: 'alto',
      nota: 'Il tappo con il sensore ha richiesto circa 15 ore contro le 3 previste, di cui circa 4 e mezza per imparare a saldare e per il primo sensore guasto. Anche la chiusura di oggi ha richiesto il doppio della stima. Il ritmo va recuperato nelle prossime attività: vedi il prospetto di fine progetto.' },
    { titolo: 'Tenuta del tappo da verificare', livello: 'medio',
      nota: 'Prima prova incoraggiante: la pressione si mantiene per almeno 10 minuti (prima della colla, mezzo secondo). Ne servono 30: lo dirà la prova di domenica, che coinvolge anche il secondo tappo. Piano B: una dose di colla in più o un tappo nuovo.' },
    { titolo: 'Palombaro difficile da tarare', livello: 'medio',
      nota: 'Le pipette arrivano lunedì 19 invece che venerdì: la costruzione dei palombari si sposta a lunedì e martedì.' },
  ],
});
