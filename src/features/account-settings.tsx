'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeading } from '@/components/page-heading';
import { isLocale, type Locale } from '@/i18n/config';
import { createLocaleHandoff } from '@/i18n/locale-handoff';
import { useLocalizedValidation } from '@/i18n/form-validation';
import type { FormStatus } from '@/lib/account-fields';
import { settingsPath } from '@/lib/settings-paths';
import type { Preferences, Profile } from '@/lib/supabase/database';
import { heightInCentimeters, heightInFeetAndInches } from '@/lib/units';
import { PreferenceFields } from './preference-fields';

type SaveAction = (state: FormStatus, fields: FormData) => Promise<FormStatus>;
type ProfileDraft = { display_name: string; birth_date: string; height_cm: string; time_zone: string };
const profileHandoff = createLocaleHandoff<{ values: ProfileDraft; status: FormStatus }>();

function FormResult({ status }: { status: FormStatus }) {
  const t = useTranslations('settings');
  if (status === 'idle') return null;
  return <p role={status === 'saved' ? 'status' : 'alert'}>{t(status)}</p>;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations('settings');
  const app = useTranslations('app');
  return (
    <button type="submit" className="button primary" disabled={pending || disabled} aria-busy={pending}>
      {pending ? t('saving') : app('save')}
    </button>
  );
}

function ProfileHeight({ centimeters, imperial, onChange }: {
  centimeters: string;
  imperial: boolean;
  onChange: (value: string) => void;
}) {
  const t = useTranslations('settings');
  const [parts, setParts] = useState(() => {
    if (!centimeters) return { feet: '', inches: '' };
    const { feet, inches } = heightInFeetAndInches(Number(centimeters), 2);
    return { feet: String(feet), inches: String(inches) };
  });

  function update(next: typeof parts) {
    setParts(next);
    onChange(next.feet || next.inches ? heightInCentimeters(Number(next.feet), Number(next.inches)).toFixed(2) : '');
  }

  if (!imperial) return <label>
    {t('heightCm')}
    <input name="height_cm" type="number" inputMode="decimal" min="0.01" max="300" step="0.01"
      value={centimeters} onChange={(event) => onChange(event.target.value)} />
  </label>;

  return <div className="record-duration-inputs">
    <input name="height_cm" type="hidden" value={centimeters} />
    <label>{t('heightFt')}
      <input type="number" inputMode="numeric" min="0" max="9" step="1"
        value={parts.feet} onChange={(event) => update({ ...parts, feet: event.target.value })} />
    </label>
    <label>{t('heightIn')}
      <input type="number" inputMode="decimal" min="0" max="11.99" step="0.01"
        value={parts.inches} onChange={(event) => update({ ...parts, inches: event.target.value })} />
    </label>
  </div>;
}

export function AccountSettings({
  locale, profile, preferences, backHref, saveProfile, savePreferences,
}: {
  locale: Locale;
  profile: Profile;
  preferences: Preferences;
  backHref: string;
  saveProfile: SaveAction;
  savePreferences: SaveAction;
}) {
  const t = useTranslations('settings');
  const nav = useTranslations('nav');
  const router = useRouter();
  const validation = useLocalizedValidation();
  const preferencesForm = useRef<HTMLFormElement>(null);
  const destination = settingsPath(locale, backHref);
  const [handoff] = useState(() => profileHandoff.read(destination));
  useEffect(() => {
    profileHandoff.clear(destination);
    const language = preferencesForm.current?.elements.namedItem('locale');
    if (handoff && language instanceof HTMLSelectElement) language.focus({ preventScroll: true });
  }, [destination, handoff]);
  const [preferenceValues, setPreferenceValues] = useState(preferences);
  const [profileValues, setProfileValues] = useState(handoff?.values ?? {
    display_name: profile.display_name ?? '',
    birth_date: profile.birth_date ?? '',
    height_cm: profile.height_cm?.toString() ?? '',
    time_zone: profile.time_zone,
  });
  const [profileStatus, submitProfile, profilePending] = useActionState<FormStatus, FormData>(saveProfile, handoff?.status ?? 'idle');
  const [preferenceStatus, submitPreferences, preferencePending] = useActionState<FormStatus, FormData>(async (state, fields) => {
    const saved = await savePreferences(state, fields);
    const next = fields.get('locale');
    if (saved === 'saved' && typeof next === 'string' && isLocale(next) && next !== locale) {
      const href = settingsPath(next, backHref);
      profileHandoff.prepare(href, { values: profileValues, status: profileStatus });
      router.replace(href, { scroll: false });
    }
    return saved;
  }, handoff ? 'saved' : 'idle');

  return (
    <>
      <PageHeading title={nav('settings')} visuallyHidden />
      <section className="panel section-panel settings-panel">
        <div className="panel-heading">
          <h2 id="profile-heading">{t('profile')}</h2>
          <Link href={backHref} className="button secondary" prefetch={false}>
            <ArrowLeft size={17} aria-hidden />{nav('back')}
          </Link>
        </div>
        <form action={submitProfile} aria-labelledby="profile-heading" className="settings-form" {...validation}>
          <fieldset disabled={profilePending || preferencePending} className="form-stack">
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
            <ProfileHeight key={preferences.height_unit} centimeters={profileValues.height_cm}
              imperial={preferences.height_unit === 'feet'}
              onChange={(height_cm) => setProfileValues({ ...profileValues, height_cm })} />
            <label>
              {t('timeZone')}
              <input name="time_zone" placeholder="America/Argentina/Buenos_Aires" maxLength={80}
                autoCapitalize="none" spellCheck={false} required value={profileValues.time_zone}
                onChange={(event) => setProfileValues({ ...profileValues, time_zone: event.target.value })} />
            </label>
          </fieldset>
          <div className="settings-actions">
            <FormResult status={profileStatus} />
            <SubmitButton disabled={preferencePending} />
          </div>
        </form>
      </section>
      <section className="panel section-panel settings-panel">
        <div className="panel-heading"><h2 id="preferences-heading">{t('preferences')}</h2></div>
        <form ref={preferencesForm} action={submitPreferences} aria-labelledby="preferences-heading" className="settings-form">
          <fieldset disabled={preferencePending || profilePending}>
            <PreferenceFields values={preferenceValues} onChange={setPreferenceValues} />
          </fieldset>
          <div className="settings-actions">
            <FormResult status={preferenceStatus} />
            <SubmitButton disabled={profilePending} />
          </div>
        </form>
      </section>
    </>
  );
}
