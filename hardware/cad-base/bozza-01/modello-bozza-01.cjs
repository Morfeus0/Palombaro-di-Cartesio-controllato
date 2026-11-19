// BOZZA DIMENSIONALE: non ancora approvata per la stampa. Tutte le quote sono in mm.
// Quote e provenienza: requisiti-e-misure.md. Le assunzioni sono esplicite in fondo a q.
const jscad = require('@jscad/modeling');
const { cuboid, cylinder, sphere, polygon } = jscad.primitives;
const { union, subtract } = jscad.booleans;
const { translate, rotateY } = jscad.transforms;
const { extrudeLinear } = jscad.extrusions;
const { hull } = jscad.hulls;

const q = {
  servo: { lunghezza: 40, larghezza: 20, altezza: 40, alette: 53, quota_alette: 26 },
  siringa: { diametro: 21, lunghezza: 105, flangia_larga: 37.5, flangia_alta: 25,
    flangia_spessa: 2, disco: 28, corsa: 70, asta_zero: 16 },
  cinematica: { raggio: 35, biella: 110, centro: 86, minimo: 36, massimo: 146,
    ml_centro: 11, ml_massimi: 20 },
  base: { spessore: 8, larghezza: 86, y_centro: 17, margine: 10 },
  montaggio: { m3_passante: 4, margine_sede_totale: 1, dado_cava: 6.8,
    dado_altezza: 3.5, flangia_piastra: 5, sella_spessore: 14, sella_larga: 48 },
  stampa: { diametro: 200, margine_radiale: 5, altezza: 400 },
  // Ipotesi di studio, NON misure confermate: verificare prima di un STL definitivo.
  ipotesi: { asse_servo_da_estremita: 10, alberino_sporge: 4, piano_braccio_sopra_alberino: 2,
    interasse_fori_lungo: 49, interasse_fori_corto: 10, asola_escursione: 2,
    spessore_alette_servo: 2, perno_da_disco: 3, perno_fuori_asse: 4,
    disassamento_biella: 16, cono_lungo: 12, disco_spessore: 3, stelo_largo: 14,
    stelo_lungo: 106, cavo_largo: 8, cavo_alto: 6,
    tacca_disco_larga: 4, tacca_disco_profonda: 12,
    rialzo_biella_su_braccio: 3, distacco_biella_nervatura: 2, gamba_gancio: 7 },
};
const E = 0.1;
const box = (size, center) => cuboid({ size, center });
const cz = (r, h, center) => cylinder({ radius: r, height: h, center, segments: 40 });
const cx = (r, h, center) => translate(center, rotateY(Math.PI / 2, cz(r, h, [0, 0, 0])));

function coordinate() {
  const a = q.ipotesi;
  const zBraccio = q.base.spessore + q.servo.altezza + a.alberino_sporge + a.piano_braccio_sopra_alberino;
  const zBiella = zBraccio + a.rialzo_biella_su_braccio;
  const z = zBiella - a.distacco_biella_nervatura;
  const yPerno = a.disassamento_biella;
  const ySiringa = yPerno - a.perno_fuori_asse;
  const pinX = -Math.sqrt(q.cinematica.biella ** 2 - (q.cinematica.raggio - yPerno) ** 2);
  const protrusione = q.siringa.asta_zero + q.siringa.corsa * q.cinematica.ml_centro / q.cinematica.ml_massimi - a.perno_da_disco;
  const flangiaX = pinX - protrusione;
  const servoX = a.asse_servo_da_estremita - q.servo.lunghezza / 2;
  const xMin = Math.floor(flangiaX - q.siringa.lunghezza - q.base.margine);
  const xMax = Math.ceil(servoX + q.servo.lunghezza / 2 + q.base.margine);
  return { z, zBraccio, zBiella, yPerno, ySiringa, flangiaX, servoX, xMin, xMax, giuntoX: (xMin + xMax) / 2 };
}

function cinematica(comando = 86) {
  if (!Number.isFinite(comando) || comando < q.cinematica.minimo || comando > q.cinematica.massimo) {
    throw new RangeError('Comando servo fuori dall’intervallo di studio 36–146°');
  }
  const d = coordinate();
  const phi = (90 + comando - q.cinematica.centro) * Math.PI / 180;
  const punta = [q.cinematica.raggio * Math.cos(phi), q.cinematica.raggio * Math.sin(phi), d.zBiella];
  const radicando = q.cinematica.biella ** 2 - (punta[1] - d.yPerno) ** 2;
  if (radicando <= 0) throw new Error('La biella non raggiunge l’asse dello stantuffo');
  const perno = [punta[0] - Math.sqrt(radicando), d.yPerno, d.zBiella];
  const discoX = perno[0] + q.ipotesi.perno_da_disco;
  const corsa = discoX - d.flangiaX - q.siringa.asta_zero;
  return { punta, perno, discoX, corsa, ml: corsa / q.siringa.corsa * q.cinematica.ml_massimi };
}

