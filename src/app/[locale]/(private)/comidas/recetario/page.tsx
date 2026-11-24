import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { ScreenParams } from '@/features/private-screen';
import { RecipeBook } from '@/features/recipe-book';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readRecipeFilter } from '@/lib/recipe-catalog';
import { loadRecipes } from '@/lib/recipe-data';

export default async function RecipesPage({ params, searchParams }: ScreenParams & {
  searchParams: Promise<{ intensidad?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const filter = readRecipeFilter((await searchParams).intensidad);
  const demo = demoMode();
  const data = demo ? { state: 'ready' as const, recipes: [], selections: [] } : await loadRecipes(locale, filter);
  return <RecipeBook locale={locale} filter={filter} demo={demo} {...data} />;
}
