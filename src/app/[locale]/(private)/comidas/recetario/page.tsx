import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { ScreenParams } from '@/features/private-screen';
import { RecipeBook } from '@/features/recipe-book';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readRecipeView } from '@/lib/recipe-catalog';
import { loadRecipes } from '@/lib/recipe-data';

export default async function RecipesPage({ params, searchParams }: ScreenParams & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const view = readRecipeView(await searchParams);
  const demo = demoMode();
  const data = demo ? { state: 'ready' as const, entries: [], selections: [] } : await loadRecipes(locale);
  return <RecipeBook locale={locale} view={view} demo={demo} {...data} />;
}
