import 'server-only';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { loginPath, readLocale } from '@/lib/auth-paths';
import { verifyAccess } from '@/lib/supabase/access';
import { isSessionCookie } from '@/lib/supabase/config';
import { createServerSupabase, requestSupabase } from '@/lib/supabase/server';

export function demoMode() {
  return process.env.NODE_ENV === 'development' && process.env.MASOMENO_DEMO_MODE === 'true';
}

export async function verifyAccountSession(client: ReturnType<typeof createServerSupabase>) {
  const expected = (await cookies()).getAll().some(({ name }) => isSessionCookie(name));
  return verifyAccess(client, expected);
}

export const loadAccess = cache(async () => verifyAccountSession(await requestSupabase()));

export async function requireAccount(locale: Locale) {
  const access = await loadAccess();
  if (access.kind !== 'authenticated') redirect(loginPath(locale, access.kind));
  return access;
}

export async function initializeAccount(client: NonNullable<ReturnType<typeof createServerSupabase>>, locale: Locale) {
  const access = await verifyAccess(client);
  if (access.kind !== 'authenticated') return null;

  const initialized = await client.rpc('masomeno_initialize_account', { initial_locale: locale });
  if (initialized.error) return null;

  const { data, error } = await client.from('user_preferences').select('locale').eq('user_id', access.id).maybeSingle();
  return error || !data ? null : readLocale(data.locale);
}

const readProfile = cache(async (id: string) => {
  const supabase = await requestSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('display_name,birth_date,height_cm,time_zone')
    .eq('id', id).maybeSingle();
  return error ? null : data;
});

export async function readAccountName(locale: Locale) {
  const { id } = await requireAccount(locale);
  return (await readProfile(id))?.display_name?.trim() || null;
}

export async function readAccount(locale: Locale) {
  const access = await requireAccount(locale);
  const supabase = await requestSupabase();
  if (!supabase) redirect(loginPath(locale, 'unconfigured'));

  const [profile, preferences] = await Promise.all([
    readProfile(access.id),
    supabase.from('user_preferences').select('locale,weight_unit,height_unit,distance_unit').eq('user_id', access.id).maybeSingle(),
  ]);
  if (preferences.error || !profile || !preferences.data) {
    redirect(loginPath(locale, 'unavailable'));
  }

  return { email: access.email, profile, preferences: preferences.data };
}
