'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { localeCookie, localeCookieOptions, localePath, type Locale } from '@/i18n/config';
import { demoMode, initializeAccount } from '@/lib/account';
import { emailReturnUrl, loginPath, readLocale, readLoginMode, type LoginMode } from '@/lib/auth-paths';
import { authFormError, validateAuthForm, type FormResult } from '@/lib/password-auth';
import { verifyAccess } from '@/lib/supabase/access';
import { authCookieOptions, isAuthCookie, isRecoveryCookie, type AuthScope } from '@/lib/supabase/config';
import { requestSupabase } from '@/lib/supabase/server';

async function rememberLocale(locale: Locale) {
  const jar = await cookies();
  jar.set(localeCookie, locale, { ...localeCookieOptions, secure: authCookieOptions.secure });
}

async function discardSession(client: NonNullable<Awaited<ReturnType<typeof requestSupabase>>>, scope: AuthScope) {
  try {
    await client.auth.signOut({ scope: 'local' });
  } catch {
    // Clear the local session even if Supabase is unavailable.
  }
  const jar = await cookies();
  const predicate = scope === 'recovery' ? isRecoveryCookie : isAuthCookie;
  for (const { name } of jar.getAll()) {
    if (predicate(name)) jar.set(name, '', { ...authCookieOptions, httpOnly: true, maxAge: 0 });
  }
}

export async function submitAuth(currentLocale: Locale, requestedMode: LoginMode, _previous: FormResult, fields: FormData): Promise<FormResult> {
  const locale = readLocale(currentLocale);
  const mode = readLoginMode(requestedMode);
  const form = validateAuthForm(mode, fields);
  if ('error' in form && form.error) return form.error;
  if (demoMode()) return 'unconfigured';
  const scope = mode === 'reset' ? 'recovery' : 'session';
  const client = await requestSupabase({ writable: true, scope });
  if (!client) return 'unconfigured';

  if (mode === 'reset') {
    const access = await verifyAccess(client);
    if (access.kind === 'unavailable') return 'unavailable';
    if (access.kind !== 'authenticated') return 'invalidLink';

    const { error } = await client.auth.updateUser({ password: form.password });
    if (error) return authFormError(mode, error);
    await discardSession(client, scope);
    await rememberLocale(locale);
    redirect(loginPath(locale, 'passwordUpdated'), RedirectType.replace);
  }

  if (mode === 'login') {
    const { error } = await client.auth.signInWithPassword({ email: form.email, password: form.password });
    if (error) return authFormError(mode, error);

    const preferred = await initializeAccount(client, locale);
    if (!preferred) {
      await discardSession(client, scope);
      return 'unavailable';
    }
    await rememberLocale(preferred);
    redirect(localePath(preferred), RedirectType.replace);
  }

  const returnUrl = emailReturnUrl(locale);
  if (!returnUrl) return 'unconfigured';
  await rememberLocale(locale);

  if (mode === 'recover') {
    try {
      await client.auth.resetPasswordForEmail(form.email, { redirectTo: returnUrl });
    } catch {
      // Use the same acknowledgement regardless of whether the email can be sent.
    }
    return 'recoveryRequested';
  }

  const { data, error } = await client.auth.signUp({
    email: form.email,
    password: form.password,
    options: { emailRedirectTo: returnUrl },
  });
  if (error) return authFormError(mode, error);
  if (data.session) {
    await discardSession(client, scope);
    return 'unavailable';
  }
  return 'confirmationSent';
}
