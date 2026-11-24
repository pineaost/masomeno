'use client';

import { Dumbbell, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { PageHeading } from '@/components/page-heading';
import { AddRecordButton, EditRecordButton, RecordChart } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { calendarDate } from '@/lib/dates';
import type { Exercise, StrengthEntry } from '@/lib/supabase/database';
import type { MutationResult } from '@/lib/tracking';
import { displayWeight, type WeightUnit } from '@/lib/units';
import { StrengthStats } from './live-gym';
import { deleteExercise, favoriteExercise } from './tracking-actions';
import { ExerciseForm, StrengthForm } from './training-forms';

export function LiveExercise({ locale, exercise, entries, unit, today }: {
  locale: Locale; exercise: Exercise; entries: StrengthEntry[]; unit: WeightUnit; today: string;
}) {
  const t = useTranslations('training');
  const feedback = useTranslations('tracking');
  const nav = useTranslations('nav');
  const format = useFormatter();
  const router = useRouter();
  const [modal, setModal] = useState<StrengthEntry | 'exercise' | 'new' | null>(null);
  const [error, setError] = useState<Exclude<MutationResult, 'saved'> | null>(null);
  const [pending, startTransition] = useTransition();
  const favorite = exercise.favorite_slot !== null;
  const gymPath = localePath(locale, '/gym');
  const date = (day: string) => format.dateTime(calendarDate(day), { timeZone: 'UTC', dateStyle: 'medium' });
  const load = (kg: number) => `${format.number(displayWeight(kg, unit), { maximumFractionDigits: 2 })} ${unit}`;
  const close = () => setModal(null);

  function toggleFavorite() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await favoriteExercise(locale, exercise.id, !favorite);
        if (result !== 'saved') setError(result);
      } catch {
        setError('unavailable');
      }
    });
  }

  return (
    <>
      <Link href={gymPath} prefetch={false} className="text-link">{nav('gym')}</Link>
      <PageHeading title={exercise.name} description={t('strengthIntro')}>
        <AddRecordButton onClick={() => setModal('new')}>{t('newLoad')}</AddRecordButton>
      </PageHeading>
      <section className="panel section-panel">
        <div className="panel-heading">
          <h2>{t('strengthSummary')}</h2>
          <div className="tracking-inline-actions">
            <button className="button secondary" type="button" onClick={toggleFavorite} disabled={pending}>
              <Star size={16} fill={favorite ? 'currentColor' : 'none'} aria-hidden />
              {t(favorite ? 'removeFavorite' : 'addFavorite')}
            </button>
            <EditRecordButton label={exercise.name} onClick={() => setModal('exercise')} />
          </div>
        </div>
        {error && <p className="auth-notice" role="alert">{feedback(error)}</p>}
        <StrengthStats entries={entries} unit={unit} />
      </section>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('strengthChart')}</h2></div>
        <RecordChart data={entries.map((entry) => ({ day: entry.performed_on, value: entry.load_kg }))}
          label={t('strengthChart')} date={date} number={load} empty={t('shortChart')} />
      </section>
      <section className="panel section-panel">
        <div className="panel-heading"><h2>{t('liftHistory')}</h2></div>
        {entries.length ? (
          <ul className="history">
            {entries.toReversed().map((entry) => (
              <li key={entry.id}>
                <span className="category-icon"><Dumbbell size={18} aria-hidden /></span>
                <time dateTime={entry.performed_on}>{date(entry.performed_on)}</time>
                <strong>{load(entry.load_kg)}</strong>
                <EditRecordButton label={date(entry.performed_on)} onClick={() => setModal(entry)} />
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">{t('noLoads')}</p>}
      </section>
      {modal === 'exercise' && <ExerciseForm locale={locale} exercise={exercise} close={close} remove={async () => {
        const result = await deleteExercise(locale, exercise.id);
        if (result === 'saved') router.replace(gymPath);
        return result;
      }} />}
      {(modal === 'new' || (modal && typeof modal === 'object')) && (
        <StrengthForm locale={locale} exercise={exercise} unit={unit} today={today} close={close}
          entry={typeof modal === 'object' ? modal : undefined} />
      )}
    </>
  );
}
