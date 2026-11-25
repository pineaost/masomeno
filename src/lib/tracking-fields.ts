import { Temporal } from '@js-temporal/polyfill';
import { isCalendarDay, localFormDateTime } from './dates.ts';
import { distanceInKm, weightInKg, type DistanceUnit, type WeightUnit } from './units.ts';

export function isTrackingId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function readText(fields: FormData, key: string) {
  const value = fields.get(key);
  return typeof value === 'string' ? value.trim() : null;
}

function decimal(value: string | null) {
  return value !== null && /^\d+(?:\.\d{1,5})?$/.test(value) ? Number(value) : NaN;
}

function round(value: number, digits: number) {
  return Number(value.toFixed(digits));
}

function weightValue(value: string | null, unit: WeightUnit, min: number, max: number) {
  const kg = round(weightInKg(decimal(value), unit), 3);
  return Number.isFinite(kg) && kg >= min && kg <= max ? kg : null;
}

export function measuredInstant(value: string | null, timeZone: string, now: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  try {
    const wallTime = Temporal.PlainDateTime.from(value);
    const zoned = wallTime.toZonedDateTime(timeZone, { disambiguation: 'earlier' });
    const instant = zoned.toInstant();
    if (!zoned.toPlainDateTime().equals(wallTime) ||
      instant.epochMilliseconds < Date.UTC(1900, 0, 1) || instant.epochMilliseconds > now.valueOf()) return null;
    return instant.toString();
  } catch {
    return null;
  }
}

export function parseWeighIn(fields: FormData, unit: WeightUnit, timeZone: string, now: Date, existingTime?: string) {
  const weight_kg = weightValue(readText(fields, 'weight'), unit, 0.001, 1000);
  const localTime = readText(fields, 'measured_at');
  const measured_at = existingTime && localTime === localFormDateTime(existingTime, timeZone)
    ? existingTime : measuredInstant(localTime, timeZone, now);
  const condition = readText(fields, 'condition');
  if (weight_kg === null || !measured_at || condition === null || condition.length > 100) return null;
  return { weight_kg, measured_at, condition: condition || null };
}

export function parseWeightGoal(fields: FormData, unit: WeightUnit) {
  const input = readText(fields, 'weight');
  const kg = input === '' ? null : weightValue(input, unit, 0.001, 1000);
  return input === '' || kg !== null ? { weight_goal_kg: kg } : null;
}

export function parseExerciseName(fields: FormData) {
  const name = readText(fields, 'name');
  return name && name.length <= 80 ? { name } : null;
}

function performedDay(fields: FormData, timeZone: string, now: Date) {
  const day = readText(fields, 'performed_on');
  const today = localFormDateTime(now.toISOString(), timeZone).slice(0, 10);
  return day && isCalendarDay(day) && day >= '1900-01-01' && day <= today ? day : null;
}

export function parseStrength(fields: FormData, unit: WeightUnit, timeZone: string, now: Date) {
  const load_kg = weightValue(readText(fields, 'load'), unit, 0, 2000);
  const performed_on = performedDay(fields, timeZone, now);
  const reps = readText(fields, 'repetitions');
  if (load_kg === null || !performed_on || (fields.has('repetitions') && reps === null) ||
    (reps && !/^[1-9]\d{0,2}$/.test(reps))) return null;
  return { load_kg, performed_on, ...(reps === null ? {} : { repetitions: reps === '' ? null : Number(reps) }) };
}

export function parseTreadmill(fields: FormData, unit: DistanceUnit, timeZone: string, now: Date) {
  const distance_km = round(distanceInKm(decimal(readText(fields, 'distance')), unit), 4);
  const minuteText = readText(fields, 'minutes');
  const secondText = readText(fields, 'seconds');
  const performed_on = performedDay(fields, timeZone, now);
  if (!minuteText || !secondText || !/^\d{1,4}$/.test(minuteText) || !/^\d{1,2}$/.test(secondText)) return null;
  const seconds = Number(secondText);
  const duration_seconds = Number(minuteText) * 60 + seconds;
  if (!Number.isFinite(distance_km) || distance_km <= 0 || distance_km > 500 ||
    seconds > 59 || duration_seconds < 1 || duration_seconds > 86400 || !performed_on) return null;
  return { distance_km, duration_seconds, performed_on };
}
