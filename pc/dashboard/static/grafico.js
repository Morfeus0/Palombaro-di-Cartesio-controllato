// Grafico a linea su canvas: una sola serie, un solo asse y, tempo sull'asse x.
// I colori arrivano dalle variabili CSS, così il tema chiaro/scuro cambia anche i grafici.

const MARGINE = { sinistra: 52, destra: 12, alto: 8, basso: 22 };

function variabile(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

// Tacche "tonde" (1, 2, 5 × 10^n) tra min e max.
function tacche(min, max, quante = 5) {
  const passoGrezzo = (max - min) / quante;
  const potenza = 10 ** Math.floor(Math.log10(passoGrezzo || 1));
  const passo = [1, 2, 5, 10].map((m) => m * potenza).find((p) => p >= passoGrezzo) ?? potenza * 10;
  const valori = [];
  for (let v = Math.ceil(min / passo) * passo; v <= max + passo * 1e-6; v += passo) valori.push(+v.toFixed(6));
  return valori;
}

export function orario(secondi) {
  const s = ((secondi % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/** Il punto più vicino a un istante (i punti sono in ordine di tempo). */
export function puntoVicino(punti, secondi) {
  if (!punti.length) return null;
  let basso = 0, alto = punti.length - 1;
  while (alto - basso > 1) {
    const medio = (basso + alto) >> 1;
    if (punti[medio].s < secondi) basso = medio; else alto = medio;
  }
  return Math.abs(punti[basso].s - secondi) <= Math.abs(punti[alto].s - secondi) ? punti[basso] : punti[alto];
}

export class Grafico {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{variabileColore: string, decimali: number, gradino?: boolean,
   *          scalaFissa?: [number, number], tacche?: number[], minimaAmpiezza?: number}} opzioni
   */
  constructor(canvas, opzioni) {
    this.canvas = canvas;
    this.opzioni = opzioni;
    this.ctx = canvas.getContext("2d");
    this.scala = null; // ultima scala usata, per convertire il mouse in tempo
  }

  _dimensiona() {
    const rapporto = window.devicePixelRatio || 1;
    const { width, height } = this.canvas.getBoundingClientRect();
    const larghezza = Math.round(width * rapporto), altezza = Math.round(height * rapporto);
    if (this.canvas.width !== larghezza || this.canvas.height !== altezza) {
      this.canvas.width = larghezza;
      this.canvas.height = altezza;
    }
    this.ctx.setTransform(rapporto, 0, 0, rapporto, 0, 0);
    return { width, height };
  }

  /** Converte una coordinata x del mouse (px nel canvas) in secondi, o null se fuori dall'area. */
  tempoDa(xPixel) {
    if (!this.scala) return null;
    const { t0, t1, x0, x1 } = this.scala;
    if (xPixel < x0 || xPixel > x1) return null;
    return t0 + ((xPixel - x0) / (x1 - x0)) * (t1 - t0);
  }

  /** Posizione x in pixel (relativa al canvas) di un istante. */
  xDi(secondi) {
    const { t0, t1, x0, x1 } = this.scala;
    return x0 + ((secondi - t0) / (t1 - t0)) * (x1 - x0);
  }

  /**
   * @param {{s: number, v: number}[]} punti in ordine di tempo
   * @param {number} t1 istante finale della finestra (secondi del giorno)
   * @param {number} finestra durata in secondi
   * @param {number|null} tMirino istante del mirino, o null
   */
  disegna(punti, t1, finestra, tMirino) {
    const { width, height } = this._dimensiona();
    const ctx = this.ctx;
    const t0 = t1 - finestra;
    const x0 = MARGINE.sinistra, x1 = width - MARGINE.destra;
    const y0 = MARGINE.alto, y1 = height - MARGINE.basso;
    ctx.clearRect(0, 0, width, height);

    const visibili = punti.filter((p) => p.s >= t0 - 1 && p.s <= t1);
    let [min, max] = this.opzioni.scalaFissa ?? [Infinity, -Infinity];
    if (!this.opzioni.scalaFissa) {
      for (const p of visibili) { if (p.v < min) min = p.v; if (p.v > max) max = p.v; }
      if (!isFinite(min)) { min = 0; max = 1; }
      const ampiezzaMinima = this.opzioni.minimaAmpiezza ?? 0.1;
      if (max - min < ampiezzaMinima) { const c = (max + min) / 2; min = c - ampiezzaMinima / 2; max = c + ampiezzaMinima / 2; }
      const margine = (max - min) * 0.08; min -= margine; max += margine;
    }
    const yDi = (v) => y1 - ((v - min) / (max - min)) * (y1 - y0);
    const xDi = (s) => x0 + ((s - t0) / (t1 - t0)) * (x1 - x0);
    this.scala = { t0, t1, x0, x1 };

    const filo = variabile("--filo"), testo = variabile("--inchiostro-3"), inchiostro = variabile("--inchiostro-2");
    ctx.font = `11px ${variabile("--font-numeri") || "monospace"}`;
    ctx.lineWidth = 1;

    // griglia orizzontale ed etichette dell'asse y, recessive
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const valoriY = this.opzioni.tacche ?? tacche(min, max, 4);
    for (const v of valoriY) {
      const y = Math.round(yDi(v)) + 0.5;
      ctx.strokeStyle = filo; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = testo; ctx.fillText(v.toFixed(this.opzioni.decimali).replace(".", ",").replace("-", "−"), x0 - 8, y);
    }
    // asse x: tacche ogni 10, 20 o 60 s
    const passoX = finestra <= 60 ? 10 : finestra <= 120 ? 20 : 60;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let s = Math.ceil(t0 / passoX) * passoX; s <= t1; s += passoX) {
      const x = Math.round(xDi(s)) + 0.5;
      ctx.strokeStyle = filo; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y1 + 4); ctx.stroke();
      ctx.fillStyle = testo; ctx.fillText(orario(s), x, y1 + 6);
    }
    ctx.strokeStyle = inchiostro; ctx.beginPath(); ctx.moveTo(x0, y1 + 0.5); ctx.lineTo(x1, y1 + 0.5); ctx.stroke();

    // serie: linea da 2 px, a gradini per il comando del servo
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0 - 2, x1 - x0, y1 - y0 + 4); ctx.clip();
    ctx.strokeStyle = variabile(this.opzioni.variabileColore);
    ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    visibili.forEach((p, i) => {
      const x = xDi(p.s), y = yDi(p.v);
      if (i === 0) ctx.moveTo(x, y);
      else if (this.opzioni.gradino) { ctx.lineTo(x, yDi(visibili[i - 1].v)); ctx.lineTo(x, y); }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // mirino condiviso tra i due grafici
    if (tMirino !== null && tMirino >= t0 && tMirino <= t1) {
      const x = Math.round(xDi(tMirino)) + 0.5;
      ctx.strokeStyle = inchiostro; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
      const vicino = puntoVicino(visibili, tMirino);
      if (vicino) {
        ctx.fillStyle = variabile("--pannello"); ctx.strokeStyle = variabile(this.opzioni.variabileColore); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(xDi(vicino.s), yDi(vicino.v), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
  }
}
