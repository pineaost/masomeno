export const locales = ['es', 'en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const languageNames = { es: 'Español', en: 'English', it: 'Italiano' } as const;
export const defaultLocale: Locale = 'es';
export const localeCookie = 'masomeno_locale';
export const localeCookieOptions = { path: '/', sameSite: 'lax', maxAge: 31536000 } as const;

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localePath(locale: string, path = '') {
  return `/${locale}${path}`;
}
