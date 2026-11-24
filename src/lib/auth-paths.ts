import { defaultLocale, isLocale, localePath, type Locale } from '../i18n/config.ts';

const modes = ['signup', 'recover', 'reset'] as const;
export type LoginMode = 'login' | (typeof modes)[number];
const notices = ['unavailable', 'unconfigured', 'provider', 'oauth', 'expired', 'invalidLink', 'passwordUpdated'] as const;
export type LoginNotice = (typeof notices)[number];

export function readLocale(value: unknown): Locale {
  return typeof value === 'string' && isLocale(value) ? value : defaultLocale;
}

export function readLoginNotice(value: unknown): LoginNotice | undefined {
  return notices.find((notice) => notice === value);
}

export function readLoginMode(value: unknown): LoginMode {
  return modes.find((mode) => mode === value) ?? 'login';
}

export function loginPath(locale: Locale, reason?: LoginNotice | 'anonymous', mode: LoginMode = 'login') {
  const query = new URLSearchParams();
  if (mode !== 'login') query.set('modo', mode);
  const notice = readLoginNotice(reason);
  if (notice) query.set('estado', notice);
  return localePath(locale, query.size ? `/login?${query}` : '/login');
}

type SiteEnvironment = Partial<Record<
  'MASOMENO_SITE_URL' | 'NODE_ENV' | 'VERCEL_ENV' | 'VERCEL_PROJECT_PRODUCTION_URL' | 'VERCEL_URL', string
>>;

export function emailReturnUrl(locale: Locale, env: SiteEnvironment = process.env) {
  const preview = env.VERCEL_ENV === 'preview';
  const production = env.VERCEL_ENV === 'production';
  const local = env.NODE_ENV === 'development' && !preview && !production;
  const vercelHost = production ? env.VERCEL_PROJECT_PRODUCTION_URL : preview ? env.VERCEL_URL : undefined;
  const origin = env.MASOMENO_SITE_URL?.trim() || (vercelHost ? `https://${vercelHost}` : local ? 'http://localhost:3000' : '');

  try {
    const url = new URL(origin);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((!local && loopback) || (url.protocol !== 'https:' && !(local && loopback && url.protocol === 'http:')) ||
      url.href !== `${url.origin}/`) return null;
    return new URL(`/auth/confirm/${locale}`, url).href;
  } catch {
    return null;
  }
}
