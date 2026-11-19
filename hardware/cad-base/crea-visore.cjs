const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const m = require('@jscad/modeling');
const { q, coordinate, componenti, cinematica } = require('./modello.cjs');
const { triangola } = require('./mesh.cjs');
const { controlliStatici } = require('./controlli.cjs');

const arrotonda = v => Math.round(v * 1000) / 1000;
const virgola = v => v.toFixed(1).replace('.', ',');

function datiCinematici(d) {
  const c = q.cinematica;
  return { raggio: c.raggio, biella: c.biella, centro: c.centro, minimo: c.minimo, massimo: c.massimo,
    servoY: d.servoY, yPerno: d.yPerno, zBiella: d.zBiella, flangiaX: d.flangiaX,
    perno_da_disco: q.ipotesi.perno_da_disco, asta_zero: q.siringa.asta_zero,
    corsa: q.siringa.corsa, ml_massimi: c.ml_massimi };
}

// Inclinazione dell'asticella rispetto allo scorrimento: al centro e massima sulla corsa.
function inclinazioni() {
  const gradi = comando => {
    const k = cinematica(comando);
    return Math.abs(Math.atan2(k.punta[1] - k.perno[1], k.punta[0] - k.perno[0])) * 180 / Math.PI;
  };
  const tutte = [];
  for (let c = q.cinematica.minimo; c <= q.cinematica.massimo; c += 1) tutte.push(gradi(c));
  return { centro: gradi(q.cinematica.centro), minima: Math.min(...tutte), massima: Math.max(...tutte) };
}

function variante(id, titolo, descrizione) {
  const gruppo = componenti();
  controlliStatici(gruppo);
  const i = inclinazioni();
  const pezzi = [...gruppo.supporti.map(p => ({ ...p, stampato: true })),
    ...gruppo.riferimenti.map(p => ({ ...p, stampato: false }))].map(p => ({
    nome: p.nome, stampato: p.stampato, colore: p.colore,
    poligoni: m.geometries.geom3.toPolygons(triangola(p.forma)).map(f => f.vertices.map(v => v.map(arrotonda))) }));
  return { id, titolo, cin: datiCinematici(gruppo.d), pezzi,
    nota: `${descrizione} Inclinazione dell’asticella: ${virgola(i.centro)}° a metà corsa; lungo tutta la corsa varia fra ${virgola(i.minima)}° e ${virgola(i.massima)}°.` };
}

// Seconda simulazione, solo dimostrativa: lo stesso progetto con il servo non arretrato,
// come nella bozza 01. La quota viene ripristinata subito dopo.
function varianteDisassata() {
  const prima = q.cinematica.allineata_al_centro;
  q.cinematica.allineata_al_centro = false;
  try {
    return variante('disassata', 'Disassata (come bozza 01)',
      'Servo più vicino all’asse della siringa: l’asticella lavora sempre di traverso. Solo per confronto, non è la versione da stampare.');
  } finally {
    q.cinematica.allineata_al_centro = prima;
  }
}

