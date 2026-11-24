export const locales = ['es', 'en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
export const localeCookie = 'masomeno_locale';

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localePath(locale: string, path = '') {
  return `/${locale}${path}`;
}
