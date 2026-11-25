import 'server-only';
import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { foodAvailability } from '@/lib/food-data';
import type { RecipeFilter } from '@/lib/recipe-catalog';
import { recipeCaloriesPerServing, type RecipeIngredient, type ReferenceIndex } from '@/lib/recipe-composition';
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

const summary = 'id,names,intensity,preparation_minutes,base_servings';

async function recipeReferences(session: Session, ingredients: RecipeIngredient[]): Promise<{
  data: ReferenceIndex; error: { code: string } | null;
}> {
  const ids = [...new Set(ingredients.flatMap(({ food_reference_id }) => food_reference_id ? [food_reference_id] : []))];
  if (!ids.length) return { data: new Map(), error: null };
  const result = await session.supabase.from('food_references').select('*').in('id', ids);
  return { data: new Map(result.data?.map((ref) => [ref.id, ref])), error: result.error };
}

export async function loadRecipes(locale: Locale, filter: RecipeFilter) {
  const session = await recipeSession(locale);
  const book = session.supabase.from('recipes').select(`${summary},ingredients:recipe_ingredients(*)`).order('id');
  const [recipes, fridge] = await Promise.all([
    filter === 'all' ? book : book.eq('intensity', filter),
    listFridge(session),
  ]);
  const references = await recipeReferences(session, recipes.data?.flatMap(({ ingredients }) => ingredients) ?? []);
  return {
    state: foodAvailability([recipes.error, references.error]),
    recipes: (recipes.data ?? []).map((recipe) => ({
      ...recipe,
      kcal_per_serving: recipeCaloriesPerServing(recipe.ingredients, recipe.base_servings, references.data),
    })),
    selections: fridge.data ?? [],
  };
}

export async function loadRecipe(locale: Locale, id: string) {
  const session = await recipeSession(locale);
  const [recipe, fridge] = await Promise.all([
    session.supabase.from('recipes').select(
      `${summary},instructions,ingredients:recipe_ingredients(*,food:foods!inner(names))`,
    ).eq('id', id).maybeSingle(),
    listFridge(session),
  ]);
  const row = recipe.data;
  const references = await recipeReferences(session, row?.ingredients ?? []);
  return {
    state: foodAvailability([recipe.error, references.error]),
    recipe: row && {
      ...row,
      kcal_per_serving: recipeCaloriesPerServing(row.ingredients, row.base_servings, references.data),
      ingredients: row.ingredients.map((ingredient) => ({
        ...ingredient,
        reference: ingredient.food_reference_id ? references.data.get(ingredient.food_reference_id) : undefined,
      })),
    },
    fridgeReady: !fridge.error,
    selections: fridge.data ?? [],
  };
}