async function main() {
  const risultato = await esbuild.build({ entryPoints: [path.join(__dirname, 'visore.js')],
    bundle: true, write: false, minify: true, format: 'iife', legalComments: 'inline' });
  const codice = risultato.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const cartella = `bozza-${q.revisione}`;
  const d = coordinate();
  const varianti = [variante('linea', 'In linea (da stampare)',
    'Servo arretrato: a metà corsa l’asticella è parallela allo scorrimento dello stantuffo.'), varianteDisassata()];
  const scena = JSON.stringify({ varianti }).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="it"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Palombaro · Il tuo primo CAD</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f3f1eb;color:#203c43;font:16px/1.5 system-ui,sans-serif}
main{display:grid;grid-template-columns:minmax(0,1fr) 310px;min-height:100vh}
header{position:absolute;left:28px;top:22px;z-index:1;pointer-events:none}h1{font-size:26px;margin:0}header p{margin:5px 0;font-size:14px}
#visore{height:100vh;min-height:420px;overflow:hidden}canvas{display:block;touch-action:none}
aside{padding:30px 24px;background:#fffefa;border-left:1px solid #deded6;z-index:2}h2{font-size:19px;margin:0 0 10px}
.nota{font-size:14px;color:#626860}.bozza{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#92501b;font-weight:700}
button,select{font:inherit;border:1px solid #b9c7c7;border-radius:8px;background:#fff;padding:9px 12px;color:#203c43}
button{cursor:pointer;margin:5px 4px 10px 0}button:hover{background:#e1ecee}button.attivo{background:#286b82;border-color:#286b82;color:#fff}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #c2410c;outline-offset:2px}input[type=range]{width:100%;margin:6px 0 2px}.moto{background:#edf3f3;padding:14px 15px 6px;border-radius:8px;margin:0 0 18px}.moto h2{font-size:17px}#lettura{font-variant-numeric:tabular-nums;font-size:14px;margin:6px 0}.arco{color:#c2410c;font-weight:700}.retta{color:#0f766e;font-weight:700}select{width:100%;margin:8px 0 16px}
label{display:block;margin:13px 0}input{accent-color:#286b82;margin-right:8px}#dettagli{background:#edf3f3;padding:15px;border-radius:8px;min-height:155px}#dettagli p{margin:6px 0 0;font-size:14px}
.legenda{margin-top:24px;font-size:14px}.colore{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px}
#stato{font-size:13px;margin-top:22px}.dati{margin-top:24px;border-top:1px solid #deded6;padding-top:16px;font-size:14px}
@media(max-width:760px){main{grid-template-columns:1fr}#visore{height:62vh}aside{border-left:0;border-top:1px solid #deded6;padding:20px}header{left:18px;top:14px}h1{font-size:21px}header p{max-width:270px;font-size:12px}}
</style><main><section aria-label="Modello tridimensionale interattivo"><header><h1>Il supporto del palombaro</h1><p>Servo verticale e siringa orizzontale</p><p class="bozza">Revisione ${q.revisione} · misure del servo confermate</p></header><div id="visore"></div></section>
<aside><section class="moto" aria-label="Simulazione del movimento"><h2>Guarda come si muove</h2>
<div id="varianti" role="group" aria-label="Disposizione del servo"></div>
<p id="nota-variante" class="nota"></p>
<button id="moto" type="button">Avvia il movimento</button>
<label for="comando">Comando del servo: <output id="gradi" for="comando"></output></label>
<input id="comando" type="range" step="0.5" min="${q.cinematica.minimo}" max="${q.cinematica.massimo}" value="${q.cinematica.centro}">
<p id="lettura"></p>
<p class="nota"><span class="arco">Arancione</span>: l’arco descritto dal foro del braccio. <span class="retta">Verde</span>: la retta su cui scorre il perno dello stantuffo. Le linee grigie sono l’asticella in cinque posizioni.</p></section>
<h2>Esplora il montaggio</h2>
<button id="ripristina">Vista iniziale</button><button id="alto">Dall’alto</button>
<label><input id="reali" type="checkbox" checked>Mostra servo e siringa</label>
<label><input id="separa" type="checkbox">Separa i pezzi stampati</label>
<label for="pezzo">Scopri un componente</label><select id="pezzo" aria-label="Componente da descrivere"></select><div id="dettagli" aria-live="polite"></div>
<div class="legenda"><p><span class="colore" style="background:#30688b"></span>Blu: base e supporti stampati<br><span class="colore" style="background:#d99d42"></span>Ocra: fermi rimovibili<br><span class="colore" style="background:#757c7b"></span>Altri colori: componenti esistenti</p></div>
<div class="dati">Base montata: <b>${d.xMax - d.xMin} × ${q.base.larghezza} mm</b><br>6 pezzi da stampare separatamente<br>Posizione centrale di studio: circa ${q.cinematica.ml_centro} ml</div>
<p id="stato" role="status">Caricamento della vista 3D…</p><p class="nota">Mouse: trascina con il tasto sinistro per ruotare; rotella per avvicinarti. Sul trackpad: clic e trascina per ruotare, scorri per lo zoom.</p>
<p class="nota">Le misure del servo sono state prese il 13 novembre. Il tubo non è rappresentato; l’anteprima nello slicer resta da fare prima di stampare.</p></aside></main>
<script id="geometrie" type="application/json">${scena}</script><script>${codice}</script></html>`;
  fs.writeFileSync(path.join(__dirname, cartella, 'APRI-IL-CAD.html'), html);
  console.log(`Creata anteprima 3D autonoma: ${cartella}/APRI-IL-CAD.html`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
