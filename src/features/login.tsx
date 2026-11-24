'use client';

import { LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { languageNames, localeCookie, locales, type Locale } from '@/i18n/config';
import { loginPath, type LoginMode, type LoginNotice } from '@/lib/auth-paths';
import { brandIcons } from '@/lib/brand';
import type { FormResult } from '@/lib/password-auth';
import { rememberPreference } from '@/lib/preferences';
import { createBrowserSupabase, googleProviderStatus } from '@/lib/supabase/browser';

const titles = { login: 'title', signup: 'signupTitle', recover: 'recoverTitle', reset: 'resetTitle' } as const;
const labels = { login: 'signIn', signup: 'createAccount', recover: 'sendLink', reset: 'savePassword' } as const;

export function Login({ locale, mode, initialNotice, enabled, submit }: {
  locale: Locale;
  mode: LoginMode;
  initialNotice?: LoginNotice;
  enabled: boolean;
  submit: (previous: FormResult, fields: FormData) => Promise<FormResult>;
}) {
  const t = useTranslations('auth');
  const app = useTranslations('app');
  const [google, setGoogle] = useState<{ pending: boolean; error?: LoginNotice }>({ pending: false });
  const [result, action, pending] = useActionState<FormResult, FormData>(submit, 'idle');
  const [email, setEmail] = useState('');
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
          <span>masomeno.</span>
        </div>
        <p className="login-tagline">{app('tagline')}</p>
        <h1 id="login-title">{t(titles[mode])}</h1>
        {notice && <p className="auth-notice" role={notice === 'passwordUpdated' ? 'status' : 'alert'}>{t(notice)}</p>}
        {mode === 'login' && (
          <>
            <button type="button" className="button secondary login-button" disabled={busy || !enabled}
              aria-busy={google.pending} onClick={signInWithGoogle}>
              <LogIn size={19} aria-hidden />{t(google.pending ? 'pending' : 'continue')}
            </button>
            <p className="auth-divider">{t('orEmail')}</p>
          </>
        )}
        {mode === 'recover' && !confirmation && <p className="auth-intro">{t('recoverIntro')}</p>}
        {result !== 'idle' && <p className="auth-notice" role={confirmation ? 'status' : 'alert'}>{t(result)}</p>}
        {!confirmation && (mode !== 'reset' || enabled) && (
          <form action={action} className="auth-form" aria-busy={pending} onSubmit={() => setGoogle({ pending: false })}>
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
                    minLength={newPassword ? 8 : undefined} maxLength={newPassword ? 72 : 1024} required />
                </label>
              )}
              {newPassword && (
                <label>
                  {t('confirmPassword')}
                  <input name="confirm_password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
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
              onClick={() => rememberPreference(localeCookie, language)}>
              {languageNames[language]}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
