import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeCalories } from '../src/lib/calories.ts';
import { isCalendarDay, monthsBefore } from '../src/lib/dates.ts';
import { displayDistance, displayWeight, heightInFeetAndInches, weightInKg } from '../src/lib/units.ts';

test('la barra representa el objetivo y el tramo excedido en la misma escala', () => {
  const summary = summarizeCalories(2300, 2000);
  assert.equal(summary.difference, -300);
  assert.equal(summary.percentage, 115);
  assert.equal(summary.goalMark, 2000 / 23);
  assert.equal(summary.baseFill, summary.goalMark);
  assert.ok(Math.abs(summary.baseFill + summary.excessFill - 100) < 1e-10);
  assert.equal(summary.status, 'over');
  assert.equal(summarizeCalories(2100, 2100).status, 'reached');
  assert.equal(summarizeCalories(1450, 2100).difference, 650);
  assert.equal(summarizeCalories(0, 2100).baseFill, 0);
  assert.equal(summarizeCalories(40000, 2000).goalMark, 5);
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