function asolaZ(x, y, z0, h) {
  const dx = q.ipotesi.asola_escursione / 2;
  return hull(cz(q.montaggio.m3_passante / 2, h, [x - dx, y, z0 + h / 2]),
    cz(q.montaggio.m3_passante / 2, h, [x + dx, y, z0 + h / 2]));
}

function foriBase(x0, x1, d) {
  const fori = [];
  const bordoY = q.base.larghezza / 2 - 6;
  for (const x of [x0 + 10, x1 - 10]) for (const y of [q.base.y_centro - bordoY, q.base.y_centro + bordoY]) {
    fori.push(cz(2.25, q.base.spessore + 2, [x, y, q.base.spessore / 2]));
  }
  for (const x of [d.giuntoX - 13, d.giuntoX + 13]) {
    if (x <= x0 || x >= x1) continue;
    for (const y of [q.base.y_centro - 23, q.base.y_centro + 23]) {
      fori.push(cz(2, q.base.spessore + 2, [x, y, q.base.spessore / 2]));
      // Accesso inferiore al dado: il gruppo andrà appoggiato su distanziali o incassato.
      fori.push(cz(3.8, 3.5 + E, [x, y, 1.75 - E / 2]));
    }
  }
  return fori;
}

function piastraBase(x0, x1, d) {
  return box([x1 - x0, q.base.larghezza, q.base.spessore],
    [(x0 + x1) / 2, q.base.y_centro, q.base.spessore / 2]);
}

function supportoServo(d) {
  const seat = q.base.spessore + q.servo.quota_alette;
  const pezzi = [];
  for (const segno of [-1, 1]) {
    const x = d.servoX + segno * q.ipotesi.interasse_fori_lungo / 2;
    const fori = [];
    for (const y of [-q.ipotesi.interasse_fori_corto / 2, q.ipotesi.interasse_fori_corto / 2]) {
      fori.push(asolaZ(x, y, 0, seat + 5));
      fori.push(box([15, q.montaggio.dado_cava, q.montaggio.dado_altezza],
        [x + segno * 2, y, seat - 6 + q.montaggio.dado_altezza / 2]));
    }
    pezzi.push(subtract(box([12, 34, q.servo.quota_alette + E],
      [x, 0, q.base.spessore + (q.servo.quota_alette - E) / 2]), ...fori));
  }
  const sede = box([q.servo.lunghezza + q.montaggio.margine_sede_totale,
    q.servo.larghezza + q.montaggio.margine_sede_totale, seat + 10],
    [d.servoX, 0, (seat + 10) / 2]);
  return subtract(union(...pezzi), sede);
}

// Poligono nel piano YZ, estruso lungo X: utile per le selle a V aperte verso l’alto.
function prismaX(puntiYZ, x, h) {
  const area = polygon({ points: puntiYZ.map(([y, z]) => [-z, y]) });
  return translate([x - h / 2, 0, 0], rotateY(Math.PI / 2, extrudeLinear({ height: h }, area)));
}

function sella(x, d) {
  const yc = d.ySiringa;
  const vertice = d.z - q.siringa.diametro / Math.SQRT2;
  const v = prismaX([[yc - 40, vertice + 40], [yc, vertice], [yc + 40, vertice + 40],
    [yc + 40, d.z + 60], [yc - 40, d.z + 60]], x, q.montaggio.sella_spessore + 2);
  const fori = [];
  for (const s of [-1, 1]) {
    const y = yc + s * 20;
    fori.push(cz(2, d.z + 40, [x, y, (d.z + 40) / 2]));
    fori.push(box([q.montaggio.dado_cava, 12, q.montaggio.dado_altezza],
      [x, y + s * 3, d.z - 6 + q.montaggio.dado_altezza / 2]));
  }
  return subtract(box([q.montaggio.sella_spessore, q.montaggio.sella_larga, d.z - q.base.spessore + E],
    [x, yc, (d.z + q.base.spessore - E) / 2]), v, ...fori);
}

function coperchioSella(x, d) {
  const basso = d.z + 2;
  const sottoTetto = d.z + q.siringa.diametro / 2 + 1;
  const alto = sottoTetto + 8;
  return subtract(box([q.montaggio.sella_spessore, q.montaggio.sella_larga, alto - basso], [x, d.ySiringa, (alto + basso) / 2]),
    box([q.montaggio.sella_spessore + 2, 32, sottoTetto - basso + E], [x, d.ySiringa, (sottoTetto + basso - E) / 2]),
    ...[-1, 1].map(s => cz(2, alto - basso + 2, [x, d.ySiringa + s * 20, (alto + basso) / 2])));
}

