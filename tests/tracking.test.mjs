import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chartBounds, trendSegments } from '../src/lib/chart-scale.ts';
import { localFormDateTime } from '../src/lib/dates.ts';
import {
  measuredInstant, parseExerciseName, parseStrength, parseTreadmill, parseWeighIn, parseWeightGoal,
} from '../src/lib/tracking-fields.ts';
import { orderExercises, clockDuration, nextFavoriteSlot, recentRuns, runMetrics, strengthSummary, weightPoints, weightSummary } from '../src/lib/tracking.ts';
import { displayDistance, displayWeight, distanceInKm } from '../src/lib/units.ts';

const now = new Date('2026-11-24T12:30:00Z');
const zone = 'America/Argentina/Buenos_Aires';
const form = (values) => {
  const fields = new FormData();
  for (const [key, value] of Object.entries(values)) fields.set(key, value);
  return fields;
};

test('los formularios editan en lb y mi sin alterar la precisión canónica', () => {
  assert.equal(distanceInKm(displayDistance(4.25, 'mi'), 'mi'), 4.25);
  const weight = form({ weight: displayWeight(78.453, 'lb').toFixed(5), measured_at: '2026-11-24T08:00', condition: ' En ayunas ' });
  assert.deepEqual(parseWeighIn(weight, 'lb', zone, now), {
    weight_kg: 78.453, measured_at: '2026-11-24T11:00:00Z', condition: 'En ayunas',
  });
  const run = form({ distance: displayDistance(3.5678, 'mi').toFixed(5), minutes: '23', seconds: '15', performed_on: '2026-11-24' });
  assert.deepEqual(parseTreadmill(run, 'mi', zone, now), {
    distance_km: 3.5678, duration_seconds: 1395, performed_on: '2026-11-24',
  });
});

test('fuerza, cinta y peso admiten coma y punto sin perder precisión', () => {
  const performed_on = '2026-11-24';
  for (const [load, expected] of [['12,5', 12.5], ['12.5', 12.5], ['12', 12], ['0', 0]]) {
    assert.equal(parseStrength(form({ load, performed_on }), 'kg', zone, now)?.load_kg, expected);
  }
  for (const [distance, expected] of [['1,13', 1.13], ['1.13', 1.13], ['1', 1], [',5', .5]]) {
    assert.equal(parseTreadmill(form({ distance, minutes: '12', seconds: '0', performed_on }), 'km', zone, now)?.distance_km, expected);
  }
  for (const value of ['12,', '12.', '1,13.4', '1.13,4', '1e2', '-1', '12,123456']) {
    assert.equal(parseStrength(form({ load: value, performed_on }), 'kg', zone, now), null, value);
    assert.equal(parseTreadmill(form({ distance: value, minutes: '12', seconds: '0', performed_on }), 'km', zone, now), null, value);
  }
  assert.deepEqual(parseWeightGoal(form({ weight: '78,125' }), 'kg'), { weight_goal_kg: 78.125 });
  assert.equal(parseTreadmill(form({ distance: displayDistance(1.13, 'mi').toFixed(5).replace('.', ','), minutes: '12',
    seconds: '0', performed_on }), 'mi', zone, now)?.distance_km, 1.13);
});

test('un pesaje usa la zona del perfil y valida el calendario y los saltos de hora', () => {
  assert.equal(localFormDateTime(now.toISOString(), zone), '2026-11-24T09:30');
  assert.equal(measuredInstant('2026-11-24T09:31', zone, now), null);
  assert.equal(measuredInstant('2026-02-29T08:00', zone, now), null);
  assert.equal(measuredInstant('2026-03-08T02:30', 'America/New_York', now), null);
  assert.equal(measuredInstant('2026-11-01T01:30', 'America/New_York', now), '2026-11-01T05:30:00Z');
});

test('los formularios validan valores y permiten quitar el objetivo o registrar carga cero', () => {
  assert.deepEqual(parseWeightGoal(form({ weight: '' }), 'kg'), { weight_goal_kg: null });
  assert.equal(parseWeightGoal(form({ weight: '0' }), 'kg'), null);
  assert.equal(parseExerciseName(form({ name: '  ' })), null);
  assert.deepEqual(parseExerciseName(form({ name: '  Press  ' })), { name: 'Press' });
  assert.deepEqual(parseStrength(form({ load: '0', performed_on: '2026-11-24' }), 'kg', zone, now), {
    load_kg: 0, performed_on: '2026-11-24',
  });
  assert.equal(parseStrength(form({ load: '-1', performed_on: '2026-11-24' }), 'kg', zone, now), null);
  assert.equal(parseStrength(form({ load: '22', performed_on: '2026-11-25' }), 'kg', zone, now), null);
  for (const values of [{ seconds: '60' }, { minutes: '0', seconds: '0' }, { distance: '0' }, { minutes: '1440', seconds: '1' }]) {
    const invalid = form({ distance: '1.7', minutes: '15', seconds: '0', performed_on: '2026-11-24', ...values });
    assert.equal(parseTreadmill(invalid, 'km', zone, now), null);
  }
});

