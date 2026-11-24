import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeading } from '@/components/page-heading';
import { FoodNavigation } from '@/features/food';
import { Fridge } from '@/features/fridge';
import type { ScreenParams } from '@/features/private-screen';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { loadFridge } from '@/lib/recipe-data';

export default async function FridgePage({ params }: ScreenParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const demo = demoMode();
  const [t, data] = await Promise.all([getTranslations({ locale }), demo ? null : loadFridge(locale)]);
  return <>
    <PageHeading title={t('meals.fridge')} visuallyHidden />
    <FoodNavigation section="fridge" demo={demo} />
    {data?.state === 'ready' ? <Fridge locale={locale} {...data} />
      : <p className="panel section-panel" role="status">{t(`fridge.${data?.state === 'unavailable' ? 'loadError' : data?.state ?? 'demo'}`)}</p>}
  </>;
}