function taglioU(x, diametro, h, d) {
  return union(cx(diametro / 2, h, [x, d.ySiringa, d.z]),
    box([h, diametro, 60], [x, d.ySiringa, d.z + 30]));
}

function foriFlangia(x, h, d) {
  return [-1, 1].flatMap(s => [-8, 8].map(dz => cx(2, h,
    [x, d.ySiringa + s * 23, d.z + dz])));
}

function fermoAnteriore(d) {
  const h = q.montaggio.flangia_piastra;
  const x = d.flangiaX - q.siringa.flangia_spessa - h / 2;
  const alto = d.z + q.siringa.flangia_alta / 2 + 4;
  return subtract(box([h, 56, alto - q.base.spessore + E],
    [x, d.ySiringa, (alto + q.base.spessore - E) / 2]),
    taglioU(x, q.siringa.diametro + 1, h + 2, d), ...foriFlangia(x, h + 2, d));
}

function fermoPosteriore(d) {
  const h = q.montaggio.flangia_piastra;
  const x = d.flangiaX + h / 2;
  const basso = d.z - q.siringa.flangia_alta / 2 - 4;
  const alto = d.z + q.siringa.flangia_alta / 2 + 4;
  return subtract(box([h, 56, alto - basso], [x, d.ySiringa, (alto + basso) / 2]),
    taglioU(x, q.ipotesi.stelo_largo + 4, h + 2, d), ...foriFlangia(x, h + 2, d));
}

function giunzione(d) {
  return subtract(box([40, 66, 6], [d.giuntoX, q.base.y_centro, q.base.spessore + 3]),
    ...[-13, 13].flatMap(dx => [-23, 23].map(dy => cz(2, 8,
      [d.giuntoX + dx, q.base.y_centro + dy, q.base.spessore + 3]))));
}

// Due linguette registrano i moduli prima di serrare la piastra superiore.
function riferimentiGiunto(d, gioco = 0) {
  return [-20, 20].map(dy => box([9 + gioco / 2, 12 + gioco, q.base.spessore + gioco],
    [d.giuntoX + 3.5 + gioco / 4, q.base.y_centro + dy, q.base.spessore / 2]));
}

function scaricoCavo(d) {
  const x = d.servoX + q.servo.lunghezza / 2;
  return box([26, q.ipotesi.cavo_largo, q.ipotesi.cavo_alto + 2],
    [x + 12, 0, q.base.spessore + q.ipotesi.cavo_alto / 2 - 1]);
}

