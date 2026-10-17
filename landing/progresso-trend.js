/* Grafico dell'andamento: curva prevista (tratteggio) e lavoro fatto (punti), con mirino e tooltip.
   Si ridisegna alla larghezza reale del contenitore, così i testi restano leggibili anche sul telefono. */
(function (root) {
  'use strict';

  const { el, svgEl, pct, shortDate, weekDate, showTip, hideTip } = root.PalombaroUI;
  const PAD = Object.freeze({ left: 40, right: 16, top: 18, bottom: 28 });
  const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];
  const DOT_R = 4;           // marcatori da 8 px
  const MIN_TICK_GAP = 56;   // px minimi tra due date sull'asse dei tempi

  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function monthStarts(first, last) {
    const out = [];
    for (let d = first; d <= last; d++) if (new Date(d * 86400000).getUTCDate() === 1) out.push(d);
    return out;
  }

  const pathOf = (pts, s) => pts.map((p, i) => `${i ? 'L' : 'M'}${s.x(p.day).toFixed(1)} ${s.y(p.value).toFixed(1)}`).join('');

  function createTrend(host, report) {
    const first = report.curve[0].day;
    const last = report.curve[report.curve.length - 1].day;
    const planByDay = new Map(report.curve.map(p => [p.day, p.value]));
    const doneByDay = new Map(report.history.map(p => [p.day, p.value]));
    let geo = null;
    let cursor = null;

    function scales(w, h) {
      const plotW = w - PAD.left - PAD.right;
      const plotH = h - PAD.top - PAD.bottom;
      return {
        w, h,
        x: d => PAD.left + (d - first) / (last - first) * plotW,
        y: v => PAD.top + (1 - v) * plotH,
        dayAt: px => Math.round(first + (px - PAD.left) / plotW * (last - first)),
      };
    }

    function axes(g, s) {
      Y_TICKS.forEach(v => {
        g.append(svgEl('line', { class: 't-grid', x1: PAD.left, x2: s.w - PAD.right, y1: s.y(v), y2: s.y(v) }));
        g.append(svgEl('text', { class: 't-axis', x: PAD.left - 8, y: s.y(v) + 4, 'text-anchor': 'end', text: `${v * 100}` }));
      });
      // un inizio mese troppo vicino al primo o all'ultimo giorno lascerebbe due date sovrapposte
      const roomy = d => s.x(d) - s.x(first + 1) >= MIN_TICK_GAP && s.x(last) - s.x(d) >= MIN_TICK_GAP;
      const ticks = [first + 1, ...monthStarts(first, last).filter(roomy), last];
      ticks.forEach((d, i) => {
        const anchor = i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle';
        g.append(svgEl('text', { class: 't-axis', x: s.x(d), y: s.h - 8, 'text-anchor': anchor, text: shortDate(d) }));
      });
    }

    function series(g, s) {
      g.append(svgEl('path', { class: 't-plan', d: pathOf(report.curve, s) }));

      const pts = [{ day: first, value: 0 }, ...report.history];
      const doneD = pathOf(pts, s);
      const end = pts[pts.length - 1];
      g.append(svgEl('path', { class: 't-area', d: `${doneD}L${s.x(end.day).toFixed(1)} ${s.y(0)}L${s.x(first)} ${s.y(0)}Z` }));
      g.append(svgEl('path', { class: 't-done', d: doneD }));
      report.history.forEach(p => g.append(svgEl('circle', { class: 't-dot', cx: s.x(p.day), cy: s.y(p.value), r: DOT_R })));

      const tx = s.x(report.day);
      g.append(svgEl('line', { class: 't-today', x1: tx, x2: tx, y1: PAD.top - 6, y2: s.y(0) }));
      g.append(svgEl('text', { class: 't-today-label', x: tx + 5, y: PAD.top - 2, text: 'oggi' }));

      // etichette dirette: il fatto accanto all'ultimo punto, il previsto in fondo alla curva
      g.append(svgEl('text', { class: 't-label', x: tx + 8, y: s.y(end.value) - 8, text: `fatto ${pct(end.value)}` }));
      g.append(svgEl('text', { class: 't-label', x: s.x(last) - 4, y: s.y(1) - 8, 'text-anchor': 'end', text: 'previsto: 100 % alla consegna' }));
    }

    function crosshair(svg, s) {
      const layer = svgEl('g', { visibility: 'hidden' });
      const line = svgEl('line', { class: 't-cross', y1: PAD.top, y2: s.y(0) });
      const planDot = svgEl('circle', { class: 't-cross-dot', r: DOT_R, fill: css('--ink') });
      const doneDot = svgEl('circle', { class: 't-cross-dot', r: DOT_R + 1, fill: css('--water') });
      layer.append(line, planDot, doneDot);
      svg.append(layer);
      return { layer, line, planDot, doneDot };
    }

    function render() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      const s = scales(w, h);
      const svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true' });
      const g = svgEl('g');
      axes(g, s);
      series(g, s);
      svg.append(g);
      geo = { s, cross: crosshair(svg, s) };
      host.replaceChildren(svg);
      if (cursor !== null) moveTo(cursor, false);
    }

    function moveTo(day, withTip, clientX, clientY) {
      if (!geo) return;
      cursor = Math.min(last, Math.max(first + 1, day));
      const { s, cross } = geo;
      const x = s.x(cursor);
      const plan = planByDay.get(cursor);
      const done = doneByDay.get(cursor);
      cross.layer.setAttribute('visibility', 'visible');
      cross.line.setAttribute('x1', x);
      cross.line.setAttribute('x2', x);
      cross.planDot.setAttribute('cx', x);
      cross.planDot.setAttribute('cy', s.y(plan));
      cross.doneDot.setAttribute('visibility', done === undefined ? 'hidden' : 'visible');
      if (done !== undefined) { cross.doneDot.setAttribute('cx', x); cross.doneDot.setAttribute('cy', s.y(done)); }
      if (!withTip) return;
      const box = host.getBoundingClientRect();
      const doneText = done !== undefined ? pct(done) : cursor > report.day ? 'da fare' : 'non registrato';
      showTip(clientX ?? box.left + x, clientY ?? box.top + s.y(plan), weekDate(cursor), [
        { value: doneText, label: 'fatto', color: css('--water') },
        { value: pct(plan), label: 'previsto', color: 'currentColor', dash: true },
      ]);
    }

    function clear() {
      cursor = null;
      if (geo) geo.cross.layer.setAttribute('visibility', 'hidden');
      hideTip();
    }

    host.addEventListener('pointermove', ev => {
      if (!geo) return;
      const box = host.getBoundingClientRect();
      moveTo(geo.s.dayAt(ev.clientX - box.left), true, ev.clientX, ev.clientY);
    });
    host.addEventListener('pointerleave', clear);
    host.addEventListener('focus', () => moveTo(report.day, true));
    host.addEventListener('blur', clear);
    host.addEventListener('keydown', ev => {
      const step = { ArrowLeft: -1, ArrowRight: 1, PageDown: -7, PageUp: 7 }[ev.key];
      if (ev.key === 'Home') { ev.preventDefault(); moveTo(first + 1, true); }
      else if (ev.key === 'End') { ev.preventDefault(); moveTo(last, true); }
      else if (step) { ev.preventDefault(); moveTo((cursor ?? report.day) + step, true); }
      else if (ev.key === 'Escape') clear();
    });

    let pending = false;
    new ResizeObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; render(); });
    }).observe(host);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
    render();
  }

  /** Tabella equivalente al grafico: ogni sera registrata, con il previsto dello stesso giorno. */
  function fillTable(table, report) {
    const planByDay = new Map(report.curve.map(p => [p.day, p.value]));
    const head = el('tr', {}, ['Giorno', 'Fatto', 'Previsto', 'Differenza'].map(t => el('th', { scope: 'col', text: t })));
    const rows = report.history.map(p => {
      const diff = (p.value - (planByDay.get(p.day) ?? 0)) * 100;
      const diffText = `${diff >= 0 ? '+' : '−'}${Math.abs(diff).toLocaleString('it-IT', { maximumFractionDigits: 1 })} punti`;
      return el('tr', {}, [
        el('td', { text: weekDate(p.day) }), el('td', { text: pct(p.value) }),
        el('td', { text: pct(planByDay.get(p.day) ?? 0) }), el('td', { text: diffText }),
      ]);
    });
    table.replaceChildren(el('thead', {}, [head]), el('tbody', {}, rows));
  }

  root.PalombaroTrend = Object.freeze({ createTrend, fillTable });
})(window);
