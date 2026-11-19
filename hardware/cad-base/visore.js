import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = selettore => document.querySelector(selettore);
const contenitore = $('#visore');
const stato = $('#stato');
const dettagli = $('#dettagli');
const MOBILI = { braccio: 'braccio-r35-riferimento', asticella: 'asticella-l110-riferimento', stantuffo: 'stantuffo-reale' };
const DURATA_ANDATA_S = 4;
const COLORE_ARCO = 0xc2410c;
const COLORE_PERNO = 0x0f766e;
const descrizioni = {
  'base-servo': ['Base del servo', 'Il servo resta appeso alle due alette, avvitate con viti che si filettano nei pilastrini; sotto la scatola c’è vuoto. La fessura al centro di ogni pilastrino lascia scendere il passacavo e uscire il cavo.'],
  'base-siringa': ['Base della siringa', 'Due selle a V sostengono il cilindro. La testata spessa riceve la spinta della flangia senza flettere.'],
  'piastra-giunzione': ['Piastra di collegamento', 'Unisce i due moduli con quattro M3×16; i dadi sono incassati sotto la base. Due linguette allineano i moduli.'],
  'coperchio-sella-1': ['Ponticello della siringa 1', 'Si avvita sulla sella e preme il cilindro nella V. Stringere solo finché la siringa non si muove.'],
  'coperchio-sella-2': ['Ponticello della siringa 2', 'Secondo punto di bloccaggio del cilindro.'],
  'fermo-flangia': ['Fermo della flangia', 'Stringe la flangia contro la testata: la siringa non si sposta né in spinta né in trazione.'],
  'servo-reale': ['Servo già disponibile', 'Riferimento semplificato del servo HAXIHA A097. Non è un pezzo da stampare.'],
  'uscita-cavo-riferimento': ['Spazio per il cavo', 'Ingombro indicativo del cavo: l’altezza reale dell’uscita va misurata sul servo.'],
  'braccio-r35-riferimento': ['Braccio del servo', 'Il foro a 35 mm dall’asse descrive un arco di cerchio (linea arancione).'],
  'asticella-l110-riferimento': ['Asticella', 'Lunga 110 mm fra i perni. Un capo segue l’arco del braccio, l’altro scorre diritto con lo stantuffo (linea verde): per questo si inclina durante la corsa.'],
  'cilindro-siringa-reale': ['Siringa già disponibile', 'Cilindro Ø21 mm; flangia ovale 37,5 × 25 mm, spessa 2 mm.'],
  'viteria-m3-riferimento': ['Viti M3×16 e dadi', 'Sedici viti tutte uguali con i loro dadi. Non si stampano: servono a controllare fori e sedi.'],
  'stantuffo-reale': ['Stantuffo', 'Scorre diritto lungo l’asse della siringa. La tacca già presente nel disco è rivolta verso l’asticella.'],
};

/** Posizione dei due capi dell'asticella per un comando del servo, in mm. */
function posa(cin, comando) {
  const phi = (90 + comando - cin.centro) * Math.PI / 180;
  const px = cin.raggio * Math.cos(phi);
  const py = cin.servoY + cin.raggio * Math.sin(phi);
  const qx = px - Math.sqrt(cin.biella ** 2 - (py - cin.yPerno) ** 2);
  const corsa = qx + cin.perno_da_disco - cin.flangiaX - cin.asta_zero;
  return { px, py, qx, qy: cin.yPerno, angolo: Math.atan2(py - cin.yPerno, px - qx),
    ml: corsa / cin.corsa * cin.ml_massimi };
}

function creaMesh(p) {
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(p.poligoni.flat(2), 3));
  geometria.computeVertexNormals();
  const materiale = new THREE.MeshStandardMaterial({
    color: new THREE.Color(...p.colore.slice(0, 3)), roughness: 0.75,
    metalness: 0, transparent: p.colore[3] < 1, opacity: p.colore[3],
    depthWrite: p.colore[3] === 1, side: THREE.DoubleSide,
  });
  const oggetto = new THREE.Mesh(geometria, materiale);
  oggetto.userData = { nome: p.nome, stampato: p.stampato };
  return oggetto;
}

function linea(punti, colore, opacita = 1) {
  const geometria = new THREE.BufferGeometry().setFromPoints(punti.map(p => new THREE.Vector3(...p)));
  return new THREE.Line(geometria, new THREE.LineBasicMaterial({ color: colore, transparent: opacita < 1, opacity: opacita }));
}

