import { BookOpen, CalendarDays, Utensils } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeading } from '@/components/page-heading';
import { isLocale } from '@/i18n/config';
import { demoMode, requireAccount } from '@/lib/account';
import { Food, FoodNavigation } from './food';
import { Gym } from './gym';
import { Home } from './home';
import { Progress } from './progress';
import { TrackingBoundary, TrackingOverview } from './tracking-screen';

const foodSections = ['diary', 'recipes', 'plan'] as const;
type FoodSection = (typeof foodSections)[number];
type Screen = 'home' | 'progress' | 'gym' | FoodSection;
export type ScreenParams = { params: Promise<{ locale: string }> };

const icons = {
  diary: Utensils, recipes: BookOpen, plan: CalendarDays,
};

function isFood(screen: Screen): screen is FoodSection {
  return foodSections.some((section) => section === screen);
}

export async function PrivateScreen({ params, screen }: ScreenParams & { screen: Screen }) {
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
  if (!isFood(screen)) {
    return (
      <TrackingBoundary locale={locale}>
        <TrackingOverview locale={locale} screen={screen} />
      </TrackingBoundary>
    );
  }
  const t = await getTranslations({ locale });
  const Icon = icons[screen];

  return (
    <>
      <PageHeading title={t('nav.meals')} description={t(`empty.${screen}.intro`)} />
      <FoodNavigation section={screen} demo={false} />
      <section className="panel plan-empty">
        <span className="quick-icon"><Icon size={22} aria-hidden /></span>
        <h2>{t(`empty.${screen}.title`)}</h2>
        <p>{t(`empty.${screen}.hint`)}</p>
      </section>
    </>
  );
}
