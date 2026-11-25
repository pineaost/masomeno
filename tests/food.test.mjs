import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  localFoodDay, matchesFood, mealCalories, parseCalorieGoal, parseMeal, portionCalories, portionInGrams, preferredFoodUnit,
  quickFoodAmounts, suggestedMealCategory, totalCalories,
} from '../src/lib/food.ts';
import { readTimeZone } from '../src/lib/time-zones.ts';
import { foodDraftNutrition, foodPreparation, parseMealItems } from '../src/lib/meal-composition.ts';
import { resolveRecipeDraft } from '../src/lib/recipe-composition.ts';

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

test('busca grupos de alimentos con el vocabulario del catálogo y de la categoría', () => {
  const search = (names, synonyms, category) => ({ food: { names, synonyms, category: { names: category } } });
  const salmon = search({ es: 'Salmón', en: 'Salmon', it: 'Salmone' }, ['pescado', 'fish', 'pesce'], {});
  const carrot = search({ es: 'Zanahoria', en: 'Carrot', it: 'Carota' }, [], { es: 'Verduras', en: 'Vegetables', it: 'Verdure' });
  for (const term of ['pescado', 'fish', 'pesce', 'PESCADO salmón']) assert.equal(matchesFood(salmon, term), true);
  for (const term of ['verduras', 'vegetables', 'verdure']) assert.equal(matchesFood(carrot, term), true);
  assert.equal(matchesFood(salmon, 'verduras'), false);
});

test('combina un bife mediano y media ensalada sin repetir el principal de la receta', () => {
  const recipeId = '94170000-0000-4000-8000-000000000009';
  const steak = { id: 'strip', validation: 'verified', kcal_per_100g: 223, portion_unit: 'steak', portion_grams: 119,
    additional_portions: { steakMedium: 180 } };
  const carrot = { id: 'carrot', validation: 'verified', kcal_per_100g: 41 };
  const egg = { id: 'egg', validation: 'verified', kcal_per_100g: 155 };
  const draft = { type: 'food', referenceId: 'strip', amount: '1', unit: 'steakMedium', role: 'main' };
  const side = { type: 'recipe', role: 'side',
    recipe: { recipeId, part: 'salad', servings: 0.5, choices: {}, quantities: {}, weights: { 2: 60 } } };
  const recipe = { id: recipeId, base_servings: 1, alternatives: [],
    parts: [{ id: 'salad', positions: [2, 3] }], ingredients: [
      { position: 1, food_reference_id: 'strip', grams: 180 },
      { position: 2, food_reference_id: 'carrot', grams: 100 },
      { position: 3, food_reference_id: 'egg', grams: 50 },
    ] };
  const refs = new Map([steak, carrot, egg].map((ref) => [ref.id, ref]));
  assert.deepEqual(parseMealItems(JSON.stringify([draft, side])), [draft, side]);
  assert.equal(parseMealItems(JSON.stringify([{ ...draft, unit: 'bowl' }])), null);
  assert.equal(parseMealItems(JSON.stringify([{ ...draft, role: 'invalid' }])), null);
  assert.equal(parseMealItems(JSON.stringify([{ ...draft, amount: '1.123' }])), null);
  assert.equal(preferredFoodUnit(steak), 'steakMedium');
  assert.deepEqual(quickFoodAmounts('steakMedium'), [0.5, 1, 1.5, 2]);
  assert.deepEqual(quickFoodAmounts('egg'), [1, 2, 3]);
  assert.deepEqual(quickFoodAmounts('tablespoon'), [0.5, 1, 2]);
  assert.deepEqual(quickFoodAmounts('g'), []);
  assert.deepEqual(foodDraftNutrition(draft, steak), { amount: 1, grams: 180, kcal: 401.4 });
  assert.deepEqual(foodPreparation(draft, steak, 'Bife'), {
    name: 'Bife', servings: 1, measureUnit: 'steakMedium', ingredients: [{ referenceId: 'strip', grams: 180 }],
  });
  const lines = resolveRecipeDraft(recipe, side.recipe, refs);
  assert.deepEqual(lines, [{ referenceId: 'carrot', grams: 60 }, { referenceId: 'egg', grams: 25 }]);
  assert.equal(totalCalories([401.4, ...lines.map(({ referenceId, grams }) => portionCalories(grams, refs.get(referenceId).kcal_per_100g))]), 464.75);
  assert.equal(resolveRecipeDraft(recipe, { ...side.recipe, part: 'missing' }, refs), null);
  assert.equal(resolveRecipeDraft(recipe, { ...side.recipe, weights: { 1: 13 } }, refs), null);
  assert.equal(portionInGrams(0.5, 'handful', { portion_unit: 'walnut', portion_grams: 4.05, additional_portions: { handful: 28.35 } }), 14.175);
  assert.equal(portionInGrams(2, 'walnut', { portion_unit: 'walnut', portion_grams: 4.05 }), 8.1);
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
