'use server';

import { revalidatePath } from 'next/cache';
import { localePath, type Locale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readLocale } from '@/lib/auth-paths';
import { localizedText } from '@/i18n/localized-text';
import { maxMealLines, parseCalorieGoal, parseMeal, parseMealDetails } from '@/lib/food';
import { foodPreparation, parseMealItems, type MealDraftItem } from '@/lib/meal-composition';
import { foodSession } from '@/lib/food-data';
import { ingredientNameKey, parsePersonalIngredient, type FridgeStatus } from '@/lib/recipe-catalog';
import { draftRecipeName, parseRecipeDrafts, parseRecordedPortions, resolveRecipeDraft,
  type PreparationInput, type PreparationSnapshot } from '@/lib/recipe-composition';
import { readFoodCatalog, readRecipeCatalog } from '@/lib/recipe-queries';
import type { MutationResult } from '@/lib/tracking';
import { isTrackingId } from '@/lib/tracking-fields';

async function writeSession(locale: Locale) {
  return demoMode() ? null : foodSession(readLocale(locale), true);
}

function finish(locale: Locale, result: { data: unknown; error: { code?: string } | null }, paths: string[]): MutationResult {
  if (result.error) return ['22023', '22P02', '23514'].includes(result.error.code ?? '') ? 'invalid' : 'unavailable';
  if (!result.data) return 'conflict';
  for (const path of paths) revalidatePath(localePath(readLocale(locale), path));
  return 'saved';
}

