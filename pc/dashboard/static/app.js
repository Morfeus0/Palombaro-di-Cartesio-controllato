// Dashboard del banco: comando manuale del servo e lettura in diretta del registro della seriale.
// Il flusso arriva dal server come Server-Sent Events; i comandi partono con una POST a /api/servo.
import { Grafico, puntoVicino, orario } from "./grafico.js";

// Stima dello stantuffo (ml) dal comando del servo: modello del manovellismo del 23 ottobre.
const MODELLO_ML = [[36, 18.2], [46, 17.1], [56, 15.8], [66, 14.3], [76, 12.7], [86, 11.0],
  [96, 9.2], [106, 7.5], [116, 5.8], [126, 4.3], [136, 2.9], [146, 1.5]];
const STORIA_S = 330;           // si tengono poco più di 5 minuti
const PERIODO_COMANDO_MS = 150; // mentre si trascina il cursore, al massimo un comando ogni 150 ms
const DIRETTA_MS = 1500;        // oltre questo tempo senza misure il registro è "fermo"
const PERIODO_DISEGNO_MS = 100;
const LIMITI_PLAUSIBILI = { pMin: 80, pMax: 120, tMin: -10, tMax: 60 };

const $ = (id) => document.getElementById(id);
const el = {
  cursore: $("cursore"), comandato: $("angolo-comandato"), attuale: $("angolo-attuale"), ml: $("stima-ml"),
  esito: $("esito"), dp: $("dp"), p: $("p"), temperatura: $("temperatura"), riferimento: $("riferimento"),
  registro: $("stato-registro"), sensore: $("stato-sensore"), letture: $("stato-letture"),
  eventi: $("eventi"), tabella: $("tabella-corpo"), area: $("area-grafici"), suggerimento: $("suggerimento"),
  etichettaMin: $("etichetta-min"), etichettaMax: $("etichetta-max"),
};

const stato = {
  config: { angoloMin: 36, angoloMax: 146, angoloCentro: 86 },
  punti: [],         // misure aggregate a 10 Hz: {s, p, T, servo}
  secchio: null,     // aggregazione in corso
  ultima: null,      // ultima misura grezza
  arrivo: 0,         // Date.now() dell'ultima misura in diretta
  riferimento: null, // pressione dello zero di Δp
  comandato: null,
  toccato: false,    // l'utente ha già mosso il comando?
  finestra: 120,
  mirino: null,
  registroPresente: true,
  connesso: false,
  letture: null,
  sensoreAssente: false,
};

const graficoPressione = new Grafico($("grafico-pressione"), { variabileColore: "--serie-pressione", decimali: 2, minimaAmpiezza: 0.2 });
const graficoServo = new Grafico($("grafico-servo"), {
  variabileColore: "--serie-servo", decimali: 0, gradino: true, scalaFissa: [30, 152], tacche: [36, 86, 146],
});

// ---------- utilità ----------
const numero = (v, decimali) => v.toLocaleString("it-IT", { minimumFractionDigits: decimali, maximumFractionDigits: decimali });
const conSegno = (v, decimali) => (v > 0 ? "+" : v < 0 ? "−" : "") + numero(Math.abs(v), decimali);

