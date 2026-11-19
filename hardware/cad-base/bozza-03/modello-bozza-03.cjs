// REVISIONE 03, con le misure del servo prese il 13 novembre 2026. Tutte le quote sono in mm.
// Quote e provenienza: requisiti-e-misure.md. Le assunzioni sono esplicite in fondo a q.
// Rispetto alla 02: servo appeso alle alette con gola per il cavo, testata rigida per la
// flangia, dadi prigionieri da 5,8 mm, tutta la viteria in M3×16, corsa centrata.
const jscad = require('@jscad/modeling');
const { cuboid, cylinder, sphere, polygon } = jscad.primitives;
const { union, subtract } = jscad.booleans;
const { translate, rotateY, rotateZ } = jscad.transforms;
const { extrudeLinear } = jscad.extrusions;
const { hull } = jscad.hulls;

const q = {
  revisione: '03',
  // alette 55 e quota_alette 30: misure di Gabriele del 13 novembre (lo schema riportava 53 e 26).
  servo: { lunghezza: 40, larghezza: 20, altezza: 40, alette: 55, quota_alette: 30 },
  siringa: { diametro: 21, lunghezza: 105, flangia_larga: 37.5, flangia_alta: 25,
    flangia_spessa: 2, disco: 28, corsa: 70, asta_zero: 16 },
  // corsa_centrata: la flangia è posta in modo che i margini ai due fine corsa siano uguali.
  cinematica: { raggio: 35, biella: 110, centro: 86, minimo: 36, massimo: 146,
    ml_centro: 11, ml_massimi: 20, allineata_al_centro: true, corsa_centrata: true },
  base: { spessore: 8, larghezza: 86, y_centro: 17, asse_siringa_y: 12, raggio_spigoli: 6,
    oltre_pilastro: 3.5, oltre_sella: 16, foro_legno: 4.5, foro_legno_dal_centro: 37 },
  viteria: { lunghezza: 16, gambo: 3, testa_diametro: 5.6, testa_alta: 3, rondella: 0.5,
    dado_chiave: 5.5, dado_spigoli: 6.35, dado_alto: 2.4 },
  montaggio: {
    foro_m3: 3.4, cava_dado: 5.8, cava_dado_alta: 3.2, tetto_dado: 5,
    // Servo: appeso alle alette, mai appoggiato sul fondo.
    sede_alette: 30.5, incasso_fondo: 2, gioco_servo_per_lato: 0.75, pilastro_oltre: 10.5,
    // Fori dei pilastrini ciechi da 2,6 mm: la M3 vi si filetta da sola. A 3,75 mm dalla
    // scatola un dado M3 non ci sta senza sfondare nella sede (verifica del 18 novembre).
    pilastro_largo: 34, guancia_lunga: 6, guancia_alta: 16, foro_autofilettante: 2.6,
    fessura_cavo: 5, foro_servo_fondo: 15,
    // Siringa.
    sella_spessore: 14, sella_larga: 48, selle_da_flangia: [37, 75], vite_sella_dy: 20,
    coperchio_luce: 9, coperchio_orecchia: 5, coperchio_tetto: 6, coperchio_interno: 12.5,
    coperchio_parete: 16.3, testata_spessa: 16, testata_larga: 56, testata_sopra_asse: 14,
    gioco_cilindro: 1.5, fermo_spesso: 5, fermo_sotto_asse: 16.5, asola_stelo: 20,
    vite_flangia_dy: 23, vite_flangia_dz: 8,
    // Giunzione fra i due moduli.
    giunto_lungo: 40, giunto_largo: 60, giunto_spesso: 8.5, giunto_dx: 13, giunto_dy: 23,
    incasso_dado_giunto: 4, linguetta_dy: 10, linguetta_gioco: 1,
  },
  stampa: { diametro: 200, margine_radiale: 5, altezza: 400 },
  // Ipotesi di studio, NON misure confermate: verificare prima di un STL definitivo.
  // interasse_fori_lungo 47,5 e braccio fra 8 e 14 mm sopra la scatola: misure M1 e M4 del 13 novembre.
  // Il piano medio del braccio è posto a 9,5 mm e l'asticella 3 mm più su, a metà del campo misurato.
  ipotesi: { asse_servo_da_estremita: 10, alberino_sporge: 4, piano_braccio_sopra_alberino: 5.5,
    // interasse_fori_corto 9,5: a metà fra i 9 mm misurati e i 10 mm nominali.
    interasse_fori_lungo: 47.5, interasse_fori_corto: 9.5,
    spessore_alette_servo: 2.5, perno_da_disco: 3, perno_fuori_asse: 4,
    disassamento_biella: 16, cono_lungo: 12, disco_spessore: 3, stelo_largo: 14,
    stelo_lungo: 106, cavo_largo: 4.6, cavo_alto: 4, cavo_da_fondo: 6,
    tacca_disco_larga: 4, tacca_disco_profonda: 12,
    rialzo_biella_su_braccio: 3, distacco_biella_nervatura: 2, gamba_gancio: 7 },
};
const E = 0.1;
const BLU = [0.12, 0.38, 0.54, 1];
const OCRA = [0.88, 0.60, 0.22, 1];

