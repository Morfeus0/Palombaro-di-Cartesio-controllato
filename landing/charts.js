/* Grafici a scorrimento su canvas. I colori arrivano dai token CSS del tema. */
(function (root) {
  'use strict';

  const PAD = Object.freeze({ left: 46, right: 10, top: 10, bottom: 20 });
  const GRID_STEP = 5;          // s tra due linee verticali
  const MIN_LABEL_GAP = 46;     // px minimi tra due etichette del tempo (sotto si dimezzano)

  function readToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ window: number, series: {key: string, token: string, width?: number, dash?: number[]}[],
   *           minSpan: number, invert?: boolean, format: (v: number) => string }} opts
   */
  function createStripChart(canvas, opts) {
    const ctx = canvas.getContext('2d');
    let samples = [];
    let colors = {};

    function refreshColors() {
      const base = { grid: readToken('--line'), text: readToken('--muted') };
      const seriesColors = Object.fromEntries(opts.series.map(s => [s.key, readToken(s.token)]));
      colors = { ...base, ...seriesColors };
    }

    function push(t, values) {
      samples = [...samples.filter(p => p.t >= t - opts.window), { t, values }];
    }

    function clear() { samples = []; }

    function range() {
      const values = samples.flatMap(p => opts.series.map(s => p.values[s.key])).filter(Number.isFinite);
      if (!values.length) return { lo: 0, hi: opts.minSpan };
      const lo = Math.min(...values);
      const hi = Math.max(...values);
      const mid = (lo + hi) / 2;
      const span = Math.max(opts.minSpan, (hi - lo) * 1.25);
      return { lo: mid - span / 2, hi: mid + span / 2 };
    }

    function fitCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    }

    function draw() {
      const { w, h } = fitCanvas();
      ctx.clearRect(0, 0, w, h);
      if (!samples.length || w === 0) return;
      const tEnd = samples[samples.length - 1].t;
      const { lo, hi } = range();
      const plotW = w - PAD.left - PAD.right;
      const plotH = h - PAD.top - PAD.bottom;
      const x = t => PAD.left + (1 - (tEnd - t) / opts.window) * plotW;
      const y = v => {
        const frac = (v - lo) / (hi - lo);
        return PAD.top + (opts.invert ? frac : 1 - frac) * plotH;
      };

      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      ctx.fillStyle = colors.text;
      ctx.textBaseline = 'middle';
      for (let k = 0; k <= 3; k++) {
        const v = lo + (hi - lo) * k / 3;
        const yy = Math.round(y(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, yy); ctx.lineTo(w - PAD.right, yy); ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(opts.format(v), PAD.left - 6, yy);
      }
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      const gridGap = plotW * GRID_STEP / opts.window;
      const labelStep = gridGap < MIN_LABEL_GAP ? 2 * GRID_STEP : GRID_STEP;
      for (let s = 0; s <= opts.window; s += GRID_STEP) {
        const xx = Math.round(x(tEnd - s)) + 0.5;
        ctx.beginPath(); ctx.moveTo(xx, PAD.top); ctx.lineTo(xx, h - PAD.bottom); ctx.stroke();
        if (s % labelStep === 0) ctx.fillText(s === 0 ? 'ora' : `−${s} s`, xx, h - PAD.bottom + 5);
      }

      opts.series.forEach(serie => {
        ctx.strokeStyle = colors[serie.key];
        ctx.lineWidth = serie.width || 2;
        ctx.setLineDash(serie.dash || []);
        ctx.beginPath();
        let started = false;
        samples.forEach(p => {
          const v = p.values[serie.key];
          if (!Number.isFinite(v)) { started = false; return; }
          if (started) ctx.lineTo(x(p.t), y(v)); else { ctx.moveTo(x(p.t), y(v)); started = true; }
        });
        ctx.stroke();
      });
      ctx.setLineDash([]);

      const first = opts.series[0];
      const lastValue = samples[samples.length - 1].values[first.key];
      if (Number.isFinite(lastValue)) {
        ctx.fillStyle = colors[first.key];
        ctx.beginPath(); ctx.arc(x(tEnd), y(lastValue), 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    refreshColors();
    return Object.freeze({ push, draw, clear, refreshColors });
  }

  root.PalombaroCharts = Object.freeze({ createStripChart });
})(window);
