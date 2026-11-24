import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeCalories } from '../src/lib/calories.ts';
import { isCalendarDay, monthsBefore } from '../src/lib/dates.ts';
import { displayDistance, displayWeight, heightInFeetAndInches, weightInKg } from '../src/lib/units.ts';

test('el avance visual llega a 100 y el resumen conserva el excedente', () => {
  assert.deepEqual(summarizeCalories(2250, 2100), {
    difference: -150, percentage: 107, fill: 100, status: 'over',
  });
  assert.equal(summarizeCalories(2100, 2100).status, 'reached');
  assert.equal(summarizeCalories(1450, 2100).difference, 650);
  assert.equal(summarizeCalories(0, 2100).fill, 0);
});

test('las conversiones mantienen como base las unidades métricas', () => {
  const kg = 78.4;
  assert.equal(displayWeight(kg, 'kg'), kg);
  assert.ok(Math.abs(weightInKg(displayWeight(kg, 'lb'), 'lb') - kg) < 1e-10);
  assert.equal(displayDistance(1.609344, 'mi'), 1);
  assert.deepEqual(heightInFeetAndInches(182.8), { feet: 6, inches: 0 });
});

test('el rango mensual se ajusta al último día del mes y respeta bisiestos', () => {
  assert.equal(monthsBefore('2024-03-31', 1), '2024-02-29');
  assert.equal(monthsBefore('2026-03-31', 1), '2026-02-28');
  assert.equal(monthsBefore('2026-01-10', 1), '2025-12-10');
  assert.ok(isCalendarDay('2024-02-29'));
  assert.equal(isCalendarDay('2026-02-29'), false);
});
