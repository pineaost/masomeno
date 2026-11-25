import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readinessPriority, recipeAvailability } from '../src/lib/recipe-catalog.ts';

test('ordena recetas preparables y conserva como desconocida una sustitución sin marcar', () => {
  const recipe = {
    ingredients: [{ food_id: 'rice', position: 1 }, { food_id: 'tuna', position: 2 }, { food_id: 'egg', position: 3, is_optional: true }],
    alternatives: [{ ingredient_position: 2, food_id: 'chicken' }],
  };
  const rice = { food_id: 'rice', status: 'available' };
  const tuna = { food_id: 'tuna', status: 'unavailable' };
  assert.deepEqual(recipeAvailability(recipe, [rice, tuna]), { available: 1, unavailable: 0, unknown: 1, total: 2 });
  assert.equal(readinessPriority(recipeAvailability(recipe, [rice, tuna, { food_id: 'chicken', status: 'available' }])), 2);
  assert.equal(readinessPriority(recipeAvailability(recipe, [rice, tuna, { food_id: 'chicken', status: 'unavailable' }])), 0);
  assert.deepEqual(recipeAvailability({ ...recipe, purchase_unit: 'unit' }, []), {
    available: 0, unavailable: 0, unknown: 0, total: 0,
  });
});
import { ingredientAvailability, ingredientNameKey, parsePersonalIngredient, readRecipeFilter, recipeIntensities } from '../src/lib/recipe-catalog.ts';

test('los nombres personales conservan el texto visible y comparan variantes evidentes', () => {
  const fields = new FormData();
  fields.set('name', '  Alméndras   tostadas ');
  assert.equal(parsePersonalIngredient(fields), 'Alméndras tostadas');
  assert.equal(ingredientNameKey('  Alméndras   tostadas '), ingredientNameKey('almendras tostadas'));
  fields.set('name', '   ');
  assert.equal(parsePersonalIngredient(fields), null);
  fields.set('name', 'A'.repeat(81));
  assert.equal(parsePersonalIngredient(fields), null);
});

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
