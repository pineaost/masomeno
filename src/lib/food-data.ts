import 'server-only';
import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { requireAccount, verifyAccountSession } from '@/lib/account';
import { loginPath } from '@/lib/auth-paths';
import { localFoodDay, mealCalories, totalCalories, type CatalogFood, type FoodAvailability, type MealRecord } from '@/lib/food';
import { requestSupabase } from '@/lib/supabase/server';

export async function foodSession(locale: Locale, writable = false) {
  const supabase = await requestSupabase({ writable });
  if (!supabase) redirect(loginPath(locale, 'unconfigured'));
  const access = writable ? await verifyAccountSession(supabase) : await requireAccount(locale);
  if (access.kind !== 'authenticated') redirect(loginPath(locale, access.kind));
  const { data, error } = await supabase.from('profiles').select('time_zone').eq('id', access.id).maybeSingle();
  return error || !data ? null : { supabase, id: access.id, zone: data.time_zone };
}

type Session = NonNullable<Awaited<ReturnType<typeof foodSession>>>;

export function foodAvailability(errors: ({ code?: string } | null)[]): FoodAvailability {
  return errors.some((error) => error && ['42P01', 'PGRST200', 'PGRST205'].includes(error.code ?? '')) ? 'pending'
    : errors.some(Boolean) ? 'unavailable' : 'ready';
}

async function goalOn({ supabase, id }: Session, day: string) {
  return supabase.from('calorie_goals').select('kcal').eq('user_id', id).lte('effective_on', day)
    .order('effective_on', { ascending: false }).limit(1).maybeSingle();
}

function foodRecords({ supabase, id }: Session) {
  return supabase.from('meals').select(
    'id,category,consumed_at,name,manual_kcal,components:meal_components(id,position,food_reference_id,amount,unit,grams_per_unit,kcal_per_100g,kcal)',
  ).eq('user_id', id).order('consumed_at', { ascending: false }).order('id');
}

async function dayRecords(session: Session, start: string, end: string) {
  const meals: MealRecord[] = [];
  const size = 200;
  for (let offset = 0; ; offset += size) {
    const { data, error } = await foodRecords(session).gte('consumed_at', start).lt('consumed_at', end).range(offset, offset + size - 1);
    if (error || !data) return { meals: [], error: error ?? {} };
    meals.push(...data);
    if (data.length < size) return { meals, error: null };
  }
}

export async function loadFoodDay(locale: Locale, includeCatalog = false) {
  const session = await foodSession(locale);
  if (!session) return null;
  const day = localFoodDay(new Date(), session.zone);
  const [goal, records, catalog, recent] = await Promise.all([
    goalOn(session, day.date),
    dayRecords(session, day.start, day.end),
    includeCatalog ? session.supabase.from('food_references').select(
      '*,food:foods!inner(names,synonyms,category:food_categories!inner(id,names))',
    ).order('id') : null,
    includeCatalog ? foodRecords(session).limit(5) : null,
  ]);
  const catalogItems: CatalogFood[] = catalog?.data ?? [];
  return {
    dateTime: day.dateTime, zone: session.zone,
    state: foodAvailability([goal.error, records.error, catalog?.error ?? null]),
    kcal: goal.data?.kcal ?? null, consumed: totalCalories(records.meals.map(mealCalories)),
    meals: records.meals, catalog: catalogItems, recent: recent?.data ?? [],
  };
}
