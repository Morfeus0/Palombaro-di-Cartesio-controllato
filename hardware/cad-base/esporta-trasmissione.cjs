// Genera e verifica la trasmissione T01 (trasmissione.cjs). Se un controllo fallisce non scrive alcun file.
// Uscita: trasmissione-T01/ (STL, scena.json, verifica.json) e da-stampare-trasmissione/ (file per il professore).
const fs = require('node:fs');
const path = require('node:path');
const m = require('@jscad/modeling');
const { triangola, verifica, stlBinario } = require('./mesh.cjs');
const M = require('./modello.cjs');
const T = require('./trasmissione.cjs');
const { volumeComune } = require('./controlli.cjs');
const { q } = M;

const SOGLIA_MM3 = 0.01;
const out = path.join(__dirname, `trasmissione-${T.t.revisione}`);
const consegna = path.join(__dirname, 'da-stampare-trasmissione');
const L = T.lunghezzaBiella();
const base = M.componenti(q.cinematica.centro);
const fissi = [...base.supporti,
  ...base.riferimenti.filter(r => ['servo-reale', 'cilindro-siringa-reale', 'viteria-m3-riferimento'].includes(r.nome))];

function mobili(comando) {
  const P = T.posa(comando);
  const R = T.riferimentiMobili(P);
  const vecchio = M.componenti(comando).riferimenti.find(r => r.nome === 'stantuffo-reale').forma;
  const dx = P.k.discoX - M.cinematica(comando).discoX;
  return { P, pezzi: [
    { nome: 'braccio', forma: P.braccio }, { nome: 'biella', forma: P.biella }, { nome: 'pinza', forma: P.pinza },
    { nome: 'perni', forma: R.perni }, { nome: 'viti-registro', forma: R.registro },
    { nome: 'squadretta', forma: R.squadretta },
    { nome: 'stantuffo', forma: m.transforms.translate([dx, 0, 0], vecchio) }] };
}

// Coppie che si toccano per costruzione (vite autofilettante nel suo foro, stelo dentro il cilindro):
// escluse dal controllo, come in esporta.cjs.
const ESCLUSE = new Set(['viti-registro|pinza', 'pinza|viti-registro', 'stantuffo|cilindro-siringa-reale']);
function controlla(a, b, comando) {
  if (ESCLUSE.has(`${a.nome}|${b.nome}`)) return 0;
  const v = volumeComune(a.forma, b.forma);
  if (v > SOGLIA_MM3) throw new Error(`Interferenza a ${comando}°: ${a.nome} / ${b.nome}: ${v.toFixed(3)} mm³`);
  return 1;
}

const report = { revisione: T.t.revisione, base: `revisione ${q.revisione} (invariata)`, quote: T.t,
  biella_interasse_mm: L, quote_verticali: (({ d, ...resto }) => resto)(T.quote()), cinematica: [], pezzi: [] };

// 1. Cinematica e collisioni a ogni grado.
let coppie = 0;
for (let c = q.cinematica.minimo; c <= q.cinematica.massimo; c += 1) {
  const { P, pezzi } = mobili(c);
  if (P.k.corsa < 0 || P.k.corsa > q.siringa.corsa) throw new Error(`Stantuffo oltre corsa a ${c}°`);
  const ml03 = M.cinematica(c).ml;
  report.cinematica.push({ comando: c, ml: +P.k.ml.toFixed(3), ml_revisione_03: +ml03.toFixed(3),
    corsa_mm: +P.k.corsa.toFixed(3), obliquita_gradi: +P.k.obliquita.toFixed(2) });
  for (const a of pezzi) for (const f of fissi) coppie += controlla(a, f, c);
  for (let i = 0; i < pezzi.length; i++) for (let j = i + 1; j < pezzi.length; j++) coppie += controlla(pezzi[i], pezzi[j], c);
}
const corse = report.cinematica.map(r => r.corsa_mm), obl = report.cinematica.map(r => Math.abs(r.obliquita_gradi));
report.collisioni = { posizioni: report.cinematica.length, coppie_controllate: coppie, soglia_mm3: SOGLIA_MM3,
  esito: 'nessuna interferenza', margini_fine_corsa_mm: [Math.min(...corse), q.siringa.corsa - Math.max(...corse)],
  obliquita_massima_gradi: Math.max(...obl),
  differenza_massima_ml_dalla_03: Math.max(...report.cinematica.map(r => Math.abs(r.ml - r.ml_revisione_03))) };

