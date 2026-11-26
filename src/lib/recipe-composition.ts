import { foodAmount, foodQuantityGrams, maxMealLines, portionCalories, totalCalories, validFoodQuantity,
  type FoodNames, type FoodQuantity, type FoodReference, type FoodSelection, type FoodUnit } from './food.ts';
import { isTrackingId } from './tracking-fields.ts';
import type { RecipeIntensity, RecipeKind } from './recipe-catalog.ts';

export type RecipeIngredient = {
  food_id: string;
  position: number;
  is_main: boolean;
  grams: number | null;
  food_reference_id?: string | null;
  is_optional?: boolean;
  optional_default?: boolean;
  adjustable_quantity?: boolean;
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
export type IngredientChoice = number | 'default' | 'omit';
export type IngredientChoices = ReadonlyMap<number, IngredientChoice>;
export type RecipeVariation = { names: FoodNames; choices: Record<string, IngredientChoice>; instructions?: FoodNames };
export type RecipePart = {
  id: string; names: FoodNames; positions: number[];
  intensity?: RecipeIntensity; minutes?: number; instructions?: FoodNames;
};
export type PreparationRole = 'main' | 'side';
export const maxRecipeGroups = 8;

export type RecipeDraft = {
  recipeId: string;
  servings: number;
  choices: Record<string, IngredientChoice>;
  quantities: Record<string, number>;
  part?: string;
  weights?: Record<string, number>;
  measures?: Record<string, FoodQuantity>;
  additions?: FoodSelection[];
};
export type RecipeForLog = {
  id: string;
  names: FoodNames;
  base_servings: number;
  ingredients: RecipeIngredient[];
  alternatives: RecipeAlternative[];
  variants?: RecipeVariation[];
  parts?: RecipePart[];
  kind?: RecipeKind;
  purchase_unit?: 'slice' | 'unit' | null;
};
export type PreparationInput = {
  name: string;
  servings: number;
  ingredients: { referenceId: string; grams: number }[];
  role?: PreparationRole;
  measureUnit?: FoodUnit;
};
export type PreparationSnapshot = {
  name: string;
  servings: number;
  kcal: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isEstimate?: boolean;
  role?: PreparationRole;
  measureUnit?: FoodUnit;
  measureGrams?: number;
  legacyMeasure?: boolean;
  ingredients: {
    referenceId: string;
    foodId: string;
    names: FoodNames;
    preparation: FoodReference['preparation'];
    variantNames: FoodNames | null;
    grams: number;
    kcal: number;
    per100g: { kcal: number; protein: number | null; carbs: number | null; fat: number | null };
    sourceRef?: string | null;
    sourceUrl?: string;
    sourceDescription?: string;
    sourceKind?: FoodReference['source_kind'];
    isEstimate?: boolean;
  }[];
};

export function recipeChoice(ingredient: RecipeIngredient, choice?: IngredientChoice) {
  return choice ?? (ingredient.is_optional && !ingredient.optional_default ? 'omit' : 'default');
}

export function resolveRecipe(
  ingredients: RecipeIngredient[], baseServings: number, servings: number,
  references: ReferenceIndex, alternatives: RecipeAlternative[] = [], choices: IngredientChoices = new Map(),
  quantities: ReadonlyMap<number, number> = new Map(),
  weights: ReadonlyMap<number, number> = new Map(),
) {
  if (!Number.isFinite(servings) || servings <= 0 || !Number.isFinite(baseServings) || baseServings <= 0) return null;
  const lines: PreparationInput['ingredients'] = [];
  const positions = new Set(ingredients.map(({ position }) => position));
  if ([...choices.keys(), ...quantities.keys(), ...weights.keys()].some((position) => !positions.has(position))) return null;
  for (const ingredient of ingredients.toSorted((a, b) => a.position - b.position)) {
    const choice = recipeChoice(ingredient, choices.get(ingredient.position));
    if (choice === 'omit') {
      if (!ingredient.is_optional) return null;
      continue;
    }
    const selected = recipeIngredientChoice(ingredient, alternatives, choice);
    const referenceId = selected?.food_reference_id;
    const reference = referenceId ? references.get(referenceId) : undefined;
    if (!referenceId || !reference || reference.validation === 'pending' || reference.kcal_per_100g === null || !selected?.grams) return null;
    const count = quantities.get(ingredient.position);
    const unitWeight = reference.portion_grams;
    const grams = weights.get(ingredient.position) ?? (count === undefined ? portionCalories(selected.grams * servings / baseServings, 100)
      : ingredient.adjustable_quantity && reference.portion_unit && unitWeight ? portionCalories(count * unitWeight, 100) : 0);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 10000) return null;
    lines.push({ referenceId, grams });
  }
  return lines.length ? lines : null;
}