/** Arco del foro del braccio, retta del perno e posizioni intermedie dell'asticella. */
function creaTracce(cin) {
  const gruppo = new THREE.Group();
  const z = cin.zBiella + 0.4;
  const arco = [], retta = [];
  for (let c = cin.minimo; c <= cin.massimo; c += 1) {
    const p = posa(cin, c);
    arco.push([p.px, p.py, z]);
    retta.push([p.qx, p.qy, z]);
    if ((c - cin.minimo) % 22 === 0) gruppo.add(linea([[p.px, p.py, z], [p.qx, p.qy, z]], 0x374151, 0.35));
  }
  gruppo.add(linea(arco, COLORE_ARCO), linea(retta, COLORE_PERNO));
  return gruppo;
}

function creaVariante(dati) {
  const gruppo = new THREE.Group();
  const oggetti = dati.pezzi.map(creaMesh);
  const tracce = creaTracce(dati.cin);
  gruppo.add(...oggetti, tracce);
  const perNome = nome => oggetti.find(o => o.userData.nome === nome);
  const mobili = Object.fromEntries(Object.entries(MOBILI).map(([chiave, nome]) => [chiave, perNome(nome)]));
  Object.values(mobili).forEach(o => { o.matrixAutoUpdate = false; });
  return { ...dati, gruppo, oggetti, tracce, mobili, riposo: posa(dati.cin, dati.cin.centro) };
}

/** Porta braccio, asticella e stantuffo nella posa del comando dato. */
function muovi(variante, comando) {
  const { cin, riposo, mobili } = variante;
  const p = posa(cin, comando);
  const perno = new THREE.Matrix4().makeTranslation(0, cin.servoY, 0);
  mobili.braccio.matrix.copy(perno)
    .multiply(new THREE.Matrix4().makeRotationZ((comando - cin.centro) * Math.PI / 180))
    .multiply(new THREE.Matrix4().makeTranslation(0, -cin.servoY, 0));
  mobili.stantuffo.matrix.makeTranslation(p.qx - riposo.qx, 0, 0);
  mobili.asticella.matrix.makeTranslation(p.qx, p.qy, 0)
    .multiply(new THREE.Matrix4().makeRotationZ(p.angolo - riposo.angolo))
    .multiply(new THREE.Matrix4().makeTranslation(-riposo.qx, -riposo.qy, 0));
  return p;
}

