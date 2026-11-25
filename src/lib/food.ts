import { Temporal } from '@js-temporal/polyfill';
import type { Locale } from '../i18n/config.ts';
import { localFormDateTime } from './dates.ts';
import { isTrackingId, measuredInstant } from './tracking-fields.ts';

export const mealCategories = ['firstMeal', 'lunch', 'snack', 'dinner', 'other'] as const;
export type MealCategory = (typeof mealCategories)[number];
export type FoodNames = Record<Locale, string>;
const portionUnits = ['egg', 'banana', 'tablespoon', 'slice', 'unit', 'piece'] as const;
export type Portion = (typeof portionUnits)[number];
export type FoodUnit = 'g' | Portion;
export type FoodReference = {
  id: string;
  preparation: 'raw' | 'cooked' | 'prepared';
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  source_url: string | null;
  source_description: string | null;
  validation: 'verified' | 'pending';
  portion_unit: Portion | null;
  portion_grams: number | null;
  variant_names?: FoodNames | null;
  source_kind?: 'sr-legacy' | 'fndds' | 'crea' | 'label' | 'official' | null;
  source_ref?: string | null;
  is_estimate?: boolean;
};
export type CatalogFood = FoodReference & {
  food: { names: FoodNames; synonyms: string[]; category: { id: string; names: FoodNames } };
};
export type MealComponent = {
  id: string;
  position: number;
  food_reference_id: string;
  amount: number;
  unit: FoodUnit;
  grams_per_unit: number;
  kcal_per_100g: number;
  kcal: number;
};
export type MealRecord = {
  id: string;
  category: MealCategory;
  consumed_at: string;
  name: string | null;
  manual_kcal: number | null;
  components: MealComponent[];
};
export type MealLine = { id: string | null; referenceId: string; amount: number; unit: FoodUnit };
export type FoodAvailability = 'ready' | 'pending' | 'unavailable';

export const maxMealLines = 30;

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function matchesFood(item: CatalogFood, query: string) {
  const variants = item.variant_names ? Object.values(item.variant_names) : [];
  return matchesFoodName({ names: item.food.names, synonyms: [...item.food.synonyms, ...variants] }, query);
}

export function matchesFoodName(food: { names: FoodNames; synonyms: string[] }, query: string) {
  const searchable = normalize([...Object.values(food.names), ...food.synonyms].join(' '));
  return normalize(query.trim()).split(/\s+/).every((word) => searchable.includes(word));
}

export function portionInGrams(amount: number, unit: FoodUnit, food: Pick<FoodReference, 'portion_unit' | 'portion_grams'>) {
  const size = unit === 'g' ? 1 : unit === food.portion_unit ? food.portion_grams : null;
  if (size === null || !Number.isFinite(amount) || amount <= 0) return null;
  const grams = amount * size;
  return grams <= 10000 ? grams : null;
}

export function portionCalories(grams: number, kcalPer100g: number) {
  const cents = grams * kcalPer100g;
  return Math.round(cents + Number.EPSILON * Math.abs(cents)) / 100;
}

export function totalCalories(values: number[]) {
  return values.reduce((total, kcal) => total + Math.round(kcal * 100), 0) / 100;
}

export function mealCalories(meal: MealRecord) {
  return meal.manual_kcal ?? totalCalories(meal.components.map(({ kcal }) => kcal));
}

export function localFoodDay(now: Date, zone: string) {
  const dateTime = localFormDateTime(now.toISOString(), zone);
  const date = Temporal.PlainDate.from(dateTime.slice(0, 10));
  return {
    date: date.toString(), dateTime,
    start: date.toZonedDateTime(zone).toInstant().toString(),
    end: date.add({ days: 1 }).toZonedDateTime(zone).toInstant().toString(),
  };
}

function text(fields: FormData, field: string) {
  const value = fields.get(field);
  return typeof value === 'string' ? value.trim() : null;
}

export function foodAmount(value: string | null, max = 10000) {
  if (value === null || !/^\d{1,6}(?:\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  return amount <= max ? amount : null;
}

export function parseCalorieGoal(fields: FormData) {
  const value = text(fields, 'kcal');
  if (value === '') return { kcal: null };
  if (!value || !/^\d{1,5}$/.test(value)) return null;
  const kcal = Number(value);
  return kcal >= 1 && kcal <= 10000 ? { kcal } : null;
}

export function parseMeal(fields: FormData, zone: string, now: Date, existingTime?: string) {
  const category = mealCategories.find((key) => key === text(fields, 'category'));
  const localTime = text(fields, 'consumed_at');
  const consumedAt = existingTime && localTime === localFormDateTime(existingTime, zone)
    ? existingTime : measuredInstant(localTime, zone, now);
  const name = text(fields, 'name');
  if (!category || !consumedAt || (name?.length ?? 0) > 120) return null;

  if (text(fields, 'kind') === 'manual') {
    const kcal = foodAmount(text(fields, 'kcal'), 100000);
    return name && kcal !== null ? { category, consumedAt, name, kcal, lines: [] as MealLine[] } : null;
  }
  if (text(fields, 'kind') !== 'catalog') return null;

  const refs = fields.getAll('reference');
  const ids = fields.getAll('component_id');
  const amounts = fields.getAll('amount');
  const units = fields.getAll('unit');
  if (!refs.length || refs.length > maxMealLines || ![ids, amounts, units].every((list) => list.length === refs.length)) return null;

  const lines: MealLine[] = [];
  for (const [index, referenceId] of refs.entries()) {
    const id = ids[index];
    const rawAmount = amounts[index];
    const amount = foodAmount(typeof rawAmount === 'string' ? rawAmount : null);
    const unit = units[index] === 'g' ? 'g' : portionUnits.find((portion) => portion === units[index]);
    if (typeof referenceId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(referenceId) || (id !== '' && !isTrackingId(id)) ||
      amount === null || amount <= 0 || !unit) return null;
    lines.push({ id: id || null, referenceId, amount, unit });
  }
  return { category, consumedAt, name: name || null, kcal: null, lines };
}