function secondi(orarioTesto) {
  const [h, m, s] = orarioTesto.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function stimaMl(angolo) {
  for (let i = 1; i < MODELLO_ML.length; i++) {
    const [a0, v0] = MODELLO_ML[i - 1], [a1, v1] = MODELLO_ML[i];
    if (angolo <= a1) return v0 + ((angolo - a0) / (a1 - a0)) * (v1 - v0);
  }
  return MODELLO_ML.at(-1)[1];
}

const limita = (a) => Math.min(stato.config.angoloMax, Math.max(stato.config.angoloMin, Math.round(a)));

// ---------- dati in arrivo ----------
function aggiungiMisura(v, inDiretta) {
  const s = secondi(v.t);
  const chiave = Math.floor(s * 10);
  const b = stato.secchio;
  if (b && b.chiave === chiave) {
    stato.secchio = { ...b, n: b.n + 1, p: b.p + v.p, T: b.T + v.T, servo: v.servo };
  } else {
    if (b) stato.punti.push({ s: b.chiave / 10, p: b.p / b.n, T: b.T / b.n, servo: b.servo });
    stato.secchio = { chiave, n: 1, p: v.p, T: v.T, servo: v.servo };
  }
  const limite = s - STORIA_S;
  if (stato.punti.length && stato.punti[0].s < limite) stato.punti = stato.punti.filter((p) => p.s >= limite);
  stato.ultima = { ...v, s };
  if (stato.riferimento === null) stato.riferimento = v.p;
  if (inDiretta) { stato.arrivo = Date.now(); stato.sensoreAssente = false; }
  if (!stato.toccato) impostaCursore(v.servo);
}

function classifica(testo) {
  if (/perso|assente|non trovato|ERRORE|BROWNOUT/i.test(testo)) return ["critico", "allarme"];
  if (/^inviato/.test(testo)) return ["comando", "comando"];
  if (/avvio|porta aperta|ritrovato|servo al centro|limiti/i.test(testo)) return ["info", "sistema"];
  return ["nota", "nota"];
}

function aggiungiEvento(v) {
  const letture = /^letture\/s:\s*(\d+)/.exec(v.testo);
  if (letture) { stato.letture = Number(letture[1]); return; }
  if (/^servo verso/.test(v.testo)) return; // doppione di "inviato"
  // Il comando può arrivare anche da fuori (sequenze automatiche, Terminal): la pagina lo segue,
  // tranne nei 2 secondi dopo un comando dato da qui, per non far saltare il cursore sotto le dita.
  const inviato = /^inviato:\s*(\d+)/.exec(v.testo);
  if (inviato && Date.now() - ultimoInvio > 2000) { stato.comandato = Number(inviato[1]); impostaCursore(stato.comandato); }
  if (/perso|assente|non trovato/i.test(v.testo)) stato.sensoreAssente = true;
  if (/ritrovato/i.test(v.testo)) stato.sensoreAssente = false;

  const [livello, tipo] = classifica(v.testo);
  const voce = document.createElement("li");
  voce.className = "evento";
  voce.dataset.livello = livello;
  for (const [classe, testo] of [["evento-ora", v.t.slice(0, 8)], ["evento-tipo", tipo], ["evento-testo", v.testo]]) {
    const span = document.createElement("span");
    span.className = classe;
    span.textContent = testo;
    voce.append(span);
  }
  el.eventi.querySelector(".evento-vuoto")?.remove();
  el.eventi.prepend(voce);
  while (el.eventi.children.length > 60) el.eventi.lastElementChild.remove();
}

function riceviVoci(voci, inDiretta) {
  for (const v of voci) {
    if (v.tipo === "misura") aggiungiMisura(v, inDiretta);
    else if (v.tipo === "evento") aggiungiEvento(v);
  }
}

function collega() {
  const flusso = new EventSource("/api/flusso");
  flusso.addEventListener("storia", (e) => {
    const dati = JSON.parse(e.data);
    stato.connesso = true;
    stato.registroPresente = dati.registroPresente;
    riceviVoci(dati.voci, false);
    if (!el.eventi.children.length) {
      const vuoto = document.createElement("li");
      vuoto.className = "evento-vuoto";
      vuoto.textContent = "Nessun evento negli ultimi minuti.";
      el.eventi.append(vuoto);
    }
  });
  flusso.addEventListener("lotto", (e) => {
    stato.connesso = true;
    stato.registroPresente = true;
    riceviVoci(JSON.parse(e.data).voci, true);
  });
  flusso.addEventListener("stato", (e) => { stato.registroPresente = JSON.parse(e.data).registroPresente; });
  flusso.onerror = () => { stato.connesso = false; };
}

// ---------- comando del servo ----------
function impostaCursore(angolo) {
  el.cursore.value = String(angolo);
  el.cursore.setAttribute("aria-valuetext", `${angolo} gradi`);
  el.comandato.textContent = `${angolo}°`;
  el.ml.textContent = numero(stimaMl(angolo), 1);
}

function mostraEsito(testo, livello = "") {
  el.esito.textContent = testo;
  el.esito.dataset.livello = livello;
}

async function invia(angolo) {
  const valore = limita(angolo);
  stato.comandato = valore;
  stato.toccato = true;
  impostaCursore(valore);
  try {
    const risposta = await fetch("/api/servo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ angolo: valore }),
    });
    const corpo = await risposta.json();
    if (!risposta.ok) throw new Error(corpo.errore || `errore ${risposta.status}`);
    const fermo = Date.now() - stato.arrivo > DIRETTA_MS;
    mostraEsito(fermo
      ? `Comando ${valore}° scritto, ma il registro è fermo: il registratore è acceso?`
      : `Inviato ${valore}° alle ${new Date().toLocaleTimeString("it-IT")}.`, fermo ? "critico" : "");
  } catch (errore) {
    mostraEsito(`Comando non inviato: ${errore instanceof Error ? errore.message : "errore sconosciuto"}.`, "critico");
  }
}

