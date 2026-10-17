/* Bollettino di avanzamento: compone la pagina a partire da progresso-dati.js e dai calcoli. */
(function () {
  'use strict';

  const C = window.PalombaroCalc;
  const UI = window.PalombaroUI;
  const { $, el, svgEl, pct, shortDate, longDate, statusBadge, showTip, hideTip } = UI;

  const GAUGE = Object.freeze({ bottom: 496, top: 104, tagX: 306, minTagGap: 20, diverTop: 12, diverMaxY: 452 });
  const BOTTLE_PATH = 'M238 56 V80 Q196 92 196 124 V486 Q196 500 210 500 H290 Q304 500 304 486 V124 Q304 92 262 80 V56 Z';
  const MONTH = new Intl.DateTimeFormat('it-IT', { month: 'long', timeZone: 'UTC' });

  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- testi ---------- */
  function daysText(n) { return n === 1 ? 'un giorno' : `${n} giorni`; }

  function slipPhrase(report) {
    const n = Math.max(1, Math.round(Math.abs(report.slip)));
    if (report.status === 'linea') return 'in linea con il piano';
    if (report.status === 'anticipo') return `in anticipo di circa ${daysText(n)}`;
    return `con circa ${daysText(n)} di ritardo`;
  }

  /** "al 10 %" ma "all'8 %", "all'11 %", "all'80 %": l'articolo segue il suono del numero. */
  function articleFor(share) {
    const n = Math.floor(share * 100);
    return n === 1 || n === 11 || String(n).startsWith('8') ? 'all\'' : 'al ';
  }

  function rangeText(fromDay, toDay) {
    if (fromDay === toDay) return shortDate(fromDay);
    const [dayA, monA] = shortDate(fromDay).split(' ');
    const [dayB, monB] = shortDate(toDay).split(' ');
    return monA === monB ? `${dayA}–${dayB} ${monB}` : `${shortDate(fromDay)} – ${shortDate(toDay)}`;
  }

  /* ---------- apertura ---------- */
  function renderHero(report, data) {
    $('stamp').textContent = `Bollettino di avanzamento · aggiornato a ${longDate(report.day)}`;
    $('hero-title').replaceChildren(
      `Il progetto è ${articleFor(report.done)}`, el('em', { text: pct(report.done) }), `, ${slipPhrase(report)}`);
    $('sintesi').textContent = data.sintesi;
    const verdict = [statusBadge(report.status)];
    if (report.forecast) {
      const main = window.PalombaroForecast.headline(report.forecast);
      const how = main.key === 'misurato' ? 'al ritmo attuale' : 'al ritmo del piano';
      verdict.push(statusBadge(main.verdict, `Fine prevista ${how}: ${shortDate(main.finish)}`));
    }
    verdict.push(el('span', { text: `Consegna interna: ${longDate(C.toDay(data.consegna))}` }));
    if (data.provvisorio) verdict.push(el('span', { class: 'provisional', text: 'stima provvisoria' }));
    $('verdict').replaceChildren(...verdict);
  }

  function gaugeTag(y, text, cls, lineY) {
    const g = svgEl('g', { class: 'gauge-tag', transform: `translate(${GAUGE.tagX} ${y.toFixed(1)})` });
    if (Math.abs(lineY - y) > 0.5) g.append(svgEl('line', { class: 'tick', x1: -3, x2: 1, y1: (lineY - y).toFixed(1), y2: 0 }));
    g.append(svgEl('path', { class: cls, d: 'M0 0 L8 -9 H94 V9 H8 Z' }),
      svgEl('text', { class: 'tag-text', x: 51, y: 3.5, 'text-anchor': 'middle', text }));
    return g;
  }

  function diver(y) {
    return svgEl('g', { transform: `translate(250 ${y.toFixed(1)})` }, [
      svgEl('rect', { class: 'diver-cap', x: -6, y: -8, width: 12, height: 9, rx: 4 }),
      svgEl('rect', { class: 'diver-air', x: -7, y: 2, width: 14, height: 20, rx: 2 }),
      svgEl('rect', { class: 'diver-water', x: -7, y: 22, width: 14, height: 12 }),
      svgEl('rect', { class: 'diver-glass', x: -9, y: 0, width: 18, height: 34, rx: 4 }),
      svgEl('path', { class: 'diver-glass', d: 'M-9 32 L-5 39 H5 L9 32' }),
      svgEl('rect', { class: 'diver-weight', x: -5, y: 38, width: 10, height: 4.5, rx: 1 }),
    ]);
  }

  function renderGauge(report) {
    const level = v => GAUGE.bottom - v * (GAUGE.bottom - GAUGE.top);
    const yDone = level(report.done);
    const yPlan = level(report.planned);
    // le due etichette non devono sovrapporsi: si allontanano in parti uguali
    const gap = Math.abs(yPlan - yDone);
    const push = gap < GAUGE.minTagGap ? (GAUGE.minTagGap - gap) / 2 : 0;
    const planAbove = yPlan <= yDone;

    // acqua e superficie salgono insieme: un solo gruppo traslato in verticale
    const water = svgEl('g', { class: 'rise', style: `transform: translateY(${GAUGE.bottom - GAUGE.top}px)` }, [
      svgEl('rect', { class: 'water-body', x: 190, y: GAUGE.top, width: 120, height: 400 }),
      svgEl('line', { class: 'surface-line', x1: 190, x2: 310, y1: GAUGE.top, y2: GAUGE.top }),
    ]);
    const ticks = [0, 0.25, 0.5, 0.75, 1].flatMap(v => [
      svgEl('line', { class: 'tick', x1: 182, x2: 192, y1: level(v), y2: level(v) }),
      svgEl('text', { class: 'tick-label', x: 178, y: level(v) + 3.5, 'text-anchor': 'end', text: `${v * 100}` }),
    ]);
    $('gauge').append(
      svgEl('defs', {}, [svgEl('clipPath', { id: 'clip-bottle' }, [svgEl('path', { d: BOTTLE_PATH })])]),
      svgEl('rect', { class: 'cap', x: 232, y: 44, width: 36, height: 12, rx: 2 }),
      svgEl('path', { class: 'glass', d: BOTTLE_PATH }),
      svgEl('g', { 'clip-path': 'url(#clip-bottle)' }, [water]),
      svgEl('path', { class: 'glass-outline', d: BOTTLE_PATH }),
      ...ticks,
      svgEl('text', { class: 'tick-label', x: 178, y: GAUGE.top - 14, 'text-anchor': 'end', text: '%' }),
      svgEl('line', { class: 'target-line', x1: 197, x2: 303, y1: yPlan, y2: yPlan }),
      diver(Math.min(GAUGE.diverMaxY, yDone + GAUGE.diverTop)),
      gaugeTag(yDone + (planAbove ? push : -push), `fatto ${pct(report.done)}`, 'tag-water', yDone),
      gaugeTag(yPlan + (planAbove ? -push : push), `previsto ${pct(report.planned)}`, 'tag-bg', yPlan),
    );
    // l'acqua sale fino al livello raggiunto subito dopo il primo disegno
    requestAnimationFrame(() => requestAnimationFrame(() => { water.style.transform = `translateY(${yDone - GAUGE.top}px)`; }));
  }

  /* ---------- indicatori ---------- */
  function renderKpis(report, data) {
    const days = Math.round(Math.abs(report.slip));
    const slipValue = report.status === 'linea' ? '0 giorni' : `${days} ${days === 1 ? 'giorno' : 'giorni'}`;
    const slipNote = report.status === 'linea' ? 'in linea con il piano' : report.slip < 0 ? 'di ritardo sul piano' : 'di anticipo sul piano';
    const current = report.phases.find(p => p.state !== 'raggiunta');
    const nextNote = current ? `in corso: ${current.phase.milestone.id} al ${pct(current.done, 0)}` : 'tutti raggiunti';
    const items = [
      ['kpi-lead', 'Completato', pct(report.done), 'del lavoro totale previsto'],
      [null, 'Previsto a oggi', pct(report.planned), 'secondo il calendario del piano'],
      [null, 'Scostamento', slipValue, slipNote],
      [null, 'Traguardi raggiunti', `${report.reached} su ${report.phases.length}`, nextNote],
      [null, 'Alla consegna interna', `${report.toDelivery} giorni`,
        `il ${shortDate(C.toDay(data.consegna))}, poi margine fino al ${shortDate(C.toDay(data.scadenzaProf))}`],
    ];
    if (report.forecast) {
      const F = window.PalombaroForecast;
      const main = F.headline(report.forecast);
      items.push(['kpi-forecast', 'Fine prevista', shortDate(main.finish),
        `a ${report.forecast.perDay} h al giorno e ritmo ${F.factorText(main.factor)}`]);
    }
    $('kpis').replaceChildren(...items.map(([cls, label, value, note]) =>
      el('div', { class: cls }, [el('dt', { text: label }), el('dd', { text: value }, [el('small', { text: note })])])));
  }

  /* ---------- traguardi ---------- */
  function meter(done, planned, small) {
    const fill = el('span', { class: `meter-fill${done >= 1 ? ' is-done' : ''}`, style: `width:${(done * 100).toFixed(1)}%` });
    const plan = planned > 0 && done < 1 ? el('span', { class: 'meter-plan', style: `left:${(planned * 100).toFixed(1)}%` }) : null;
    return el('div', { class: `meter${small ? ' small' : ''}`, 'aria-hidden': 'true' }, [fill, plan]);
  }

  function subRow({ sub, state }, day) {
    const note = [rangeText(C.toDay(sub.da), C.toDay(sub.a)), sub.nota].filter(Boolean).join(' · ');
    return el('li', { class: `sub${sub.saltata ? ' is-skip' : ''}` }, [
      el('span', { class: 'sub-id', text: sub.id }),
      el('div', { class: 'sub-name' }, [
        el('span', { text: sub.facoltativa ? `${sub.nome} (facoltativa)` : sub.nome }),
        el('small', { text: note }),
      ]),
      sub.saltata ? el('span') : meter(sub.fatto / 100, C.plannedShare(sub, day), true),
      el('span', { class: 'sub-pct', text: sub.saltata ? '—' : `${Math.round(sub.fatto)} %` }),
      statusBadge(state === 'ritardo' ? 'ritardoSub' : state),
    ]);
  }

  function renderMilestones(report) {
    $('milestones').replaceChildren(...report.phases.map(p => {
      const m = p.phase.milestone;
      const summary = el('summary', {}, [
        el('span', { class: 'ms-id', text: m.id }),
        el('span', { class: 'ms-title' }, [el('b', { text: m.titolo }), el('span', { text: m.descrizione })]),
        el('span', { class: 'ms-meter' }, [
          el('span', { class: 'ms-meter-head' }, [statusBadge(p.state), el('span', { text: `entro il ${shortDate(p.deadline)}` })]),
          meter(p.done, p.planned, false),
        ]),
        el('span', { class: 'ms-pct', text: pct(p.done, 0) }, [el('small', { text: `previsto ${pct(p.planned, 0)}` })]),
        el('span', { class: 'chev', 'aria-hidden': 'true' }),
      ]);
      const open = p.state === 'corso' || p.state === 'scaduta';
      const subs = el('ul', { class: 'subs', 'aria-label': `Attività di ${m.id}` }, p.subs.map(s => subRow(s, report.day)));
      return el('li', { class: 'ms' }, [el('details', { open: open ? '' : null }, [summary, subs])]);
    }));
  }

  /* ---------- calendario ---------- */
  function ganttBar(p, pos) {
    const ph = p.phase;
    const period = rangeText(p.start, p.deadline);
    const bar = el('div', {
      class: `g-bar${p.done >= 1 ? ' is-done' : ''}`, tabindex: 0, role: 'img',
      'aria-label': `${ph.id}, ${ph.nome}: ${period}. Fatto ${pct(p.done)}, previsto a oggi ${pct(p.planned)}.`,
      style: `left:${pos(p.start)};width:calc(${pos(p.deadline + 1)} - ${pos(p.start)})`,
    }, [el('span', { class: 'g-bar-fill', style: `width:${(p.done * 100).toFixed(1)}%` })]);
    const tip = ev => {
      const box = bar.getBoundingClientRect();
      showTip(ev.clientX ?? box.left + box.width / 2, ev.clientY ?? box.top, `${ph.id} · ${ph.nome}`, [
        { value: pct(p.done), label: 'fatto', color: css('--water') },
        { value: pct(p.planned), label: 'previsto a oggi', color: 'currentColor', dash: true },
        { value: period, label: UI.STATES[p.state].label.toLowerCase() },
      ]);
    };
    bar.addEventListener('pointermove', tip);
    bar.addEventListener('focus', tip);
    bar.addEventListener('pointerleave', hideTip);
    bar.addEventListener('blur', hideTip);
    return bar;
  }

  function renderGantt(report, data) {
    const d0 = Math.min(...report.phases.map(p => p.start));
    const d1 = C.toDay(data.scadenzaProf) + 1;
    const pos = d => `${((d - d0) / (d1 - d0) * 100).toFixed(2)}%`;
    const months = [];
    for (let d = d0 + 1; d < d1; d++) if (new Date(d * 86400000).getUTCDate() === 1) months.push(d);
    const marginFrom = C.toDay(data.consegna) + 1;

    const background = withLabel => [
      ...months.map(d => el('span', { class: 'g-month-line', style: `left:${pos(d)}` })),
      el('span', { class: 'g-margin', style: `left:${pos(marginFrom)}` }),
      el('span', { class: 'g-today', style: `left:${pos(report.day + 0.5)}` },
        withLabel ? [el('span', { text: `oggi, ${shortDate(report.day)}` })] : []),
    ];
    const monthNames = [d0, ...months].map(d => el('span', { class: 'g-month-name', style: `left:${pos(d)}`, text: MONTH.format(new Date(d * 86400000)) }));
    const axis = el('div', { class: 'g-axis', 'aria-hidden': 'true' }, [
      el('span', { class: 'g-label' }),
      el('div', { class: 'g-months g-track' }, [...background(true), ...monthNames]),
    ]);
    const rows = report.phases.map(p => el('div', { class: 'g-row' }, [
      el('div', { class: 'g-label' }, [el('b', { text: `${p.phase.id} → ${p.phase.milestone.id}` }), el('span', { text: p.phase.nome })]),
      el('div', { class: 'g-track' }, [
        ...background(false), ganttBar(p, pos),
        el('span', { class: `g-diamond${p.done >= 1 ? ' is-done' : ''}`, style: `left:${pos(p.deadline + 1)}` }),
      ]),
    ]));
    $('gantt').replaceChildren(axis, ...rows);
  }

  /* ---------- diario ---------- */
  function renderDiary(data) {
    $('log').replaceChildren(...data.diario.map(entry => {
      const day = C.toDay(entry.data);
      const weekday = UI.weekDate(day).split(' ')[0];
      return el('li', {}, [
        el('time', { datetime: entry.data }, [el('span', { class: 'log-wd', text: weekday }), el('span', { text: shortDate(day) })]),
        el('ul', {}, entry.testo.map(t => el('li', { text: t }))),
      ]);
    }));
    $('next').replaceChildren(...data.prossimi.map(t => el('li', { text: t })));
    $('risks').replaceChildren(...data.rischi.map(r => el('li', { class: `risk lv-${r.livello}` }, [
      el('div', { class: 'risk-head' }, [el('b', { text: r.titolo }), statusBadge(r.livello)]),
      el('p', { text: r.nota }),
    ])));
  }

  function renderMethod(data) {
    const active = data.fasi.flatMap(f => f.sottofasi).filter(s => !s.saltata && !s.facoltativa);
    $('m-count').textContent = String(active.length);
    $('m-hours').textContent = String(Math.round(active.reduce((sum, s) => sum + s.ore, 0)));
  }

  function init() {
    const data = window.PalombaroProgresso;
    if (!data || !Array.isArray(data.fasi) || !data.fasi.length) {
      $('sintesi').textContent = 'Dati di avanzamento non disponibili: controlla il file progresso-dati.js.';
      return;
    }
    const report = C.buildReport(data);
    renderHero(report, data);
    renderGauge(report);
    renderKpis(report, data);
    renderMilestones(report);
    renderGantt(report, data);
    window.PalombaroTrend.createTrend($('trend'), report);
    window.PalombaroTrend.fillTable($('trend-table'), report);
    window.PalombaroForecast.render(report, data);
    renderDiary(data);
    renderMethod(data);
  }

  init();
})();
