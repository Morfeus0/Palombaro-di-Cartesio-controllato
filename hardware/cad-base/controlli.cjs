// Controlli di progetto oltre la mesh: viteria nei fori, accessi, lunghezze delle viti
// e tenuta agli errori di misura. Ogni controllo fallito interrompe l'esportazione.
const m = require('@jscad/modeling');
const M = require('./modello.cjs');
const { q } = M;
const SOGLIA_MM3 = 0.01;

// Intervalli entro cui il progetto deve funzionare anche se il pezzo reale differisce
// dalla quota usata: misure prese con il righello, quote nominali dello schema, ipotesi.
const CAMPI = {
  servo_lunghezza: [39.5, 41], servo_larghezza: [19, 20.6], quota_alette: [28, 32],
  alette_spessore: [2, 3], interasse_lungo: [47, 48], interasse_corto: [9, 10],
  // Passacavo: dallo schema sporge oltre 5 mm fra 3,5 e 7 mm dal fondo; il cavo misurato esce a 8 mm.
  foro_aletta_minimo: 4, passacavo_largo: 4.6, passacavo_da_fondo: [3, 10], filetto_in_pla_minimo: 8,
  siringa_diametro: [20.3, 21.7], flangia_larga: [36.5, 39], flangia_spessa: [1.5, 2.5],
  stelo_largo_massimo: 19,
  errori_catena: { raggio: 1, biella: 1.5, asta_zero: 1, perno_da_disco: 1.5, asse_servo: 0.75, montaggio: 0.5 },
  lunghezze_m3_commerciali: [8, 10, 12, 16, 20, 25, 30],
};

function volumeComune(a, b) {
  const aa = m.measurements.measureBoundingBox(a), bb = m.measurements.measureBoundingBox(b);
  if ([0, 1, 2].some(i => aa[1][i] <= bb[0][i] + 1e-9 || bb[1][i] <= aa[0][i] + 1e-9)) return 0;
  const volume = Math.abs(m.measurements.measureVolume(m.booleans.intersect(a, b)));
  if (!Number.isFinite(volume)) throw new Error('Volume di intersezione non calcolabile');
  return volume;
}

function controlliStatici(gruppo) {
  const forme = Object.fromEntries(gruppo.riferimenti.map(r => [r.nome, r.forma]));
  const fissi = ['servo-reale', 'uscita-cavo-riferimento', 'cilindro-siringa-reale', 'viteria-m3-riferimento'];
  const coppie = [];
  const prova = (a, b, formaA, formaB) => {
    const volume = volumeComune(formaA, formaB);
    if (volume > SOGLIA_MM3) throw new Error(`Interferenza ${a} / ${b}: ${volume.toFixed(3)} mm³`);
    coppie.push(`${a} / ${b}`);
  };
  const S = gruppo.supporti;
  for (let i = 0; i < S.length; i++) {
    for (let j = i + 1; j < S.length; j++) prova(S[i].nome, S[j].nome, S[i].forma, S[j].forma);
    for (const nome of fissi) prova(S[i].nome, nome, S[i].forma, forme[nome]);
  }
  // Testa e cacciavite delle viti da legno: liberi con base e piastra montate.
  const basi = S.filter(p => ['base-servo', 'base-siringa', 'piastra-giunzione'].includes(p.nome));
  for (const [i, accesso] of M.accessiLegno(gruppo.d).entries()) {
    for (const p of basi) prova(`accesso vite legno ${i + 1}`, p.nome, accesso, p.forma);
  }
  // Calando il servo con le misure massime, corpo e passacavo non devono toccare nulla.
  const baseServo = S.find(p => p.nome === 'base-servo');
  const massimi = { lunghezza: CAMPI.servo_lunghezza[1], larghezza: CAMPI.servo_larghezza[1],
    quota_alette: CAMPI.quota_alette[1], passacavo_largo: CAMPI.passacavo_largo,
    passacavo_da_fondo: CAMPI.passacavo_da_fondo };
  for (const p of M.percorsiMontaggio(gruppo.d, massimi)) prova(p.nome, 'base-servo', p.forma, baseServo.forma);
  // Prova di controllo: una viteria spostata di 1,2 mm DEVE risultare in interferenza.
  const spostata = m.transforms.translate([0, 1.2, 0], forme['viteria-m3-riferimento']);
  const rilevato = S.reduce((somma, p) => somma + volumeComune(p.forma, spostata), 0);
  if (rilevato < 1) throw new Error('Il controllo della viteria non rileva un errore voluto');
  return { coppie_verificate: coppie.length, soglia_mm3: SOGLIA_MM3,
    prova_di_controllo_mm3: +rilevato.toFixed(1), esito: 'Nessuna interferenza; errore voluto rilevato' };
}

