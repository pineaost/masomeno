import { isLocale, localePath, type Locale } from '../i18n/config.ts';
import { readRecipeFilter } from './recipe-catalog.ts';
import { isTrackingId } from './tracking-fields.ts';

const pages = ['', '/comidas', '/comidas/recetario', '/comidas/heladera', '/comidas/plan', '/evolucion', '/gym', '/gym/cinta'];
const details = ['/gym/ejercicios/', '/comidas/recetario/'];

export function settingsBackPath(locale: Locale, previous: unknown) {
  const home = localePath(locale);
  if (typeof previous !== 'string' || !previous.startsWith('/') || previous.startsWith('//') || previous.includes('\\')) return home;
  const [path, query] = previous.split('?');
  const [, language, ...segments] = path.split('/');
  if (!isLocale(language)) return home;

  const page = segments.length ? '/' + segments.join('/') : '';
  if (!pages.includes(page) && !details.some((prefix) => page.startsWith(prefix) && isTrackingId(page.slice(prefix.length)))) return home;
  const filter = page === '/comidas/recetario' || page.startsWith('/comidas/recetario/')
    ? readRecipeFilter(new URLSearchParams(query).get('intensidad')) : 'all';
  return localePath(locale, page) + (filter === 'all' ? '' : `?intensidad=${filter}`);
}

export function settingsPath(locale: Locale, previous?: string) {
  const path = localePath(locale, '/configuracion');
  return previous ? `${path}?${new URLSearchParams({ volver: settingsBackPath(locale, previous) })}` : path;
}
