import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ingredientAvailability, readRecipeFilter, recipeIntensities } from '../src/lib/recipe-catalog.ts';

test('el recetario admite las cuatro intensidades y conserva Todas como opción general', () => {
  assert.deepEqual(recipeIntensities.map(readRecipeFilter), ['light', 'medium', 'hearty', 'extraHearty']);
  for (const invalid of [null, undefined, ['light'], 'heavy', 'all']) assert.equal(readRecipeFilter(invalid), 'all');
});

test('disponibilidad distingue disponible, confirmado ausente y sin marcar sin contar ingredientes duplicados', () => {
  const ingredients = ['egg', 'egg', 'onion', 'tomato'].map((food_id) => ({ food_id }));
  const selections = [{ food_id: 'egg', status: 'available' }, { food_id: 'tomato', status: 'unavailable' }];
  assert.deepEqual(ingredientAvailability(ingredients, selections), { available: 1, unavailable: 1, unknown: 1, total: 3 });
  assert.deepEqual(ingredientAvailability(ingredients, []), { available: 0, unavailable: 0, unknown: 3, total: 3 });
});
