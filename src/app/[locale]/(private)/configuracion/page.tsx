import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { AccountSettings } from '@/features/account-settings';
import { Settings } from '@/features/settings';
import { isLocale, localePath } from '@/i18n/config';
import { demoMode, readAccount } from '@/lib/account';
import { loadCalorieGoal } from '@/lib/food-data';
import { setCalorieGoal } from '@/features/food-actions';
import { isTrackingId } from '@/lib/tracking-fields';
import { savePreferences, saveProfile } from './actions';

export default async function SettingsPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ volver?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  if (demoMode()) return <Settings />;
  const [account, goal, query] = await Promise.all([readAccount(locale), loadCalorieGoal(locale), searchParams]);
  const home = localePath(locale);
  const previous = typeof query.volver === 'string' ? query.volver : '';
  const exercises = home + '/gym/ejercicios/';
  const recipeDetails = home + '/comidas/recetario/';
  const permitted = ['', '/comidas', '/comidas/recetario', '/comidas/heladera', '/comidas/plan', '/evolucion', '/gym', '/gym/cinta']
    .some((path) => previous === home + path) ||
    [exercises, recipeDetails].some((prefix) => previous.startsWith(prefix) && isTrackingId(previous.slice(prefix.length)));
  return <AccountSettings profile={account.profile} preferences={account.preferences} goal={goal}
    backHref={permitted ? previous : home} saveGoal={setCalorieGoal.bind(null, locale)}
    saveProfile={saveProfile.bind(null, locale)} savePreferences={savePreferences.bind(null, locale)} />;
}
