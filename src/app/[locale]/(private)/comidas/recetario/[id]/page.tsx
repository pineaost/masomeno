import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RecipeDetail } from '@/features/recipe-book';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readRecipeView, recipeEntries } from '@/lib/recipe-catalog';
import { loadRecipe } from '@/lib/recipe-data';
import { isTrackingId } from '@/lib/tracking-fields';

export default async function RecipePage({ params, searchParams }: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  if (!isTrackingId(id) || demoMode()) notFound();

  const [data, query] = await Promise.all([loadRecipe(locale, id), searchParams]);
  if (data.state !== 'ready') {
    const t = await getTranslations({ locale, namespace: 'recipeState' });
    return <p className="panel section-panel" role="status">{t(data.state)}</p>;
  }
  if (!data.recipe) notFound();
  const entry = recipeEntries(data.recipe).find(({ part, variant }) =>
    part?.id === query.parte && (variant === undefined ? undefined : String(variant)) === query.variante);
  if (!entry) notFound();
  return <RecipeDetail locale={locale} recipe={data.recipe} entry={entry} view={readRecipeView(query)}
    selections={data.selections} fridgeReady={data.fridgeReady} log={data.log} />;
}
