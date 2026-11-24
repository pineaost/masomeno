import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Login } from '@/features/login';
import { isLocale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readLoginMode, readLoginNotice } from '@/lib/auth-paths';
import { verifyAccess } from '@/lib/supabase/access';
import { supabaseConfig } from '@/lib/supabase/config';
import { requestSupabase } from '@/lib/supabase/server';
import { submitAuth } from './actions';

export default async function LoginPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ estado?: string | string[]; modo?: string | string[] }>;
}) {
  const [{ locale }, { estado, modo }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const mode = readLoginMode(modo);
  const configured = Boolean(supabaseConfig()) && !demoMode();
  const recovery = mode === 'reset' && configured
    ? await verifyAccess(await requestSupabase({ scope: 'recovery' })) : null;
  const notice = !configured ? 'unconfigured'
    : recovery && recovery.kind !== 'authenticated'
      ? recovery.kind === 'unavailable' ? 'unavailable' : 'invalidLink'
      : readLoginNotice(estado);

  return <Login key={`${locale}:${mode}:${notice ?? ''}`} locale={locale} mode={mode} initialNotice={notice}
    enabled={configured && (mode !== 'reset' || recovery?.kind === 'authenticated')}
    submit={submitAuth.bind(null, locale, mode)} />;
}
