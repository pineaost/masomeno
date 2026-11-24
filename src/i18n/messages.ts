import 'server-only';
import type { Locale } from './config';
import type Spanish from './es.json';

type Messages = typeof Spanish;

const loaders = {
  es: () => import('./es.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
  it: () => import('./it.json').then((module) => module.default),
} satisfies Record<Locale, () => Promise<Messages>>;

export function getMessages(locale: Locale) {
  return loaders[locale]();
}
