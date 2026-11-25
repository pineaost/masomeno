import 'server-only';
import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount, verifyAccountSession } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { requestSupabase } from '@/lib/supabase/server';
import { isTrackingId } from '@/lib/tracking-fields';

export async function trackingSession(locale: Locale, writable = false) {
  const supabase = await requestSupabase({ writable });
  if (!supabase) redirect(loginPath(locale, 'unconfigured'));
  const access = writable ? await verifyAccountSession(supabase) : await requireAccount(locale);
  if (access.kind !== 'authenticated') redirect(loginPath(locale, access.kind));
  const id = access.id;
  const [profile, preferences] = await Promise.all([
    supabase.from('profiles').select('time_zone').eq('id', id).maybeSingle(),
    supabase.from('user_preferences').select('weight_unit,distance_unit').eq('user_id', id).maybeSingle(),
  ]);
  if (profile.error || preferences.error || !profile.data || !preferences.data) return null;
  return { supabase, id, timeZone: profile.data.time_zone, ...preferences.data };
}

async function allRows<Row>(page: (from: number, through: number) => PromiseLike<{ data: Row[] | null; error: unknown }>) {
  const rows: Row[] = [];
  const size = 500;
  for (let start = 0; ; start += size) {
    const { data, error } = await page(start, start + size - 1);
    if (error || !data) return null;
    rows.push(...data);
    if (data.length < size) return rows;
  }
}

async function loadStrengthEntries({ supabase, id }: NonNullable<Awaited<ReturnType<typeof trackingSession>>>, exercises: string[]) {
  if (!exercises.length) return [];
  // A wildcard also reads older installations without the optional repetitions column.
  const entries = await allRows((from, through) => supabase.from('strength_entries').select('*')
    .eq('user_id', id).in('exercise_id', exercises).order('performed_on').order('created_at').order('id').range(from, through));
  return entries?.map(({ id, exercise_id, load_kg, performed_on, repetitions }) =>
    ({ id, exercise_id, load_kg, performed_on, repetitions: repetitions ?? null })) ?? null;
}

export async function loadWeight(locale: Locale) {
  const session = await trackingSession(locale);
  if (!session) return null;
  const { supabase, id, timeZone, weight_unit } = session;
  const [records, profile] = await Promise.all([
    allRows((from, through) => supabase.from('weight_measurements').select('id,weight_kg,measured_at,condition')
      .eq('user_id', id).order('measured_at').order('created_at').order('id').range(from, through)),
    supabase.from('profiles').select('weight_goal_kg').eq('id', id).maybeSingle(),
  ]);
  if (!records || profile.error || !profile.data) return null;
  return { records, goal: profile.data.weight_goal_kg, timeZone, unit: weight_unit };
}

export async function loadGym(locale: Locale) {
  const session = await trackingSession(locale);
  if (!session) return null;
  const { supabase, id, timeZone, weight_unit, distance_unit } = session;
  const [exercises, recent] = await Promise.all([
    allRows((from, through) => supabase.from('exercises').select('id,name,favorite_slot,latest:strength_entries(*)')
      .eq('user_id', id).order('id').range(from, through)
      .order('performed_on', { referencedTable: 'latest', ascending: false })
      .order('created_at', { referencedTable: 'latest', ascending: false })
      .order('id', { referencedTable: 'latest', ascending: false }).limit(1, { referencedTable: 'latest' })),
    supabase.from('treadmill_sessions').select('id,distance_km,duration_seconds,performed_on')
      .eq('user_id', id).order('performed_on', { ascending: false })
      .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(10),
  ]);
  if (!exercises || recent.error || !recent.data) return null;
  return {
    exercises: exercises.map(({ latest, ...exercise }) => ({
      ...exercise,
      latest: latest[0] ? { load_kg: latest[0].load_kg, repetitions: latest[0].repetitions ?? null } : null,
    })),
    runs: recent.data.toReversed(),
    timeZone,
    weightUnit: weight_unit,
    distanceUnit: distance_unit,
  };
}

export async function loadExercise(locale: Locale, exerciseId: string) {
  const session = await trackingSession(locale);
  if (!session) return null;
  if (!isTrackingId(exerciseId)) notFound();
  const { supabase, id, timeZone, weight_unit } = session;
  const [exercise, entries] = await Promise.all([
    supabase.from('exercises').select('id,name,favorite_slot').eq('user_id', id).eq('id', exerciseId).maybeSingle(),
    loadStrengthEntries(session, [exerciseId]),
  ]);
  if (exercise.error || !entries) return null;
  if (!exercise.data) notFound();
  return { exercise: exercise.data, entries, timeZone, unit: weight_unit };
}

export async function loadTreadmill(locale: Locale) {
  const session = await trackingSession(locale);
  if (!session) return null;
  const { supabase, id, timeZone, distance_unit } = session;
  const records = await allRows((from, through) => supabase.from('treadmill_sessions').select('id,distance_km,duration_seconds,performed_on')
    .eq('user_id', id).order('performed_on').order('created_at').order('id').range(from, through));
  return records ? { records, timeZone, unit: distance_unit } : null;
}