// Parallelepipedo dai suoi limiti; cilindri lungo Z e lungo X fra due quote.
const bb = (x0, x1, y0, y1, z0, z1) => cuboid({
  size: [Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)],
  center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
const cilZ = (r, x, y, z0, z1, segments = 40) => cylinder({
  radius: r, height: Math.abs(z1 - z0), center: [x, y, (z0 + z1) / 2], segments });
const cilX = (r, x0, x1, y, z, segments = 40) => translate([(x0 + x1) / 2, y, z],
  rotateY(Math.PI / 2, rotateZ(segments === 6 ? Math.PI / 6 : 0,
    cylinder({ radius: r, height: Math.abs(x1 - x0), segments }))));
const raggioEsagono = chiave => chiave / Math.sqrt(3);

// Poligono nel piano YZ estruso lungo X fra x0 e x1 (verso dei punti indifferente).
function prismaX(puntiYZ, x0, x1) {
  const punti = puntiYZ.map(([y, z]) => [-z, y]);
  const area = punti.reduce((s, p, i) => {
    const n = punti[(i + 1) % punti.length];
    return s + p[0] * n[1] - n[0] * p[1];
  }, 0);
  const antiorari = area < 0 ? [...punti].reverse() : punti;
  return translate([Math.min(x0, x1), 0, 0], rotateY(Math.PI / 2,
    extrudeLinear({ height: Math.abs(x1 - x0) }, polygon({ points: antiorari }))));
}

function puntaBraccio(comando, servoY) {
  const phi = (90 + comando - q.cinematica.centro) * Math.PI / 180;
  return [q.cinematica.raggio * Math.cos(phi), servoY + q.cinematica.raggio * Math.sin(phi)];
}

function pernoX(comando, servoY, yPerno) {
  const [x, y] = puntaBraccio(comando, servoY);
  const radicando = q.cinematica.biella ** 2 - (y - yPerno) ** 2;
  if (radicando <= 0) throw new Error('La biella non raggiunge l’asse dello stantuffo');
  return x - Math.sqrt(radicando);
}

function coordinate() {
  const a = q.ipotesi, c = q.cinematica, mo = q.montaggio, s = q.siringa;
  const zSede = q.base.spessore + mo.sede_alette;
  const zFondoServo = zSede - q.servo.quota_alette;
  const zCassa = zFondoServo + q.servo.altezza;
  const zBraccio = zCassa + a.alberino_sporge + a.piano_braccio_sopra_alberino;
  const zBiella = zBraccio + a.rialzo_biella_su_braccio;
  const z = zBiella - a.distacco_biella_nervatura;
  const ySiringa = q.base.asse_siringa_y;
  const yPerno = ySiringa + a.perno_fuori_asse;
  // Con allineamento al centro si arretra il servo, senza spostare la siringa.
  const servoY = yPerno - (c.allineata_al_centro ? c.raggio : a.disassamento_biella);
  const baseY = q.base.y_centro + servoY;
  const corsaCentro = c.corsa_centrata
    ? s.corsa / 2 + pernoX(c.centro, servoY, yPerno)
      - (pernoX(c.minimo, servoY, yPerno) + pernoX(c.massimo, servoY, yPerno)) / 2
    : s.corsa * c.ml_centro / c.ml_massimi;
  const flangiaX = pernoX(c.centro, servoY, yPerno) + a.perno_da_disco - s.asta_zero - corsaCentro;
  const fronteX = flangiaX - s.flangia_spessa;
  const servoX = a.asse_servo_da_estremita - q.servo.lunghezza / 2;
  const selleX = mo.selle_da_flangia.map(v => fronteX - v);
  const xMin = Math.floor(Math.min(...selleX) - mo.sella_spessore / 2 - q.base.oltre_sella);
  const xMax = Math.ceil(servoX + q.servo.lunghezza / 2 + mo.pilastro_oltre + q.base.oltre_pilastro);
  const coperchioZ = z + s.diametro / 2 - mo.coperchio_luce;
  return { z, zSede, zFondoServo, zCassa, zBraccio, zBiella, yPerno, ySiringa, flangiaX, fronteX,
    servoX, servoY, baseY, selleX, coperchioZ, xMin, xMax, giuntoX: (xMin + xMax) / 2 };
}

function cinematica(comando = 86) {
  if (!Number.isFinite(comando) || comando < q.cinematica.minimo || comando > q.cinematica.massimo) {
    throw new RangeError('Comando servo fuori dall’intervallo di studio 36–146°');
  }
  const d = coordinate();
  const punta = [...puntaBraccio(comando, d.servoY), d.zBiella];
  const perno = [pernoX(comando, d.servoY, d.yPerno), d.yPerno, d.zBiella];
  const discoX = perno[0] + q.ipotesi.perno_da_disco;
  const corsa = discoX - d.flangiaX - q.siringa.asta_zero;
  return { punta, perno, discoX, corsa, ml: corsa / q.siringa.corsa * q.cinematica.ml_massimi };
}

// ---- Posizioni di viti e fori, usate sia dai tagli sia dai controlli ----
function vitiServo(d) {
  const a = q.ipotesi;
  return [-1, 1].flatMap(segno => [-1, 1].map(lato => ({
    segno, x: d.servoX + segno * a.interasse_fori_lungo / 2,
    y: d.servoY + lato * a.interasse_fori_corto / 2 })));
}
const vitiSella = (x, d) => [-1, 1].map(s => ({ s, x, y: d.ySiringa + s * q.montaggio.vite_sella_dy }));
const vitiFlangia = d => [-1, 1].flatMap(s => [-1, 1].map(v => ({ s,
  y: d.ySiringa + s * q.montaggio.vite_flangia_dy, z: d.z + v * q.montaggio.vite_flangia_dz })));
const vitiGiunto = d => [-1, 1].flatMap(sx => [-1, 1].map(sy => ({
  x: d.giuntoX + sx * q.montaggio.giunto_dx, y: d.baseY + sy * q.montaggio.giunto_dy })));

function foriLegno(d) {
  const dy = q.base.foro_legno_dal_centro;
  const lato = xs => xs.flatMap(x => [-1, 1].map(s => ({ x, y: d.baseY + s * dy })));
  return { servo: lato([d.giuntoX + 10, d.servoX]), siringa: lato([d.giuntoX - 10, d.xMin + 8]) };
}

// ---- Base ----
function piastraBase(x0, x1, d, spigoliA) {
  const r = q.base.raggio_spigoli, T = q.base.spessore, mezza = q.base.larghezza / 2;
  const xr = spigoliA === 'x0' ? x0 + r : x1 - r;
  const dritta = spigoliA === 'x0' ? bb(xr, x1, d.baseY - mezza, d.baseY + mezza, 0, T)
    : bb(x0, xr, d.baseY - mezza, d.baseY + mezza, 0, T);
  return hull(dritta, ...[-1, 1].map(s => cilZ(r, xr, d.baseY + s * (mezza - r), 0, T, 48)));
}

function foriBase(lista, d, x0, x1) {
  const mo = q.montaggio, T = q.base.spessore;
  const fori = lista.map(f => cilZ(q.base.foro_legno / 2, f.x, f.y, -1, T + 1));
  for (const v of vitiGiunto(d).filter(p => p.x > x0 && p.x < x1)) {
    fori.push(cilZ(mo.foro_m3 / 2, v.x, v.y, -1, T + 1));
    // Dado prigioniero inserito da sotto: va montato prima di fissare la base al legno.
    fori.push(cilZ(raggioEsagono(mo.cava_dado), v.x, v.y, -1, mo.incasso_dado_giunto, 6));
  }
  return fori;
}

// Due linguette registrano i moduli prima di serrare la piastra superiore.
function linguette(d, gioco = 0) {
  return [-1, 1].map(s => {
    const y = d.baseY + s * q.montaggio.linguetta_dy;
    return bb(d.giuntoX - 1, d.giuntoX + 8 + gioco / 2, y - 6 - gioco / 2, y + 6 + gioco / 2,
      -gioco / 2, q.base.spessore + gioco / 2);
  });
}

// ---- Servo ----
function sedeServo(d) {
  const mo = q.montaggio, c = mo.gioco_servo_per_lato;
  return bb(d.servoX - q.servo.lunghezza / 2 - c, d.servoX + q.servo.lunghezza / 2 + c,
    d.servoY - q.servo.larghezza / 2 - c, d.servoY + q.servo.larghezza / 2 + c,
    q.base.spessore - mo.incasso_fondo, d.zSede + 10);
}

function tagliPilastro(segno, d) {
  const mo = q.montaggio, T = q.base.spessore, sy = d.servoY;
  const fine = d.servoX + segno * q.servo.lunghezza / 2;
  const fuori = fine + segno * (mo.pilastro_oltre + 1);
  const fori = vitiServo(d).filter(p => p.segno === segno).map(v =>
    cilZ(mo.foro_autofilettante / 2, v.x, v.y, T + mo.foro_servo_fondo, d.zSede + 1));
  // Fessura passante, aperta in alto: il passacavo scende con il servo e il cavo esce di lato
  // senza dover essere infilato. Il pilastrino diventa due colonne unite dalla base.
  const fessura = bb(fine, fuori, sy - mo.fessura_cavo / 2, sy + mo.fessura_cavo / 2, T - 0.6, d.zSede + 1);
  return [...fori, fessura];
}

function supportoServo(d) {
  const mo = q.montaggio, T = q.base.spessore, sy = d.servoY, mezzo = mo.pilastro_largo / 2;
  const pieni = [], tagli = [sedeServo(d)];
  for (const segno of [-1, 1]) {
    const fine = d.servoX + segno * q.servo.lunghezza / 2;
    pieni.push(bb(fine, fine + segno * mo.pilastro_oltre, sy - mezzo, sy + mezzo, T - E, d.zSede));
    // Guance basse ai quattro angoli: limitano la rotazione se le viti si allentano.
    pieni.push(bb(fine - segno * mo.guancia_lunga, fine + segno, sy - mezzo, sy + mezzo,
      T - E, T + mo.guancia_alta));
    tagli.push(...tagliPilastro(segno, d));
  }
  return { pieni, tagli };
}

// ---- Siringa ----
function sella(x, d) {
  const mo = q.montaggio, T = q.base.spessore, yc = d.ySiringa, m = mo.sella_spessore / 2;
  const vertice = d.z - q.siringa.diametro / Math.SQRT2;
  const v = prismaX([[yc - 40, vertice + 40], [yc, vertice], [yc + 40, vertice + 40],
    [yc + 40, d.z + 60], [yc - 40, d.z + 60]], x - m - 1, x + m + 1);
  const tagli = vitiSella(x, d).flatMap(p => [
    cilZ(mo.foro_m3 / 2, p.x, p.y, d.z - 25, d.z + 1),
    bb(x - mo.cava_dado / 2, x + mo.cava_dado / 2,
      p.y - p.s * (q.viteria.dado_spigoli / 2 + 0.2), yc + p.s * (mo.sella_larga / 2 + 1),
      d.z - mo.tetto_dado - mo.cava_dado_alta, d.z - mo.tetto_dado)]);
  return subtract(bb(x - m, x + m, yc - mo.sella_larga / 2, yc + mo.sella_larga / 2, T - E, d.z), v, ...tagli);
}

// Ponticello: orecchie basse per la M3×16, tetto piano che preme sul cilindro.
function coperchioSella(x, d) {
  const mo = q.montaggio, yc = d.ySiringa, m = mo.sella_spessore / 2, b = d.coperchioZ;
  const est = mo.sella_larga / 2, par = mo.coperchio_parete, int = mo.coperchio_interno;
  const alto = b + mo.coperchio_luce + mo.coperchio_tetto;
  const profilo = [[-est, b], [-int, b], [-int, b + mo.coperchio_luce], [int, b + mo.coperchio_luce],
    [int, b], [est, b], [est, b + mo.coperchio_orecchia], [par, b + mo.coperchio_orecchia],
    [par, alto], [-par, alto], [-par, b + mo.coperchio_orecchia], [-est, b + mo.coperchio_orecchia]];
  return subtract(prismaX(profilo.map(([y, z]) => [yc + y, z]), x - m, x + m),
    ...vitiSella(x, d).map(p => cilZ(mo.foro_m3 / 2, p.x, p.y, b - 1, b + mo.coperchio_orecchia + 1)));
}

function taglioU(x0, x1, diametro, d) {
  return union(cilX(diametro / 2, x0, x1, d.ySiringa, d.z),
    bb(x0, x1, d.ySiringa - diametro / 2, d.ySiringa + diametro / 2, d.z, d.z + 60));
}

// Blocco spesso contro cui appoggia la flangia: sostituisce la lamina da 5 mm della bozza 01.
function testata(d) {
  const mo = q.montaggio, yc = d.ySiringa, m = mo.testata_larga / 2;
  const x0 = d.fronteX - mo.testata_spessa, x1 = d.fronteX;
  const tagli = vitiFlangia(d).flatMap(p => [
    cilX(mo.foro_m3 / 2, x0 - 1, x1 + 1, p.y, p.z),
    bb(x1 - mo.tetto_dado - mo.cava_dado_alta, x1 - mo.tetto_dado,
      p.y - p.s * (q.viteria.dado_spigoli / 2 + 0.2), yc + p.s * (m + 1),
      p.z - mo.cava_dado / 2, p.z + mo.cava_dado / 2)]);
  return subtract(bb(x0, x1, yc - m, yc + m, q.base.spessore - E, d.z + mo.testata_sopra_asse),
    taglioU(x0 - 1, x1 + 1, q.siringa.diametro + mo.gioco_cilindro, d), ...tagli);
}

function fermoFlangia(d) {
  const mo = q.montaggio, yc = d.ySiringa, m = mo.testata_larga / 2;
  const x0 = d.flangiaX, x1 = d.flangiaX + mo.fermo_spesso;
  return subtract(bb(x0, x1, yc - m, yc + m, d.z - mo.fermo_sotto_asse, d.z + mo.testata_sopra_asse),
    taglioU(x0 - 1, x1 + 1, mo.asola_stelo, d),
    ...vitiFlangia(d).map(p => cilX(mo.foro_m3 / 2, x0 - 1, x1 + 1, p.y, p.z)));
}

function giunzione(d) {
  const mo = q.montaggio, T = q.base.spessore;
  return subtract(bb(d.giuntoX - mo.giunto_lungo / 2, d.giuntoX + mo.giunto_lungo / 2,
    d.baseY - mo.giunto_largo / 2, d.baseY + mo.giunto_largo / 2, T, T + mo.giunto_spesso),
  ...vitiGiunto(d).map(v => cilZ(mo.foro_m3 / 2, v.x, v.y, T - 1, T + mo.giunto_spesso + 1)));
}

function pezziStampati(d) {
  const legno = foriLegno(d), servo = supportoServo(d);
  return [
    { nome: 'base-servo', colore: BLU, forma: subtract(
      union(piastraBase(d.giuntoX, d.xMax, d, 'x1'), ...servo.pieni),
      ...servo.tagli, ...foriBase(legno.servo, d, d.giuntoX, d.xMax),
      ...linguette(d, q.montaggio.linguetta_gioco)) },
    { nome: 'base-siringa', colore: BLU, forma: subtract(
      union(piastraBase(d.xMin, d.giuntoX, d, 'x0'), ...linguette(d),
        ...d.selleX.map(x => sella(x, d)), testata(d)),
      ...foriBase(legno.siringa, d, d.xMin, d.giuntoX)) },
    { nome: 'piastra-giunzione', colore: BLU, forma: giunzione(d) },
    ...d.selleX.map((x, i) => ({ nome: `coperchio-sella-${i + 1}`, colore: OCRA, forma: coperchioSella(x, d) })),
    { nome: 'fermo-flangia', colore: OCRA, forma: fermoFlangia(d) },
  ];
}

// ---- Viteria: non si stampa, serve a controllare fori, cave e lunghezze ----
// dado null: vite autofilettante, disegnata con il diametro del foro (il filetto lo intaglia).
function vite(testa, verso, dado, gambo = q.viteria.gambo) {
  const v = q.viteria, r = raggioEsagono(v.dado_chiave);
  if (verso === 'z') {
    const parti = [cilZ(v.testa_diametro / 2, testa.x, testa.y, testa.z, testa.z + v.testa_alta),
      cilZ(gambo / 2, testa.x, testa.y, testa.z - v.lunghezza, testa.z + E)];
    if (dado !== null) {
      parti.push(translate([testa.x, testa.y, dado - v.dado_alto / 2], rotateZ(testa.ruota || 0,
        cylinder({ radius: r, height: v.dado_alto, segments: 6 }))));
    }
    return union(...parti);
  }
  return union(cilX(v.testa_diametro / 2, testa.x, testa.x + v.testa_alta, testa.y, testa.z),
    cilX(v.gambo / 2, testa.x - v.lunghezza, testa.x + E, testa.y, testa.z),
    cilX(r, dado - v.dado_alto, dado, testa.y, testa.z, 6));
}

function viteria(d) {
  const mo = q.montaggio, v = q.viteria, T = q.base.spessore, gioco = 0.05;
  const servo = vitiServo(d).map(p => vite(
    { x: p.x, y: p.y, z: d.zSede + q.ipotesi.spessore_alette_servo + v.rondella }, 'z',
    null, mo.foro_autofilettante - 2 * gioco));
  const selle = d.selleX.flatMap(x => vitiSella(x, d)).map(p => vite(
    { x: p.x, y: p.y, z: d.coperchioZ + mo.coperchio_orecchia + v.rondella, ruota: Math.PI / 6 }, 'z',
    d.z - mo.tetto_dado - gioco));
  const giunto = vitiGiunto(d).map(p => vite(
    { x: p.x, y: p.y, z: T + mo.giunto_spesso + v.rondella }, 'z', mo.incasso_dado_giunto - gioco));
  const flangia = vitiFlangia(d).map(p => vite(
    { x: d.flangiaX + mo.fermo_spesso + v.rondella, y: p.y, z: p.z }, 'x',
    d.fronteX - mo.tetto_dado - gioco));
  return union(...servo, ...selle, ...giunto, ...flangia);
}

// Volumi spazzati calando il servo dall'alto, con le misure massime ammesse:
// corpo sotto le alette e passacavo, fino oltre il pilastrino. Devono restare liberi.
function percorsiMontaggio(d, max) {
  const fine = d.servoX + max.lunghezza / 2, alto = d.zSede + 40;
  const zFondo = d.zSede - max.quota_alette;
  const zPassacavo = zFondo + max.passacavo_da_fondo[0];
  return [
    { nome: 'discesa del corpo del servo', forma: bb(d.servoX - max.lunghezza / 2, fine,
      d.servoY - max.larghezza / 2, d.servoY + max.larghezza / 2, zFondo, alto) },
    ...[-1, 1].map(s => ({ nome: `discesa del passacavo (${s > 0 ? 'lato braccio' : 'lato siringa'})`,
      forma: bb(d.servoX + s * max.lunghezza / 2, d.servoX + s * (q.servo.lunghezza / 2 + 16),
        d.servoY - max.passacavo_largo / 2, d.servoY + max.passacavo_largo / 2, zPassacavo, alto) })),
  ];
}

// Spazio per testa e cacciavite sopra ogni vite da legno: deve restare libero.
function accessiLegno(d) {
  const tutti = [...foriLegno(d).servo, ...foriLegno(d).siringa];
  return tutti.map(f => cilZ(4.25, f.x, f.y, q.base.spessore + 0.2, q.base.spessore + 90));
}

// ---- Componenti reali, semplificati ----
function servoReale(d) {
  const s = q.servo, a = q.ipotesi;
  return union(
    bb(d.servoX - s.lunghezza / 2, d.servoX + s.lunghezza / 2, d.servoY - s.larghezza / 2,
      d.servoY + s.larghezza / 2, d.zFondoServo, d.zCassa),
    bb(d.servoX - s.alette / 2, d.servoX + s.alette / 2, d.servoY - s.larghezza / 2,
      d.servoY + s.larghezza / 2, d.zSede, d.zSede + a.spessore_alette_servo),
    cilZ(3, 0, d.servoY, d.zCassa - E, d.zCassa + a.alberino_sporge));
}

function siringaReale(d, pose) {
  const s = q.siringa, a = q.ipotesi, yc = d.ySiringa;
  const corpoFine = d.fronteX - (s.lunghezza - a.cono_lungo - s.flangia_spessa);
  const corpo = subtract(cilX(s.diametro / 2, corpoFine, d.fronteX, yc, d.z),
    cilX(s.diametro / 2 - 0.96, corpoFine - 1, d.fronteX + 1, yc, d.z));
  const flangia = translate([d.flangiaX - s.flangia_spessa / 2, yc, d.z],
    rotateY(Math.PI / 2, jscad.transforms.scale([s.flangia_alta / s.flangia_larga, 1, 1],
      cylinder({ radius: s.flangia_larga / 2, height: s.flangia_spessa, segments: 40 }))));
  const cono = cilX(3, d.flangiaX - s.lunghezza, corpoFine + E, yc, d.z);
  const x0 = pose.discoX - a.stelo_lungo, m = a.stelo_largo / 2;
  const stelo = subtract(union(bb(x0, pose.discoX, yc - m, yc + m, d.z - 0.5, d.z + 0.5),
    bb(x0, pose.discoX, yc - 0.5, yc + 0.5, d.z - m, d.z + m)),
  cilZ(0.75, pose.perno[0], pose.perno[1], d.z - 6, d.z + 6));
  // La tacca 4×12 mm esiste già (calibrazione-servo.md): qui viene orientata verso +Y.
  const disco = subtract(cilX(s.disco / 2, pose.discoX, pose.discoX + a.disco_spessore, yc, d.z),
    bb(pose.discoX - 1, pose.discoX + a.disco_spessore + 1,
      yc + s.disco / 2 - a.tacca_disco_profonda, yc + s.disco / 2 + 2,
      d.zBiella - a.tacca_disco_larga / 2, d.zBiella + a.tacca_disco_larga / 2));
  return { cilindro: union(corpo, flangia, cono), stantuffo: union(stelo, disco) };
}

function riferimentiReali(d, pose) {
  const a = q.ipotesi;
  const punta = [pose.punta[0], pose.punta[1]];
  const braccio = subtract(hull(cilZ(5, 0, d.servoY, d.zBraccio - 1.5, d.zBraccio + 1.5),
    cilZ(3, ...punta, d.zBraccio - 1.5, d.zBraccio + 1.5)),
  cilZ(0.75, ...punta, d.zBraccio - 2.5, d.zBraccio + 2.5));
  // Terminali verticali semplificati: le pieghe L/Z e il loro ritegno vanno verificati al banco.
  const asticella = union(hull(...[pose.punta, pose.perno].map(v => translate(v, sphere({ radius: 0.75, segments: 12 })))),
    ...[pose.punta, pose.perno].map(v => cilZ(0.75, v[0], v[1], d.zBiella - a.gamba_gancio, d.zBiella)));
  const cavoX = d.servoX + q.servo.lunghezza / 2;
  const siringa = siringaReale(d, pose);
  return [
    { nome: 'servo-reale', colore: [0.18, 0.19, 0.21, 1], forma: servoReale(d) },
    { nome: 'uscita-cavo-riferimento', colore: [0.64, 0.20, 0.12, 1], forma:
      bb(cavoX, cavoX + 18, d.servoY - a.cavo_largo / 2, d.servoY + a.cavo_largo / 2,
        d.zFondoServo + a.cavo_da_fondo, d.zFondoServo + a.cavo_da_fondo + a.cavo_alto) },
    { nome: 'braccio-r35-riferimento', colore: [0.74, 0.28, 0.13, 1], forma: braccio },
    { nome: 'asticella-l110-riferimento', colore: [0.32, 0.33, 0.36, 1], forma: asticella },
    { nome: 'cilindro-siringa-reale', colore: [0.72, 0.85, 0.88, 0.26], forma: siringa.cilindro },
    { nome: 'stantuffo-reale', colore: [0.78, 0.80, 0.78, 0.9], forma: siringa.stantuffo },
    { nome: 'viteria-m3-riferimento', colore: [0.55, 0.57, 0.6, 1], forma: viteria(d) },
  ];
}

function componenti(comando = 86) {
  const d = coordinate();
  const pose = cinematica(comando);
  return { supporti: pezziStampati(d), riferimenti: riferimentiReali(d, pose), d, pose };
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

module.exports = { main, getParameterDefinitions, componenti, cinematica, coordinate, q,
  accessiLegno, percorsiMontaggio, vitiServo, vitiSella, vitiFlangia, vitiGiunto, foriLegno };