// Per ogni giunto: lunghezza minima (dado preso per intero) e massima (la punta non urta né sporge).
function lunghezzeViti(d) {
  const mo = q.montaggio, v = q.viteria, T = q.base.spessore, C = CAMPI;
  const giocoCoperchio = D => (D - q.siringa.diametro) / Math.SQRT2 + D / 2 - mo.coperchio_luce;
  const giunti = {
    servo: { min: v.rondella + C.alette_spessore[1] + C.filetto_in_pla_minimo,
      max: v.rondella + C.alette_spessore[0] + d.zSede - (T + mo.foro_servo_fondo) },
    coperchi: { min: v.rondella + mo.coperchio_orecchia + giocoCoperchio(C.siringa_diametro[1]) + mo.tetto_dado + v.dado_alto,
      max: mo.coperchio_orecchia + 25 },
    flangia: { min: v.rondella + mo.fermo_spesso + C.flangia_spessa[1] + mo.tetto_dado + v.dado_alto,
      max: mo.fermo_spesso + C.flangia_spessa[0] + mo.testata_spessa },
    giunzione: { min: v.rondella + mo.giunto_spesso + T - mo.incasso_dado_giunto + v.dado_alto,
      max: mo.giunto_spesso + T },
  };
  for (const [nome, g] of Object.entries(giunti)) {
    if (v.lunghezza < g.min || v.lunghezza > g.max) {
      throw new Error(`Vite M3×${v.lunghezza} non adatta a ${nome}: serve ${g.min.toFixed(1)}–${g.max.toFixed(1)} mm`);
    }
  }
  const adatte = C.lunghezze_m3_commerciali.filter(L => Object.values(giunti).every(g => L >= g.min && L <= g.max));
  return { scelta: v.lunghezza, quantita: 16, giunti, lunghezze_commerciali_valide_per_tutti: adatte };
}

function pernoX(comando, raggio, biella, d) {
  const phi = (90 + comando - q.cinematica.centro) * Math.PI / 180;
  const dy = d.servoY + raggio * Math.sin(phi) - d.yPerno;
  return raggio * Math.cos(phi) - Math.sqrt(biella ** 2 - dy ** 2);
}

// Corsa ai due estremi con tutti gli errori della catena sommati nel verso peggiore.
function catenaCinematica(d) {
  const c = q.cinematica, e = CAMPI.errori_catena;
  const lineari = e.asta_zero + e.perno_da_disco + e.asse_servo + e.montaggio;
  let minima = Infinity, massima = -Infinity;
  for (const dr of [-e.raggio, e.raggio]) for (const db of [-e.biella, e.biella]) {
    for (const comando of [c.minimo, c.massimo]) {
      const corsa = pernoX(comando, c.raggio + dr, c.biella + db, d) + q.ipotesi.perno_da_disco
        - d.flangiaX - q.siringa.asta_zero;
      minima = Math.min(minima, corsa - lineari);
      massima = Math.max(massima, corsa + lineari);
    }
  }
  return { minima, massima };
}

