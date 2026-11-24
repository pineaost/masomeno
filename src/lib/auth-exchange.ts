import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { localeCookie, localeCookieOptions, type Locale } from '@/i18n/config';
import { authCookieOptions, authHeaders, isAuthCookie, isRecoveryCookie, type AuthScope } from '@/lib/supabase/config';
import { createServerSupabase, sessionCookieOptions } from '@/lib/supabase/server';

export function authExchange(request: NextRequest, scope: AuthScope = 'session') {
  const response = new NextResponse(null, { status: 303, headers: authHeaders });
  const seen = new Set(request.cookies.getAll().map(({ name }) => name));
  const client = createServerSupabase({
    getAll: () => request.cookies.getAll(),
    setAll: (updates) => {
      for (const { name, value, options } of updates) {
        seen.add(name);
        request.cookies.set(name, value);
        response.cookies.set(name, value, sessionCookieOptions(options, scope));
      }
    },
  }, scope);

  function expire(predicate: (name: string) => boolean) {
    for (const name of seen) {
      if (predicate(name)) response.cookies.set(name, '', { ...authCookieOptions, httpOnly: true, maxAge: 0 });
    }
  }

  async function discardSession() {
    try {
      await client?.auth.signOut({ scope: 'local' });
    } catch {
      // The browser cookies can still be cleared if Supabase is unavailable.
    }
    expire(scope === 'recovery' ? isRecoveryCookie : isAuthCookie);
  }

  function go(path: string, locale?: Locale) {
    if (locale) response.cookies.set(localeCookie, locale, { ...localeCookieOptions, secure: authCookieOptions.secure });
    response.headers.set('Location', path);
    return response;
  }

  return { client, expire, discardSession, go };
}
