import { foodSearchScore, usableFood, type CatalogFood } from './food.ts';
import type { Locale } from '../i18n/config.ts';

const preparationOrder = { cooked: 0, prepared: 1, raw: 2 };

function baseReference(item: CatalogFood) {
  const foodId = item.food_id ?? item.food.id;
  return item.id === `${foodId}-${item.preparation}`;
}

export function catalogChoices(catalog: CatalogFood[], query: string, locale: Locale) {
  const families = new Map<string, { item: CatalogFood; score: number }[]>();
  for (const item of catalog) {
    const key = item.food.browse_parent ?? item.food_id ?? item.food.id ?? item.food.names.es;
    const family = families.get(key) ?? [];
    family.push({ item, score: foodSearchScore(item.food, query, item.variant_names) });
    families.set(key, family);
  }

  const choices = [];
  for (const [key, family] of families) {
    if (!family.some(({ score }) => score > 0)) continue;
    const [primary, ...others] = family.sort((a, b) =>
      b.score - a.score ||
      Number(usableFood(b.item)) - Number(usableFood(a.item)) ||
      (a.item.food.browse_parent ? 1 : 0) - (b.item.food.browse_parent ? 1 : 0) ||
      (a.item.food.search_priority ?? 100) - (b.item.food.search_priority ?? 100) ||
      preparationOrder[a.item.preparation] - preparationOrder[b.item.preparation] ||
      Number(baseReference(b.item)) - Number(baseReference(a.item)) ||
      a.item.id.localeCompare(b.item.id));
    choices.push({ key, primary: primary.item, score: primary.score, variants: others.map(({ item }) => item) });
  }
  return choices.sort((a, b) => b.score - a.score ||
    (a.primary.food.search_priority ?? 100) - (b.primary.food.search_priority ?? 100) ||
    a.primary.food.names[locale].localeCompare(b.primary.food.names[locale], locale));
}
