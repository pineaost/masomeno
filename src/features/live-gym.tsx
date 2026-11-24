'use client';

import { Dumbbell, Footprints, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import type { Exercise, StrengthEntry, TreadmillSession } from '@/lib/supabase/database';
import { recentRuns, strengthSummary } from '@/lib/tracking';
import { displayWeight, type DistanceUnit, type WeightUnit } from '@/lib/units';
import { ExerciseForm, StrengthForm, TreadmillForm } from './training-forms';

export function StrengthStats({ entries, unit }: { entries: StrengthEntry[]; unit: WeightUnit }) {
  const gym = useTranslations('gym');
  const t = useTranslations('training');
  const format = useFormatter();
  const summary = strengthSummary(entries);
  if (!summary) return <p className="empty-state">{t('noLoads')}</p>;

  const load = (kg: number, signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto') =>
    `${format.number(displayWeight(kg, unit), { maximumFractionDigits: 2, signDisplay })} ${unit}`;
  return (
    <dl className="gym-stats live-gym-stats">
      <div><dt>{gym('last')}</dt><dd>{load(summary.latest)}</dd></div>
      <div><dt>{gym('best')}</dt><dd>{load(summary.best)}</dd></div>
      <div><dt>{t('loadChange')}</dt><dd>{summary.change === null ? '—' : load(summary.change, 'exceptZero')}</dd></div>
    </dl>
  );
}

export function LiveGym({ locale, exercises, favoriteCards, runs, today, weightUnit, distanceUnit }: {
  locale: Locale;
  exercises: Exercise[];
  favoriteCards: (Exercise & { entries: StrengthEntry[] })[];
  runs: TreadmillSession[];
  today: string;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
}) {
  const nav = useTranslations('nav');
  const t = useTranslations('training');
  const gym = useTranslations('gym');
  const format = useFormatter();
  const [modal, setModal] = useState<Exercise | 'exercise' | 'run' | null>(null);
  const close = () => setModal(null);
  const recent = recentRuns(runs, distanceUnit);
  const speed = (value: number, signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto') =>
    `${format.number(value, { maximumFractionDigits: 2, signDisplay })} ${distanceUnit}/h`;
  const exercisePath = (id: string) => localePath(locale, `/gym/ejercicios/${id}`);

  return (
    <>
      <PageHeading title={nav('gym')} visuallyHidden />
      <section className="gym-favorites">
        <div className="panel-heading">
          <h2>{gym('favorites')}</h2>
          <AddRecordButton onClick={() => setModal('exercise')}>{t('newExercise')}</AddRecordButton>
        </div>
        {favoriteCards.length ? (
          <div className="gym-grid">
            {favoriteCards.map((exercise) => (
              <article className="panel gym-card" key={exercise.id}>
                <div className="gym-heading tracking-card-heading">
                  <span className="category-icon"><Dumbbell size={19} aria-hidden /></span>
                  <h3><Link className="text-link" prefetch={false} href={exercisePath(exercise.id)}>{exercise.name}</Link></h3>
                  <button className="icon-button" type="button" aria-label={t('newLoadFor', { name: exercise.name })}
                    onClick={() => setModal(exercise)}><Plus size={20} aria-hidden /></button>
                </div>
                <StrengthStats entries={exercise.entries} unit={weightUnit} />
              </article>
            ))}
          </div>
        ) : <p className="panel section-panel section-copy">{t('noFavorites')}</p>}
      </section>
      <section className="panel section-panel treadmill">
        <div className="panel-heading">
          <h2 className="inline-flex items-center gap-3"><Footprints size={20} aria-hidden />{gym('treadmill')}</h2>
          <Link className="text-link" prefetch={false} href={localePath(locale, '/gym/cinta')}>{t('viewRuns')}</Link>
        </div>
        {recent ? (
          <dl className="gym-stats">
            <div><dt>{t('recentSpeed', { count: recent.count })}</dt><dd>{speed(recent.speed)}</dd></div>
            <div><dt>{t('runChange')}</dt><dd>{recent.change === null ? '—' : speed(recent.change, 'exceptZero')}</dd></div>
          </dl>
        ) : <p className="empty-state">{t('noRuns')}</p>}
        <AddRecordButton onClick={() => setModal('run')}>{t('newRun')}</AddRecordButton>
      </section>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('exercises')}</h2></div>
        {exercises.length ? (
          <ul className="history">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <Link className="exercise-link" prefetch={false} href={exercisePath(exercise.id)}>
                  <span className="category-icon"><Dumbbell size={18} aria-hidden /></span>
                  <span>{exercise.name}</span>
                  {exercise.favorite_slot !== null && <Star size={17} aria-label={t('favorite')} />}
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">{t('noExercises')}</p>}
      </section>
      {modal === 'exercise' && <ExerciseForm locale={locale} close={close} />}
      {modal === 'run' && <TreadmillForm locale={locale} unit={distanceUnit} today={today} close={close} />}
      {modal && typeof modal === 'object' && <StrengthForm locale={locale} exercise={modal} unit={weightUnit} today={today} close={close} />}
    </>
  );
}
