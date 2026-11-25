import { isLocale } from '../i18n/config.ts';
import { isCalendarDay, localFormDateTime } from './dates.ts';
import { readTimeZone } from './time-zones.ts';
import type { Preferences, Profile } from './supabase/database';

export type FormStatus = 'idle' | 'saved' | 'invalid' | 'unavailable';

export function parsePreferences(fields: FormData): Preferences | null {
  const locale = fields.get('locale');
  const weight = fields.get('weight_unit');
  const height = fields.get('height_unit');
  const distance = fields.get('distance_unit');
  if (typeof locale !== 'string' || !isLocale(locale)) return null;
  if (weight !== 'kg' && weight !== 'lb') return null;
  if (height !== 'cm' && height !== 'feet') return null;
  if (distance !== 'km' && distance !== 'mi') return null;
  return { locale, weight_unit: weight, height_unit: height, distance_unit: distance };
}

export function parseProfile(fields: FormData): Profile | null {
  const name = fields.get('display_name');
  const day = fields.get('birth_date');
  const height = fields.get('height_cm');
  const zone = fields.get('time_zone');
  if (typeof name !== 'string' || typeof day !== 'string' || typeof height !== 'string' || typeof zone !== 'string') {
    return null;
  }

  const displayName = name.trim();
  const timeZone = readTimeZone(zone.trim());
  const heightCm = height === '' ? null : Number(height);
  if (displayName.length > 100) return null;
  if (!timeZone) return null;
  if (day && (!isCalendarDay(day) || day < '1900-01-01' ||
    day > localFormDateTime(new Date().toISOString(), timeZone).slice(0, 10))) return null;
  if (heightCm !== null && (!/^\d+(\.\d{1,2})?$/.test(height) || heightCm <= 0 || heightCm > 300)) return null;

  return { display_name: displayName || null, birth_date: day || null, height_cm: heightCm, time_zone: timeZone };
}
