import { defaultLocale, locales, type Locale } from './config.ts';

export function localizedValue(values: Partial<Record<Locale, string>> | null | undefined, locale: Locale) {
  for (const language of [locale, defaultLocale, ...locales]) {
    const value = values?.[language];
    if (typeof value === 'string' && value.trim()) return { text: value.trim(), language };
  }
  return null;
}

export function localizedText(values: Partial<Record<Locale, string>> | null | undefined, locale: Locale) {
  return localizedValue(values, locale)?.text;
}
