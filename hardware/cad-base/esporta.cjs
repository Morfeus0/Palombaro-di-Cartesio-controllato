// Genera la bozza e controlla geometria e ingombri. Gli STL restano nella cartella BOZZA.
const fs = require('node:fs');
const path = require('node:path');
const m = require('@jscad/modeling');
const { triangola, verifica, stlBinario } = require('./mesh.cjs');
const { componenti, cinematica, q } = require('./modello.cjs');
const { CAMPI, volumeComune, controlliStatici, lunghezzeViti, tolleranze } = require('./controlli.cjs');
const out = path.join(__dirname, `bozza-${q.revisione}`);
fs.mkdirSync(out, { recursive: true });
const gruppo = componenti();
const report = { revisione: q.revisione, stato: 'VERIFICATA SUL MODELLO con le misure del 13 novembre — anteprima nello slicer a cura di chi stampa',
  quote: q, coordinate: gruppo.d, pezzi: [], cinematica: [], assunzioni: q.ipotesi };
const scena = [];
const fileDaScrivere = [];

function controllaIntersezione(a, b) {
  const volume = volumeComune(a.forma, b.forma);
  if (volume > 0.01) throw new Error(`Interferenza ${a.nome} / ${b.nome}: ${volume} mm³`);
  return true;
}

// Prima di tutto i controlli di progetto: se uno fallisce non si scrive alcun file.
report.controlli_statici = controlliStatici(gruppo);
report.viti = lunghezzeViti(gruppo.d);
report.tolleranze = tolleranze(gruppo.d);
report.campi_di_misura_ammessi = CAMPI;

for (const p of gruppo.supporti) {
  const forma = triangola(p.forma);
  verifica(forma);
  const bb = m.measurements.measureBoundingBox(forma);
  const centro = bb[0].map((v, i) => (v + bb[1][i]) / 2);
  // Basi e piastra sul fondo; coperchi e fermo coricati sul profilo: nessuno sbalzo,
  // e gli strati lavorano nel piano in cui il pezzo flette.
  let stampa = m.transforms.translate(centro.map(v => -v), forma);
  if (p.nome.startsWith('coperchio') || p.nome === 'fermo-flangia') {
    stampa = m.transforms.rotateY(Math.PI / 2, stampa);
  }
  const pb = m.measurements.measureBoundingBox(stampa);
  stampa = m.transforms.translate([0, 0, -pb[0][2]], stampa);
  const sb = m.measurements.measureBoundingBox(stampa);
  const misura = sb[0].map((v, i) => sb[1][i] - v);
  const r = Math.max(...m.geometries.geom3.toPolygons(stampa).flatMap(f => f.vertices.map(v => Math.hypot(v[0], v[1]))));
  const volume = m.measurements.measureVolume(forma);
  if (volume <= 0 || !Number.isFinite(volume)) throw new Error(`Volume non valido: ${p.nome}`);
  if (r > q.stampa.diametro / 2 - q.stampa.margine_radiale || misura[2] > q.stampa.altezza) {
    throw new Error(`Pezzo fuori dal volume di stampa: ${p.nome}`);
  }
  const raw = stlBinario(stampa);
  fileDaScrivere.push([`BOZZA-${p.nome}.stl`, raw.dati]);
  report.pezzi.push({ nome: p.nome, ingombro_stampa_mm: misura, raggio_stampa_mm: r,
    volume_mm3: volume, mesh_verificata: true, ...raw.controllo });
  scena.push({ nome: p.nome, stampato: true, colore: p.colore, poligoni: m.geometries.geom3.toPolygons(forma).map(f => f.vertices) });
}
for (const p of gruppo.riferimenti) {
  scena.push({ nome: p.nome, stampato: false, colore: p.colore, poligoni: m.geometries.geom3.toPolygons(triangola(p.forma)).map(f => f.vertices) });
}
let intersezioniCalcolate = 0;
for (let comando = q.cinematica.minimo; comando <= q.cinematica.massimo; comando += 1) {
  const k = cinematica(comando);
  if (k.corsa < 0 || k.corsa > q.siringa.corsa) throw new Error(`Stantuffo oltre corsa a ${comando}°`);
  const biella = Math.hypot(...k.punta.map((v, i) => v - k.perno[i]));
  if (Math.abs(biella - q.cinematica.biella) > 1e-7) throw new Error('Lunghezza biella incoerente');
  const obliquita = Math.atan2(k.punta[1] - k.perno[1], k.punta[0] - k.perno[0]) * 180 / Math.PI;
  if (q.cinematica.allineata_al_centro && comando === q.cinematica.centro && Math.abs(obliquita) > 1e-7) {
    throw new Error('Asticella non parallela allo scorrimento al centro');
  }
  report.cinematica.push({ comando, corsa_mm: k.corsa, ml: k.ml, obliquita_gradi: obliquita });
  const posa = comando === q.cinematica.centro ? gruppo : componenti(comando);
  const mobili = posa.riferimenti.filter(p => ['braccio-r35-riferimento', 'asticella-l110-riferimento', 'stantuffo-reale'].includes(p.nome));
  const viteria = gruppo.riferimenti.find(p => p.nome === 'viteria-m3-riferimento');
  for (const mobile of mobili) for (const fisso of [...gruppo.supporti, viteria]) {
    if (controllaIntersezione(mobile, fisso)) intersezioniCalcolate++;
  }
  const geometriaBiella = mobili.find(p => p.nome === 'asticella-l110-riferimento');
  for (const altro of mobili.filter(p => p !== geometriaBiella)) {
    if (controllaIntersezione(geometriaBiella, altro)) intersezioniCalcolate++;
  }
}
report.collisioni = { posizioni: report.cinematica.length, intersezioni_calcolate: intersezioniCalcolate,
  tolleranza_volume_mm3: 0.01, esito: 'Nessuna intersezione oltre soglia',
  oggetti: 'Braccio, asticella con terminali e stantuffo contro supporti e viteria; asticella contro braccio e stantuffo.' };
report.limiti = ['Nessun collaudo meccanico o di resistenza del PLA effettuato.',
  'Le tolleranze verificano che il progetto regga gli errori di misura entro i campi dichiarati, non oltre.',
  'Misure del servo prese con il righello il 13 novembre: valgono entro i campi di tolleranza dichiarati.',
  'Altezza del braccio misurata fra 8 e 14 mm sopra la scatola: asse della siringa posto a metà di quel campo.',
  'Le collisioni sono controllate ogni grado sui riferimenti semplificati; tubo e geometria reale dei ganci non sono rappresentati.',
  'Ritegni dei ganci e fissaggio rigido della prolunga del braccio ancora da definire.',
  'Preparazione nello slicer (riempimento, pareti, brim) da concordare con il professore.'];
fileDaScrivere.push(['scena.json', JSON.stringify(scena)], ['verifica.json', JSON.stringify(report, null, 2)]);
// Tutti i controlli geometrici e cinematici finiscono prima di aggiornare i file.
for (const [nome, dati] of fileDaScrivere) fs.writeFileSync(path.join(out, nome), dati);
console.log(JSON.stringify({ stato: report.stato, base_mm: [gruppo.d.xMax - gruppo.d.xMin, q.base.larghezza],
  pezzi: report.pezzi.map(p => ({ nome: p.nome, ingombro: p.ingombro_stampa_mm.map(v => +v.toFixed(2)),
    raggio: +p.raggio_stampa_mm.toFixed(2) })), corsa_ml: [report.cinematica.at(-1).ml, report.cinematica[0].ml] }, null, 2));
