'use server';

import { revalidatePath } from 'next/cache';
import { localePath, type Locale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readLocale } from '@/lib/auth-paths';
import { parseCalorieGoal, parseMeal } from '@/lib/food';
import { foodSession } from '@/lib/food-data';
import { ingredientNameKey, parsePersonalIngredient, type FridgeStatus } from '@/lib/recipe-catalog';
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

export async function saveMeal(locale: Locale, id: string | null, zone: string, fields: FormData): Promise<MutationResult> {
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
  const meal = parseMeal(fields, zone, new Date(), existingTime);
  if (!meal) return 'invalid';
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
  return finish(locale, result, ['']);
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
