// Sottofase 5.5: pannello di controllo. Manda i comandi del protocollo e la registrazione al server
// (/api/protocollo, /api/esperimento), che li passa al ponte; segue stato e quota dal flusso del registro.
import { Grafico } from "./grafico.js";

const FINESTRA_S = 60;
const PERIODO_DISEGNO_MS = 150;
const STATI = { M: "MANUALE", C: "CALIBRAZIONE", H: "HOLD", S: "SAFE", T: "TRACKING" };

const $ = (id) => document.getElementById(id);
const esito = $("esito-pannello");
const grafico = new Grafico($("grafico-quota"), { variabileColore: "--serie-pressione", decimali: 1, minimaAmpiezza: 2 });
const punti = [];

const secondi = (orario) => {
  const [h, m, s] = orario.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};
const numero = (v) => String(Number(v));   // il firmware vuole il punto decimale, mai la virgola

function scriviEsito(testo, critico = false) {
  esito.textContent = testo;
  esito.dataset.livello = critico ? "critico" : "";
}

async function manda(percorso, corpo) {
  try {
    const risposta = await fetch(percorso, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo),
    });
    const dati = await risposta.json();
    if (!risposta.ok) { scriviEsito(`Non mandato: ${dati.errore}`, true); return; }
    scriviEsito(`Mandato: ${dati.riga}`);
  } catch (errore) {
    scriviEsito(`Server non raggiungibile: ${errore.message}`, true);
  }
}
const comando = (testo) => manda("/api/protocollo", { comando: testo });

document.querySelectorAll("[data-comando]").forEach((b) => b.addEventListener("click", () => comando(b.dataset.comando)));

$("form-quota").addEventListener("submit", (e) => {
  e.preventDefault();
  const cm = Number($("quota-voluta").value);
  comando(`R,${Math.round(cm * 100)}`);   // decimi di millimetro
});
$("form-pi").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  comando(`K,P,${numero(f.get("kp"))},${numero(f.get("ki"))}`);
});
$("form-pid").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  comando(`K,Z,${["kp", "ki", "kd", "n"].map((k) => numero(f.get(k))).join(",")}`);
});
$("form-onoff").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  comando(`K,O,${numero(f.get("isteresi"))},${numero(f.get("ampiezza"))}`);
});
$("form-registra").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  manda("/api/esperimento", { azione: "inizia", nome: f.get("nome"), durata: f.get("durata"), note: f.get("note") });
});
$("ferma-registrazione").addEventListener("click", () => manda("/api/esperimento", { azione: "fine" }));

function ricevi(voci) {
  for (const v of voci) {
    if (v.tipo === "misura" && v.stato) $("pannello-stato").textContent = STATI[v.stato] ?? v.stato;
    if (v.tipo === "quota") {
      punti.push({ s: secondi(v.t), v: v.quota });
      $("quota-misurata").textContent = v.quota.toFixed(1).replace(".", ",");
      $("quota-rif").textContent = v.rif.toFixed(1).replace(".", ",");
    }
  }
  const limite = (punti.at(-1)?.s ?? 0) - FINESTRA_S - 5;
  while (punti.length && punti[0].s < limite) punti.shift();
}

const flusso = new EventSource("/api/flusso");
flusso.addEventListener("storia", (e) => ricevi(JSON.parse(e.data).voci));
flusso.addEventListener("lotto", (e) => ricevi(JSON.parse(e.data).voci));

let ultimo = 0;
function disegna(adesso) {
  requestAnimationFrame(disegna);
  if (adesso - ultimo < PERIODO_DISEGNO_MS || !punti.length) return;
  ultimo = adesso;
  grafico.disegna(punti, punti.at(-1).s, FINESTRA_S, null);
}
requestAnimationFrame(disegna);
