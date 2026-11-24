import type { NextRequest } from 'next/server';
import { localeCookie, localePath } from '@/i18n/config';
import { demoMode, initializeAccount } from '@/lib/account';
import { authExchange } from '@/lib/auth-exchange';
import { loginPath, readLocale } from '@/lib/auth-paths';
import { temporaryAuthError } from '@/lib/supabase/access';
import { isVerifierCookie } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  const locale = readLocale(request.cookies.get(localeCookie)?.value);
  const query = request.nextUrl.searchParams;
  const code = query.get('code');
  const { client, discardSession, expire, go } = authExchange(request);

  if (demoMode()) return go(localePath(locale));
  if (query.has('error') || !code) return go(loginPath(locale, 'oauth'));
  if (!client) return go(loginPath(locale, 'unconfigured'));

  const { error } = await client.auth.exchangeCodeForSession(code);
  expire(isVerifierCookie);
  if (error) return go(loginPath(locale, temporaryAuthError(error) ? 'unavailable' : 'oauth'));

  const preferred = await initializeAccount(client, locale);
  if (!preferred) {
    await discardSession();
    return go(loginPath(locale, 'unavailable'));
  }

  return go(localePath(preferred), preferred);
}