export function recipeVariation(recipe: RecipeForLog, draft: RecipeDraft) {
  if (draft.part) return undefined;
  return recipe.variants?.find((variant) => Object.entries(variant.choices).every(([position, choice]) => {
    const ingredient = recipe.ingredients.find((slot) => slot.position === Number(position));
    return ingredient && recipeChoice(ingredient, draft.choices[position]) === choice;
  }));
}

export function recipePart(recipe: RecipeForLog, draft: RecipeDraft) {
  return recipe.parts?.find(({ id }) => id === draft.part);
}

export function recipeIngredients(recipe: RecipeForLog, part?: RecipePart) {
  return part ? recipe.ingredients.filter(({ position }) => part.positions.includes(position)) : recipe.ingredients;
}

export function draftRecipeName(recipe: RecipeForLog, draft: RecipeDraft) {
  return recipePart(recipe, draft)?.names ?? recipeVariation(recipe, draft)?.names ?? recipe.names;
}

export function resolveRecipeDraft(recipe: RecipeForLog, draft: RecipeDraft, references: ReferenceIndex) {
  const part = recipePart(recipe, draft);
  if ((draft.part && !part) || !validPortionAmount(draft.servings)) return null;
  const ingredients = recipeIngredients(recipe, part);
  const positions = new Set(ingredients.map(({ position }) => String(position)));
  const draftFields = [draft.choices, draft.quantities, draft.weights ?? {}, draft.measures ?? {}];
  if (draftFields.some((fields) => Object.keys(fields).some((position) => !positions.has(position)))) return null;

  const included = ingredients.filter((ingredient) => recipeChoice(ingredient, draft.choices[ingredient.position]) !== 'omit');
  const choices = new Map<number, IngredientChoice>();
  const quantities = new Map<number, number>();
  const weights = new Map<number, number>();
  for (const ingredient of included) {
    const { position } = ingredient;
    const choice = recipeChoice(ingredient, draft.choices[position]);
    if (choice === 'omit') continue;
    choices.set(position, choice);
    const quantity = draft.quantities[position];
    if (quantity !== undefined) quantities.set(position, quantity);
    const measure = draft.measures?.[position];
    const weight = draft.weights?.[position];
    if (weight !== undefined) weights.set(position, weight);
    if (measure) {
      const selected = recipeIngredientChoice(ingredient, recipe.alternatives, choice);
      const reference = selected?.food_reference_id && references.get(selected.food_reference_id);
      const grams = reference && foodQuantityGrams(measure, reference);
      if (!grams) return null;
      weights.set(position, grams);
    }
  }
  const lines = included.length ? resolveRecipe(included, recipe.base_servings, draft.servings, references,
    recipe.alternatives, choices, quantities, weights) : [];
  if (!lines) return null;
  for (const addition of draft.additions ?? []) {
    const reference = references.get(addition.referenceId);
    const grams = reference && foodQuantityGrams(addition, reference);
    if (!grams) return null;
    lines.push({ referenceId: addition.referenceId, grams });
  }
  return lines.length && lines.length <= maxMealLines ? lines : null;
}

