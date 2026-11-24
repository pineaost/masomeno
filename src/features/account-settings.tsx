'use client';

import { CircleUserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeading } from '@/components/page-heading';
import type { FormStatus } from '@/lib/account-fields';
import type { Preferences, Profile } from '@/lib/supabase/database';
import { PreferenceFields } from './preference-fields';

type SaveAction = (state: FormStatus, fields: FormData) => Promise<FormStatus>;

function FormResult({ status }: { status: FormStatus }) {
  const t = useTranslations('settings');
  if (status === 'idle') return null;
  return <p role={status === 'saved' ? 'status' : 'alert'}>{t(status)}</p>;
}

function SubmitButton({ kind = 'save' }: { kind?: 'save' | 'signOut' }) {
  const { pending } = useFormStatus();
  const t = useTranslations('settings');
  const app = useTranslations('app');
  const label = kind === 'signOut' ? t(pending ? 'signingOut' : 'signOut') : pending ? t('saving') : app('save');
  return (
    <button type="submit" className={`button ${kind === 'save' ? 'primary' : 'secondary'}`}
      disabled={pending} aria-busy={pending}>
      {label}
    </button>
  );
}

export function AccountSettings({
  profile, preferences, email, saveProfile, savePreferences, signOut,
}: {
  profile: Profile;
  preferences: Preferences;
  email: string | null;
  saveProfile: SaveAction;
  savePreferences: SaveAction;
  signOut: () => Promise<void>;
}) {
  const t = useTranslations('settings');
  const nav = useTranslations('nav');
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
      <PageHeading title={nav('settings')} description={t('intro')} />
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
      <section className="panel section-panel settings-panel">
        <div className="panel-heading"><h2>{t('profile')}</h2></div>
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
        <div className="panel-heading">
          <h2 className="inline-flex items-center gap-3"><CircleUserRound size={21} aria-hidden />{t('account')}</h2>
        </div>
        {email && <p className="section-copy account-email">{email}</p>}
        <form action={signOut} className="settings-actions"><SubmitButton kind="signOut" /></form>
      </section>
    </>
  );
}
