import { CalendarDays } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeading } from '@/components/page-heading';
import { isLocale, type Locale } from '@/i18n/config';
import { demoMode, requireAccount } from '@/lib/account';
import { loadFoodDay } from '@/lib/food-data';
import { CaloriesCard } from './calories-card';
import { Food, FoodNavigation } from './food';
import { FoodDiary } from './food-diary';
import { Gym } from './gym';
import { Home } from './home';
import { Progress } from './progress';
import { TrackingBoundary, TrackingOverview } from './tracking-screen';

const foodSections = ['diary', 'plan'] as const;
type FoodSection = (typeof foodSections)[number];
type Screen = 'home' | 'progress' | 'gym' | FoodSection;
export type ScreenParams = { params: Promise<{ locale: string }> };

function isFood(screen: Screen): screen is FoodSection {
  return foodSections.some((section) => section === screen);
}

async function TodayCalories({ locale }: { locale: Locale }) {
  const data = await loadFoodDay(locale);
  return <CaloriesCard live state={data?.state ?? 'unavailable'} goal={data?.kcal ?? null} consumed={data?.consumed ?? 0} />;
}

async function DiaryContent({ locale, initialOpen }: { locale: Locale; initialOpen: boolean }) {
  const data = await loadFoodDay(locale, true);
  if (data?.state === 'ready') return <FoodDiary {...data} locale={locale} initialOpen={initialOpen} />;
  const t = await getTranslations({ locale, namespace: 'nutrition' });
  return <p className="panel section-panel" role="status">{t(data?.state ?? 'unavailable')}</p>;
}

export async function PrivateScreen({ params, screen, register }: ScreenParams & { screen: Screen; register?: boolean }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  if (demoMode()) {
    if (isFood(screen)) return <Food section={screen} />;
    if (screen === 'progress') return <Progress />;
    if (screen === 'gym') return <Gym />;
    return <Home />;
  }

  await requireAccount(locale);
  const t = await getTranslations({ locale });
  if (screen === 'home') {
    return <>
      <PageHeading title={t('nav.home')} visuallyHidden />
      <Suspense fallback={<CaloriesCard live state="loading" consumed={0} goal={null} />}>
        <TodayCalories locale={locale} />
      </Suspense>
    </>;
  }
  if (!isFood(screen)) {
    return (
      <TrackingBoundary locale={locale}>
        <TrackingOverview locale={locale} screen={screen} />
      </TrackingBoundary>
    );
  }
  if (screen === 'diary') {
    return <>
      <PageHeading title={t('nav.meals')} visuallyHidden />
      <FoodNavigation section={screen} demo={false} />
      <Suspense fallback={<p className="empty-state" role="status">{t('nutrition.loading')}</p>}>
        <DiaryContent locale={locale} initialOpen={register === true} />
      </Suspense>
    </>;
  }
  return (
    <>
      <PageHeading title={t('meals.plan')} visuallyHidden />
      <FoodNavigation section={screen} demo={false} />
      <section className="panel plan-empty">
        <span className="quick-icon"><CalendarDays size={22} aria-hidden /></span>
        <h2>{t(`empty.${screen}.title`)}</h2>
        <p>{t(`empty.${screen}.hint`)}</p>
      </section>
    </>
  );
}