let ultimoInvio = 0, inSospeso = null;
function inviaLimitato(angolo) {
  const adesso = Date.now();
  clearTimeout(inSospeso);
  if (adesso - ultimoInvio >= PERIODO_COMANDO_MS) { ultimoInvio = adesso; invia(angolo); }
  else inSospeso = setTimeout(() => { ultimoInvio = Date.now(); invia(angolo); }, PERIODO_COMANDO_MS);
}

function passo(delta) {
  const base = stato.comandato ?? Number(el.cursore.value);
  invia(base + delta);
}

function preparaComandi() {
  el.cursore.addEventListener("input", () => {
    stato.toccato = true;
    impostaCursore(Number(el.cursore.value));
    inviaLimitato(Number(el.cursore.value));
  });
  el.cursore.addEventListener("change", () => { clearTimeout(inSospeso); invia(Number(el.cursore.value)); });
  for (const b of document.querySelectorAll(".passo")) b.addEventListener("click", () => passo(Number(b.dataset.passo)));
  const fissi = { min: () => stato.config.angoloMin, centro: () => stato.config.angoloCentro, max: () => stato.config.angoloMax };
  for (const b of document.querySelectorAll(".preset-voce")) b.addEventListener("click", () => invia(fissi[b.dataset.angolo]()));
  $("azzera").addEventListener("click", () => {
    if (stato.ultima) { stato.riferimento = stato.ultima.p; mostraEsito(`Zero di Δp a ${numero(stato.riferimento, 3)} kPa.`); }
  });

  // In alto si tira, in basso si spinge: freccia su = angolo più piccolo.
  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLElement && e.target.matches("input:not(#cursore), textarea")) return;
    const ampiezza = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowUp") { e.preventDefault(); passo(-ampiezza); }
    else if (e.key === "ArrowDown") { e.preventDefault(); passo(ampiezza); }
    else if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey) invia(stato.config.angoloCentro);
  });

  for (const b of document.querySelectorAll(".segmento")) {
    b.addEventListener("click", () => {
      stato.finestra = Number(b.dataset.finestra);
      for (const altro of document.querySelectorAll(".segmento")) altro.setAttribute("aria-pressed", String(altro === b));
    });
  }

  el.area.addEventListener("pointermove", (e) => {
    const r = graficoPressione.canvas.getBoundingClientRect();
    stato.mirino = graficoPressione.tempoDa(e.clientX - r.left);
  });
  el.area.addEventListener("pointerleave", () => { stato.mirino = null; });
}

// ---------- tema ----------
function preparaTema() {
  try {
    const salvato = localStorage.getItem("tema-banco");
    if (salvato === "light" || salvato === "dark") document.documentElement.dataset.theme = salvato;
  } catch { /* archivio del browser non disponibile: si segue il sistema */ }
  $("tema").addEventListener("click", () => {
    const scuro = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = scuro ? "light" : "dark";
    try { localStorage.setItem("tema-banco", document.documentElement.dataset.theme); } catch { /* niente */ }
  });
}

// ---------- disegno ----------
function pillola(nodo, livello, testo) {
  nodo.dataset.livello = livello;
  nodo.querySelector(".pillola-testo").textContent = testo;
}

function aggiornaStati() {
  const eta = Date.now() - stato.arrivo;
  const inDiretta = stato.arrivo > 0 && eta < DIRETTA_MS;
  if (!stato.connesso) pillola(el.registro, "critico", "Dashboard: server non raggiungibile");
  else if (!stato.registroPresente) pillola(el.registro, "attesa", "Registro: non ancora avviato");
  else if (inDiretta) pillola(el.registro, "buono", "Registro: in diretta");
  else if (stato.arrivo === 0) pillola(el.registro, "attesa", "Registro: in attesa di dati");
  else pillola(el.registro, "attenzione", `Registro: fermo da ${Math.round(eta / 1000)} s`);

  const u = stato.ultima;
  const fuoriScala = u && (u.p < LIMITI_PLAUSIBILI.pMin || u.p > LIMITI_PLAUSIBILI.pMax || u.T < LIMITI_PLAUSIBILI.tMin || u.T > LIMITI_PLAUSIBILI.tMax);
  if (stato.sensoreAssente && !inDiretta) pillola(el.sensore, "critico", "Sensore: non risponde");
  else if (fuoriScala && inDiretta) pillola(el.sensore, "critico", "Sensore: valori fuori scala");
  else if (inDiretta) pillola(el.sensore, "buono", "Sensore: ok");
  else pillola(el.sensore, "attesa", "Sensore: —");
  el.letture.querySelector(".pillola-testo").textContent = `${stato.letture ?? "—"} letture/s`;
}

