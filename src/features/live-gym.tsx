'use client';

import { ChevronRight, Dumbbell, Footprints, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import type { Exercise, StrengthEntry, TreadmillSession } from '@/lib/supabase/database';
import { orderExercises, recentRuns, strengthSummary } from '@/lib/tracking';
import { displayWeight, type DistanceUnit, type WeightUnit } from '@/lib/units';
import { ExerciseForm, StrengthForm, TreadmillForm } from './training-forms';

export function StrengthStats({ entries, unit }: { entries: StrengthEntry[]; unit: WeightUnit }) {
  const gym = useTranslations('gym');
  const t = useTranslations('training');
  const format = useFormatter();
  const summary = strengthSummary(entries);
  if (!summary) return <p className="empty-state">{t('noLoads')}</p>;
  const repetitions = entries.at(-1)?.repetitions;

  const load = (kg: number, signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto') =>
    `${format.number(displayWeight(kg, unit), { maximumFractionDigits: 2, signDisplay })} ${unit}`;
  return (
    <dl className="gym-stats live-gym-stats">
      <div><dt>{gym('last')}</dt><dd>{load(summary.latest)}</dd>
        {repetitions != null && <small>{t('repetitions', { count: repetitions })}</small>}
      </div>
      <div><dt>{gym('best')}</dt><dd>{load(summary.best)}</dd></div>
      <div><dt>{t('loadChange')}</dt><dd>{summary.change === null ? '—' : load(summary.change, 'exceptZero')}</dd></div>
    </dl>
  );
}

type ListedExercise = Exercise & { latest: Pick<StrengthEntry, 'load_kg' | 'repetitions'> | null };

export function LiveGym({ locale, exercises, runs, timeZone, weightUnit, distanceUnit }: {
  locale: Locale;
  exercises: ListedExercise[];
  runs: TreadmillSession[];
  timeZone: string;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
}) {
  const nav = useTranslations('nav');
  const t = useTranslations('training');
  const gym = useTranslations('gym');
  const format = useFormatter();
  const [modal, setModal] = useState<'exercise' | 'run' | ListedExercise | null>(null);
  const close = () => setModal(null);
  const recent = recentRuns(runs, distanceUnit);
  const speed = (value: number, signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto') =>
    `${format.number(value, { maximumFractionDigits: 2, signDisplay })} ${distanceUnit}/h`;

  return <>
    <PageHeading title={nav('gym')} visuallyHidden />
    <div className="gym-overview">
      <section className="panel section-panel treadmill">
        <div className="panel-heading">
          <h2><Footprints size={20} aria-hidden />{gym('treadmill')}</h2>
          <AddRecordButton onClick={() => setModal('run')}>{t('newRun')}</AddRecordButton>
        </div>
        {recent ? <dl className="gym-stats">
          <div><dt>{t('recentSpeed', { count: recent.count })}</dt><dd>{speed(recent.speed)}</dd></div>
          <div><dt>{t('runChange')}</dt><dd>{recent.change === null ? '—' : speed(recent.change, 'exceptZero')}</dd></div>
        </dl> : <p className="empty-state">{t('noRuns')}</p>}
        <Link className="text-link" prefetch={false} href={localePath(locale, '/gym/cinta')}>{t('viewRuns')}</Link>
      </section>
      <section className="panel section-panel gym-exercises">
        <div className="panel-heading">
          <h2><Dumbbell size={20} aria-hidden />{t('exercises')}</h2>
          <AddRecordButton onClick={() => setModal('exercise')}>{t('newExercise')}</AddRecordButton>
        </div>
        {exercises.length ? <ul className="history">
          {orderExercises(exercises, locale).map((exercise) => <li key={exercise.id}>
            <Link className="exercise-link" prefetch={false} href={localePath(locale, `/gym/ejercicios/${exercise.id}`)}>
              <span className="exercise-name">{exercise.favorite_slot !== null &&
                <Star size={16} role="img" aria-label={t('favorite')} />}{exercise.name}</span>
              {exercise.latest && <span className="exercise-load">
                <strong>{format.number(displayWeight(exercise.latest.load_kg, weightUnit), { maximumFractionDigits: 2 })} {weightUnit}</strong>
                {exercise.latest.repetitions != null && <small>{t('repetitions', { count: exercise.latest.repetitions })}</small>}
              </span>}
              <ChevronRight size={17} aria-hidden />
            </Link>
            {exercise.favorite_slot !== null && <button type="button" className="icon-button"
              title={t('newLoadFor', { name: exercise.name })}
              aria-label={t('newLoadFor', { name: exercise.name })} onClick={() => setModal(exercise)}>
              <Plus size={18} aria-hidden />
            </button>}
          </li>)}
        </ul> : <p className="empty-state">{t('noExercises')}</p>}
      </section>
    </div>
    {modal === 'exercise' && <ExerciseForm locale={locale} close={close} />}
    {modal && typeof modal === 'object' && <StrengthForm locale={locale} exercise={modal} unit={weightUnit}
      timeZone={timeZone} latest={modal.latest} close={close} />}
    {modal === 'run' && <TreadmillForm locale={locale} unit={distanceUnit} timeZone={timeZone} close={close} />}
  </>;
}
