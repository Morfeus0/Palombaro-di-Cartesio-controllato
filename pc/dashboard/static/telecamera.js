// Pannello «Telecamera» della dashboard (sottofase 2.1): immagine dal vivo, guide, colonna d'acqua, riferimento,
// maschera del rosso, misure e controlli della postazione. Legge i file scritti da pc/telecamera.py attraverso il
// server e gli manda i comandi con una POST a /api/telecamera/comando.
// È la base dell'interfaccia finale: qui la 2.2 disegnerà il riquadro del palombaro e la quota.

const PERIODO_IMMAGINE_MS = 200; // 5 immagini al secondo: per guardare basta, e il Mac non fatica
const PERIODO_STATO_MS = 200;  // come il giro di pc/telecamera.py: il riquadro di P1 segue l'immagine
const VECCHIO_S = 2;             // stato più vecchio di così: il programma della telecamera è fermo
const SECONDI_REGISTRAZIONE = 120;
const LATO_MIN_COLONNA = 20;     // come LATO_MIN_ROI in pc/postazione.py

const CONTROLLI = [
  ["risoluzione", "Risoluzione 1920 × 1080", "F1"],
  ["fps", "Fotogrammi al secondo", "F1"],
  ["esposizione", "Esposizione stabile", "F4"],
  ["riflessi", "Niente riflessi nella colonna", "E4"],
  ["nitidezza", "Immagine nitida", "F3"],
  ["rosso", "Un solo rosso: il marcatore", "F5"],
];

const $ = (id) => document.getElementById(id);
const el = {
  scena: $("tc-scena"), immagine: $("tc-immagine"), fantasma: $("tc-fantasma"), tela: $("tc-sovrapposto"),
  vuoto: $("tc-vuoto"), stato: $("tc-stato"), controlli: $("tc-controlli"), esito: $("tc-esito"), eventi: $("tc-eventi"),
  risoluzione: $("tc-risoluzione"), fps: $("tc-fps"), interruzioni: $("tc-interruzioni"), luce: $("tc-luce"),
  riflessi: $("tc-riflessi"), nitidezza: $("tc-nitidezza"), rosse: $("tc-rosse"), palombaro: $("tc-palombaro"), colonna: $("tc-colonna"), rif: $("tc-rif"),
  riferimento: $("tc-riferimento"), registra: $("tc-registra"), colonnaVia: $("tc-colonna-via"),
  mini: $("tc-mini"), miniTela: $("tc-mini-tela"),
};

const tc = {
  stato: null,              // ultimo stato.json (con presente ed eta_s)
  strati: { guide: true, fantasma: false, rosso: false },
  trascinamento: null,      // {x0, y0, x1, y1} in pixel della tela, mentre si disegna la colonna
  numeroImmagine: 0,
  riferimentoVersione: "",
  scenaInVista: true,       // l'immagine grande è sullo schermo: la miniatura non serve
};

const numero = (v, decimali = 0) =>
  v === null || v === undefined ? "—" : v.toLocaleString("it-IT", { minimumFractionDigits: decimali, maximumFractionDigits: decimali });
const minuti = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const colore = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

function mostraEsito(testo, livello = "") {
  el.esito.textContent = testo;
  el.esito.dataset.livello = livello;
}

async function invia(comando, conferma) {
  try {
    const risposta = await fetch("/api/telecamera/comando", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(comando),
    });
    const corpo = await risposta.json();
    if (!risposta.ok) throw new Error(corpo.errore || `errore ${risposta.status}`);
    mostraEsito(conferma);
  } catch (errore) {
    mostraEsito(`Comando non inviato: ${errore.message}`, "critico");
  }
}

// ---------- immagine dal vivo ----------
function prossimaImmagine() {
  const nome = tc.strati.rosso ? "rosso" : "anteprima";
  el.immagine.dataset.inizio = String(performance.now());
  el.immagine.src = `/api/telecamera/${nome}.jpg?n=${++tc.numeroImmagine}`;
}

function preparaImmagine() {
  el.immagine.addEventListener("load", () => {
    el.immagine.hidden = false;
    el.vuoto.hidden = true;
    adattaTela();
    aggiornaMini();
    const trascorso = performance.now() - Number(el.immagine.dataset.inizio);
    setTimeout(prossimaImmagine, Math.max(0, PERIODO_IMMAGINE_MS - trascorso));
  });
  el.immagine.addEventListener("error", () => {
    el.immagine.hidden = true;
    el.vuoto.hidden = false;
    aggiornaMini();
    setTimeout(prossimaImmagine, 1000);
  });
  prossimaImmagine();
}

