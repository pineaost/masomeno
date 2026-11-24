'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { localeCookie, localeCookieOptions, localePath, type Locale } from '@/i18n/config';
import { parsePreferences, parseProfile, type FormStatus } from '@/lib/account-fields';
import { loginPath, readLocale } from '@/lib/auth-paths';
import { verifyAccountSession } from '@/lib/account';
import { authCookieOptions, isAuthCookie, isRecoveryCookie } from '@/lib/supabase/config';
import { requestSupabase } from '@/lib/supabase/server';

async function settingsSession(locale: Locale) {
  const supabase = await requestSupabase({ writable: true });
  if (!supabase) redirect(loginPath(locale, 'unconfigured'));
  const access = await verifyAccountSession(supabase);
  if (access.kind !== 'authenticated') redirect(loginPath(locale, access.kind));
  return { supabase, id: access.id };
}

export async function savePreferences(currentLocale: Locale, _status: FormStatus, fields: FormData): Promise<FormStatus> {
  const locale = readLocale(currentLocale);
  const { supabase, id } = await settingsSession(locale);
  const values = parsePreferences(fields);
  if (!values) return 'invalid';

  const { data, error } = await supabase.from('user_preferences').update(values)
    .eq('user_id', id).select('user_id').maybeSingle();
  if (error || !data) return 'unavailable';

  const jar = await cookies();
  jar.set(localeCookie, values.locale, { ...localeCookieOptions, secure: authCookieOptions.secure });
  revalidatePath(localePath(locale, '/configuracion'));
  if (locale !== values.locale) redirect(localePath(values.locale, '/configuracion'), RedirectType.replace);
  return 'saved';
}

export async function saveProfile(currentLocale: Locale, _status: FormStatus, fields: FormData): Promise<FormStatus> {
  const locale = readLocale(currentLocale);
  const { supabase, id } = await settingsSession(locale);
  const values = parseProfile(fields);
  if (!values) return 'invalid';

  const { data, error } = await supabase.from('profiles').update(values)
    .eq('id', id).select('id').maybeSingle();
  if (error?.code === '23514') return 'invalid';
  if (error || !data) return 'unavailable';

  revalidatePath(localePath(locale, '/configuracion'));
  return 'saved';
}

export async function signOut(currentLocale: Locale) {
  const locale = readLocale(currentLocale);
  const jar = await cookies();
  const supabase = await requestSupabase({ writable: true });
  try {
    await supabase?.auth.signOut({ scope: 'local' });
  } finally {
    for (const { name } of jar.getAll()) {
      if (isAuthCookie(name) || isRecoveryCookie(name)) jar.set(name, '', { ...authCookieOptions, httpOnly: true, maxAge: 0 });
    }
    jar.set(localeCookie, locale, { ...localeCookieOptions, secure: authCookieOptions.secure });
    redirect(loginPath(locale), RedirectType.replace);
  }
}
