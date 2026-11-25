import type { Locale } from '../i18n/config.ts';
import { localizedText } from '../i18n/localized-text.ts';
import type { CatalogFood, MealRecord } from './food.ts';

export function mealLabel(meal: MealRecord, catalog: CatalogFood[], locale: Locale, fallback: string) {
  if (meal.name) return meal.name;
  if (meal.preparations?.length) return meal.preparations.map(({ name }) => name).join(' + ');
  const names = meal.components.toSorted((a, b) => a.position - b.position)
    .map((line) => localizedText(catalog.find((item) => item.id === line.food_reference_id)?.food.names, locale))
    .filter(Boolean).join(', ');
  return names || fallback;
}