function aggiornaFantasma() {
  const r = tc.stato?.riferimento;
  const versione = r ? `${r.data}-${r.ora}` : "";
  if (versione && versione !== tc.riferimentoVersione) {
    tc.riferimentoVersione = versione;
    el.fantasma.src = `/api/telecamera/riferimento.jpg?v=${encodeURIComponent(versione)}`;
  }
  el.fantasma.hidden = !(tc.strati.fantasma && versione && !el.immagine.hidden);
}

// ---------- miniatura: la telecamera resta visibile mentre si scorre fino ai grafici ----------
// Ricopia l'ultimo fotogramma (con guide e zone rosse) senza chiedere al server un'immagine in più.
function aggiornaMini() {
  const mostra = !tc.scenaInVista && !el.immagine.hidden;
  if (mostra === el.mini.hidden) {
    el.mini.hidden = !mostra;
    requestAnimationFrame(() => { el.mini.dataset.visibile = mostra ? "si" : "no"; });
  }
  if (!mostra) return;
  const { naturalWidth: wi, naturalHeight: hi } = el.immagine;
  if (!wi || !hi) return;
  const dpr = window.devicePixelRatio || 1;
  const larghezza = Math.round(el.mini.clientWidth * dpr), altezza = Math.round(larghezza * hi / wi);
  if (el.miniTela.width !== larghezza || el.miniTela.height !== altezza) {
    el.miniTela.width = larghezza;
    el.miniTela.height = altezza;
    el.miniTela.style.aspectRatio = `${wi} / ${hi}`;
  }
  const ctx = el.miniTela.getContext("2d");
  ctx.drawImage(el.immagine, 0, 0, larghezza, altezza);
  if (el.tela.width) ctx.drawImage(el.tela, 0, 0, larghezza, altezza);
}

function preparaMini() {
  new IntersectionObserver(([voce]) => {
    // in vista se se ne vede almeno un terzo: con meno, P1 può essere già fuori dallo schermo
    tc.scenaInVista = voce.intersectionRatio >= 0.35;
    aggiornaMini();
  }, { threshold: [0, 0.35, 1] }).observe(el.scena);
  el.mini.addEventListener("click", () => {
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("telecamera").scrollIntoView({ behavior: riduci ? "auto" : "smooth", block: "start" });
  });
}

// ---------- sovrapposizioni: guide, colonna, zone rosse ----------
function adattaTela() {
  const { width, height } = el.immagine.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  if (el.tela.width !== Math.round(width * dpr) || el.tela.height !== Math.round(height * dpr)) {
    el.tela.width = Math.round(width * dpr);
    el.tela.height = Math.round(height * dpr);
  }
  disegna();
}

// Fattore da pixel della tela (CSS) a pixel della piena risoluzione.
function scala() {
  const larghezza = tc.stato?.larghezza;
  const { width } = el.tela.getBoundingClientRect();
  return larghezza && width ? larghezza / width : null;
}

function rettangolo(ctx, x, y, w, h, tinta, spessore, tratteggio = []) {
  ctx.save();
  ctx.strokeStyle = tinta;
  ctx.lineWidth = spessore;
  ctx.setLineDash(tratteggio);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function disegna() {
  const ctx = el.tela.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = el.tela.width / dpr, h = el.tela.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const s = scala();
  if (!s || el.immagine.hidden) return;
  const accento = colore("--accento"), critico = colore("--stato-critico");

  if (tc.strati.guide) {
    ctx.save();
    ctx.strokeStyle = accento;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);   // verticale: bordo del righello e asse della bottiglia
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);   // orizzontale: altezza della lente sul righello
    ctx.stroke();
    ctx.restore();
  }
  const roi = tc.stato?.roi;
  if (roi) rettangolo(ctx, roi[0] / s, roi[1] / s, roi[2] / s, roi[3] / s, accento, 2);
  for (const [i, z] of (tc.stato?.zone_rosse || []).entries()) {
    rettangolo(ctx, z.x / s - 3, z.y / s - 3, z.w / s + 6, z.h / s + 6, critico, 1.5);
    ctx.fillStyle = critico;
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText(String(i + 1), z.x / s - 3, z.y / s - 6);
  }
  disegnaPalombaro(ctx, s, w, colore("--stato-buono"), critico);
  const t = tc.trascinamento;
  if (t) rettangolo(ctx, Math.min(t.x0, t.x1), Math.min(t.y0, t.y1), Math.abs(t.x1 - t.x0), Math.abs(t.y1 - t.y0), accento, 1.5, [4, 3]);
}

