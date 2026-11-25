import { foodAmount, foodQuantityGrams, maxMealLines, portionCalories, usableFood, validFoodQuantity,
  type FoodReference, type FoodSelection } from './food.ts';
import { isRecipeDraft, type PreparationInput, type PreparationRole, type RecipeDraft } from './recipe-composition.ts';

export type FoodDraft = { type: 'food' } & FoodSelection;
export type RecipeMealDraft = { type: 'recipe'; recipe: RecipeDraft };
export type MealDraftItem = (FoodDraft | RecipeMealDraft) & { role?: PreparationRole };

export function parseMealItems(value: FormDataEntryValue | null): MealDraftItem[] | null {
  if (typeof value !== 'string' || value.length > 48_000) return null;
  let items: unknown;
  try {
    items = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > maxMealLines) return null;
  for (const item of items) {
    if (!item || (item.role !== undefined && item.role !== 'main' && item.role !== 'side')) return null;
    if (item.type === 'recipe') {
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
