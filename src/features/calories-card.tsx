'use client';

import { Flame, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { RecordDialog } from '@/components/tracking-ui';
import { localePath } from '@/i18n/config';
import { readLocale } from '@/lib/auth-paths';
import { summarizeCalories } from '@/lib/calories';
import type { FoodAvailability } from '@/lib/food';
import { setCalorieGoal } from './food-actions';

export function CaloriesCard({ consumed, goal, state = 'ready', live = false }: {
  consumed: number; goal: number | null; state?: FoodAvailability | 'loading'; live?: boolean;
}) {
  const t = useTranslations('calories');
  const food = useTranslations('nutrition');
  const home = useTranslations('home');
  const format = useFormatter();
  const locale = readLocale(useLocale());
  const [editingGoal, setEditingGoal] = useState(false);
  const ready = state === 'ready';
  const summary = ready && goal !== null ? summarizeCalories(consumed, goal) : null;
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  const diary = localePath(locale, '/comidas');

  return (
    <section className="calories-card" aria-labelledby="calories-title">
      <div className="calories-content">
        <div className="calories-top">
          <h2 id="calories-title"><span className="flame-icon"><Flame size={19} aria-hidden /></span>{t('title')}</h2>
          {ready && <span className="estimate">{t('estimate')}</span>}
        </div>
        <div className="calories-total">
          <strong>{ready ? number(consumed) : '—'}</strong>
          {(!ready || goal === null || !live) && <span>{ready && goal !== null ? `/ ${number(goal)} kcal` : 'kcal'}</span>}
          {live && ready && <button type="button" className="calories-goal" onClick={() => setEditingGoal(true)}
            aria-label={goal === null ? food('setGoal') : `${food('editGoal')} · ${number(goal)} kcal`}
            title={goal === null ? undefined : food('editGoal')}>
            {goal === null ? food('setGoal') : `/ ${number(goal)} kcal`}
            <Pencil size={15} aria-hidden />
          </button>}
        </div>
        {summary && goal !== null ? (
          <>
            <div className="calories-track" data-near-goal={summary.percentage >= 90}
              data-over-goal={summary.status === 'over'} role="progressbar" aria-labelledby="calories-title"
              aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(consumed, goal)}
              aria-valuetext={t('summary', { consumed, goal, percentage: summary.percentage })}>
              <div style={{ width: `${summary.fill}%` }} />
            </div>
            <div className="calories-footer">
              <span><strong>{number(Math.abs(summary.difference))} kcal</strong> · {t(summary.status)}</span>
              <strong>{format.number(summary.percentage)}%</strong>
            </div>
          </>
        ) : (
          <>
            <div className="calories-track" aria-hidden />
            {!ready && <p className="calories-footer" role="status">{food(state)}</p>}
          </>
        )}
        {live && <div className="calories-actions">
          {ready && <Link className="button primary" href={`${diary}?registrar=1`} prefetch={false}>
            <Plus size={18} aria-hidden />{home('logMeal')}
          </Link>}
          <Link className="button secondary" href={diary} prefetch={false}>{home('seeMeals')}</Link>
        </div>}
      </div>
      {editingGoal && <RecordDialog title={food('goal')} save={setCalorieGoal.bind(null, locale)} close={() => setEditingGoal(false)}>
        <label>{food('goalInput')}
          <input type="number" name="kcal" inputMode="numeric" min="1" max="10000" step="1" defaultValue={goal ?? ''} />
        </label>
        <p className="section-copy">{food('goalHint')}</p>
      </RecordDialog>}
    </section>
  );
}
