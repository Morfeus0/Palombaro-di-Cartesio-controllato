// TRASMISSIONE T01 (19 novembre 2026): i tre pezzi mobili fra servo e stantuffo, da stampare insieme alla base.
//   - braccio: si avvita dall'alto su una squadretta a doppio braccio ORIGINALE e nuova (niente dentatura stampata);
//   - biella: barra rigida con due perni M3 (al posto dell'asticella di filo con i ganci a Z e a L);
//   - pinza: abbraccia il disco di spinta dello stantuffo sulle due facce, con due viti di registro.
// Non modifica la base della revisione 03 (già inviata): ne riusa coordinate e quote da modello.cjs. La lunghezza
// della biella è scelta perché lo stantuffo percorra esattamente la stessa corsa della revisione 03 (36–146°).
// Quote in mm. Le voci segnate IPOTESI aspettano le misure di Gabriele (lettere A–H del 19 novembre).
const jscad = require('@jscad/modeling');
const { cuboid, cylinder } = jscad.primitives;
const { union, subtract } = jscad.booleans;
const { translate, rotateY, rotateZ } = jscad.transforms;
const { hull } = jscad.hulls;
const M = require('./modello.cjs');
const { q } = M;

const t = {
  revisione: 'T01',
  squadretta: {
    lunga: 37,            // misura del 18 ottobre (calibrazione-servo.md)
    larga_mozzo: 9.5,     // IPOTESI, misura A
    larga_punta: 5.5,     // IPOTESI, misura B
    spessa: 2.5,          // IPOTESI, misura C
    // Faccia inferiore della parte piatta sopra la scatola: 8 mm misurati il 13 novembre sulla prolunga attuale.
    sotto_da_cassa: 8,    // da riconfermare con la misura D
    fori_r: [10.75, 16.75], foro_corto_r: 16.75,  // forellini a 7,75/10,75/13,75/16,75 mm dall'asse (18 ottobre)
  },
  braccio: { raggio: q.cinematica.raggio, sopra_squadretta: 5, tasca_gioco: 0.3, tasca_lascia: 0.5,
    bordo_mozzo: 3, bordo_corto: 2.5, punta_r: 5.5, foro_centrale: 7.5, foro_vite_squadretta: 2.6 },
  biella: { larga: 10, spessa: 5, foro: 3.3 },
  // Perni: vite M3×20 serrata al pezzo fisso con un dado, la biella gira sul gambo, autobloccante sopra non serrato.
  perno: { diam: 3, lunga: 20, testa_alta: 3, testa_diam: 5.6, dado_alto: 2.4, nyloc_alto: 4, rondella: 0.5,
    foro_passante: 3.4, chiave_dado: 5.5 },
  pinza: {
    disco_r: q.siringa.disco / 2,         // Ø28 misurato
    disco_spesso: q.ipotesi.disco_spessore, // IPOTESI 3 mm, misura F: la fessura ne accetta fino a 4,2
    gioco_disco: 0.5,                     // sul raggio
    fessura: 4.5,                         // le viti di registro spingono il disco contro il labbro anteriore
    labbro: 3.5, retro: 5, parete: 2.5,
    apertura_stelo: 20,                   // come l'asola del fermo: passa qualunque stelo che entri nel cilindro
    sotto_asse: 24, larga_sotto: 8, bullone_sotto_asse: 19.5,
    orecchia_lunga: 14, orecchia_larga: 10, orecchia_alta: 7,
    registro_dy: 9, registro_dz: -2, foro_autofilettante: 2.6, svasatura_testa: 7,
  },
};

const E = 0.01;
const bb = (x0, x1, y0, y1, z0, z1) => cuboid({
  size: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)],
  center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
const cilZ = (r, x, y, z0, z1, segments = 40) => cylinder({
  radius: r, height: Math.abs(z1 - z0), center: [x, y, (z0 + z1) / 2], segments });
const cilX = (r, x0, x1, y, z, segments = 48) => translate([(x0 + x1) / 2, y, z],
  rotateY(Math.PI / 2, cylinder({ radius: r, height: Math.abs(x1 - x0), segments })));

// ---- Quote verticali: tutte riferite alla faccia superiore della scatola del servo ----
function quote() {
  const d = M.coordinate();
  const s = t.squadretta, b = t.braccio, p = t.perno;
  const zSqSotto = d.zCassa + s.sotto_da_cassa;
  const zSqSopra = zSqSotto + s.spessa;
  const zA0 = zSqSotto + b.tasca_lascia;              // il braccio non tocca la faccia inferiore della squadretta
  const zA1 = zSqSopra + b.sopra_squadretta;
  const zB0 = zA1 + p.dado_alto + p.rondella;         // dado di serraggio e rondella sopra il pezzo fisso
  const zB1 = zB0 + t.biella.spessa;
  const zL1 = zA1, zL0 = zL1 - t.pinza.orecchia_alta;   // orecchia della pinza alla stessa quota del braccio
  return { d, zSqSotto, zSqSopra, zA0, zA1, zB0, zB1, zL0, zL1, asse: d.z };
}

