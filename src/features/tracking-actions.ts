'use server';

import { revalidatePath } from 'next/cache';
import { localePath, type Locale } from '@/i18n/config';
import { demoMode } from '@/lib/account';
import { readLocale } from '@/lib/auth-paths';
import { trackingSession } from '@/lib/tracking-data';
import { nextFavoriteSlot, type MutationResult } from '@/lib/tracking';
import {
  isTrackingId, parseExerciseName, parseStrength, parseTreadmill, parseWeighIn, parseWeightGoal,
} from '@/lib/tracking-fields';
import type { DistanceUnit, WeightUnit } from '@/lib/units';

async function writeSession(locale: Locale) {
  return demoMode() ? null : trackingSession(readLocale(locale), true);
}

function refresh(locale: Locale, paths: string[]) {
  for (const path of paths) revalidatePath(localePath(readLocale(locale), path));
}

function finish(locale: Locale, paths: string[], result: { data: unknown; error: { code?: string } | null }): MutationResult {
  if (result.error) return result.error.code === '23514' ? 'invalid' : 'unavailable';
  if (!result.data) return 'conflict';
  refresh(locale, paths);
  return 'saved';
}

const weightPaths = ['', '/evolucion'];
const treadmillPaths = ['/gym', '/gym/cinta'];
const exercisePaths = (id: string) => ['/gym', `/gym/ejercicios/${id}`];

export async function saveWeighIn(locale: Locale, id: string | null, unit: WeightUnit, zone: string, fields: FormData): Promise<MutationResult> {
  if (id !== null && !isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  if (session.weight_unit !== unit || session.timeZone !== zone) return 'conflict';
  const record = parseWeighIn(fields, session.weight_unit, session.timeZone, new Date());
  if (!record) return 'invalid';
  const table = session.supabase.from('weight_measurements');
  const write = id === null ? table.insert(record) : table.update(record).eq('user_id', session.id).eq('id', id);
  return finish(locale, weightPaths, await write.select('id').maybeSingle());
}

export async function deleteWeighIn(locale: Locale, id: string): Promise<MutationResult> {
  if (!isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('weight_measurements').delete().eq('user_id', session.id).eq('id', id)
    .select('id').maybeSingle();
  return finish(locale, weightPaths, result);
}

export async function saveWeightGoal(locale: Locale, unit: WeightUnit, fields: FormData): Promise<MutationResult> {
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  if (session.weight_unit !== unit) return 'conflict';
  const goal = parseWeightGoal(fields, session.weight_unit);
  if (!goal) return 'invalid';
  return finish(locale, weightPaths, await session.supabase.from('profiles').update(goal)
    .eq('id', session.id).select('id').maybeSingle());
}

export async function saveExercise(locale: Locale, id: string | null, fields: FormData): Promise<MutationResult> {
  if (id !== null && !isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const exercise = parseExerciseName(fields);
  if (!exercise) return 'invalid';
  const table = session.supabase.from('exercises');
  const write = id === null ? table.insert(exercise) : table.update(exercise).eq('user_id', session.id).eq('id', id);
  const result = await write.select('id').maybeSingle();
  if (result.error?.code === '23505') return 'duplicate';
  return finish(locale, id === null ? ['/gym'] : exercisePaths(id), result);
}

export async function deleteExercise(locale: Locale, id: string): Promise<MutationResult> {
  if (!isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('exercises').delete().eq('user_id', session.id).eq('id', id)
    .select('id').maybeSingle();
  return finish(locale, ['/gym'], result);
}

export async function favoriteExercise(locale: Locale, id: string, desired: boolean): Promise<MutationResult> {
  if (!isTrackingId(id) || typeof desired !== 'boolean') return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const table = session.supabase.from('exercises');
  const { data, error } = await table.select('id,favorite_slot').eq('user_id', session.id)
    .or(`id.eq.${id},favorite_slot.not.is.null`).limit(5);
  if (error || !data) return 'unavailable';
  const exercise = data.find((entry) => entry.id === id);
  if (!exercise) return 'conflict';
  if (desired === (exercise.favorite_slot !== null)) return 'saved';

  const slot = desired ? nextFavoriteSlot(data) : null;
  if (slot === undefined) return 'favoritesFull';
  const update = table.update({ favorite_slot: slot }).eq('user_id', session.id).eq('id', id);
  const unchanged = exercise.favorite_slot === null
    ? update.is('favorite_slot', null)
    : update.eq('favorite_slot', exercise.favorite_slot);
  const result = await unchanged.select('id').maybeSingle();
  if (result.error?.code === '23505') return 'conflict';
  return finish(locale, exercisePaths(id), result);
}

export async function saveStrength(locale: Locale, exerciseId: string, id: string | null, unit: WeightUnit, fields: FormData): Promise<MutationResult> {
  if (!isTrackingId(exerciseId) || (id !== null && !isTrackingId(id))) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  if (session.weight_unit !== unit) return 'conflict';
  const record = parseStrength(fields, session.weight_unit, session.timeZone, new Date());
  if (!record) return 'invalid';
  const table = session.supabase.from('strength_entries');
  const write = id === null
    ? table.insert({ ...record, exercise_id: exerciseId })
    : table.update(record).eq('user_id', session.id).eq('exercise_id', exerciseId).eq('id', id);
  const result = await write.select('id').maybeSingle();
  if (result.error?.code === '23503') return 'conflict';
  return finish(locale, exercisePaths(exerciseId), result);
}

export async function deleteStrength(locale: Locale, exerciseId: string, id: string): Promise<MutationResult> {
  if (!isTrackingId(exerciseId) || !isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('strength_entries').delete().eq('user_id', session.id)
    .eq('exercise_id', exerciseId).eq('id', id).select('id').maybeSingle();
  return finish(locale, exercisePaths(exerciseId), result);
}

export async function saveTreadmill(locale: Locale, id: string | null, unit: DistanceUnit, fields: FormData): Promise<MutationResult> {
  if (id !== null && !isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  if (session.distance_unit !== unit) return 'conflict';
  const record = parseTreadmill(fields, session.distance_unit, session.timeZone, new Date());
  if (!record) return 'invalid';
  const table = session.supabase.from('treadmill_sessions');
  const write = id === null ? table.insert(record) : table.update(record).eq('user_id', session.id).eq('id', id);
  return finish(locale, treadmillPaths, await write.select('id').maybeSingle());
}

export async function deleteTreadmill(locale: Locale, id: string): Promise<MutationResult> {
  if (!isTrackingId(id)) return 'invalid';
  const session = await writeSession(locale);
  if (!session) return 'unavailable';
  const result = await session.supabase.from('treadmill_sessions').delete().eq('user_id', session.id).eq('id', id)
    .select('id').maybeSingle();
  return finish(locale, treadmillPaths, result);
}