function componenti(comando = 86) {
  const d = coordinate();
  const pose = cinematica(comando);
  const saddleX = [d.flangiaX - 25, d.flangiaX - 70];
  const supporti = [
    { nome: 'base-servo', colore: [0.12, 0.38, 0.54, 1], forma: subtract(
      union(piastraBase(d.giuntoX, d.xMax, d), supportoServo(d)),
      ...foriBase(d.giuntoX, d.xMax, d), ...riferimentiGiunto(d, 1), scaricoCavo(d)) },
    { nome: 'base-siringa', colore: [0.12, 0.38, 0.54, 1], forma: subtract(
      union(piastraBase(d.xMin, d.giuntoX, d), ...riferimentiGiunto(d),
        ...saddleX.map(x => sella(x, d)), fermoAnteriore(d)), ...foriBase(d.xMin, d.giuntoX, d)) },
    { nome: 'piastra-giunzione', colore: [0.12, 0.38, 0.54, 1], forma: giunzione(d) },
    ...saddleX.map((x, i) => ({ nome: `coperchio-sella-${i + 1}`, colore: [0.88, 0.60, 0.22, 1], forma: coperchioSella(x, d) })),
    { nome: 'fermo-flangia', colore: [0.88, 0.60, 0.22, 1], forma: fermoPosteriore(d) },
  ];
  const cassa = box([q.servo.lunghezza, q.servo.larghezza, q.servo.altezza],
    [d.servoX, 0, q.base.spessore + q.servo.altezza / 2]);
  const alette = box([q.servo.alette, q.servo.larghezza, q.ipotesi.spessore_alette_servo],
    [d.servoX, 0, q.base.spessore + q.servo.quota_alette + q.ipotesi.spessore_alette_servo / 2]);
  const alberino = cz(3, q.ipotesi.alberino_sporge,
    [0, 0, q.base.spessore + q.servo.altezza + q.ipotesi.alberino_sporge / 2]);
  const puntaBraccio = [pose.punta[0], pose.punta[1], d.zBraccio];
  const braccio = subtract(hull(cz(5, 3, [0, 0, d.zBraccio]), cz(3, 3, puntaBraccio)),
    cz(0.75, 5, puntaBraccio));
  // Terminali verticali semplificati: le pieghe L/Z e il loro ritegno vanno verificati al banco.
  const asticella = union(hull(...[pose.punta, pose.perno].map(v => translate(v, sphere({ radius: 0.75, segments: 12 })))),
    ...[pose.punta, pose.perno].map(v => cz(0.75, q.ipotesi.gamba_gancio,
      [v[0], v[1], d.zBiella - q.ipotesi.gamba_gancio / 2])));
  const corpoL = q.siringa.lunghezza - q.ipotesi.cono_lungo - q.siringa.flangia_spessa;
  const corpoX = d.flangiaX - q.siringa.flangia_spessa - corpoL / 2;
  const corpo = subtract(cx(q.siringa.diametro / 2, corpoL, [corpoX, d.ySiringa, d.z]),
    cx(q.siringa.diametro / 2 - 0.96, corpoL + 2, [corpoX, d.ySiringa, d.z]));
  const flangia = translate([d.flangiaX - q.siringa.flangia_spessa / 2, d.ySiringa, d.z],
    rotateY(Math.PI / 2, jscad.transforms.scale([q.siringa.flangia_alta / q.siringa.flangia_larga, 1, 1],
      cz(q.siringa.flangia_larga / 2, q.siringa.flangia_spessa, [0, 0, 0]))));
  const puntaCono = cx(3, q.ipotesi.cono_lungo,
    [d.flangiaX - q.siringa.lunghezza + q.ipotesi.cono_lungo / 2, d.ySiringa, d.z]);
  const steloL = q.ipotesi.stelo_lungo;
  const stelo = subtract(union(box([steloL, q.ipotesi.stelo_largo, 1], [pose.discoX - steloL / 2, d.ySiringa, d.z]),
    box([steloL, 1, q.ipotesi.stelo_largo], [pose.discoX - steloL / 2, d.ySiringa, d.z])),
  cz(0.75, 12, [pose.perno[0], pose.perno[1], d.z]));
  // La tacca 4×12 mm esiste già (calibrazione-servo.md): qui viene orientata verso +Y.
  const disco = subtract(cx(q.siringa.disco / 2, q.ipotesi.disco_spessore,
    [pose.discoX + q.ipotesi.disco_spessore / 2, d.ySiringa, d.z]),
  box([q.ipotesi.disco_spessore + 2, q.ipotesi.tacca_disco_profonda + 2, q.ipotesi.tacca_disco_larga],
    [pose.discoX + q.ipotesi.disco_spessore / 2,
      d.ySiringa + q.siringa.disco / 2 - q.ipotesi.tacca_disco_profonda / 2 + 1, d.zBiella]));
  const riferimenti = [
    { nome: 'servo-reale', colore: [0.18, 0.19, 0.21, 1], forma: union(cassa, alette, alberino) },
    { nome: 'uscita-cavo-riferimento', colore: [0.64, 0.20, 0.12, 1], forma:
      box([18, q.ipotesi.cavo_largo - 2, q.ipotesi.cavo_alto - 2],
        [d.servoX + q.servo.lunghezza / 2 + 9, 0, q.base.spessore + 2]) },
    { nome: 'braccio-r35-riferimento', colore: [0.74, 0.28, 0.13, 1], forma: braccio },
    { nome: 'asticella-l110-riferimento', colore: [0.32, 0.33, 0.36, 1], forma: asticella },
    { nome: 'cilindro-siringa-reale', colore: [0.72, 0.85, 0.88, 0.26], forma: union(corpo, flangia, puntaCono) },
    { nome: 'stantuffo-reale', colore: [0.78, 0.80, 0.78, 0.9], forma: union(stelo, disco) },
  ];
  return { supporti, riferimenti, d, pose };
}

function getParameterDefinitions() {
  return [
    { name: 'comando', type: 'float', initial: 86, min: 36, max: 146, caption: 'Comando servo [°]' },
    { name: 'riferimenti', type: 'checkbox', checked: true, caption: 'Mostra servo, siringa e trasmissione' },
  ];
}

function main(params = {}) {
  const gruppo = componenti(params.comando === undefined ? 86 : params.comando);
  const pezzi = params.riferimenti === false ? gruppo.supporti : [...gruppo.supporti, ...gruppo.riferimenti];
  return pezzi.map(p => jscad.colors.colorize(p.colore, p.forma));
}

module.exports = { main, getParameterDefinitions, componenti, cinematica, coordinate, q };