// Distanza fra la faccia anteriore del disco (verso il cilindro) e l'asse del perno della pinza.
const pernoDaDisco = () => t.pinza.fessura + t.pinza.retro + t.pinza.orecchia_lunga / 2;

function puntaBraccio(comando, d) {
  const phi = (90 + comando - q.cinematica.centro) * Math.PI / 180;
  return { phi, x: t.braccio.raggio * Math.cos(phi), y: d.servoY + t.braccio.raggio * Math.sin(phi) };
}
function pernoPinzaX(comando, biella, d) {
  const pt = puntaBraccio(comando, d);
  const r = biella ** 2 - (pt.y - d.ySiringa) ** 2;
  if (r <= 0) throw new Error('La biella non raggiunge l’asse dello stantuffo');
  return pt.x - Math.sqrt(r);
}
// Disco della revisione 03 (perno nella nervatura, 3 mm davanti al disco, 4 mm fuori asse).
function discoRevisione03(comando) { return M.cinematica(comando).discoX; }

// Biella che riproduce la corsa della revisione 03: stessa media dei fine corsa, quindi stessi margini.
function lunghezzaBiella() {
  const d = M.coordinate(), c = q.cinematica, k = pernoDaDisco();
  const obiettivo = (discoRevisione03(c.minimo) + discoRevisione03(c.massimo)) / 2;
  const media = L => (pernoPinzaX(c.minimo, L, d) + pernoPinzaX(c.massimo, L, d)) / 2 - k;
  let a = 60, b = 140;
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2;
    if (media(m) < obiettivo) b = m; else a = m;  // biella più lunga: perno e disco più lontani dal servo (X minore)
  }
  return (a + b) / 2;
}

function cinematicaT(comando, L = lunghezzaBiella()) {
  const z = quote(), d = z.d;
  const pt = puntaBraccio(comando, d);
  const perno = [pernoPinzaX(comando, L, d), d.ySiringa];
  const discoX = perno[0] - pernoDaDisco();
  const corsa = discoX - d.flangiaX - q.siringa.asta_zero;
  const obliquita = Math.atan2(pt.y - perno[1], pt.x - perno[0]) * 180 / Math.PI;
  return { comando, phi: pt.phi, punta: [pt.x, pt.y], perno, discoX, corsa,
    ml: corsa / q.siringa.corsa * q.cinematica.ml_massimi, obliquita, L };
}

// ---- Pezzi stampati, nella posa del comando dato ----
function profiloSquadretta(gioco, z0, z1) {
  const s = t.squadretta, rc = s.larga_mozzo / 2 + gioco, rp = s.larga_punta / 2 + gioco;
  const xp = s.lunga / 2 - s.larga_punta / 2;
  return union(hull(cilZ(rc, 0, 0, z0, z1), cilZ(rp, xp, 0, z0, z1)),
    hull(cilZ(rc, 0, 0, z0, z1), cilZ(rp, -xp, 0, z0, z1)));
}

// Braccio nel suo sistema: asse del servo nell'origine, punta su +X.
function braccioLocale(z) {
  const s = t.squadretta, b = t.braccio, p = t.perno;
  const rMozzo = s.larga_mozzo / 2 + b.bordo_mozzo;
  const rCorto = s.larga_punta / 2 + b.bordo_corto, xCorto = s.lunga / 2 - s.larga_punta / 2;
  const corpo = union(hull(cilZ(rMozzo, 0, 0, z.zA0, z.zA1), cilZ(b.punta_r, b.raggio, 0, z.zA0, z.zA1)),
    hull(cilZ(rMozzo, 0, 0, z.zA0, z.zA1), cilZ(rCorto, -xCorto, 0, z.zA0, z.zA1)));
  const fori = [cilZ(b.foro_centrale / 2, 0, 0, z.zA0 - 1, z.zA1 + 1),
    ...s.fori_r.map(r => cilZ(b.foro_vite_squadretta / 2, r, 0, z.zA0 - 1, z.zA1 + 1, 24)),
    cilZ(b.foro_vite_squadretta / 2, -s.foro_corto_r, 0, z.zA0 - 1, z.zA1 + 1, 24),
    cilZ(p.foro_passante / 2, b.raggio, 0, z.zA0 - 1, z.zA1 + 1, 24)];
  // Tasca sotto il braccio: la squadretta vi entra e non può ruotare rispetto al braccio.
  const tasca = profiloSquadretta(b.tasca_gioco, z.zA0 - 1, z.zSqSopra);
  return subtract(corpo, tasca, ...fori);
}

function biellaLocale(L, z) {
  const b = t.biella;
  return subtract(hull(cilZ(b.larga / 2, 0, 0, z.zB0, z.zB1), cilZ(b.larga / 2, L, 0, z.zB0, z.zB1)),
    cilZ(b.foro / 2, 0, 0, z.zB0 - 1, z.zB1 + 1, 24), cilZ(b.foro / 2, L, 0, z.zB0 - 1, z.zB1 + 1, 24));
}

