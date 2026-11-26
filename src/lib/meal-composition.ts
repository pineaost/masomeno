import { foodAmount, foodQuantityGrams, maxMealLines, portionCalories, usableFood, validFoodQuantity,
  totalCalories, type FoodReference, type FoodSelection, type MealComponent, type MealRecord } from './food.ts';
import { isRecipeDraft, recordedPreparationLines, type PreparationInput, type PreparationRole, type PreparationSnapshot, type RecipeDraft } from './recipe-composition.ts';
import { isTrackingId } from './tracking-fields.ts';

export type FoodDraft = { type: 'food' } & FoodSelection;
export type RecipeMealDraft = { type: 'recipe'; recipe: RecipeDraft };
export type RepeatedItem = {
  type: 'repeat'; sourceMeal: string; index: number; amount: string; role?: PreparationRole;
  original: PreparationSnapshot | MealComponent;
};
export type MealDraftItem = (FoodDraft | RecipeMealDraft | RepeatedItem) & { role?: PreparationRole };

export function repeatItems(meal: MealRecord): MealDraftItem[] {
  const groups = meal.preparations?.length ? meal.preparations : meal.components.toSorted((a, b) => a.position - b.position);
  return groups.map((original, index) => ({
    type: 'repeat', sourceMeal: meal.id, index, original,
    amount: String('servings' in original ? original.servings : original.amount),
    role: 'ingredients' in original ? original.role : undefined,
  }));
}

export function repeatedNutrition({ original, amount }: RepeatedItem) {
  const quantity = foodAmount(amount, 'ingredients' in original && !original.measureUnit ? 1000 : 10000);
  if (!quantity) return null;
  if ('ingredients' in original) {
    if (original.legacyMeasure && original.measureGrams) {
      const grams = quantity * original.measureGrams;
      return grams <= 10000 ? { kcal: portionCalories(grams, original.ingredients[0].per100g.kcal), count: 1 } : null;
    }
    const lines = recordedPreparationLines([original], [quantity]);
    return lines && { kcal: totalCalories(lines.map((line) => line.kcal)), count: lines.length };
  }
  const grams = quantity * original.grams_per_unit;
  return grams > 0 && grams <= 10000 ? { kcal: portionCalories(grams, original.kcal_per_100g), count: 1 } : null;
}

export function withMealEdit(items: MealDraftItem[], edit: { index: number | null; draft: MealDraftItem } | null) {
  if (!edit) return items;
  return edit.index === null ? [...items, edit.draft] : items.map((item, i) => i === edit.index ? edit.draft : item);
}

export function parseMealItems(value: FormDataEntryValue | null): MealDraftItem[] | null {
  if (typeof value !== 'string' || value.length > 250_000) return null;
  let items: unknown;
  try {
    items = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > maxMealLines) return null;
  for (const item of items) {
    if (!item || (item.role !== undefined && item.role !== 'main' && item.role !== 'side')) return null;
    if (item.type === 'repeat') {
      if (!isTrackingId(item.sourceMeal) || !Number.isInteger(item.index) || item.index < 0 || item.index >= maxMealLines ||
        typeof item.amount !== 'string' || !foodAmount(item.amount) || !item.original || typeof item.original !== 'object') return null;
    } else if (item.type === 'recipe') {
      if (!isRecipeDraft(item.recipe)) return null;
    } else if (item.type !== 'food' || typeof item.referenceId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.referenceId) ||
      !validFoodQuantity(item)) return null;
  }
  return items;
}

export function foodDraftNutrition(draft: FoodDraft, reference: FoodReference) {
  const amount = foodAmount(draft.amount);
  if (!amount || !usableFood(reference)) return null;
  const grams = foodQuantityGrams(draft, reference);
  return grams === null ? null : { amount, grams, kcal: portionCalories(grams, reference.kcal_per_100g) };
}

export function foodPreparation(draft: FoodDraft, reference: FoodReference, name: string): PreparationInput | null {
  const result = foodDraftNutrition(draft, reference);
  return result && {
    name, servings: result.amount, measureUnit: draft.unit,
    ingredients: [{ referenceId: reference.id, grams: result.grams }],
  };
}
