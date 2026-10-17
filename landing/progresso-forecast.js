/* Prospetto di fine progetto: ritmo misurato, data di fine nei tre scenari e calcolo incrociato delle ore. */
(function (root) {
  'use strict';

  const C = root.PalombaroCalc;
  const { $, el, pct, shortDate, longDate, statusBadge } = root.PalombaroUI;

  const NF1 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const NF2 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
  const MONTH = new Intl.DateTimeFormat('it-IT', { month: 'short', timeZone: 'UTC' });
  const LABEL_FLIP = 80;     // % della traccia: oltre, la data va a sinistra della fine della barra
  const DOMAIN_PAD = 5;      // giorni di respiro dopo l'ultima data mostrata

  const SCENARIOS = Object.freeze({
    misurato: { name: 'Al ritmo misurato', hint: 'tutte le ore registrate' },
    'senza-una-tantum': { name: 'Senza le ore una tantum', hint: 'come imparare a saldare' },
    piano: { name: 'Al ritmo del piano', hint: 'se da qui ogni stima fosse giusta' },
  });

  const factorText = f => `×${NF1.format(f)}`;
  const hoursText = h => `${NF2.format(h)} h`;

  function daysFrom(n, what) {
    if (n === 0) return `lo stesso giorno della ${what}`;
    const abs = Math.abs(n);
    const unit = abs === 1 ? 'giorno' : 'giorni';
    return n > 0 ? `${abs} ${unit} dopo la ${what}` : `${abs} ${unit} prima della ${what}`;
  }

  /** Lo scenario di riferimento: il ritmo misurato se ci sono ore registrate, altrimenti il piano. */
  function headline(f) { return f.scenarios[0]; }

  function renderHead(f) {
    const box = $('fc-head');
    if (f.measured === null) {
      box.replaceChildren(el('p', { class: 'fc-lead', text: 'Servono ore registrate nel diario per misurare il ritmo: per ora vale la stima del piano.' }));
      return;
    }
    const main = headline(f);
    const needRow = (n, label) => el('div', {}, [
      el('dt', { text: label }),
      el('dd', {}, [
        el('b', { text: `${NF1.format(n.hoursPerDay)} h al giorno` }),
        el('span', { text: ` a questo ritmo, oppure, con ${f.perDay} h al giorno, impiegare al massimo ${factorText(n.maxFactor)} le stime` }),
      ]),
    ]);
    const [byDelivery, byDeadline] = f.needs;
    box.replaceChildren(
      el('p', { class: 'eyebrow', text: 'Ritmo misurato finora' }),
      el('p', { class: 'fc-factor' }, [
        el('span', { text: factorText(f.measured) }),
        el('small', { text: f.measured >= 1 ? 'il tempo stimato dal piano' : 'il tempo stimato: più veloce del piano' }),
      ]),
      el('p', { class: 'fc-lead', text: `Per ogni ora stimata nel piano ne sono servite ${NF1.format(f.measured)}. ` +
        `A questo ritmo, con ${f.perDay} ore al giorno, finirei ${longDate(main.finish)}: ${daysFrom(main.late, 'consegna interna')}.` }),
      statusBadge(main.verdict),
      el('dl', { class: 'fc-needs' }, [
        needRow(byDelivery, `Per consegnare il ${shortDate(byDelivery.target)} servirebbero`),
        needRow(byDeadline, `Per stare entro il ${shortDate(byDeadline.target)} servirebbero`),
      ]),
    );
  }

  function renderFinishLine(report, f, data) {
    const d0 = report.day;
    const delivery = C.toDay(data.consegna);
    const deadline = C.toDay(data.scadenzaProf);
    const d1 = Math.max(deadline, ...f.scenarios.map(s => s.finish)) + DOMAIN_PAD;
    const at = d => (d - d0) / (d1 - d0) * 100;
    const pos = d => `${at(d).toFixed(2)}%`;
    const months = [];
    for (let d = d0 + 1; d < d1; d++) if (new Date(d * 86400000).getUTCDate() === 1) months.push(d);

    const refs = withLabel => [
      ...months.map(d => el('span', { class: 'g-month-line', style: `left:${pos(d)}` })),
      el('span', { class: 'fl-ref fl-delivery', style: `left:${pos(delivery + 1)}` },
        withLabel ? [el('span', { text: `consegna ${shortDate(delivery)}` })] : []),
      el('span', { class: 'fl-ref fl-deadline', style: `left:${pos(deadline + 1)}` },
        withLabel ? [el('span', { text: `scadenza ${shortDate(deadline)}` })] : []),
    ];
    const axis = el('div', { class: 'g-axis fl-axis', 'aria-hidden': 'true' }, [
      el('span', { class: 'g-label' }),
      el('div', { class: 'g-track g-months' }, [
        ...refs(true),
        el('span', { class: 'g-month-name', style: 'left:0', text: 'oggi' }),
        ...months.map(d => el('span', { class: 'g-month-name', style: `left:${pos(d)}`, text: MONTH.format(new Date(d * 86400000)) })),
      ]),
    ]);
    const rows = f.scenarios.map(s => {
      const meta = SCENARIOS[s.key];
      const end = at(s.finish + 1);
      return el('div', { class: `g-row fl-row is-${s.key}` }, [
        el('div', { class: 'g-label' }, [
          el('b', { text: `${factorText(s.factor)} · ${meta.name}` }), el('span', { text: meta.hint }), statusBadge(s.verdict),
        ]),
        el('div', { class: 'g-track', role: 'img',
          'aria-label': `${meta.name}, ${factorText(s.factor)}: fine ${longDate(s.finish)}, ${daysFrom(s.late, 'consegna interna')}.` }, [
          ...refs(false),
          el('span', { class: 'fl-bar', style: `width:${end.toFixed(2)}%` }),
          el('span', { class: `fl-date${end > LABEL_FLIP ? ' is-left' : ''}`, style: `left:${end.toFixed(2)}%`, text: shortDate(s.finish) }),
        ]),
      ]);
    });
    $('finish').replaceChildren(axis, ...rows);
  }

  function renderHours(f, data) {
    const COLS = ['Attività', 'Stima del piano', 'Fatto', 'Ore guadagnate', 'Ore effettive', 'Rapporto'];
    const head = el('tr', {}, COLS.map(t => el('th', { scope: 'col', text: t })));
    // data-label: sul telefono ogni riga diventa una scheda con l'etichetta accanto al valore
    const cell = (col, text, children = [], cls) => el('td', { 'data-label': COLS[col], class: cls, text }, children);
    const ratioCell = r => cell(5, r === null ? '—' : factorText(r), [], 'hours-ratio');
    const rows = f.tracked.map(t => el('tr', {}, [
      el('th', { scope: 'row' }, [el('span', { class: 'hours-id', text: t.sub.id }), el('span', { text: t.sub.nome })]),
      cell(1, hoursText(t.sub.ore)),
      cell(2, `${Math.round(t.sub.fatto)} %`),
      cell(3, hoursText(t.earned)),
      cell(4, hoursText(t.sub.oreEffettive), t.sub.oreUnaTantum
        ? [el('small', { text: `di cui ${hoursText(t.sub.oreUnaTantum)} una tantum` })] : []),
      ratioCell(t.ratio),
    ]));
    const total = el('tr', { class: 'is-total' }, [
      el('th', { scope: 'row', text: 'Totale' }), el('td', { class: 'is-empty' }), el('td', { class: 'is-empty' }),
      cell(3, hoursText(f.earned)), cell(4, hoursText(f.actual)), ratioCell(f.measured),
    ]);
    $('hours').replaceChildren(el('thead', {}, [head]), el('tbody', {}, [...rows, total]));

    const untracked = data.fasi.flatMap(ph => ph.sottofasi)
      .filter(s => s.fatto > 0 && !s.saltata && typeof s.oreEffettive !== 'number').map(s => s.id);
    const sample = f.tracked.find(t => t.sub.fatto < 100) || f.tracked[0];
    const parts = [
      sample ? `Le ore guadagnate sono le ore del piano per la parte fatta: la ${sample.sub.id} vale ${hoursText(sample.sub.ore)}, ` +
        `al ${Math.round(sample.sub.fatto)} % ne ha guadagnate ${hoursText(sample.earned)}.` : '',
      `Restano ${NF1.format(f.remaining)} delle ${Math.round(f.total)} ore del piano (${pct(f.remaining / f.total, 0)}).`,
      `Il ritmo è misurato su ${hoursText(f.actual)} registrate in ${f.tracked.length} attività: con così pochi dati può cambiare molto nelle prossime settimane.`,
    ];
    if (untracked.length) parts.push(`Le attività ${untracked.join(', ')} sono avanzate ma senza ore registrate, quindi restano fuori dal rapporto.`);
    $('fc-note').textContent = parts.filter(Boolean).join(' ');
  }

  function render(report, data) {
    const f = report.forecast;
    if (!f) { $('previsione').hidden = true; return; }
    $('fc-perday').textContent = `${f.perDay} ore`;
    renderHead(f);
    renderFinishLine(report, f, data);
    renderHours(f, data);
  }

  root.PalombaroForecast = Object.freeze({ render, headline, factorText });
})(window);
