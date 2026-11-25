import assert from 'node:assert/strict';
import { test } from 'node:test';
import { portionCalories, portionInGrams } from '../src/lib/food.ts';
import { preparationNutrition, recipeCaloriesPerServing, resolveRecipe } from '../src/lib/recipe-composition.ts';

const references = new Map([
  ['rice-dry', { validation: 'verified', kcal_per_100g: 365, protein_per_100g: 7.13, carbs_per_100g: 80, fat_per_100g: 0.66 }],
  ['rice-cooked', { validation: 'verified', kcal_per_100g: 130, protein_per_100g: 2.69, carbs_per_100g: 28.17, fat_per_100g: 0.28 }],
  ['carrot-raw', { validation: 'verified', kcal_per_100g: 41 }],
  ['carrot-cooked', { validation: 'verified', kcal_per_100g: 35 }],
  ['oil', { validation: 'verified', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 }],
  ['unknown', { validation: 'pending', kcal_per_100g: null }],
]);
const base = [{ position: 1, food_reference_id: 'rice-dry', grams: 80 }];

test('las referencias usan cantidades medidas en el estado elegido', () => {
  assert.equal(recipeCaloriesPerServing(base, 1, references), 292);
  assert.equal(recipeCaloriesPerServing([{ ...base[0], food_reference_id: 'rice-cooked', grams: 200 }], 1, references), 260);
  assert.equal(recipeCaloriesPerServing([{ ...base[0], food_reference_id: 'carrot-raw', grams: 100 }], 1, references), 41);
  assert.equal(recipeCaloriesPerServing([{ ...base[0], food_reference_id: 'carrot-cooked', grams: 100 }], 1, references), 35);
  const grams = portionInGrams(2, 'slice', { portion_unit: 'slice', portion_grams: 86 });
  assert.equal(grams, 172);
  assert.equal(portionCalories(grams, 266), 457.52);
});

test('las porciones, sustituciones y opcionales se aplican sin cambiar la receta base', () => {
  const ingredients = [...base, { position: 2, food_reference_id: 'oil', grams: 10, is_optional: true }];
  const alternatives = [{ ingredient_position: 1, position: 1, food_reference_id: 'rice-cooked', grams: 200 }];
  assert.equal(recipeCaloriesPerServing(ingredients, 2, references), 146);
  const lines = resolveRecipe(ingredients, 2, 1.5, references, alternatives, new Map([[1, 1], [2, 'default']]));
  assert.deepEqual(lines, [{ referenceId: 'rice-cooked', grams: 150 }, { referenceId: 'oil', grams: 7.5 }]);
  assert.deepEqual(preparationNutrition(lines, references), { kcal: 261.3, protein: 4.04, carbs: 42.26, fat: 7.92, estimated: false });
  assert.equal(resolveRecipe(ingredients, 2, 1, references, alternatives, new Map([[1, 'omit']])), null);
  assert.equal(resolveRecipe(ingredients, 2, 1, references, alternatives, new Map([[1, 9]])), null);
  assert.equal(recipeCaloriesPerServing([{ ...base[0], food_reference_id: 'unknown' }], 1, references), null);
  assert.equal(recipeCaloriesPerServing([{ ...base[0], food_reference_id: null }], 1, references), null);
  assert.deepEqual(ingredients[0], { position: 1, food_reference_id: 'rice-dry', grams: 80 });
});