function tolleranze(d) {
  const mo = q.montaggio, v = q.viteria, T = q.base.spessore, C = CAMPI, voci = [];
  const voce = (nome, campo, margine, richiesto, unita = 'mm') => {
    voci.push({ nome, campo_ammesso: campo, margine_minimo: +margine.toFixed(2), richiesto, unita });
    if (margine < richiesto) throw new Error(`Tolleranza non rispettata: ${nome} (${margine.toFixed(2)} < ${richiesto})`);
  };
  const gioco = (sede, campo) => (sede - campo[1]) / 2;
  voce('Gioco per lato sulla lunghezza del servo', C.servo_lunghezza,
    gioco(q.servo.lunghezza + 2 * mo.gioco_servo_per_lato, C.servo_lunghezza), 0.2);
  voce('Gioco per lato sulla larghezza del servo', C.servo_larghezza,
    gioco(q.servo.larghezza + 2 * mo.gioco_servo_per_lato, C.servo_larghezza), 0.2);
  voce('Vuoto sotto il servo appeso alle alette', C.quota_alette,
    mo.sede_alette + mo.incasso_fondo - C.quota_alette[1], 0.5);
  // Fori autofilettanti in posizione fissa: l'unico recupero è il gioco della vite nel foro dell'aletta.
  const recupero = (C.foro_aletta_minimo - v.gambo) / 2;
  const scarto = (campo, nominale) => Math.max(...campo.map(s => Math.abs(s - nominale))) / 2;
  voce('Interasse lungo dei fori recuperato dal gioco nei fori delle alette', C.interasse_lungo,
    recupero - scarto(C.interasse_lungo, q.ipotesi.interasse_fori_lungo), 0);
  voce('Interasse corto dei fori recuperato dal gioco nei fori delle alette', C.interasse_corto,
    recupero - scarto(C.interasse_corto, q.ipotesi.interasse_fori_corto), 0);
  const vite = M.vitiServo(d).find(p => p.segno > 0);
  const pareteSede = d.servoX + q.servo.lunghezza / 2 + mo.gioco_servo_per_lato;
  voce('Parete fra filetto della vite del servo e sede del servo', [], vite.x - v.gambo / 2 - pareteSede, 1);
  voce('Parete fra filetto della vite del servo e fessura del cavo', [],
    Math.abs(vite.y - d.servoY) - v.gambo / 2 - mo.fessura_cavo / 2, 0.6);
  voce('Passacavo nella fessura del pilastrino', [0, C.passacavo_largo], (mo.fessura_cavo - C.passacavo_largo) / 2, 0.2);
  const stringe = D => (D - q.siringa.diametro) / Math.SQRT2 + D / 2 - mo.coperchio_luce;
  voce('Il coperchio stringe ancora il cilindro più piccolo', C.siringa_diametro, stringe(C.siringa_diametro[0]), 0.3);
  voce('Gioco radiale del cilindro più grande nella testata', C.siringa_diametro,
    (q.siringa.diametro + mo.gioco_cilindro - C.siringa_diametro[1]) / 2, 0.25);
  voce('Flangia più larga libera dalle viti', C.flangia_larga,
    mo.vite_flangia_dy - mo.foro_m3 / 2 - C.flangia_larga[1] / 2, 0.5);
  voce('Stelo dello stantuffo nell’asola del fermo', [0, C.stelo_largo_massimo],
    (mo.asola_stelo - C.stelo_largo_massimo) / 2, 0.4);
  const catena = catenaCinematica(d);
  voce('Corsa minima con tutti gli errori sommati (lo stantuffo non batte a 0 ml)', C.errori_catena, catena.minima, 0.3);
  voce('Corsa massima con tutti gli errori sommati (oltre i 20 ml al più 3 mm)', C.errori_catena,
    q.siringa.corsa + 3 - catena.massima, 0);
  return { voci, esito: `${voci.length} voci verificate` };
}

module.exports = { CAMPI, volumeComune, controlliStatici, lunghezzeViti, tolleranze };
