import { CalendarDays } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeading } from '@/components/page-heading';
import { isLocale, type Locale } from '@/i18n/config';
import { demoMode, requireAccount } from '@/lib/account';
import { mealCalories } from '@/lib/food';
import { loadFoodDay } from '@/lib/food-data';
import { mealLabel } from '@/lib/meal-label';
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
  const summary = data?.state === 'ready' && data.meals.length > 0 ? data : null;
  const [t, format] = await Promise.all([getTranslations({ locale }), getFormatter({ locale })]);
  return <>
    <CaloriesCard live state={data?.state ?? 'unavailable'} goal={data?.kcal ?? null} consumed={data?.consumed ?? 0}
      log={data ?? undefined} refreshAt={data?.refreshAt} />
    {summary && <section className="panel section-panel today-meals">
      <h2>{t('home.dailyMeals')}</h2>
      <ul className="today-meal-summary">{summary.meals.toReversed().map((meal) => {
        const category = t(`meals.${meal.category}`);
        return <li key={meal.id}>
          <span className="today-meal-category">{category}</span>
          <strong>{mealLabel(meal, summary.catalog, locale, category)}</strong>
          <span className="today-meal-kcal">≈ {format.number(mealCalories(meal), { maximumFractionDigits: 0 })} kcal</span>
        </li>;
      })}</ul>
    </section>}
  </>;
}

async function DiaryContent({ locale, date }: { locale: Locale; date?: string }) {
  const data = await loadFoodDay(locale, date);
  if (data?.state === 'ready') return <FoodDiary {...data} locale={locale} />;
  const t = await getTranslations({ locale, namespace: 'nutrition' });
  return <p className="panel section-panel" role="status">{t(data?.state ?? 'unavailable')}</p>;
}

export async function PrivateScreen({ params, screen, date }: ScreenParams & { screen: Screen; date?: string }) {
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
      <div className="today-stack">
        <Suspense fallback={<CaloriesCard live state="loading" consumed={0} goal={null} />}>
          <TodayCalories locale={locale} />
        </Suspense>
      </div>
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
        <DiaryContent locale={locale} date={date} />
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
