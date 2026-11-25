import type { FoodNames } from './food.ts';

export const recipeIntensities = ['light', 'medium', 'hearty', 'extraHearty'] as const;
export type RecipeIntensity = (typeof recipeIntensities)[number];
export type RecipeFilter = 'all' | RecipeIntensity;

export function readRecipeFilter(value: unknown): RecipeFilter {
  return recipeIntensities.find((intensity) => intensity === value) ?? 'all';
}
export type RecipeSummary = {
  id: string;
  names: FoodNames;
  intensity: RecipeIntensity;
  kcal_per_serving: number | null;
  preparation_minutes: number | null;
};

export type FridgeStatus = 'available' | 'unavailable';
export type FridgeSelection = { food_id: string; status: FridgeStatus };
export type PersonalFridgeIngredient = { id: string; name: string; status: FridgeStatus | null };
export type FridgeFood = {
  id: string;
  names: FoodNames;
  synonyms: string[];
  category: { id: string; names: FoodNames };
};

export function ingredientNameKey(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function parsePersonalIngredient(fields: FormData) {
  const value = fields.get('name');
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  return name.length <= 80 && ingredientNameKey(name) ? name : null;
}

export function ingredientAvailability(ingredients: { food_id: string }[], selections: FridgeSelection[]) {
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const ids = new Set(ingredients.map(({ food_id }) => food_id));
  let available = 0;
  let unavailable = 0;
  for (const id of ids) {
    const status = selected.get(id);
    if (status === 'available') available++;
    if (status === 'unavailable') unavailable++;
  }
  return { available, unavailable, unknown: ids.size - available - unavailable, total: ids.size };
}
