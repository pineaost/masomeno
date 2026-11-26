import 'server-only';
import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { foodAvailability, foodSession, loadFoodRegistration } from '@/lib/food-data';
import { readinessPriority, recipeAvailability, recipeEntries, recipeEntryDraft, type FridgeSelection } from '@/lib/recipe-catalog';
import { preparationNutrition, resolveRecipeDraft } from '@/lib/recipe-composition';
import { readFoodCatalog, readRecipeCatalog } from '@/lib/recipe-queries';
import { requestSupabase } from '@/lib/supabase/server';

async function recipeSession(locale: Locale) {
  const account = await requireAccount(locale);
  const supabase = await requestSupabase();
  if (!supabase) redirect(loginPath(locale, 'unconfigured'));
  return { supabase, id: account.id };
}

type Session = Awaited<ReturnType<typeof recipeSession>>;

function listFridge({ supabase, id }: Session) {
  return supabase.from('fridge_ingredients').select('food_id,status').eq('user_id', id);
}

export async function loadFridge(locale: Locale) {
  const session = await recipeSession(locale);
  const [foods, selections, personal] = await Promise.all([
    session.supabase.from('foods').select('*,category:food_categories!inner(id,names)').order('id'),
    listFridge(session),
    session.supabase.from('personal_fridge_ingredients').select('id,name,status').eq('user_id', session.id).order('id'),
  ]);
  const marked = selections.data ?? [];
  const matches = !selections.error && marked.some(({ status }) => status === 'available')
    ? await loadRecipeEntries(session, marked) : null;
  return {
    recipeCount: matches && matches.state !== 'ready' ? null
      : matches?.entries.filter(({ availability }) => readinessPriority(availability) === 2).length ?? 0,
    state: foodAvailability([foods.error, selections.error]),
    foods: foods.data ?? [],
    selections: selections.data ?? [],
    personal: personal.data ?? [],
    personalState: foodAvailability([personal.error]),
  };
}

async function loadRecipeEntries({ supabase }: Session, selections: FridgeSelection[]) {
  const [recipes, catalog] = await Promise.all([readRecipeCatalog(supabase), readFoodCatalog(supabase)]);
  const references = new Map(catalog.data?.map((ref) => [ref.id, ref]));
  const foodNames = Object.fromEntries((catalog.data ?? []).map((ref) => [ref.food_id, ref.food.names]));
  return {
    state: foodAvailability([catalog.error, ...recipes.errors]),
    entries: recipes.data.flatMap((recipe) => recipeEntries(recipe).flatMap((entry) => {
      const lines = resolveRecipeDraft(recipe, recipeEntryDraft(recipe, entry), references);
      const nutrition = lines && preparationNutrition(lines, references);
      return nutrition ? [{ recipe, entry, kcal: nutrition.kcal,
        availability: recipeAvailability(recipe, selections, entry, references) }] : [];
    })),
    foodNames,
  };
}

export async function loadRecipes(locale: Locale) {
  const session = await recipeSession(locale);
  const fridge = await listFridge(session);
  return { ...await loadRecipeEntries(session, fridge.data ?? []), fridgeReady: !fridge.error };
}

export async function loadRecipe(locale: Locale, id: string) {
  const session = await foodSession(locale);
  if (!session) return { state: 'unavailable' as const };
  const [registration, fridge] = await Promise.all([loadFoodRegistration(session), listFridge(session)]);
  const { errors, catalogRecipes, ...log } = registration;
  const row = catalogRecipes.find((recipe) => recipe.id === id);
  return {
    state: foodAvailability(errors),
    recipe: row,
    log,
    fridgeReady: !fridge.error,
    selections: fridge.data ?? [],
  };
}
