import 'server-only';
import { createServerClient, type CookieMethodsServer, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authCookieName, authCookieOptions, recoveryCookieName, supabaseConfig, type AuthScope } from './config';
import type { Database } from './database';

export function sessionCookieOptions(options: CookieOptions, scope: AuthScope): CookieOptions {
  if (scope !== 'recovery' || options.maxAge === 0) return options;
  return { ...options, maxAge: 900, expires: undefined };
}

export function createServerSupabase(cookies: CookieMethodsServer, scope: AuthScope = 'session') {
  const config = supabaseConfig();
  if (!config) return null;

  return createServerClient<Database>(config.url, config.key, {
    cookies,
    cookieOptions: {
      name: scope === 'recovery' ? recoveryCookieName : authCookieName, ...authCookieOptions, httpOnly: true,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

export async function requestSupabase({ writable = false, scope = 'session' }: { writable?: boolean; scope?: AuthScope } = {}) {
  const jar = await cookies();
  return createServerSupabase({
    getAll: () => jar.getAll(),
    ...(writable && {
      setAll: (updates) => {
        for (const { name, value, options } of updates) jar.set(name, value, sessionCookieOptions(options, scope));
      },
    }),
  }, scope);
}
