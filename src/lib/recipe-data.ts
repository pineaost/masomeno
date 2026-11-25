import 'server-only';
import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { foodAvailability, foodSession, loadFoodRegistration } from '@/lib/food-data';
import type { RecipeFilter } from '@/lib/recipe-catalog';
import { preparationNutrition, recipeCaloriesPerServing, resolveRecipe } from '@/lib/recipe-composition';
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
    session.supabase.from('foods').select('id,names,synonyms,category:food_categories!inner(id,names)').order('id'),
    listFridge(session),
    session.supabase.from('personal_fridge_ingredients').select('id,name,status').eq('user_id', session.id).order('id'),
  ]);
  return {
    state: foodAvailability([foods.error, selections.error]),
    foods: foods.data ?? [],
    selections: selections.data ?? [],
    personal: personal.data ?? [],
    personalState: foodAvailability([personal.error]),
  };
}

export async function loadRecipes(locale: Locale, filter: RecipeFilter) {
  const session = await recipeSession(locale);
  const [recipes, fridge, catalog] = await Promise.all([
    readRecipeCatalog(session.supabase, filter), listFridge(session), readFoodCatalog(session.supabase),
  ]);
  const references = new Map(catalog.data?.map((ref) => [ref.id, ref]));
  return {
    state: foodAvailability([catalog.error, ...recipes.errors]),
    recipes: recipes.data.map((recipe) => ({
      ...recipe,
      kcal_per_serving: recipeCaloriesPerServing(recipe.ingredients, recipe.base_servings, references),
    })),
    selections: fridge.data ?? [],
  };
}

export async function loadRecipe(locale: Locale, id: string) {
  const session = await foodSession(locale);
  if (!session) return { state: 'unavailable' as const };
  const [registration, fridge] = await Promise.all([loadFoodRegistration(session), listFridge(session)]);
  const { errors, catalogRecipes, ...log } = registration;
  const row = catalogRecipes.find((recipe) => recipe.id === id);
  const refs = new Map(log.catalog.map((ref) => [ref.id, ref]));
  const lines = row ? resolveRecipe(row.ingredients, row.base_servings, 1, refs) : null;
  const nutrition = lines ? preparationNutrition(lines, refs) : null;
  return {
    state: foodAvailability(errors),
    recipe: row && { ...row, kcal_per_serving: nutrition?.kcal ?? null, nutrition },
    log,
    fridgeReady: !fridge.error,
    selections: fridge.data ?? [],
  };
}
