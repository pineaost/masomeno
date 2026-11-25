import { portionCalories, totalCalories, type FoodNames, type FoodReference } from './food.ts';

export type RecipeIngredient = {
  food_id: string;
  position: number;
  is_main: boolean;
  grams: number | null;
  food_reference_id?: string | null;
  is_optional?: boolean;
};

export type RecipeAlternative = {
  recipe_id: string;
  ingredient_position: number;
  position: number;
  food_id: string;
  food_reference_id: string;
  grams: number;
};

export type ReferenceIndex = ReadonlyMap<string, FoodReference>;
export type IngredientChoices = ReadonlyMap<number, number | 'default' | 'omit'>;
export type PreparationInput = {
  name: string;
  servings: number;
  ingredients: { referenceId: string; grams: number }[];
};
export type PreparationSnapshot = {
  name: string;
  servings: number;
  kcal: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isEstimate: boolean;
  ingredients: {
    referenceId: string;
    foodId: string;
    names: FoodNames;
    preparation: FoodReference['preparation'];
    variantNames: FoodNames | null;
    grams: number;
    kcal: number;
    per100g: { kcal: number; protein: number | null; carbs: number | null; fat: number | null };
    sourceRef: string | null;
    sourceUrl: string;
    sourceDescription: string;
    sourceKind: FoodReference['source_kind'];
    isEstimate: boolean;
  }[];
};

export function resolveRecipe(
  ingredients: RecipeIngredient[], baseServings: number, servings: number,
  references: ReferenceIndex, alternatives: RecipeAlternative[] = [], choices: IngredientChoices = new Map(),
) {
  if (!Number.isFinite(servings) || servings <= 0 || !Number.isFinite(baseServings) || baseServings <= 0) return null;
  const lines: PreparationInput['ingredients'] = [];
  for (const ingredient of ingredients) {
    const choice = choices.get(ingredient.position) ?? (ingredient.is_optional ? 'omit' : 'default');
    if (choice === 'omit') {
      if (!ingredient.is_optional) return null;
      continue;
    }
    const selected = choice === 'default' ? ingredient
      : alternatives.find((item) => item.ingredient_position === ingredient.position && item.position === choice);
    const referenceId = selected?.food_reference_id;
    const reference = referenceId ? references.get(referenceId) : undefined;
    if (!referenceId || reference?.validation !== 'verified' || reference.kcal_per_100g === null || !selected?.grams) return null;
    const grams = portionCalories(selected.grams * servings / baseServings, 100);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 10000) return null;
    lines.push({ referenceId, grams });
  }
  return lines.length ? lines : null;
}

export function preparationNutrition(ingredients: PreparationInput['ingredients'], references: ReferenceIndex) {
  if (!ingredients.length) return null;
  const resolved: { reference: FoodReference; grams: number; kcal: number }[] = [];
  for (const { referenceId, grams } of ingredients) {
    const reference = references.get(referenceId);
    if (reference?.validation !== 'verified' || reference.kcal_per_100g === null ||
      !Number.isFinite(grams) || grams <= 0 || grams > 10000) return null;
    resolved.push({ reference, grams, kcal: portionCalories(grams, reference.kcal_per_100g) });
  }
  function total(key: 'protein_per_100g' | 'carbs_per_100g' | 'fat_per_100g') {
    const values = [];
    for (const { reference, grams } of resolved) {
      const per100g = reference[key];
      if (per100g === null) return null;
      values.push(portionCalories(grams, per100g));
    }
    return totalCalories(values);
  }
  return {
    kcal: totalCalories(resolved.map(({ kcal }) => kcal)),
    protein: total('protein_per_100g'),
    carbs: total('carbs_per_100g'),
    fat: total('fat_per_100g'),
    estimated: resolved.some(({ reference }) => reference.is_estimate === true),
  };
}

export function recipeCaloriesPerServing(ingredients: RecipeIngredient[], baseServings: number, references: ReferenceIndex) {
  const lines = resolveRecipe(ingredients, baseServings, 1, references);
  return lines ? preparationNutrition(lines, references)?.kcal ?? null : null;
}
