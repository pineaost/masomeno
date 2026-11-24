'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeading } from '@/components/page-heading';
import { RecordDialog } from '@/components/tracking-ui';
import type { FormStatus } from '@/lib/account-fields';
import type { FoodAvailability } from '@/lib/food';
import type { Preferences, Profile } from '@/lib/supabase/database';
import type { TrackingAction } from '@/lib/tracking';
import { PreferenceFields } from './preference-fields';

type SaveAction = (state: FormStatus, fields: FormData) => Promise<FormStatus>;

function FormResult({ status }: { status: FormStatus }) {
  const t = useTranslations('settings');
  if (status === 'idle') return null;
  return <p role={status === 'saved' ? 'status' : 'alert'}>{t(status)}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('settings');
  const app = useTranslations('app');
  return (
    <button type="submit" className="button primary" disabled={pending} aria-busy={pending}>
      {pending ? t('saving') : app('save')}
    </button>
  );
}

export function AccountSettings({
  profile, preferences, goal, backHref, saveProfile, savePreferences, saveGoal,
}: {
  profile: Profile;
  preferences: Preferences;
  goal: { state: FoodAvailability; kcal: number | null };
  backHref: string;
  saveProfile: SaveAction;
  savePreferences: SaveAction;
  saveGoal: TrackingAction;
}) {
  const t = useTranslations('settings');
  const nav = useTranslations('nav');
  const food = useTranslations('nutrition');
  const format = useFormatter();
  const [goalOpen, setGoalOpen] = useState(false);
  const [preferenceValues, setPreferenceValues] = useState(preferences);
  const [profileValues, setProfileValues] = useState({
    display_name: profile.display_name ?? '',
    birth_date: profile.birth_date ?? '',
    height_cm: profile.height_cm?.toString() ?? '',
    time_zone: profile.time_zone,
  });
  const [profileStatus, submitProfile, profilePending] = useActionState<FormStatus, FormData>(saveProfile, 'idle');
  const [preferenceStatus, submitPreferences, preferencePending] = useActionState<FormStatus, FormData>(savePreferences, 'idle');

  return (
    <>
      <PageHeading title={nav('settings')} visuallyHidden />
      <section className="panel section-panel settings-panel">
        <div className="panel-heading">
          <h2>{t('profile')}</h2>
          <Link href={backHref} className="button secondary" prefetch={false}>
            <ArrowLeft size={17} aria-hidden />{nav('back')}
          </Link>
        </div>
        <form action={submitProfile} className="settings-form">
          <fieldset disabled={profilePending} className="form-stack">
            <label>
              {t('displayName')}
              <input name="display_name" autoComplete="name" maxLength={100} value={profileValues.display_name}
                onChange={(event) => setProfileValues({ ...profileValues, display_name: event.target.value })} />
            </label>
            <label>
              {t('birthDate')}
              <input name="birth_date" type="date" autoComplete="bday" min="1900-01-01" value={profileValues.birth_date}
                onChange={(event) => setProfileValues({ ...profileValues, birth_date: event.target.value })} />
            </label>
            <label>
              {t('heightCm')}
              <input name="height_cm" type="number" inputMode="decimal" min="0.01" max="300" step="0.01"
                value={profileValues.height_cm}
                onChange={(event) => setProfileValues({ ...profileValues, height_cm: event.target.value })} />
            </label>
            <label>
              {t('timeZone')}
              <input name="time_zone" placeholder="America/Argentina/Buenos_Aires" maxLength={80}
                autoCapitalize="none" spellCheck={false} required value={profileValues.time_zone}
                onChange={(event) => setProfileValues({ ...profileValues, time_zone: event.target.value })} />
            </label>
          </fieldset>
          <div className="settings-actions">
            <FormResult status={profileStatus} />
            <SubmitButton />
          </div>
        </form>
      </section>
      <section className="panel section-panel settings-panel">
        <div className="panel-heading"><h2>{t('preferences')}</h2></div>
        <form action={submitPreferences} className="settings-form">
          <fieldset disabled={preferencePending}>
            <PreferenceFields values={preferenceValues} onChange={setPreferenceValues} />
          </fieldset>
          <div className="settings-actions">
            <FormResult status={preferenceStatus} />
            <SubmitButton />
          </div>
        </form>
      </section>
      <section className="panel section-panel settings-panel" id="objetivo-calorico">
        <div className="panel-heading">
          <h2>{food('goal')}</h2>
          {goal.state === 'ready' && <button type="button" className="button secondary" onClick={() => setGoalOpen(true)}>
            {food(goal.kcal === null ? 'setGoal' : 'editGoal')}
          </button>}
        </div>
        <p className="section-copy">{goal.state === 'ready'
          ? goal.kcal === null ? food('noGoal') : food('goalValue', { kcal: format.number(goal.kcal) })
          : food(goal.state)}</p>
      </section>
      {goalOpen && <RecordDialog title={food('goal')} save={saveGoal} close={() => setGoalOpen(false)}>
        <label>{food('goalInput')}
          <input type="number" name="kcal" inputMode="numeric" min="1" max="10000" step="1" defaultValue={goal.kcal ?? ''} />
        </label>
        <p className="section-copy">{food('goalHint')}</p>
      </RecordDialog>}
    </>
  );
}
