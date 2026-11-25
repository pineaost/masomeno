import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AccountSettings } from '@/features/account-settings';
import { Settings } from '@/features/settings';
import { isLocale } from '@/i18n/config';
import { demoMode, readAccount } from '@/lib/account';
import { settingsBackPath } from '@/lib/settings-paths';
import { savePreferences, saveProfile } from './actions';

export default async function SettingsPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ volver?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const query = await searchParams;
  const backHref = settingsBackPath(locale, query.volver);
  if (demoMode()) return <Settings backHref={backHref} />;
  const account = await readAccount(locale);
  return <AccountSettings locale={locale} profile={account.profile} preferences={account.preferences} backHref={backHref}
    saveProfile={saveProfile.bind(null, locale)} savePreferences={savePreferences.bind(null, locale)} />;
}