// 2. Pezzi stampabili: mesh chiusa, piatto Ø200, orientamento senza supporti.
const centro = T.posa(q.cinematica.centro);
const daStampare = [
  { nome: 'braccio', forma: centro.braccio, capovolgi: true },   // faccia superiore sul piatto: tasca verso l'alto
  { nome: 'biella', forma: centro.biella, capovolgi: false },
  { nome: 'pinza-stantuffo', forma: centro.pinza, capovolgi: false }, // base piatta sotto, sede aperta in basso
];
const file = [];
for (const p of daStampare) {
  const forma = triangola(p.forma);
  verifica(forma);
  const b0 = m.measurements.measureBoundingBox(forma);
  let s = m.transforms.translate(b0[0].map((v, i) => -(v + b0[1][i]) / 2), forma);
  if (p.capovolgi) s = m.transforms.rotateX(Math.PI, s);
  const b1 = m.measurements.measureBoundingBox(s);
  s = m.transforms.translate([0, 0, -b1[0][2]], s);
  const b2 = m.measurements.measureBoundingBox(s);
  const ingombro = b2[0].map((v, i) => +(b2[1][i] - v).toFixed(2));
  const raggio = Math.max(...m.geometries.geom3.toPolygons(s).flatMap(f => f.vertices.map(v => Math.hypot(v[0], v[1]))));
  if (raggio > q.stampa.diametro / 2 - q.stampa.margine_radiale) throw new Error(`${p.nome} fuori dal piatto`);
  const volume = m.measurements.measureVolume(forma);
  const raw = stlBinario(s);
  file.push([`palombaro-${p.nome}.stl`, raw.dati]);
  report.pezzi.push({ nome: p.nome, ingombro_stampa_mm: ingombro, raggio_stampa_mm: +raggio.toFixed(2),
    volume_cm3: +(volume / 1000).toFixed(2), mesh_verificata: true });
}

// 3. Stime di resistenza a mano (PLA 2500 MPa, rottura circa 50 MPa, forza massima sulla biella 30 N).
const F = 30, E_PLA = 2500;
const b = T.t.braccio, bi = T.t.biella;
const larghezzaBraccio = 2 * b.punta_r, spessoreBraccio = T.quote().zA1 - T.quote().zA0;
report.stime = {
  braccio_flessione_MPa: +(6 * F * b.raggio / (spessoreBraccio * larghezzaBraccio ** 2)).toFixed(1),
  biella_carico_critico_N: +(Math.PI ** 2 * E_PLA * (bi.larga * bi.spessa ** 3 / 12) / L ** 2).toFixed(0),
  biella_allungamento_mm: +(F * L / (E_PLA * bi.larga * bi.spessa)).toFixed(4),
  nota: 'Stime a mano, non prove: sezione minima del braccio alla punta, biella incernierata agli estremi.',
};
report.limiti = [
  'Squadretta, spessore del disco e quota della squadretta sono IPOTESI fino alle misure A–F del 19 novembre.',
  'I perni hanno 0,3–0,4 mm di gioco radiale nei fori: circa 0,5° per perno al centro della corsa.',
  'Il gioco degli ingranaggi del servo non si elimina con la stampa.',
  'Collisioni controllate ogni grado su geometrie semplificate; tubo e cavo non rappresentati.',
];

// 4. Scena per le anteprime (pezzi nuovi, base e riferimenti a 86°).
const scena = [];
const aggiungi = (nome, forma, colore, stampato) => scena.push({ nome, stampato, colore,
  poligoni: m.geometries.geom3.toPolygons(triangola(forma)).map(f => f.vertices) });
for (const p of base.supporti) aggiungi(p.nome, p.forma, [0.62, 0.70, 0.76, 0.55], false);
for (const r of fissi.slice(base.supporti.length)) aggiungi(r.nome, r.forma, [0.55, 0.57, 0.6, 0.6], false);
const mob = mobili(q.cinematica.centro).pezzi;
const COLORI = { braccio: [0.85, 0.42, 0.13, 1], biella: [0.85, 0.42, 0.13, 1], pinza: [0.85, 0.42, 0.13, 1],
  perni: [0.3, 0.3, 0.32, 1], 'viti-registro': [0.3, 0.3, 0.32, 1], squadretta: [0.95, 0.95, 0.93, 1],
  stantuffo: [0.78, 0.80, 0.78, 0.9] };
for (const p of mob) aggiungi(p.nome, p.forma, COLORI[p.nome], ['braccio', 'biella', 'pinza'].includes(p.nome));

fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(consegna, { recursive: true });
for (const [nome, dati] of file) {
  fs.writeFileSync(path.join(out, nome), dati);
  fs.writeFileSync(path.join(consegna, nome), dati);
}
fs.writeFileSync(path.join(out, 'scena.json'), JSON.stringify(scena));
fs.writeFileSync(path.join(out, 'verifica.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ biella_mm: +L.toFixed(2), collisioni: report.collisioni, pezzi: report.pezzi,
  stime: report.stime }, null, 2));
