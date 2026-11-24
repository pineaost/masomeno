export const authCookieName = 'masomeno_auth';
export const recoveryCookieName = 'masomeno_recovery';
export type AuthScope = 'session' | 'recovery';
const verifierCookieName = `${authCookieName}-code-verifier`;

export const authCookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

export const authHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } as const;

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key?.startsWith('sb_publishable_')) return null;

  try {
    const parsed = new URL(url);
    if (parsed.origin !== url || (
      parsed.protocol !== 'https:' && !(
        parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname)
      )
    )) return null;
    return { url, key };
  } catch {
    return null;
  }
}

export function isAuthCookie(name: string) {
  return isSessionCookie(name) || isVerifierCookie(name);
}

export function isSessionCookie(name: string) {
  return name.replace(/\.\d+$/, '') === authCookieName;
}

export function isRecoveryCookie(name: string) {
  return name.replace(/\.\d+$/, '') === recoveryCookieName;
}

export function isVerifierCookie(name: string) {
  const base = name.replace(/\.\d+$/, '');
  return base === verifierCookieName || base === `${authCookieName}-flows-code-verifier`
    || (base.startsWith(`${authCookieName}-flow-`) && base.endsWith('-code-verifier'));
}