function avvia() {
  const dati = JSON.parse($('#geometrie').textContent);
  const scena = new THREE.Scene();
  scena.background = new THREE.Color('#f3f1eb');
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2500);
  camera.up.set(0, 0, 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  contenitore.appendChild(renderer.domElement);
  const controlli = new OrbitControls(camera, renderer.domElement);
  controlli.minDistance = 25;
  controlli.maxDistance = 1000;
  controlli.cursorStyle = 'grab';
  scena.add(new THREE.HemisphereLight(0xffffff, 0x87928f, 2.6));
  const luce = new THREE.DirectionalLight(0xffffff, 3.1);
  luce.position.set(-100, -120, 220);
  scena.add(luce);

  const varianti = dati.varianti.map(creaVariante);
  varianti.forEach(v => scena.add(v.gruppo));
  let attiva = varianti[0];
  let comando = attiva.cin.centro;
  let inMoto = false, verso = 1, ultimoTempo = null;
  const tutti = varianti.flatMap(v => v.oggetti);

  const insieme = new THREE.Box3();
  attiva.oggetti.forEach(o => insieme.expandByObject(o));
  const centro = insieme.getCenter(new THREE.Vector3());
  const estensione = insieme.getSize(new THREE.Vector3());
  const dimensione = Math.max(estensione.x, estensione.y, estensione.z);
  let vista = 'prospettiva';
  const disegna = () => renderer.render(scena, camera);

  function inquadra(tipo = vista) {
    vista = tipo;
    const distanza = dimensione / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) *
      Math.max(1, 1 / camera.aspect) * 1.18;
    controlli.target.copy(centro);
    camera.position.copy(centro).add(new THREE.Vector3(...(
      tipo === 'alto' ? [0, -0.001, distanza] : [distanza * 0.22, -distanza * 0.85, distanza * 0.55])));
    controlli.update();
    disegna();
  }
  function dimensiona() {
    const { width, height } = contenitore.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    inquadra();
  }

  const cursore = $('#comando');
  const numero = valore => valore.toFixed(1).replace('.', ',');
  function aggiorna() {
    const p = muovi(attiva, comando);
    cursore.value = String(comando);
    $('#gradi').textContent = `${Math.round(comando)}°`;
    $('#lettura').textContent = `Volume: ${numero(p.ml)} ml · inclinazione dell’asticella: ${numero(Math.abs(p.angolo) * 180 / Math.PI)}°`;
    disegna();
  }
  function scegli(variante) {
    attiva = variante;
    varianti.forEach(v => { v.gruppo.visible = v === attiva; });
    document.querySelectorAll('#varianti button').forEach(b => {
      const scelto = b.dataset.id === attiva.id;
      b.classList.toggle('attivo', scelto);
      b.setAttribute('aria-pressed', String(scelto));
    });
    $('#nota-variante').textContent = attiva.nota;
    cursore.min = String(attiva.cin.minimo);
    cursore.max = String(attiva.cin.massimo);
    comando = Math.min(attiva.cin.massimo, Math.max(attiva.cin.minimo, comando));
    aggiorna();
  }
  function passo(tempo) {
    if (!inMoto) return;
    const dt = ultimoTempo === null ? 0 : Math.min(0.1, (tempo - ultimoTempo) / 1000);
    ultimoTempo = tempo;
    const { minimo, massimo } = attiva.cin;
    comando += verso * dt * (massimo - minimo) / DURATA_ANDATA_S;
    if (comando >= massimo) { comando = massimo; verso = -1; }
    if (comando <= minimo) { comando = minimo; verso = 1; }
    aggiorna();
    requestAnimationFrame(passo);
  }
  function imposta(moto) {
    inMoto = moto;
    ultimoTempo = null;
    $('#moto').textContent = inMoto ? 'Ferma il movimento' : 'Avvia il movimento';
    if (inMoto) requestAnimationFrame(passo);
  }

  for (const v of varianti) {
    const bottone = document.createElement('button');
    bottone.type = 'button';
    bottone.dataset.id = v.id;
    bottone.textContent = v.titolo;
    bottone.addEventListener('click', () => scegli(v));
    $('#varianti').appendChild(bottone);
  }
  $('#moto').addEventListener('click', () => imposta(!inMoto));
  cursore.addEventListener('input', e => { imposta(false); comando = Number(e.target.value); aggiorna(); });
  controlli.addEventListener('change', disegna);
  new ResizeObserver(dimensiona).observe(contenitore);
  $('#alto').addEventListener('click', () => inquadra('alto'));
  $('#ripristina').addEventListener('click', () => inquadra('prospettiva'));
  $('#reali').addEventListener('change', e => {
    tutti.filter(o => !o.userData.stampato).forEach(o => { o.visible = e.target.checked; });
    varianti.forEach(v => { v.tracce.visible = e.target.checked; });
    disegna();
  });
  $('#separa').addEventListener('change', e => {
    const spostamenti = { 'base-siringa': [-16, 0, 0], 'base-servo': [16, 0, 0], 'piastra-giunzione': [0, 0, 25],
      'coperchio-sella-1': [-16, 0, 25], 'coperchio-sella-2': [-16, 0, 25], 'fermo-flangia': [0, 0, 25] };
    for (const o of tutti.filter(p => p.userData.stampato)) {
      o.position.set(...(e.target.checked ? spostamenti[o.userData.nome] ?? [0, 0, 0] : [0, 0, 0]));
    }
    disegna();
  });

  function seleziona(nome) {
    const descrizione = descrizioni[nome];
    dettagli.replaceChildren();
    const titolo = document.createElement('strong');
    titolo.textContent = descrizione?.[0] ?? nome;
    const testo = document.createElement('p');
    testo.textContent = descrizione?.[1] ?? '';
    dettagli.append(titolo, testo);
  }
  const selettore = $('#pezzo');
  for (const o of attiva.oggetti) {
    const opzione = document.createElement('option');
    opzione.value = o.userData.nome;
    opzione.textContent = descrizioni[o.userData.nome]?.[0] ?? o.userData.nome;
    selettore.appendChild(opzione);
  }
  selettore.addEventListener('change', e => seleziona(e.target.value));
  const raggio = new THREE.Raycaster();
  let pressione = null;
  renderer.domElement.addEventListener('pointerdown', e => { pressione = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!pressione || Math.hypot(e.clientX - pressione[0], e.clientY - pressione[1]) > 5) return;
    const rettangolo = renderer.domElement.getBoundingClientRect();
    raggio.setFromCamera(new THREE.Vector2((e.clientX - rettangolo.left) / rettangolo.width * 2 - 1,
      -(e.clientY - rettangolo.top) / rettangolo.height * 2 + 1), camera);
    const colpiti = raggio.intersectObjects(attiva.oggetti.filter(o => o.visible));
    if (colpiti.length) {
      const nome = colpiti[0].object.userData.nome;
      selettore.value = nome;
      seleziona(nome);
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    imposta(false);
    stato.textContent = 'La vista 3D si è interrotta: ricarica la pagina. Puoi anche aprire anteprima-assieme.png.';
  });
  seleziona('base-servo');
  selettore.value = 'base-servo';
  dimensiona();
  scegli(attiva);
  stato.textContent = 'Trascina per ruotare · scorri per ingrandire · clicca un pezzo per scoprirlo';
}

try {
  avvia();
} catch (errore) {
  stato.textContent = 'Impossibile avviare la vista 3D. Apri anteprima-assieme.png nella stessa cartella.';
  console.error(errore);
}
