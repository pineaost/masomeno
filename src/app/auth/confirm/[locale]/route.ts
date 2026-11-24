import type { NextRequest } from 'next/server';
import { localePath } from '@/i18n/config';
import { demoMode, initializeAccount } from '@/lib/account';
import { authExchange } from '@/lib/auth-exchange';
import { loginPath, readLocale } from '@/lib/auth-paths';
import { parseEmailLink } from '@/lib/password-auth';
import { temporaryAuthError, verifyAccess } from '@/lib/supabase/access';
import { isVerifierCookie } from '@/lib/supabase/config';

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const locale = readLocale((await params).locale);
  const link = parseEmailLink(request.nextUrl.searchParams);
  const recovery = link?.type === 'recovery';
  const { client, discardSession, expire, go } = authExchange(request, recovery ? 'recovery' : 'session');
  const retryMode = recovery ? 'recover' : 'login';

  if (demoMode()) return go(localePath(locale));
  if (!link) return go(loginPath(locale, 'invalidLink'));
  if (!client) return go(loginPath(locale, 'unconfigured', retryMode));

  const { data, error } = await client.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type });
  expire(isVerifierCookie);
  if (error) return go(loginPath(locale, temporaryAuthError(error) ? 'unavailable' : 'invalidLink', retryMode));
  if (!data.session) return go(loginPath(locale, 'invalidLink', retryMode));

  if (recovery) {
    const access = await verifyAccess(client);
    if (access.kind === 'authenticated') return go(loginPath(locale, undefined, 'reset'), locale);
  } else {
    const preferred = await initializeAccount(client, locale);
    if (preferred) return go(localePath(preferred), preferred);
  }

  await discardSession();
  return go(loginPath(locale, 'unavailable', retryMode));
}