export function recipeIngredientChoice(ingredient: RecipeIngredient, alternatives: RecipeAlternative[], choice: IngredientChoice) {
  return choice === 'default' ? ingredient
    : alternatives.find((item) => item.ingredient_position === ingredient.position && item.position === choice);
}

function boundedMap<T>(value: unknown, validate: (value: unknown) => value is T): value is Record<string, T> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length <= 30 && entries.every(([key, item]) => /^[1-9]\d{0,4}$/.test(key) && validate(item));
}

export function validPortionAmount(value: unknown, max = 1000): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0.01 && value <= max &&
    Math.abs(value - Math.round(value * 100) / 100) < 1e-9;
}

export function isRecipeDraft(value: unknown): value is RecipeDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<RecipeDraft>;
  return isTrackingId(draft.recipeId) && validPortionAmount(draft.servings) &&
    (draft.part === undefined || (typeof draft.part === 'string' && /^[a-z0-9-]{1,40}$/.test(draft.part))) &&
    boundedMap(draft.choices, (choice): choice is IngredientChoice =>
      choice === 'default' || choice === 'omit' || (typeof choice === 'number' && Number.isInteger(choice) && choice > 0 && choice <= 30)) &&
    boundedMap(draft.quantities, validPortionAmount) &&
    (draft.weights === undefined || boundedMap(draft.weights, (weight): weight is number => validPortionAmount(weight, 10000))) &&
    (draft.measures === undefined || boundedMap(draft.measures, validFoodQuantity)) &&
    (draft.additions === undefined || (Array.isArray(draft.additions) && draft.additions.length <= maxMealLines &&
      draft.additions.every((item) => typeof item?.referenceId === 'string' && /^[a-z0-9-]{1,80}$/.test(item.referenceId) &&
        validFoodQuantity(item))));
}

export function parseRecipeDrafts(value: FormDataEntryValue | null): RecipeDraft[] | null {
  if (typeof value !== 'string' || value.length > 12_000) return null;
  let drafts: unknown;
  try {
    drafts = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(drafts) || drafts.length < 1 || drafts.length > maxRecipeGroups) return null;
  const ids = new Set<string>();
  for (const draft of drafts) {
    if (!isRecipeDraft(draft) || ids.has(draft.recipeId)) return null;
    ids.add(draft.recipeId);
  }
  return drafts;
}

export function parseRecordedPortions(fields: FormData, groups?: PreparationSnapshot[]) {
  const values = fields.getAll('recordedServings');
  if (values.length < 1 || values.length > 30) return null;
  const portions = values.map((value, index) => typeof value === 'string'
    ? foodAmount(value, groups?.[index]?.measureUnit ? 10000 : 1000) : null);
  return portions.every((value): value is number => value !== null) && portions.some((value) => value > 0) ? portions : null;
}

export function recordedPreparationLines(groups: PreparationSnapshot[], portions: number[]) {
  if (portions.length !== groups.length) return null;
  const lines = groups.flatMap((group, index) => portions[index] === 0 ? [] : group.ingredients.map((ingredient) => {
    const grams = portionCalories(
      group.measureGrams ? group.measureGrams * portions[index] : ingredient.grams * portions[index] / group.servings, 100,
    );
    return { grams, kcal: portionCalories(grams, ingredient.per100g.kcal) };
  }));
  return lines.length && lines.every(({ grams }) => grams > 0 && grams <= 10000) ? lines : null;
}

export function preparationNutrition(ingredients: PreparationInput['ingredients'], references: ReferenceIndex) {
  if (!ingredients.length) return null;
  const resolved: { reference: FoodReference; grams: number; kcal: number }[] = [];
  for (const { referenceId, grams } of ingredients) {
    const reference = references.get(referenceId);
    if (!reference || reference.validation === 'pending' || reference.kcal_per_100g === null ||
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
