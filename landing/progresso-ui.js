/* Aiuti comuni del bollettino: creazione del DOM, formati italiani, stati e tooltip condiviso.
   Tutti i testi arrivano dai dati e finiscono nel DOM con textContent, mai come HTML. */
(function (root) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const TIP_OFFSET = 14;   // px tra il puntatore e il tooltip

  const $ = id => document.getElementById(id);

  /** el('p', { class: 'x', text: 'ciao' }, [figli]) — attributi, testo sicuro e figli in una chiamata. */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    applyProps(node, props);
    children.filter(Boolean).forEach(c => node.append(c));
    return node;
  }
  function svgEl(tag, props = {}, children = []) {
    const node = document.createElementNS(SVG_NS, tag);
    applyProps(node, props);
    children.filter(Boolean).forEach(c => node.append(c));
    return node;
  }
  function applyProps(node, props) {
    Object.entries(props).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    });
  }

  const nf = digits => new Intl.NumberFormat('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const NF0 = nf(0);
  const NF1 = nf(1);
  /** 0..1 → "8,2 %" (una cifra decimale sotto il 10 %, poi intero). */
  function pct(share, digits) {
    const v = share * 100;
    const f = digits === undefined ? (v > 0 && v < 10 ? NF1 : NF0) : nf(digits);
    return `${f.format(v)} %`;
  }

  const DF_SHORT = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const DF_WEEK = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const DF_LONG = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dateOf = day => new Date(day * 86400000);
  const shortDate = day => DF_SHORT.format(dateOf(day));
  const weekDate = day => DF_WEEK.format(dateOf(day));
  const longDate = day => DF_LONG.format(dateOf(day));

  /** Ogni stato ha colore, icona ed etichetta: il colore non viaggia mai da solo. */
  const STATES = Object.freeze({
    anticipo: { cls: 's-ok', icon: 'i-ok', label: 'In anticipo' },
    linea: { cls: 's-ok', icon: 'i-ok', label: 'In linea con il piano' },
    lieve: { cls: 's-warn', icon: 'i-warn', label: 'Lieve ritardo' },
    ritardo: { cls: 's-late', icon: 'i-late', label: 'In ritardo' },
    raggiunta: { cls: 's-ok', icon: 'i-ok', label: 'Raggiunta' },
    scaduta: { cls: 's-late', icon: 'i-late', label: 'Oltre la scadenza' },
    corso: { cls: 's-run', icon: 'i-run', label: 'In corso' },
    attesa: { cls: 's-wait', icon: 'i-wait', label: 'Da iniziare' },
    fatta: { cls: 's-ok', icon: 'i-ok', label: 'Fatta' },
    'corso-ritardo': { cls: 's-warn', icon: 'i-warn', label: 'In corso, in ritardo' },
    ritardoSub: { cls: 's-late', icon: 'i-late', label: 'Da avviare, in ritardo' },
    'da-fare': { cls: 's-wait', icon: 'i-wait', label: 'Da fare' },
    saltata: { cls: 's-skip', icon: 'i-skip', label: 'Non necessaria' },
    tempo: { cls: 's-ok', icon: 'i-ok', label: 'In tempo per la consegna' },
    margine: { cls: 's-warn', icon: 'i-warn', label: 'Nel margine di dicembre' },
    oltre: { cls: 's-late', icon: 'i-late', label: 'Oltre la scadenza del professore' },
    alto: { cls: 's-late', icon: 'i-late', label: 'Attenzione alta' },
    medio: { cls: 's-warn', icon: 'i-warn', label: 'Da seguire' },
    basso: { cls: 's-ok', icon: 'i-ok', label: 'Sotto controllo' },
  });

  function statusBadge(key, labelOverride) {
    const s = STATES[key] || STATES.attesa;
    const icon = svgEl('svg', { 'aria-hidden': 'true' }, [svgEl('use', { href: `#${s.icon}` })]);
    return el('span', { class: `status ${s.cls}` }, [icon, el('span', { text: labelOverride || s.label })]);
  }

  /** Tooltip condiviso. Righe: { value, label, color?, dash? }: il valore in evidenza, l'etichetta dopo. */
  function showTip(x, y, title, rows) {
    const tip = $('tip');
    tip.replaceChildren(el('div', { class: 'tip-title', text: title }));
    rows.forEach(r => {
      const key = r.color ? el('i', { class: r.dash ? 'dash' : null, style: `--c:${r.color}` }) : null;
      tip.append(el('div', { class: 'tip-row' }, [key, el('b', { text: r.value }), el('span', { text: r.label })]));
    });
    tip.hidden = false;
    const { width, height } = tip.getBoundingClientRect();
    const left = Math.min(window.innerWidth - width - 8, Math.max(8, x + TIP_OFFSET));
    const top = y - height - TIP_OFFSET < 8 ? y + TIP_OFFSET : y - height - TIP_OFFSET;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }
  function hideTip() { $('tip').hidden = true; }

  root.PalombaroUI = Object.freeze({ $, el, svgEl, pct, shortDate, weekDate, longDate, STATES, statusBadge, showTip, hideTip });
})(window);
