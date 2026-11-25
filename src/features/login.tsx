'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { languageNames, localeCookie, locales, type Locale } from '@/i18n/config';
import { useLocalizedValidation } from '@/i18n/form-validation';
import { createLocaleHandoff } from '@/i18n/locale-handoff';
import { loginPath, type LoginMode, type LoginNotice } from '@/lib/auth-paths';
import { brandIcons, brandName } from '@/lib/brand';
import type { FormResult } from '@/lib/password-auth';
import { rememberPreference } from '@/lib/preferences';
import { createBrowserSupabase, googleProviderStatus } from '@/lib/supabase/browser';

const titles = { login: 'title', signup: 'signupTitle', recover: 'recoverTitle', reset: 'resetTitle' } as const;
const labels = { login: 'signIn', signup: 'createAccount', recover: 'sendLink', reset: 'savePassword' } as const;
const loginHandoff = createLocaleHandoff<{
  email: string; password?: string; confirmation?: string; result: FormResult; googleError?: LoginNotice;
}>();

export function Login({ locale, mode, initialNotice, enabled, submit }: {
  locale: Locale;
  mode: LoginMode;
  initialNotice?: LoginNotice;
  enabled: boolean;
  submit: (previous: FormResult, fields: FormData) => Promise<FormResult>;
}) {
  const t = useTranslations('auth');
  const app = useTranslations('app');
  const validation = useLocalizedValidation();
  const form = useRef<HTMLFormElement>(null);
  const destination = loginPath(locale, initialNotice, mode);
  const [handoff] = useState(() => loginHandoff.read(destination));
  useEffect(() => loginHandoff.clear(destination), [destination]);
  const [google, setGoogle] = useState<{ pending: boolean; error?: LoginNotice }>({ pending: false, error: handoff?.googleError });
  const [result, action, pending] = useActionState<FormResult, FormData>(submit, handoff?.result ?? 'idle');
  const [email, setEmail] = useState(handoff?.email ?? '');
  const confirmation = result === 'confirmationSent' || result === 'recoveryRequested';
  const newPassword = mode === 'signup' || mode === 'reset';
  const notice = google.error ?? (result === 'idle' && !google.pending ? initialNotice : undefined);
  const busy = google.pending || pending;

  async function signInWithGoogle() {
    setGoogle({ pending: true });
    try {
      const provider = await googleProviderStatus();
      const client = createBrowserSupabase();
      if (!client || provider !== 'ready') {
        setGoogle({ pending: false, error: provider === 'provider' ? 'provider' : 'unavailable' });
        return;
      }

      rememberPreference(localeCookie, locale);
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: new URL('/auth/callback', location.origin).href,
          queryParams: { prompt: 'select_account' },
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) {
        setGoogle({ pending: false, error: 'oauth' });
        return;
      }
      location.assign(data.url);
    } catch {
      setGoogle({ pending: false, error: 'unavailable' });
    }
  }

  return (
    <main className="login-screen">
      <section className="panel login-panel" aria-labelledby="login-title">
        <div className="wordmark">
          <Image src={brandIcons.small.src} width={38} height={38} alt="" />
          <span>{brandName}<span className="wordmark-dot" aria-hidden>.</span></span>
        </div>
        <p className="login-tagline">{app('tagline')}</p>
        <h1 id="login-title">{t(titles[mode])}</h1>
        {notice && <p className="auth-notice" role={notice === 'passwordUpdated' ? 'status' : 'alert'}>{t(notice)}</p>}
        {mode === 'login' && (
          <>
            <button type="button" className="button secondary login-button" disabled={busy || !enabled}
              aria-busy={google.pending} onClick={signInWithGoogle}>
              <Image src="/google-g.png" width={18} height={18} alt="" unoptimized />
              {t(google.pending ? 'pending' : 'continue')}
            </button>
            <p className="auth-divider">{t('orEmail')}</p>
          </>
        )}
        {mode === 'recover' && !confirmation && <p className="auth-intro">{t('recoverIntro')}</p>}
        {result !== 'idle' && <p className="auth-notice" role={confirmation ? 'status' : 'alert'}>{t(result)}</p>}
        {!confirmation && (mode !== 'reset' || enabled) && (
          <form ref={form} action={action} className="auth-form" aria-busy={pending}
            onSubmit={() => setGoogle({ pending: false })} {...validation}>
            <fieldset className="form-stack" disabled={busy || !enabled}>
              {mode !== 'reset' && (
                <label>
                  {t('email')}
                  <input name="email" type="email" autoComplete="email" maxLength={254} required
                    value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
              )}
              {mode !== 'recover' && (
                <label>
                  {t(mode === 'reset' ? 'newPassword' : 'password')}
                  <input name="password" type="password" autoComplete={newPassword ? 'new-password' : 'current-password'}
                    minLength={newPassword ? 8 : undefined} maxLength={newPassword ? 72 : 1024} defaultValue={handoff?.password} required />
                </label>
              )}
              {newPassword && (
                <label>
                  {t('confirmPassword')}
                  <input name="confirm_password" type="password" autoComplete="new-password" minLength={8} maxLength={72}
                    defaultValue={handoff?.confirmation} required />
                </label>
              )}
              <button type="submit" className="button primary">{t(pending ? 'submitting' : labels[mode])}</button>
            </fieldset>
          </form>
        )}
        <div className="auth-links">
          {(mode === 'login' || mode === 'reset') && (
            <Link className="text-link" href={loginPath(locale, undefined, 'recover')}>{t(mode === 'login' ? 'forgot' : 'requestLink')}</Link>
          )}
          {mode === 'login'
            ? <p>{t('noAccount')} <Link className="text-link" href={loginPath(locale, undefined, 'signup')}>{t('createAccount')}</Link></p>
            : <Link className="text-link" href={loginPath(locale)}>{t('backToLogin')}</Link>}
        </div>
        <nav className="login-languages" aria-label={t('languages')}>
          {locales.map((language) => (
            <Link key={language} lang={language} href={loginPath(language, initialNotice, mode)}
              aria-current={language === locale ? 'page' : undefined}
              onNavigate={(event) => {
                if (busy) {
                  event.preventDefault();
                  return;
                }
                rememberPreference(localeCookie, language);
                if (language === locale) return;
                const fields = form.current ? new FormData(form.current) : null;
                loginHandoff.prepare(loginPath(language, initialNotice, mode), {
                  email, result, googleError: google.error,
                  password: fields?.get('password')?.toString(),
                  confirmation: fields?.get('confirm_password')?.toString(),
                });
              }}>
              {languageNames[language]}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
