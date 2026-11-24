'use client';

import { Activity, CalendarDays, Plus, Scale, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { LineChart } from '@/components/line-chart';
import { PageHeading } from '@/components/page-heading';
import { localePath } from '@/i18n/config';
import { calendarDate, monthsBefore } from '@/lib/dates';
import { useUnit } from '@/lib/preferences';
import { displayWeight } from '@/lib/units';
import { calorieGoal, demoDay, type Meal } from './demo-data';
import { useDemo } from './demo-provider';
import { MealDialog, WeightDialog } from './log-dialogs';
import { MealList } from './meal-list';
import { CaloriesCard } from './calories-card';

export function Home() {
  const t = useTranslations('home');
  const nav = useTranslations('nav');
  const weight = useTranslations('weight');
  const format = useFormatter();
  const locale = useLocale();
  const { meals, weights } = useDemo();
  const [unit] = useUnit('weight');
  const [open, setOpen] = useState<'meal' | 'weight' | Meal | null>(null);
  const first = weights[0];
  const last = weights[weights.length - 1];
  const chart = weights.filter((entry) => entry.day >= monthsBefore(demoDay, 1))
    .map(({ day, kg }) => ({ day, value: kg }));
  const formatDay = (day: string) => format.dateTime(calendarDate(day), { day: 'numeric', month: 'short' });
  const formatWeight = (kg: number, signed = false) => `${format.number(displayWeight(kg, unit), {
    maximumFractionDigits: 1,
    signDisplay: signed ? 'exceptZero' : 'auto',
  })} ${unit}`;

  return (
    <>
      <PageHeading title={nav('home')} visuallyHidden>
        <time className="date-pill" dateTime={demoDay}>
          <CalendarDays size={17} strokeWidth={1.8} aria-hidden />
          {format.dateTime(calendarDate(demoDay), { weekday: 'long', day: 'numeric', month: 'long' })}
        </time>
      </PageHeading>
      <CaloriesCard goal={calorieGoal} consumed={meals.reduce((total, meal) => total + meal.kcal, 0)} />
      <section className="quick-section" aria-labelledby="actions-title">
        <h2 id="actions-title">{t('actions')}</h2>
        <div className="quick-grid">
          <button type="button" className="quick-action" onClick={() => setOpen('meal')}>
            <span className="quick-icon accent"><Plus size={22} strokeWidth={2} aria-hidden /></span>
            <strong>{t('logMeal')}</strong>
          </button>
          <Link className="quick-action" href={localePath(locale, '/comidas/recetario')}>
            <span className="quick-icon"><Sparkles size={21} strokeWidth={1.75} aria-hidden /></span>
            <strong>{t('chooseMeal')}</strong>
          </Link>
          <button type="button" className="quick-action" onClick={() => setOpen('weight')}>
            <span className="quick-icon"><Scale size={21} strokeWidth={1.75} aria-hidden /></span>
            <strong>{t('logWeight')}</strong>
          </button>
        </div>
      </section>
      <div className="home-grid">
        <section className="panel meal-panel" aria-labelledby="today-meals">
          <div className="panel-heading">
            <h2 id="today-meals">{t('dailyMeals')}</h2>
            <Link className="text-link" href={localePath(locale, '/comidas')}>{t('seeMeals')}</Link>
          </div>
          <MealList meals={meals} onSelect={setOpen} />
        </section>
        <section className="panel weight-panel" aria-labelledby="weight-today">
          <div className="panel-heading">
            <h2 id="weight-today">{weight('current')}</h2>
            <span className="panel-icon"><Activity size={18} aria-hidden /></span>
          </div>
          <div className="weight-number">
            <strong>{format.number(displayWeight(last.kg, unit), { maximumFractionDigits: 1 })}</strong>
            <span>{unit}</span>
          </div>
          <span className="change-pill">{weight('sinceStart', { change: formatWeight(last.kg - first.kg, true) })}</span>
          {chart.length >= 2 ? (
            <figure className="weight-figure">
              <LineChart data={chart} label={weight('chartLabel')} compact />
              <figcaption><span>{formatDay(chart[0].day)}</span><span>{formatDay(chart[chart.length - 1].day)}</span></figcaption>
            </figure>
          ) : <p className="empty-state">{weight('emptyTrend')}</p>}
          <Link className="text-link" href={localePath(locale, '/evolucion')}>{t('seeProgress')}</Link>
        </section>
      </div>
      {open === 'weight' && <WeightDialog onClose={() => setOpen(null)} />}
      {open && open !== 'weight' && (
        <MealDialog meal={open === 'meal' ? undefined : open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