test('el resumen de peso y la media móvil se calculan sobre registros observados', () => {
  const observations = [80, 84, 79, 77, 78].map((weight, index) => ({
    weight_kg: weight, measured_at: `2026-11-0${index + 1}T09:00:00Z`,
  }));
  assert.deepEqual(weightSummary(observations), { first: 80, current: 78, change: -2 });
  assert.equal(weightSummary([]), null);
  assert.ok(weightPoints(observations.slice(0, 3)).every(({ trend }) => trend === undefined));
  const chart = weightPoints(observations);
  assert.equal(chart.length, observations.length);
  assert.deepEqual(chart.map(({ trend }) => trend), [undefined, undefined, 81, 80, 79.6]);
  assert.deepEqual(chart.map(({ day }) => day), observations.map(({ measured_at }) => measured_at));
});

test('la tendencia pesa cada día local por igual y el gráfico conserva márgenes legibles', () => {
  const observations = [
    ['2026-11-02T01:00:00Z', 82], ['2026-11-01T13:00:00Z', 80], ['2026-11-02T15:00:00Z', 79],
    ['2026-11-03T15:00:00Z', 77], ['2026-11-04T15:00:00Z', 75], ['2026-11-22T15:00:00Z', 70],
  ].map(([measured_at, weight_kg]) => ({ measured_at, weight_kg }));
  const points = weightPoints(observations, zone);
  assert.deepEqual(points.map(({ value }) => value), [80, 82, 79, 77, 75, 70]);
  assert.deepEqual(points.map(({ trend }) => trend), [undefined, undefined, undefined, 79, 78, undefined]);
  assert.deepEqual(trendSegments(points), [[3, 4]]);
  assert.deepEqual(chartBounds(points, 5), { min: 65, max: 87 });
  assert.deepEqual(chartBounds([{ value: 9 }, { value: 10 }]), { min: 8.5, max: 10.5 });
  assert.deepEqual(chartBounds([{ value: 0 }, { value: 0 }]), { min: 0, max: 0.1 });
  assert.equal(parseWeighIn(form({ weight: '72', measured_at: '2026-11-01T01:30', condition: '' }),
    'kg', 'America/New_York', now, '2026-11-01T06:30:31Z').measured_at, '2026-11-01T06:30:31Z');
});

test('la carga acepta repeticiones opcionales y permite quitar un valor anterior', () => {
  const values = { load: '40', performed_on: '2026-11-24' };
  assert.equal(parseStrength(form({ ...values, repetitions: '12' }), 'kg', zone, now)?.repetitions, 12);
  assert.equal(parseStrength(form({ ...values, repetitions: '' }), 'kg', zone, now)?.repetitions, null);
  for (const repetitions of ['0', '-3', '1.5', '1000']) {
    assert.equal(parseStrength(form({ ...values, repetitions }), 'kg', zone, now), null);
  }
});

test('las cargas comparan la última marca con la anterior y los destacados ocupan cuatro lugares', () => {
  assert.deepEqual(strengthSummary([30, 50, 45].map((load_kg) => ({ load_kg }))), { latest: 45, best: 50, change: -5 });
  assert.deepEqual(strengthSummary([{ load_kg: 0 }]), { latest: 0, best: 0, change: null });
  assert.equal(nextFavoriteSlot([{ favorite_slot: 1 }, { favorite_slot: 3 }, { favorite_slot: null }]), 2);
  assert.equal(nextFavoriteSlot([1, 2, 3, 4].map((favorite_slot) => ({ favorite_slot }))), undefined);
});

test('cinta calcula velocidad, ritmo y compara ventanas completas ponderadas por tiempo', () => {
  const first = { distance_km: 2, duration_seconds: 1200 };
  const second = { distance_km: 4, duration_seconds: 1200 };
  assert.deepEqual(runMetrics(first, 'km'), { distance: 2, speed: 6, paceSeconds: 600 });
  assert.ok(Math.abs(runMetrics(first, 'mi').paceSeconds - 600 * 1.609344) < 1e-9);
  assert.equal(clockDuration(359.6), '6:00');
  const differentDuration = { distance_km: 1, duration_seconds: 1800 };
  assert.deepEqual(recentRuns([first, differentDuration], 'km'), { speed: 3.6, count: 2, change: null });
  assert.equal(recentRuns([first, ...Array(8).fill(second)], 'km').change, null);
  assert.deepEqual(recentRuns([...Array(5).fill(first), ...Array(5).fill(second)], 'km'), { speed: 12, count: 5, change: 6 });
});

test('ordena destacados primero dentro del mismo listado y el resto por nombre', () => {
  const exercises = [
    { id: 'a', favorite_slot: null, name: 'Zancadas' },
    { id: 'b', favorite_slot: 2, name: 'Press plano' },
    { id: 'c', favorite_slot: null, name: 'Abdominales' },
    { id: 'd', favorite_slot: 1, name: 'Cuádriceps' },
  ];
  assert.deepEqual(orderExercises(exercises, 'es').map(({ id }) => id), ['d', 'b', 'c', 'a']);
  assert.deepEqual(exercises.map(({ id }) => id), ['a', 'b', 'c', 'd']);
});
