import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecipeFilter } from '@/lib/recipe-catalog';
import type { Database } from '@/lib/supabase/database';

export function readFoodCatalog(supabase: SupabaseClient<Database>) {
  return supabase.from('food_references').select(
    '*,food:foods!inner(*,category:food_categories!inner(id,names))',
  ).order('id');
}

export async function readRecipeCatalog(supabase: SupabaseClient<Database>, filter: RecipeFilter = 'all', ids?: string[]) {
  const book = supabase.from('recipes').select('*,ingredients:recipe_ingredients(*)').eq('published', true).order('id');
  const alternatives = supabase.from('recipe_ingredient_alternatives').select('*').order('position');
  if (filter !== 'all') book.eq('intensity', filter);
  if (ids) {
    book.in('id', ids);
    alternatives.in('recipe_id', ids);
  }
  const [recipes, choices] = await Promise.all([book, alternatives]);
  return {
    errors: [recipes.error, choices.error],
    data: (recipes.data ?? []).map((recipe) => ({
      ...recipe,
      alternatives: choices.data?.filter(({ recipe_id }) => recipe_id === recipe.id) ?? [],
    })),
  };
}