export async function saveMeal(
  locale: Locale, id: string | null, zone: string, expected: PreparationSnapshot[] | null, fields: FormData,
): Promise<MutationResult> {
  if (id !== null && !isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  if (session.zone !== zone) return 'conflict';
  let existingTime: string | undefined;
  if (id !== null) {
    const { data, error } = await session.supabase.from('meals').select('consumed_at')
      .eq('id', id).eq('user_id', session.id).maybeSingle();
    if (error) return 'unavailable';
    if (!data) return 'conflict';
    existingTime = data.consumed_at;
  }
  const now = new Date();
  const kind = fields.get('kind');
  if (kind === 'snapshot' && id && expected) {
    const meal = parseMealDetails(fields, zone, now, existingTime);
    const portions = parseRecordedPortions(fields, expected);
    if (!meal || !portions || portions.length !== expected.length) return 'invalid';
    return finish(locale, await session.supabase.rpc('masomeno_resize_preparations', {
      meal_id: id, meal_category: meal.category, meal_time: meal.consumedAt, meal_name: meal.name,
      expected_groups: expected, portions,
    }), ['', '/comidas']);
  }
  if ((kind === 'composition' || kind === 'recipe') && id === null) {
    const meal = parseMealDetails(fields, zone, now);
    const items: MealDraftItem[] | null = kind === 'composition' ? parseMealItems(fields.get('mealItems')) :
      parseRecipeDrafts(fields.get('recipeGroups'))?.map((recipe) => ({ type: 'recipe', recipe })) ?? null;
    if (!meal || !items) return 'invalid';
    const ids = [...new Set(items.flatMap((item) => item.type === 'recipe' ? [item.recipe.recipeId] : []))];
    const [recipes, catalog] = await Promise.all([
      ids.length ? readRecipeCatalog(session.supabase, 'all', ids) : { data: [], errors: [] },
      readFoodCatalog(session.supabase),
    ]);
    if (catalog.error || recipes.errors.some(Boolean)) return 'unavailable';
    const refs = new Map(catalog.data.map((ref) => [ref.id, ref]));
    const groups: PreparationInput[] = [];
    for (const item of items) {
      if (item.type === 'food') {
        const ref = refs.get(item.referenceId);
        const title = ref && localizedText(ref.food.names, locale);
        if (!ref || !title) return 'conflict';
        const group = foodPreparation(item, ref, title);
        if (!group || title.length > 120) return 'invalid';
        groups.push({ ...group, role: item.role });
      } else {
        const recipe = recipes.data.find(({ id }) => id === item.recipe.recipeId);
        if (!recipe) return 'conflict';
        const ingredients = resolveRecipeDraft(recipe, item.recipe, refs);
        const title = localizedText(draftRecipeName(recipe, item.recipe), locale);
        if (!ingredients || !title || title.length > 120) return 'invalid';
        groups.push({ name: title, servings: item.recipe.servings, ingredients, role: item.role });
      }
    }
    if (groups.flatMap(({ ingredients }) => ingredients).length > maxMealLines) return 'invalid';
    return finish(locale, await session.supabase.rpc('masomeno_save_preparations', {
      meal_category: meal.category, meal_time: meal.consumedAt, meal_name: meal.name,
      groups,
    }), ['', '/comidas']);
  }
  const meal = parseMeal(fields, zone, now, existingTime);
  if (!meal || meal.recipe || expected) return 'invalid';
  return finish(locale, await session.supabase.rpc('masomeno_save_meal', {
    meal_id: id, meal_category: meal.category, meal_time: meal.consumedAt, meal_name: meal.name,
    estimated_kcal: meal.kcal, lines: meal.lines,
  }), ['', '/comidas']);
}

export async function deleteMeal(locale: Locale, id: string): Promise<MutationResult> {
  if (!isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('meals').delete().eq('id', id).eq('user_id', session.id).select('id').maybeSingle();
  return finish(locale, result, ['', '/comidas']);
}

export async function setCalorieGoal(locale: Locale, fields: FormData): Promise<MutationResult> {
  const goal = parseCalorieGoal(fields);
  if (!goal) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.rpc('masomeno_set_calorie_goal', { goal_kcal: goal.kcal });
  return finish(locale, result, ['', '/comidas']);
}

export async function setFridgeIngredient(locale: Locale, foodId: string, status: FridgeStatus | null): Promise<MutationResult> {
  if (typeof foodId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(foodId) ||
    (status !== null && status !== 'available' && status !== 'unavailable')) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.rpc('masomeno_set_fridge_ingredient', { ingredient_id: foodId, ingredient_status: status });
  if (result.data) revalidatePath('/[locale]/comidas/recetario/[id]', 'page');
  return finish(locale, result, ['/comidas/heladera', '/comidas/recetario']);
}

const fridgePath = ['/comidas/heladera'];

export async function savePersonalIngredient(locale: Locale, id: string | null, fields: FormData): Promise<MutationResult> {
  if (id !== null && !isTrackingId(id)) return 'invalid';
  const name = parsePersonalIngredient(fields);
  if (!name) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const { data: catalog, error } = await session.supabase.from('foods').select('names,synonyms');
  if (error || !catalog) return 'unavailable';
  const key = ingredientNameKey(name);
  if (catalog.some(({ names, synonyms }) => [...Object.values(names), ...synonyms].some((term) => ingredientNameKey(term) === key))) {
    return 'duplicate';
  }

  const table = session.supabase.from('personal_fridge_ingredients');
  const write = id === null ? table.insert({ name }) : table.update({ name }).eq('user_id', session.id).eq('id', id);
  const result = await write.select('id').maybeSingle();
  if (result.error?.code === '23505') return 'duplicate';
  return finish(locale, result, fridgePath);
}

export async function setPersonalIngredientStatus(locale: Locale, id: string, status: FridgeStatus | null): Promise<MutationResult> {
  if (!isTrackingId(id) || (status !== null && status !== 'available' && status !== 'unavailable')) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('personal_fridge_ingredients').update({ status })
    .eq('user_id', session.id).eq('id', id).select('id').maybeSingle();
  return finish(locale, result, fridgePath);
}

export async function deletePersonalIngredient(locale: Locale, id: string): Promise<MutationResult> {
  if (!isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('personal_fridge_ingredients').delete()
    .eq('user_id', session.id).eq('id', id).select('id').maybeSingle();
  return finish(locale, result, fridgePath);
}
