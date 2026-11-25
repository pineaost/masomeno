import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AccountSettings } from '@/features/account-settings';
import { Settings } from '@/features/settings';
import { isLocale } from '@/i18n/config';
import { demoMode, readAccount } from '@/lib/account';
import { savePreferences, saveProfile } from './actions';

export default async function SettingsPage({ params }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  if (demoMode()) return <Settings />;
  const account = await readAccount(locale);
  return <AccountSettings locale={locale} profile={account.profile} preferences={account.preferences}
    saveProfile={saveProfile.bind(null, locale)} savePreferences={savePreferences.bind(null, locale)} />;
}
