import { localFormDateTime, monthsBefore } from './dates.ts';
import { displayDistance, type DistanceUnit } from './units.ts';
import type { StrengthEntry, TreadmillSession, WeightMeasurement } from './supabase/database';

export type MutationResult = 'saved' | 'invalid' | 'unavailable' | 'duplicate' | 'favoritesFull' | 'conflict';
export type TrackingAction = (form: FormData) => Promise<MutationResult>;

export function weightSummary(records: WeightMeasurement[]) {
  if (!records.length) return null;
  const first = records[0].weight_kg;
  const current = records[records.length - 1].weight_kg;
  return { first, current, change: current - first };
}

export function weightPoints(records: WeightMeasurement[], timeZone = 'UTC') {
  const observations = records.toSorted((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at)).map((record) => ({
    day: record.measured_at,
    value: record.weight_kg,
    localDay: localFormDateTime(record.measured_at, timeZone).slice(0, 10),
  }));
  const daily = new Map<string, { sum: number; count: number }>();
  for (const { value, localDay } of observations) {
    const day = daily.get(localDay) ?? { sum: 0, count: 0 };
    daily.set(localDay, { sum: day.sum + value, count: day.count + 1 });
  }

  // Weight each observed calendar day equally within the preceding seven local days.
  const trends = new Map<string, number>();
  let recent: { date: number; value: number }[] = [];
  for (const [day, { sum, count }] of daily) {
    const date = Date.parse(day);
    recent = recent.filter((point) => date - point.date <= 6 * 86400000);
    recent.push({ date, value: sum / count });
    if (recent.length >= 3) trends.set(day, recent.reduce((total, point) => total + point.value, 0) / recent.length);
  }
  return observations.map(({ day, value, localDay }) => ({
    day, value, trend: trends.size >= 2 ? trends.get(localDay) : undefined,
  }));
}

export function weightPeriod(records: WeightMeasurement[], months: number, now: string, timeZone: string) {
  const today = localFormDateTime(now, timeZone).slice(0, 10);
  const cutoff = months ? monthsBefore(today, months) : null;
  const points = weightPoints(cutoff === null ? records : records.filter(({ measured_at }) =>
    localFormDateTime(measured_at, timeZone).slice(0, 10) >= cutoff), timeZone);
  const first = points[0];
  const last = points.at(-1);
  return {
    points,
    change: first && last && points.length >= 2 ? { kg: last.value - first.value, from: first.day, to: last.day } : null,
  };
}

export function strengthSummary(records: StrengthEntry[]) {
  if (!records.length) return null;
  const latest = records[records.length - 1].load_kg;
  const previous = records[records.length - 2]?.load_kg;
  return {
    latest,
    best: records.reduce((max, record) => Math.max(max, record.load_kg), latest),
    change: previous === undefined ? null : latest - previous,
  };
}

type Run = Pick<TreadmillSession, 'distance_km' | 'duration_seconds'>;

export function runMetrics(run: Run, unit: DistanceUnit) {
  const distance = displayDistance(run.distance_km, unit);
  return {
    distance,
    speed: distance * 3600 / run.duration_seconds,
    paceSeconds: run.duration_seconds / distance,
  };
}

export function recentRuns(records: Run[], unit: DistanceUnit) {
  const recent = records.slice(-5);
  if (!recent.length) return null;
  const average = (runs: Run[]) => runMetrics(runs.reduce((total, run) => ({
    distance_km: total.distance_km + run.distance_km,
    duration_seconds: total.duration_seconds + run.duration_seconds,
  }), { distance_km: 0, duration_seconds: 0 }), unit).speed;

  const speed = average(recent);
  const previous = records.slice(-10, -5);
  return { speed, count: recent.length, change: previous.length === 5 ? speed - average(previous) : null };
}

export function clockDuration(seconds: number) {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = String(rounded % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function nextFavoriteSlot(exercises: { favorite_slot: number | null }[]) {
  return [1, 2, 3, 4].find((slot) => !exercises.some((exercise) => exercise.favorite_slot === slot));
}

export function orderExercises<T extends { name: string; favorite_slot: number | null }>(exercises: T[], locale: string) {
  const last = Number.MAX_SAFE_INTEGER;
  return exercises.toSorted((a, b) =>
    (a.favorite_slot ?? last) - (b.favorite_slot ?? last) || a.name.localeCompare(b.name, locale));
}
