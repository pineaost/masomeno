import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localFormDateTime } from '../src/lib/dates.ts';
import {
  measuredInstant, parseExerciseName, parseStrength, parseTreadmill, parseWeighIn, parseWeightGoal,
} from '../src/lib/tracking-fields.ts';
import { clockDuration, nextFavoriteSlot, recentRuns, runMetrics, strengthSummary, weightPoints, weightSummary } from '../src/lib/tracking.ts';
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
  assert.ok(weightPoints(observations.slice(0, 4)).every(({ trend }) => trend === undefined));
  const chart = weightPoints(observations);
  assert.equal(chart.length, observations.length);
  assert.deepEqual(chart.map(({ trend }) => trend), [undefined, undefined, 81, 80, 78]);
  assert.deepEqual(chart.map(({ day }) => day), observations.map(({ measured_at }) => measured_at));
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
