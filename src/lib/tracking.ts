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

export function weightPoints(records: WeightMeasurement[]) {
  return records.map((record, index) => ({
    day: record.measured_at,
    value: record.weight_kg,
    trend: records.length >= 5 && index >= 2
      ? (record.weight_kg + records[index - 1].weight_kg + records[index - 2].weight_kg) / 3
      : undefined,
  }));
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
