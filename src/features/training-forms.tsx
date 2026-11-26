'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { RecordDialog } from '@/components/tracking-ui';
import type { Locale } from '@/i18n/config';
import { localFormDateTime } from '@/lib/dates';
import type { Exercise, StrengthEntry, TreadmillSession } from '@/lib/supabase/database';
import type { MutationResult } from '@/lib/tracking';
import { displayDistance, displayWeight, type DistanceUnit, type WeightUnit } from '@/lib/units';
import { deleteStrength, deleteTreadmill, saveExercise, saveStrength, saveTreadmill } from './tracking-actions';

export function ExerciseForm({ locale, exercise, close, remove }: {
  locale: Locale; exercise?: Exercise; close: () => void; remove?: () => Promise<MutationResult>;
}) {
  const t = useTranslations('training');
  return (
    <RecordDialog title={t(exercise ? 'editExercise' : 'newExercise')} close={close}
      save={saveExercise.bind(null, locale, exercise?.id ?? null)} remove={remove} removePrompt={t('removeExercise')}>
      <label>
        {t('exerciseName')}
        <input name="name" maxLength={80} defaultValue={exercise?.name} required />
      </label>
    </RecordDialog>
  );
}

export function StrengthForm({ locale, exercise, unit, timeZone, entry, latest, close }: {
  latest?: Pick<StrengthEntry, 'load_kg' | 'repetitions'> | null;
  locale: Locale; exercise: Exercise; unit: WeightUnit; timeZone: string; entry?: StrengthEntry; close: () => void;
}) {
  const t = useTranslations('training');
  const weight = useTranslations('weight');
  const format = useFormatter();
  const formatLoad = (kg: number) => format.number(displayWeight(kg, unit), {
    useGrouping: false, maximumFractionDigits: 5,
  });
  const [load, setLoad] = useState(() => entry ? formatLoad(entry.load_kg) : '');
  const [repetitions, setRepetitions] = useState(() => String(entry?.repetitions ?? ''));
  const [today] = useState(() => localFormDateTime(new Date().toISOString(), timeZone).slice(0, 10));
  return (
    <RecordDialog title={entry ? t('editLoad') : t('newLoadFor', { name: exercise.name })} close={close}
      save={saveStrength.bind(null, locale, exercise.id, entry?.id ?? null, unit)}
      remove={entry ? deleteStrength.bind(null, locale, exercise.id, entry.id) : undefined}>
      {!entry && latest && <div>
        <button type="button" className="button secondary" onClick={() => {
          setLoad(formatLoad(latest.load_kg));
          setRepetitions(String(latest.repetitions ?? ''));
        }}>{t('useLatestLoad')}</button>
      </div>}
      <label>
        {t('load', { unit })}
        <input name="load" type="text" inputMode="decimal" maxLength={16} required
          value={load} onChange={(event) => setLoad(event.target.value)} />
      </label>
      <label>
        {t('repetitionsInput')}
        <input name="repetitions" type="number" inputMode="numeric" min="1" max="999" step="1"
          value={repetitions} onChange={(event) => setRepetitions(event.target.value)} />
      </label>
      <label>
        {weight('date')}
        <input name="performed_on" type="date" defaultValue={entry?.performed_on ?? today} max={today} required />
      </label>
    </RecordDialog>
  );
}

export function TreadmillForm({ locale, unit, timeZone, entry, close }: {
  locale: Locale; unit: DistanceUnit; timeZone: string; entry?: TreadmillSession; close: () => void;
}) {
  const t = useTranslations('training');
  const weight = useTranslations('weight');
  const format = useFormatter();
  const [today] = useState(() => localFormDateTime(new Date().toISOString(), timeZone).slice(0, 10));
  return (
    <RecordDialog title={t(entry ? 'editRun' : 'newRun')} close={close}
      save={saveTreadmill.bind(null, locale, entry?.id ?? null, unit)}
      remove={entry ? deleteTreadmill.bind(null, locale, entry.id) : undefined}>
      <label>
        {t('distanceInput', { unit })}
        <input name="distance" type="text" inputMode="decimal" maxLength={16} required
          defaultValue={entry ? format.number(displayDistance(entry.distance_km, unit), { useGrouping: false, maximumFractionDigits: 5 }) : undefined} />
      </label>
      <fieldset className="record-duration">
        <legend>{t('runDuration')}</legend>
        <div className="record-duration-inputs">
          <label>
            {t('minutes')}
            <input name="minutes" type="number" inputMode="numeric" min="0" max="1440" step="1" required
              defaultValue={entry ? Math.floor(entry.duration_seconds / 60) : undefined} />
          </label>
          <label>
            {t('seconds')}
            <input name="seconds" type="number" inputMode="numeric" min="0" max="59" step="1" required
              defaultValue={(entry?.duration_seconds ?? 0) % 60} />
          </label>
        </div>
      </fieldset>
      <label>
        {weight('date')}
        <input name="performed_on" type="date" defaultValue={entry?.performed_on ?? today} max={today} required />
      </label>
    </RecordDialog>
  );
}
