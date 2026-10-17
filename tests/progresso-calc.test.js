// Test dei calcoli del bollettino di avanzamento: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../landing/progresso-calc.js');

const sub = (over) => ({ id: 'x', nome: 'x', da: '2026-10-13', a: '2026-10-16', ore: 2, fatto: 0, ...over });
const day = iso => C.toDay(iso);

test('il previsto cresce in modo lineare dall\'inizio del primo giorno alla fine dell\'ultimo', () => {
  const s = sub();
  assert.equal(C.plannedShare(s, day('2026-10-12')), 0);
  assert.equal(C.plannedShare(s, day('2026-10-13')), 0.25);
  assert.equal(C.plannedShare(s, day('2026-10-15')), 0.75);
  assert.equal(C.plannedShare(s, day('2026-10-16')), 1);
  assert.equal(C.plannedShare(s, day('2026-10-30')), 1);
});

test('le sottofasi pesano in ore e quelle saltate o facoltative non contano', () => {
  const subs = [
    sub({ ore: 3, fatto: 100 }),
    sub({ ore: 1, fatto: 0 }),
    sub({ ore: 5, fatto: 0, saltata: true }),
    sub({ ore: 5, fatto: 0, facoltativa: true }),
  ];
  assert.equal(C.doneShare(subs), 0.75);
});

test('lo scostamento è negativo in ritardo e positivo in anticipo', () => {
  const subs = [sub({ da: '2026-10-10', a: '2026-10-19', ore: 10 })];
  const today = day('2026-10-14');            // previsto a fine giornata: 50 %
  assert.ok(Math.abs(C.slipDays(subs, today, 0.3) + 2) < 1e-6);
  assert.ok(Math.abs(C.slipDays(subs, today, 0.5)) < 1e-6);
  assert.ok(Math.abs(C.slipDays(subs, today, 0.7) - 2) < 1e-6);
});

test('lo stato segue la regola dei 3 giorni del piano', () => {
  assert.equal(C.scheduleStatus(1.5), 'anticipo');
  assert.equal(C.scheduleStatus(0.4), 'linea');
  assert.equal(C.scheduleStatus(-0.9), 'linea');
  assert.equal(C.scheduleStatus(-1.1), 'lieve');
  assert.equal(C.scheduleStatus(-3), 'ritardo');
});

test('una sottofase iniziata dopo la scadenza risulta in corso ma in ritardo', () => {
  const s = sub({ fatto: 40 });
  assert.equal(C.subState(s, day('2026-10-15')), 'corso');
  assert.equal(C.subState(s, day('2026-10-17')), 'corso-ritardo');
  assert.equal(C.subState(sub(), day('2026-10-17')), 'ritardo');
  assert.equal(C.subState(sub({ fatto: 100 }), day('2026-10-17')), 'fatta');
  assert.equal(C.subState(sub({ saltata: true }), day('2026-10-17')), 'saltata');
});

test('lo storico riceve il punto di oggi, che sostituisce un valore registrato nello stesso giorno', () => {
  const h = C.historyWithToday([{ data: '2026-10-12', fatto: 6 }, { data: '2026-10-15', fatto: 1 }], day('2026-10-15'), 0.08);
  assert.deepEqual(h.map(p => p.value), [0.06, 0.08]);
});

test('il prospetto misura la lentezza sulle sole attività con ore registrate', () => {
  const data = {
    consegna: '2026-10-30', scadenzaProf: '2026-11-10', oreAlGiorno: 2,
    fasi: [{ id: 'F0', sottofasi: [
      sub({ ore: 4, fatto: 50, oreEffettive: 6, oreUnaTantum: 2 }),   // guadagnate 2 h, spese 6 h
      sub({ ore: 2, fatto: 100 }),                                       // fatta ma senza ore: fuori dal rapporto
      sub({ ore: 10, fatto: 0 }),
    ] }],
  };
  const f = C.forecast(data, day('2026-10-15'));
  assert.equal(f.earned, 2);
  assert.equal(f.actual, 6);
  assert.equal(f.measured, 3);
  assert.equal(f.remaining, 12);                     // 2 h della prima + 10 h della terza
  const [misurato, senza, piano] = f.scenarios;
  assert.equal(misurato.finish - day('2026-10-15'), 18);   // 12 h × 3 / 2 h al giorno
  assert.equal(senza.factor, 2);                            // (6 − 2) / 2
  assert.equal(piano.finish, day('2026-10-21'));            // 12 h / 2 h = 6 giorni
  assert.equal(piano.verdict, 'tempo');
  assert.equal(misurato.verdict, 'margine');      // 2 nov: dopo la consegna, prima della scadenza
  assert.equal(misurato.late, 3);
});

test('il prospetto calcola quanto si può essere lenti e quante ore al giorno servono per arrivare in tempo', () => {
  const data = {
    consegna: '2026-10-25', scadenzaProf: '2026-11-04', oreAlGiorno: 2,
    fasi: [{ id: 'F0', sottofasi: [sub({ ore: 10, fatto: 50, oreEffettive: 10 }), sub({ ore: 15, fatto: 0 })] }],
  };
  const [byDelivery] = C.forecast(data, day('2026-10-15')).needs;
  assert.equal(byDelivery.maxFactor, 1);             // 10 giorni × 2 h = 20 h per 20 h di piano
  assert.equal(byDelivery.hoursPerDay, 4);           // a ritmo ×2: 40 h in 10 giorni
});

test('senza ore registrate il prospetto mostra solo il ritmo del piano', () => {
  const data = { consegna: '2026-10-25', scadenzaProf: '2026-11-04', oreAlGiorno: 2,
    fasi: [{ id: 'F0', sottofasi: [sub({ ore: 4, fatto: 0 })] }] };
  const f = C.forecast(data, day('2026-10-15'));
  assert.equal(f.measured, null);
  assert.deepEqual(f.scenarios.map(s => s.key), ['piano']);
});

test('il bollettino conta le milestone raggiunte e i giorni alla consegna', () => {
  const data = {
    aggiornato: '2026-10-15', consegna: '2026-10-20', storico: [],
    fasi: [
      { id: 'F0', sottofasi: [sub({ da: '2026-10-10', a: '2026-10-11', fatto: 100 })] },
      { id: 'F1', sottofasi: [sub({ da: '2026-10-14', a: '2026-10-17', fatto: 10 })] },
    ],
  };
  const r = C.buildReport(data);
  assert.equal(r.reached, 1);
  assert.equal(r.toDelivery, 5);
  assert.deepEqual(r.phases.map(p => p.state), ['raggiunta', 'corso']);
});