function aggiornaLetture() {
  const u = stato.ultima;
  if (!u) return;
  el.p.textContent = numero(u.p, 3);
  el.temperatura.textContent = numero(u.T, 1);
  el.dp.textContent = conSegno(u.p - stato.riferimento, 3);
  el.riferimento.textContent = numero(stato.riferimento, 3);
  el.attuale.textContent = `${u.servo}°`;
}

function aggiornaSuggerimento(serieP, serieS) {
  if (stato.mirino === null || !serieP.length) { el.suggerimento.hidden = true; return; }
  const p = puntoVicino(serieP, stato.mirino), s = puntoVicino(serieS, stato.mirino);
  el.suggerimento.replaceChildren();
  const ora = document.createElement("span");
  ora.className = "ora";
  ora.textContent = orario(p.s);
  el.suggerimento.append(ora);
  for (const [colore, nome, valore] of [["--serie-pressione", "Δp", `${conSegno(p.v, 3)} kPa`], ["--serie-servo", "Servo", `${s.v}°`]]) {
    const riga = document.createElement("span");
    riga.className = "riga";
    const tacca = document.createElement("span");
    tacca.className = "tacca";
    tacca.style.background = `var(${colore})`;
    const forte = document.createElement("strong");
    forte.textContent = valore;
    riga.append(tacca, document.createTextNode(nome), forte);
    el.suggerimento.append(riga);
  }
  el.suggerimento.hidden = false;
  const x = graficoPressione.xDi(p.s);
  const larghezza = el.suggerimento.offsetWidth, area = el.area.clientWidth;
  el.suggerimento.style.left = `${Math.min(area - larghezza, Math.max(0, x + 14))}px`;
}

function aggiornaTabella() {
  const perSecondo = new Map();
  for (const p of stato.punti.slice(-100)) perSecondo.set(Math.floor(p.s), p);
  const righe = [...perSecondo.values()].slice(-10).reverse();
  el.tabella.replaceChildren(...righe.map((p) => {
    const tr = document.createElement("tr");
    for (const testo of [orario(p.s), conSegno(p.p - stato.riferimento, 3), numero(p.p, 3), numero(p.T, 2), String(p.servo)]) {
      const td = document.createElement("td");
      td.textContent = testo;
      tr.append(td);
    }
    return tr;
  }));
}

let ultimoDisegno = 0;
function ciclo(adesso) {
  requestAnimationFrame(ciclo);
  if (adesso - ultimoDisegno < PERIODO_DISEGNO_MS) return;
  ultimoDisegno = adesso;
  aggiornaStati();
  if (!stato.punti.length) return;
  aggiornaLetture();
  const t1 = stato.punti.at(-1).s;
  const serieP = stato.punti.map((p) => ({ s: p.s, v: p.p - stato.riferimento }));
  const serieS = stato.punti.map((p) => ({ s: p.s, v: p.servo }));
  graficoPressione.disegna(serieP, t1, stato.finestra, stato.mirino);
  graficoServo.disegna(serieS, t1, stato.finestra, stato.mirino);
  aggiornaSuggerimento(serieP, serieS);
  if (document.querySelector(".tabella").open) aggiornaTabella();
}

async function avvia() {
  preparaTema();
  try {
    const risposta = await fetch("/api/config");
    stato.config = await risposta.json();
  } catch {
    mostraEsito("Configurazione non letta: uso i limiti 36–146°.", "critico");
  }
  el.cursore.min = String(stato.config.angoloMin);
  el.cursore.max = String(stato.config.angoloMax);
  el.etichettaMin.textContent = `${stato.config.angoloMin}°`;
  el.etichettaMax.textContent = `${stato.config.angoloMax}°`;
  // l'etichetta "centro" all'altezza esatta di angoloCentro (il cursore ha 7 px di margine per lato)
  const quota = (stato.config.angoloCentro - stato.config.angoloMin) / (stato.config.angoloMax - stato.config.angoloMin);
  document.querySelector(".corsa-centro").style.top = `calc(${(quota * 100).toFixed(2)}% + ${(7 - quota * 14).toFixed(1)}px)`;
  impostaCursore(stato.config.angoloCentro);
  preparaComandi();
  collega();
  requestAnimationFrame(ciclo);
}

avvia();
