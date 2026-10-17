/* Calcoli dell'avanzamento: pesi in ore, avanzamento previsto dal calendario, scostamento in giorni.
   Funzioni pure: le usano la pagina (window.PalombaroCalc) e i test in Node (module.exports). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PalombaroCalc = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const DAY_MS = 86400000;
  const ON_TRACK_DAYS = 1;   // entro ±1 giorno dal piano: in linea
  const LATE_DAYS = 3;       // oltre 3 giorni: scatta il piano B (regola di ritardo del T5)

  /** 'AAAA-MM-GG' → numero di giorni dal 1970 (UTC, niente sorprese con l'ora legale). */
  function toDay(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d) / DAY_MS;
  }
  function fromDay(day) { return new Date(Math.round(day) * DAY_MS).toISOString().slice(0, 10); }

  /** Le sottofasi saltate o facoltative non pesano sul totale. */
  function counts(sub) { return !sub.saltata && !sub.facoltativa; }

  /** Quota prevista a fine giornata `day`: lineare dall'inizio del primo giorno alla fine dell'ultimo. */
  function plannedShare(sub, day) {
    const start = toDay(sub.da);
    const end = toDay(sub.a) + 1;
    return Math.min(1, Math.max(0, (day + 1 - start) / (end - start)));
  }

  function weighted(subs, valueOf) {
    const active = subs.filter(counts);
    const total = active.reduce((sum, s) => sum + s.ore, 0);
    if (!total) return 0;
    return active.reduce((sum, s) => sum + s.ore * valueOf(s), 0) / total;
  }
  const doneShare = subs => weighted(subs, s => s.fatto / 100);
  const plannedAt = (subs, day) => weighted(subs, s => plannedShare(s, day));

  /**
   * Giorni di scostamento: in che giorno il piano prevedeva il lavoro fatto oggi?
   * Negativo = ritardo, positivo = anticipo. Bisezione: il previsto non decresce mai nel tempo.
   */
  function slipDays(subs, day, done) {
    const active = subs.filter(counts);
    let lo = Math.min(...active.map(s => toDay(s.da))) - 1;
    let hi = Math.max(...active.map(s => toDay(s.a)));
    if (done <= 0) return lo - day;
    if (done >= plannedAt(subs, hi)) return hi - day;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (plannedAt(subs, mid) >= done) hi = mid; else lo = mid;
    }
    return hi - day;
  }

  function scheduleStatus(slip) {
    if (slip >= ON_TRACK_DAYS) return 'anticipo';
    if (slip > -ON_TRACK_DAYS) return 'linea';
    if (slip > -LATE_DAYS) return 'lieve';
    return 'ritardo';
  }

  function subState(sub, day) {
    if (sub.saltata) return 'saltata';
    if (sub.fatto >= 100) return 'fatta';
    const late = day > toDay(sub.a);
    if (sub.fatto > 0) return late ? 'corso-ritardo' : 'corso';
    return late ? 'ritardo' : 'da-fare';
  }

  function phaseSummary(phase, day) {
    const active = phase.sottofasi.filter(counts);
    const deadline = Math.max(...active.map(s => toDay(s.a)));
    const done = doneShare(phase.sottofasi);
    const planned = plannedAt(phase.sottofasi, day);
    let state = 'attesa';
    if (done >= 1) state = 'raggiunta';
    else if (day > deadline) state = 'scaduta';
    else if (done > 0) state = 'corso';
    return {
      phase, done, planned, state,
      start: Math.min(...active.map(s => toDay(s.da))), deadline,
      subs: phase.sottofasi.map(s => ({ sub: s, state: subState(s, day) })),
    };
  }

  /** Curva prevista giorno per giorno, dal primo all'ultimo giorno indicati (estremi compresi). */
  function plannedSeries(subs, firstDay, lastDay) {
    const out = [];
    for (let d = firstDay; d <= lastDay; d++) out.push({ day: d, value: plannedAt(subs, d) });
    return out;
  }

  /** Storico registrato + il punto di oggi, calcolato (sostituisce un eventuale punto della stessa data). */
  function historyWithToday(storico, day, done) {
    const past = storico
      .map(p => ({ day: toDay(p.data), value: p.fatto / 100 }))
      .filter(p => p.day !== day);
    return [...past, { day, value: done }].sort((a, b) => a.day - b.day);
  }

  /**
   * Prospetto di fine progetto: confronta le ore effettive con le ore "guadagnate"
   * (ore del piano × quota fatta) sulle attività con le ore registrate. Il rapporto, applicato alle
   * ore di piano che restano e diviso per le ore di lavoro al giorno, dà la data di fine.
   */
  function forecast(data, day) {
    const active = data.fasi.flatMap(f => f.sottofasi).filter(counts);
    const tracked = active.filter(s => typeof s.oreEffettive === 'number' && s.fatto > 0);
    const earnedOf = s => s.ore * s.fatto / 100;
    const earned = tracked.reduce((sum, s) => sum + earnedOf(s), 0);
    const actual = tracked.reduce((sum, s) => sum + s.oreEffettive, 0);
    const oneOff = tracked.reduce((sum, s) => sum + (s.oreUnaTantum || 0), 0);
    const remaining = active.reduce((sum, s) => sum + s.ore * (1 - s.fatto / 100), 0);
    const total = active.reduce((sum, s) => sum + s.ore, 0);
    const perDay = data.oreAlGiorno;
    const delivery = toDay(data.consegna);
    const deadline = toDay(data.scadenzaProf);

    const scenario = (key, factor) => {
      const finish = day + Math.ceil(remaining * factor / perDay);
      const verdict = finish <= delivery ? 'tempo' : finish <= deadline ? 'margine' : 'oltre';
      return { key, factor, finish, late: finish - delivery, verdict };
    };
    const measured = earned > 0 ? actual / earned : null;
    const scenarios = [];
    if (measured !== null) scenarios.push(scenario('misurato', measured));
    if (measured !== null && oneOff > 0) scenarios.push(scenario('senza-una-tantum', (actual - oneOff) / earned));
    scenarios.push(scenario('piano', 1));

    // calcolo inverso: quanto si può essere lenti, o quante ore al giorno servono, per arrivare in tempo
    const need = target => ({
      target,
      maxFactor: (target - day) * perDay / remaining,
      hoursPerDay: measured === null ? null : remaining * measured / (target - day),
    });
    return {
      perDay, earned, actual, oneOff, remaining, total, measured,
      tracked: tracked.map(s => ({ sub: s, earned: earnedOf(s), ratio: s.oreEffettive / earnedOf(s) })),
      scenarios,
      needs: [need(delivery), need(deadline)],
    };
  }

  function buildReport(data) {
    const day = toDay(data.aggiornato);
    const subs = data.fasi.flatMap(f => f.sottofasi);
    const active = subs.filter(counts);
    const done = doneShare(subs);
    const slip = slipDays(subs, day, done);
    const phases = data.fasi.map(f => phaseSummary(f, day));
    const first = Math.min(...active.map(s => toDay(s.da)));
    const last = Math.max(...active.map(s => toDay(s.a)));
    return {
      day, done, slip,
      planned: plannedAt(subs, day),
      status: scheduleStatus(slip),
      phases,
      reached: phases.filter(p => p.state === 'raggiunta').length,
      toDelivery: toDay(data.consegna) - day,
      curve: plannedSeries(subs, first - 1, last),
      history: historyWithToday(data.storico || [], day, done),
      forecast: data.oreAlGiorno > 0 ? forecast(data, day) : null,
    };
  }

  return Object.freeze({
    DAY_MS, toDay, fromDay, plannedShare, doneShare, plannedAt, slipDays,
    scheduleStatus, subState, phaseSummary, plannedSeries, historyWithToday, forecast, buildReport,
  });
});