// Il riconoscimento della 2.2: riquadro verde sul marcatore, oppure l'avviso se P1 manca o è perso.
function disegnaPalombaro(ctx, s, larghezza, verde, rosso) {
  const m = tc.stato?.marcatore;
  if (!m) return;
  ctx.save();
  ctx.font = "600 12px 'IBM Plex Mono', monospace";
  if (m.trovato && m.riquadro) {
    const [x, y, w, h] = m.riquadro;
    rettangolo(ctx, x / s - 4, y / s - 4, w / s + 8, h / s + 8, verde, 2);
    ctx.fillStyle = verde;
    ctx.fillText(`P1 · y ${numero(m.y)} px`, x / s + w / s + 8, y / s + 10);
  } else {
    const testo = m.perso ? "P1 perso" : `P1 non visto da ${numero(m.da_quanto_s, 2)} s`;
    ctx.fillStyle = rosso;
    ctx.fillText(testo, larghezza - ctx.measureText(testo).width - 10, 18);
  }
  ctx.restore();
}

function puntoTela(evento) {
  const r = el.tela.getBoundingClientRect();
  return { x: Math.min(Math.max(evento.clientX - r.left, 0), r.width), y: Math.min(Math.max(evento.clientY - r.top, 0), r.height) };
}

function preparaColonna() {
  el.tela.addEventListener("pointerdown", (e) => {
    if (!scala()) return;
    const { x, y } = puntoTela(e);
    tc.trascinamento = { x0: x, y0: y, x1: x, y1: y };
    el.tela.setPointerCapture(e.pointerId);
  });
  el.tela.addEventListener("pointermove", (e) => {
    if (!tc.trascinamento) return;
    const { x, y } = puntoTela(e);
    tc.trascinamento = { ...tc.trascinamento, x1: x, y1: y };
    disegna();
  });
  el.tela.addEventListener("pointerup", () => {
    const t = tc.trascinamento, s = scala();
    tc.trascinamento = null;
    disegna();
    if (!t || !s) return;
    const roi = {
      comando: "roi",
      x: Math.round(Math.min(t.x0, t.x1) * s), y: Math.round(Math.min(t.y0, t.y1) * s),
      w: Math.round(Math.abs(t.x1 - t.x0) * s), h: Math.round(Math.abs(t.y1 - t.y0) * s),
    };
    if (roi.w < LATO_MIN_COLONNA || roi.h < LATO_MIN_COLONNA) {
      mostraEsito("Rettangolo troppo piccolo: trascina dal fondo della bottiglia fino sopra il pelo dell'acqua.", "critico");
      return;
    }
    invia(roi, `Colonna: ${roi.w} × ${roi.h} pixel. Le misure di luce e riflessi ora valgono lì dentro.`);
  });
}

// ---------- stato, misure e controlli ----------
function pillola(livello, testo) {
  el.stato.dataset.livello = livello;
  el.stato.querySelector(".pillola-testo").textContent = testo;
}

function mostraControlli(verdetto) {
  el.controlli.replaceChildren(...CONTROLLI.map(([chiave, etichetta, passo]) => {
    const esito = verdetto ? verdetto[chiave] : undefined;
    const voce = document.createElement("li");
    voce.className = "tc-controllo";
    voce.dataset.esito = esito === true ? "si" : esito === false ? "no" : "boh";
    for (const [classe, testo] of [["tc-segno", esito === true ? "✓" : esito === false ? "✗" : "—"],
      ["tc-etichetta", etichetta], ["tc-passo mono", passo]]) {
      const span = document.createElement("span");
      span.className = classe;
      span.textContent = testo;
      voce.append(span);
    }
    voce.title = esito === true ? "superato" : esito === false ? "non superato" : "non ancora giudicato";
    return voce;
  }));
  if (!verdetto) {
    const nota = document.createElement("li");
    nota.className = "tc-nota";
    nota.textContent = "Giudizio da scrivere: verdetto_postazione() in pc/postazione.py.";
    el.controlli.append(nota);
  }
}

