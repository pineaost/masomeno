import 'server-only';
import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { foodAvailability } from '@/lib/food-data';
import type { RecipeFilter } from '@/lib/recipe-catalog';
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
  const [foods, selections] = await Promise.all([
    session.supabase.from('foods').select('id,names,synonyms,category:food_categories!inner(id,names)').order('id'),
    listFridge(session),
  ]);
  return {
    state: foodAvailability([foods.error, selections.error]),
    foods: foods.data ?? [],
    selections: selections.data ?? [],
  };
}

const summary = 'id,names,intensity,kcal_per_serving,preparation_minutes';

export async function loadRecipes(locale: Locale, filter: RecipeFilter) {
  const session = await recipeSession(locale);
  const book = session.supabase.from('recipes').select(`${summary},ingredients:recipe_ingredients(food_id)`).order('id');
  const [recipes, fridge] = await Promise.all([
    filter === 'all' ? book : book.eq('intensity', filter),
    listFridge(session),
  ]);
  return {
    state: foodAvailability([recipes.error]),
    recipes: recipes.data ?? [],
    selections: fridge.data ?? [],
  };
}

export async function loadRecipe(locale: Locale, id: string) {
  const session = await recipeSession(locale);
  const [recipe, fridge] = await Promise.all([
    session.supabase.from('recipes').select(
      `${summary},base_servings,instructions,ingredients:recipe_ingredients(position,food_id,is_main,grams,food:foods!inner(names))`,
    ).eq('id', id).maybeSingle(),
    listFridge(session),
  ]);
  return {
    state: foodAvailability([recipe.error]),
    recipe: recipe.data,
    fridgeReady: !fridge.error,
    selections: fridge.data ?? [],
  };
}
