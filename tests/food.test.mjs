import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  localFoodDay, matchesFood, mealCalories, parseCalorieGoal, parseMeal, portionCalories, portionInGrams, suggestedMealCategory, totalCalories,
} from '../src/lib/food.ts';
import { readTimeZone } from '../src/lib/time-zones.ts';

const zone = 'America/Argentina/Buenos_Aires';
const now = new Date('2026-11-24T12:00:00Z');

const fields = (values) => {
  const result = new FormData();
  for (const [field, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value]) result.append(field, item);
  }
  return result;
};

test('convierte porciones documentadas y suma las estimaciones de los componentes', () => {
  const egg = { portion_unit: 'egg', portion_grams: 50 };
  assert.equal(portionInGrams(2, 'egg', egg), 100);
  assert.equal(portionInGrams(1.5, 'egg', egg), 75);
  assert.equal(portionInGrams(120, 'g', egg), 120);
  assert.equal(portionInGrams(1, 'banana', egg), null);
  assert.equal(portionInGrams(201, 'egg', egg), null);
  assert.equal(portionCalories(75, 155), 116.25);
  assert.equal(portionCalories(13.5, 884), 119.34);
  assert.equal(portionInGrams(.5, 'steak', { portion_unit: 'steak', portion_grams: 119 }), 59.5);
  assert.equal(portionInGrams(2, 'cup', { portion_unit: 'cup', portion_grams: 158 }), 316);
  assert.equal(portionInGrams(1, 'bananaLarge', { portion_unit: 'banana', portion_grams: 118, additional_portions: { bananaLarge: 136 } }), 136);
  assert.equal(mealCalories({ manual_kcal: 0, components: [] }), 0);
  assert.equal(mealCalories({ manual_kcal: null, components: [{ kcal: 116.25 }, { kcal: 119.34 }] }), 235.59);
  assert.equal(totalCalories([235.59, 320.13, 0]), 555.72);
  assert.equal(totalCalories([]), 0);
});

test('busca nombres traducidos y sinónimos con y sin acentos', () => {
  const item = { food: { names: { es: 'Fideos de trigo', en: 'Wheat pasta', it: 'Pasta di grano' }, synonyms: ['espagueti', 'fidéos cocidos'] } };
  assert.equal(matchesFood(item, '  FIDEOS cocidos '), true);
  assert.equal(matchesFood(item, 'espagueti'), true);
  assert.equal(matchesFood(item, 'pasta di grano'), true);
  assert.equal(matchesFood(item, 'pasta seca'), false);
});

test('calcula el día local y sus límites aunque cambie el horario de verano', () => {
  assert.deepEqual(localFoodDay(new Date('2026-11-24T02:59:59Z'), zone), {
    date: '2026-11-23', today: '2026-11-23', dateTime: '2026-11-23T23:59', start: '2026-11-23T03:00:00Z', end: '2026-11-24T03:00:00Z',
  });
  assert.equal(localFoodDay(new Date('2026-11-24T03:00:00Z'), zone).date, '2026-11-24');
  const observed = new Date('2026-11-25T01:36:00Z');
  assert.equal(localFoodDay(observed, zone).dateTime, '2026-11-24T22:36');
  assert.equal(localFoodDay(observed, zone, '2026-11-23').end, '2026-11-24T03:00:00Z');
  assert.equal(localFoodDay(observed, zone, '2026-11-25').date, '2026-11-24');
  for (const [day, hours] of [['2026-03-08', 23], ['2026-11-01', 25]]) {
    const { start, end } = localFoodDay(new Date(day + 'T12:00:00Z'), 'America/New_York');
    assert.equal((Date.parse(end) - Date.parse(start)) / 3600000, hours);
  }
});

test('normaliza la zona IANA y sugiere una categoría a partir de la hora local', () => {
  assert.equal(readTimeZone('America/Buenos_Aires'), zone);
  assert.equal(readTimeZone('UTC-3'), null);
  assert.equal(readTimeZone('ART'), null);
  assert.equal(readTimeZone('America/Invented'), null);
  assert.deepEqual(['08:00', '11:20', '13:40', '16:10', '22:36', '01:36']
    .map((time) => suggestedMealCategory('2026-11-24T' + time)),
  ['firstMeal', 'other', 'lunch', 'snack', 'dinner', 'other']);
});

test('valida objetivos personales y comidas de catálogo o manuales', () => {
  assert.deepEqual(parseCalorieGoal(fields({ kcal: '2100' })), { kcal: 2100 });
  assert.deepEqual(parseCalorieGoal(fields({ kcal: '' })), { kcal: null });
  for (const kcal of ['0', '10001', '-5', '2100.5']) assert.equal(parseCalorieGoal(fields({ kcal })), null);

  const form = { name: ' Almuerzo ', category: 'lunch', consumed_at: '2026-11-24T08:00' };
  assert.deepEqual(parseMeal(fields({ ...form, kind: 'manual', kcal: '550.25' }), zone, now), {
    name: 'Almuerzo', category: 'lunch', consumedAt: '2026-11-24T11:00:00Z', kcal: 550.25, lines: [],
  });
  assert.equal(parseMeal(fields({ ...form, kind: 'manual', kcal: '' }), zone, now), null);
  assert.equal(parseMeal(fields({ ...form, kind: 'manual', kcal: '200', consumed_at: '2026-11-24T09:01' }), zone, now), null);
  assert.equal(parseMeal(fields({ ...form, kind: 'catalog' }), zone, now), null);
  const line = { reference: ['egg-cooked', 'white-rice-cooked'], component_id: ['', ''], amount: ['1', '125'], unit: ['egg', 'g'] };
  assert.deepEqual(parseMeal(fields({ ...form, kind: 'catalog', ...line }), zone, now)?.lines, [
    { id: null, referenceId: 'egg-cooked', amount: 1, unit: 'egg' },
    { id: null, referenceId: 'white-rice-cooked', amount: 125, unit: 'g' },
  ]);
  assert.equal(parseMeal(fields({ ...form, kind: 'catalog', ...line, unit: ['egg', 'cup'] }), zone, now)?.lines[1].unit, 'cup');
  assert.equal(parseMeal(fields({ ...form, kind: 'catalog', ...line, unit: ['egg', 'unknown'] }), zone, now), null);
  assert.deepEqual(parseMeal(fields({ ...form, kind: 'recipe', recipe: 'd493d385-bc7c-4bb4-8eda-ce9b7a792015', servings: '1.5' }), zone, now)?.recipe,
    { id: 'd493d385-bc7c-4bb4-8eda-ce9b7a792015', servings: 1.5 });
  const existingTime = '2026-11-01T06:30:15Z';
  assert.equal(parseMeal(fields({ ...form, kind: 'manual', kcal: '245', consumed_at: '2026-11-01T01:30' }),
    'America/New_York', now, existingTime)?.consumedAt, existingTime);
});
