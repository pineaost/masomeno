import { foodSearchScore, type FoodNames } from './food.ts';
import { recipeChoice, recipeIngredients, type RecipeDraft, type RecipeForLog, type RecipePart } from './recipe-composition.ts';

export const recipeIntensities = ['light', 'medium', 'hearty', 'extraHearty'] as const;
export type RecipeIntensity = (typeof recipeIntensities)[number];
export type RecipeFilter = 'all' | RecipeIntensity;
export const recipeKinds = ['dish', 'preparation', 'snack'] as const;
export type RecipeKind = (typeof recipeKinds)[number];

export type RecipeView = { filter: RecipeFilter; kind: RecipeKind | 'all'; query: string };
export type RecipeEntry = { names: FoodNames; kind: RecipeKind; part?: RecipePart; variant?: number };

export function readRecipeView(params: Record<string, string | string[] | undefined>): RecipeView {
  return {
    filter: readRecipeFilter(params.intensidad),
    kind: recipeKinds.find((kind) => kind === params.tipo) ?? 'all',
    query: typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '',
  };
}

export function recipeEntries(recipe: RecipeForLog): RecipeEntry[] {
  const kind = recipe.kind ?? 'dish';
  return [
    { names: recipe.names, kind },
    ...(recipe.parts ?? []).map((part) => ({ names: part.names, kind: 'preparation' as const, part })),
    ...(recipe.variants ?? []).map(({ names }, variant) => ({ names, kind, variant })),
  ];
}

export function recipeEntryKey(recipeId: string, entry: RecipeEntry) {
  return entry.part ? `${recipeId}/part/${entry.part.id}` : `${recipeId}/${entry.variant ?? ''}`;
}

export function recipeEntryDraft(recipe: RecipeForLog, { part, variant }: RecipeEntry): RecipeDraft {
  const choices = variant === undefined ? {} : recipe.variants?.[variant]?.choices ?? {};
  return { recipeId: recipe.id, servings: 1, choices, quantities: {}, part: part?.id };
}

export function recipeEntryScore(entry: RecipeEntry, recipe: RecipeForLog, query: string) {
  const score = foodSearchScore({ names: entry.names, synonyms: [] }, query);
  return score || (entry.part && foodSearchScore({ names: recipe.names, synonyms: [] }, query) ? 1 : 0);
}

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
  search_priority?: number;
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

export function recipeAvailability(recipe: RecipeForLog, selections: FridgeSelection[], entry?: RecipeEntry) {
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const choices = entry ? recipeEntryDraft(recipe, entry).choices : {};
  const required = recipe.purchase_unit ? [] : recipeIngredients(recipe, entry?.part)
    .filter((ingredient) => recipeChoice(ingredient, choices[ingredient.position]) !== 'omit');
  let available = 0;
  let unavailable = 0;
  for (const ingredient of required) {
    const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === ingredient.position);
    const choice = choices[ingredient.position];
    const options = typeof choice === 'number' ? alternatives.filter(({ position }) => position === choice).map(({ food_id }) => food_id)
      : [ingredient.food_id, ...alternatives.map(({ food_id }) => food_id)];
    if (options.some((id) => selected.get(id) === 'available')) available++;
    else if (options.length && options.every((id) => selected.get(id) === 'unavailable')) unavailable++;
  }
  return { available, unavailable, unknown: required.length - available - unavailable, total: required.length };
}

export function readinessPriority(status: ReturnType<typeof recipeAvailability>) {
  return status.total > 0 && status.available === status.total ? 2 : status.available > 0 && !status.unavailable ? 1 : 0;
}
