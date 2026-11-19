// JSCAD 2.13: lo snap di generalize prima dell'inserimento delle T-junction può
// spostare un vertice fuori dal suo spigolo obliquo. Si mantiene la precisione
// a 0,0000001 mm e si triangola a ventaglio senza perdere i vertici sul bordo.
const m = require('@jscad/modeling');
const inserisciGiunzioni = require('@jscad/modeling/src/operations/modifiers/insertTjunctions');

function triangola(forma) {
  const g = m.modifiers.generalize({ snap: false, simplify: true, triangulate: false }, forma);
  let poligoni = m.geometries.geom3.toPolygons(g).map(p => m.geometries.poly3.create(
    p.vertices.map(v => v.map(x => Math.round(x * 1e7) / 1e7))))
    .filter(p => m.geometries.poly3.measureArea(p) > 1e-8);
  poligoni = inserisciGiunzioni(poligoni);
  const triangoli = poligoni.flatMap(p => {
    if (p.vertices.length === 3) return [p];
    const centro = [0, 1, 2].map(i => p.vertices.reduce((s, v) => s + v[i], 0) / p.vertices.length);
    return p.vertices.map((v, i) => m.geometries.poly3.create([centro, v, p.vertices[(i + 1) % p.vertices.length]]));
  });
  return m.geometries.geom3.create(triangoli);
}

function verifica(forma) {
  m.geometries.geom3.validate(forma);
  const triangoli = m.geometries.geom3.toPolygons(forma);
  const lati = new Map();
  const adiacenti = triangoli.map(() => []);
  for (const [i, t] of triangoli.entries()) {
    if (t.vertices.length !== 3) throw new Error('La mesh non è triangolata');
    for (let j = 0; j < 3; j++) {
      const a = t.vertices[j].join(','), b = t.vertices[(j + 1) % 3].join(',');
      const chiave = [a, b].sort().join('/');
      if (!lati.has(chiave)) lati.set(chiave, []);
      lati.get(chiave).push(i);
    }
  }
  for (const facce of lati.values()) {
    if (facce.length !== 2) throw new Error('Spigolo aperto o condiviso da più di due facce');
    adiacenti[facce[0]].push(facce[1]);
    adiacenti[facce[1]].push(facce[0]);
  }
  const viste = new Set();
  let solidi = 0;
  for (let i = 0; i < triangoli.length; i++) {
    if (viste.has(i)) continue;
    solidi++;
    const pila = [i];
    while (pila.length) {
      const n = pila.pop();
      if (viste.has(n)) continue;
      viste.add(n);
      for (const v of adiacenti[n]) if (!viste.has(v)) pila.push(v);
    }
  }
  if (solidi !== 1) throw new Error(`Il pezzo comprende ${solidi} gusci scollegati`);
  return { triangoli: triangoli.length, spigoli: lati.size, gusci: solidi };
}

// Esporta solo triangoli già validati. Il serializer standard applicherebbe di nuovo
// lo snap: qui si controlla invece anche il risultato DOPO la conversione STL float32.
function stlBinario(forma) {
  const triangoli = m.geometries.geom3.toPolygons(forma).map(p =>
    m.geometries.poly3.create(p.vertices.map(v => v.map(Math.fround))));
  const geometriaSTL = m.geometries.geom3.create(triangoli);
  const controllo = verifica(geometriaSTL);
  const dati = Buffer.alloc(84 + triangoli.length * 50);
  dati.write('PALOMBARO - BOZZA DIMENSIONALE - mm', 0, 'ascii');
  dati.writeUInt32LE(triangoli.length, 80);
  let offset = 84;
  for (const t of triangoli) {
    const normale = m.geometries.poly3.plane(t).slice(0, 3);
    for (const v of [...normale, ...t.vertices.flat()]) {
      dati.writeFloatLE(v, offset);
      offset += 4;
    }
    offset += 2;
  }
  return { dati, controllo };
}

module.exports = { triangola, verifica, stlBinario };
