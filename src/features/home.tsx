'use client';

import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton } from '@/components/tracking-ui';
import { localePath } from '@/i18n/config';
import { calendarDate } from '@/lib/dates';
import { CaloriesCard } from './calories-card';
import { calorieGoal, demoDay, type Meal } from './demo-data';
import { useDemo } from './demo-provider';
import { MealDialog } from './log-dialogs';
import { MealList } from './meal-list';

export function Home() {
  const t = useTranslations('home');
  const nav = useTranslations('nav');
  const format = useFormatter();
  const locale = useLocale();
  const { meals } = useDemo();
  const [open, setOpen] = useState<'new' | Meal | null>(null);

  return (
    <>
      <PageHeading title={nav('home')} visuallyHidden>
        <time className="date-pill" dateTime={demoDay}>
          <CalendarDays size={17} strokeWidth={1.8} aria-hidden />
          {format.dateTime(calendarDate(demoDay), { weekday: 'long', day: 'numeric', month: 'long' })}
        </time>
      </PageHeading>
      <CaloriesCard goal={calorieGoal} consumed={meals.reduce((total, meal) => total + meal.kcal, 0)} />
      <section className="panel meal-panel today-meals" aria-labelledby="today-meals">
        <div className="panel-heading">
          <h2 id="today-meals">{t('dailyMeals')}</h2>
          <div className="food-quick-actions">
            <AddRecordButton onClick={() => setOpen('new')}>{t('logMeal')}</AddRecordButton>
            <Link className="button secondary" href={localePath(locale, '/comidas')}>{t('seeMeals')}</Link>
          </div>
        </div>
        <MealList meals={meals} onSelect={setOpen} />
      </section>
      {open && <MealDialog meal={open === 'new' ? undefined : open} onClose={() => setOpen(null)} />}
    </>
  );
}
