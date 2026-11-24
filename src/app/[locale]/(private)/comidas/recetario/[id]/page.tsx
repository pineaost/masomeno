import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RecipeDetail } from '@/features/recipe-book';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readRecipeFilter } from '@/lib/recipe-catalog';
import { loadRecipe } from '@/lib/recipe-data';
import { isTrackingId } from '@/lib/tracking-fields';

export default async function RecipePage({ params, searchParams }: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ intensidad?: string | string[] }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !isTrackingId(id) || demoMode()) notFound();
  setRequestLocale(locale);

  const [data, query] = await Promise.all([loadRecipe(locale, id), searchParams]);
  if (data.state !== 'ready') {
    const t = await getTranslations({ locale, namespace: 'recipeState' });
    return <p className="panel section-panel" role="status">{t(data.state)}</p>;
  }
  if (!data.recipe) notFound();
  return <RecipeDetail locale={locale} recipe={data.recipe} filter={readRecipeFilter(query.intensidad)}
    selections={data.selections} fridgeReady={data.fridgeReady} />;
}