// Pinza nel sistema del disco: X = 0 sulla faccia anteriore del disco, asse dello stantuffo in Y = 0, Z = 0.
function pinzaLocale(z) {
  const k = t.pinza, ra = k.disco_r + k.gioco_disco, ro = ra + k.parete;
  const xF = -k.labbro, xR = k.fessura + k.retro, xP = pernoDaDisco();
  const zL0 = z.zL0 - z.asse, zL1 = z.zL1 - z.asse;
  const corpo = hull(cilX(ro, xF, xR, 0, 0), bb(xF, xR, -k.larga_sotto, k.larga_sotto, -k.sotto_asse, 0));
  // Orecchia del perno, sostenuta da uno svaso a 45° verso il retro: si stampa senza supporti.
  const orecchia = hull(bb(xR - E, xR + k.orecchia_lunga, -k.orecchia_larga / 2, k.orecchia_larga / 2, zL0, zL1),
    bb(xR - E, xR, -k.orecchia_larga / 2, k.orecchia_larga / 2, zL0 - k.orecchia_lunga, zL1));
  const tagli = [
    // Sede del disco, aperta in basso: il disco entra dal basso e il bullone inferiore chiude la pinza.
    cilX(ra, 0, k.fessura, 0, 0), bb(0, k.fessura, -ra, ra, -k.sotto_asse - 1, 0),
    // Apertura del labbro per lo stelo a croce, aperta in basso come la sede.
    cilX(k.apertura_stelo / 2, xF - 1, E, 0, 0), bb(xF - 1, E, -k.apertura_stelo / 2, k.apertura_stelo / 2,
      -k.sotto_asse - 1, 0),
    // Perno della biella: foro passante, con lo spazio per testa e cacciavite da sotto.
    cilZ(t.perno.foro_passante / 2, xP, 0, zL0 - k.orecchia_lunga - 1, zL1 + 1, 24),
    cilZ(k.svasatura_testa / 2, xP, 0, zL0 - k.orecchia_lunga - 1, zL0, 32),
    // Viti di registro autofilettanti nel retro e bullone di chiusura sotto il disco.
    ...[-1, 1].map(s => cilX(k.foro_autofilettante / 2, k.fessura - 1, xR + 1, s * k.registro_dy, k.registro_dz, 24)),
    cilX(t.perno.foro_passante / 2, xF - 1, xR + 1, 0, -k.bullone_sotto_asse, 24),
  ];
  return subtract(union(corpo, orecchia), ...tagli);
}

function posa(comando = q.cinematica.centro) {
  const z = quote(), d = z.d, k = cinematicaT(comando);
  const braccio = translate([0, d.servoY, 0], rotateZ(k.phi, braccioLocale(z)));
  const ang = Math.atan2(k.perno[1] - k.punta[1], k.perno[0] - k.punta[0]);
  const biella = translate([k.punta[0], k.punta[1], 0], rotateZ(ang, biellaLocale(k.L, z)));
  const pinza = translate([k.discoX, d.ySiringa, z.asse], pinzaLocale(z));
  return { z, d, k, braccio, biella, pinza };
}

// ---- Riferimenti non stampati: squadretta originale, perni con dadi, viti di registro ----
function perno(x, y, zTesta, zDado, zBiellaSopra) {
  const p = t.perno, rd = p.chiave_dado / Math.sqrt(3);
  return union(cilZ(p.testa_diam / 2, x, y, zTesta - p.testa_alta, zTesta),
    cilZ(p.diam / 2, x, y, zTesta - E, zTesta + p.lunga),
    cilZ(rd, x, y, zDado, zDado + p.dado_alto, 6),
    cilZ(rd, x, y, zBiellaSopra + p.rondella, zBiellaSopra + p.rondella + p.nyloc_alto, 6));
}

function riferimentiMobili(P) {
  const { z, d, k } = P, kp = t.pinza;
  const squadretta = translate([0, d.servoY, 0], rotateZ(k.phi, profiloSquadretta(0, z.zSqSotto, z.zSqSopra)));
  const perni = union(perno(k.punta[0], k.punta[1], z.zA0, z.zA1, z.zB1),
    perno(k.perno[0], k.perno[1], z.zL0, z.zL1, z.zB1));
  // Viti di registro: la punta tocca la faccia posteriore del disco, la testa sporge dietro la pinza.
  const xR = k.discoX + kp.fessura + kp.retro;
  const registro = union(...[-1, 1].map(sg => cilX(t.perno.diam / 2, k.discoX + kp.disco_spesso, xR + 8,
    d.ySiringa + sg * kp.registro_dy, z.asse + kp.registro_dz)));
  return { squadretta, perni, registro };
}

module.exports = { t, quote, cinematicaT, lunghezzaBiella, posa, riferimentiMobili, braccioLocale, biellaLocale,
  pinzaLocale, pernoDaDisco };
