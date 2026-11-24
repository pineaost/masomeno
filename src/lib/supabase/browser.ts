'use client';

import { createBrowserClient } from '@supabase/ssr';
import { authCookieName, authCookieOptions, supabaseConfig } from './config';
import type { Database } from './database';

export function createBrowserSupabase() {
  const config = supabaseConfig();
  if (!config) return null;

  return createBrowserClient<Database>(config.url, config.key, {
    cookieOptions: { name: authCookieName, ...authCookieOptions },
  });
}

export async function googleProviderStatus() {
  const config = supabaseConfig();
  if (!config) return 'unavailable';
  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return 'unavailable';
    const settings = await response.json();
    return settings.external?.google === true ? 'ready' : 'provider';
  } catch {
    return 'unavailable';
  }
}
