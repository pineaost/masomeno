import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calorieProgress } from '../src/lib/calories.ts';
import { isCalendarDay, monthsBefore } from '../src/lib/dates.ts';
import { displayDistance, displayWeight, heightInFeetAndInches, weightInKg } from '../src/lib/units.ts';

test('la barra usa una escala fija y respeta ambos límites de la zona objetivo', () => {
  const cases = [
    // Consumo, tramo naranja, porcentaje de la zona completado, tramo coral.
    [0, 0, 0, 0], [1500, 60, 0, 0], [1899, 75.96, 0, 0], [1900, 76, 0, 0],
    [1950, 76, 25, 0], [2000, 76, 50, 0], [2050, 76, 75, 0], [2100, 76, 100, 0],
    [2100.01, 76, 100, .0004], [2101, 76, 100, .04], [2300, 76, 100, 8], [40000, 76, 100, 16],
  ];
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`);
  for (const [consumed, orange, green, coral] of cases) {
    const progress = calorieProgress(consumed, 2000);
    assert.deepEqual([progress.lower, progress.upper, progress.scale, progress.goalMark], [1900, 2100, 2500, 80]);
    assert.deepEqual([progress.zoneStart, progress.zoneWidth, progress.excessStart], [76, 8, 84]);
    assert.equal(progress.visible, Math.min(consumed, 2500));
    near(progress.percentage, consumed / 20);
    near(progress.baseFill, orange);
    near(progress.zoneFill, green);
    near(progress.excessFill, coral);
  }
});

test('la zona se recalcula al cambiar la meta y admite metas pequeñas y datos inválidos', () => {
  const changed = calorieProgress(1750.5, 1600);
  assert.deepEqual([changed.lower, changed.upper, changed.scale, changed.goalMark, changed.zoneWidth], [1500, 1700, 2000, 80, 10]);
  assert.equal(changed.distanceToRange, 50.5);
  const small = calorieProgress(85, 50);
  assert.deepEqual([small.lower, small.upper, small.scale, small.baseFill, small.excessFill], [0, 150, 175, 0, 0]);
  assert.ok(small.zoneWidth < 100 && small.zoneFill > 0 && small.zoneFill < 100);
  for (const invalid of [null, 0, -100, NaN, Infinity, Number.MAX_VALUE]) assert.equal(calorieProgress(250, invalid), null);
  for (const invalid of [NaN, -1, Infinity]) assert.equal(calorieProgress(invalid, 2000), null);
});

test('Hoy y Comidas interpretan los límites inclusivos y la distancia al rango de cada meta', () => {
  for (const goal of [1600, 2100]) {
    for (const [offset, status, distance] of [
      [-650, 'belowRange', 550], [-100.25, 'belowRange', 0.25],
      [-100, 'withinRange', 0], [-50, 'withinRange', 0], [0, 'withinRange', 0],
      [50, 'withinRange', 0], [100, 'withinRange', 0],
      [100.25, 'aboveRange', 0.25], [350, 'aboveRange', 250],
    ]) {
      const balance = calorieProgress(goal + offset, goal);
      assert.deepEqual([balance.status, balance.distanceToRange], [status, distance]);
    }
  }
  assert.equal(calorieProgress(0, 50).status, 'withinRange');
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