function mostraMisure(s) {
  el.risoluzione.textContent = s.larghezza ? `${s.larghezza} × ${s.altezza}` : "—";
  el.fps.textContent = s.fps === null || s.fps === undefined ? "—" : `${numero(s.fps, 1)} fps · max ${numero(s.intervallo_max_ms)} ms`;
  el.interruzioni.textContent = numero(s.interruzioni);
  el.luce.textContent = s.luminosita === undefined ? "—"
    : `${numero(s.luminosita)} · deriva ${s.deriva_pct === null ? "—" : numero(s.deriva_pct, 1) + " %"} in ${minuti(s.deriva_finestra_s || 0)}`;
  el.riflessi.textContent = s.riflessi_pct === undefined ? "—" : `${numero(s.riflessi_pct, 2)} %`;
  el.nitidezza.textContent = s.nitidezza === undefined ? "—"
    : `${numero(s.nitidezza)}${s.nitidezza_riferimento ? ` (rif. ${numero(s.nitidezza_riferimento)})` : ""}`;
  const zone = s.zone_rosse || [], nellaColonna = s.zone_rosse_colonna || [];
  el.rosse.textContent = `${nellaColonna.length} nella colonna · ${zone.length} in tutto`;
  el.colonna.textContent = s.roi ? `${s.roi[2]} × ${s.roi[3]} da (${s.roi[0]}, ${s.roi[1]})` : "tutta l'immagine";
  const m = s.marcatore;
  el.palombaro.textContent = !m ? "—"
    : `${m.trovato ? `y ${numero(m.y, 1)} px` : m.perso ? "perso" : "non visto"} · ${numero(m.fps, 0)} fps`;
  el.rif.textContent = s.riferimento ? `${s.riferimento.data} ${s.riferimento.ora}` : "nessuno";
  const reg = s.registrazione || {};
  el.registra.textContent = reg.attiva ? `Ferma (${minuti(reg.secondi_rimasti)})` : "Registra 2 min";
  el.registra.dataset.attiva = reg.attiva ? "si" : "no";
  el.eventi.replaceChildren(...(s.eventi || []).slice(0, 5).map((e) => {
    const voce = document.createElement("li");
    voce.textContent = `${e.ora}  ${e.testo}`;
    return voce;
  }));
}

async function leggiStato() {
  try {
    const risposta = await fetch("/api/telecamera/stato", { cache: "no-store" });
    const s = await risposta.json();
    tc.stato = s;
    if (!s.presente) {
      pillola("attesa", "Telecamera: spenta");
      mostraControlli(null);
    } else if (s.eta_s > VECCHIO_S) {
      pillola("critico", `Telecamera: ferma da ${numero(s.eta_s)} s`);
    } else if (!s.fps) {
      pillola("critico", "Telecamera: nessun fotogramma");
    } else {
      pillola("buono", `Telecamera: ${numero(s.fps, 1)} fps`);
    }
    if (s.presente) {
      mostraMisure(s);
      mostraControlli(s.verdetto);
    }
    aggiornaFantasma();
    disegna();
  } catch {
    pillola("critico", "Telecamera: server non raggiungibile");
  }
}

// ---------- comandi ----------
function preparaComandi() {
  for (const b of document.querySelectorAll(".tc-strati .segmento")) {
    b.addEventListener("click", () => {
      const nome = b.dataset.strato;
      tc.strati[nome] = !tc.strati[nome];
      b.setAttribute("aria-pressed", String(tc.strati[nome]));
      if (nome === "fantasma" && tc.strati.fantasma) {
        mostraEsito(tc.stato?.riferimento
          ? "Riferimento sovrapposto per differenza: ciò che non si è mosso diventa scuro, ciò che si è spostato mostra un bordo chiaro."
          : "Nessun riferimento salvato: prima «Salva riferimento».", tc.stato?.riferimento ? "" : "critico");
      }
      aggiornaFantasma();
      disegna();
    });
  }
  el.riferimento.addEventListener("click", () => invia({ comando: "riferimento" }, "Riferimento salvato in pc/config/: servirà per ritrovare l'inquadratura."));
  el.registra.addEventListener("click", () => {
    if (el.registra.dataset.attiva === "si") invia({ comando: "ferma" }, "Registrazione fermata.");
    else invia({ comando: "registra", secondi: SECONDI_REGISTRAZIONE }, "Registrazione avviata: 2 minuti.");
  });
  el.colonnaVia.addEventListener("click", () => invia({ comando: "roi_via" }, "Colonna tolta: le misure valgono su tutta l'immagine."));
  // la colonna può cambiare larghezza anche senza ridimensionare la finestra (cambio di disposizione)
  new ResizeObserver(adattaTela).observe(el.scena);
}

preparaImmagine();
preparaColonna();
preparaMini();
preparaComandi();
mostraControlli(null);
leggiStato();
setInterval(leggiStato, PERIODO_STATO_MS);
