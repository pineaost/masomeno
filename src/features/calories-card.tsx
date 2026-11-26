'use client';

import { Flame, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { RecordDialog } from '@/components/tracking-ui';
import { localePath } from '@/i18n/config';
import { readLocale } from '@/lib/auth-paths';
import { calorieProgress } from '@/lib/calories';
import type { FoodAvailability } from '@/lib/food';
import { setCalorieGoal } from './food-actions';
import { LogMealButton, useFoodDayRefresh, type FoodLogData } from './food-diary';

export function CaloriesCard({ consumed, goal, state = 'ready', live = false, log, refreshAt }: {
  consumed: number; goal: number | null; state?: FoodAvailability | 'loading'; live?: boolean;
  log?: FoodLogData; refreshAt?: string;
}) {
  const t = useTranslations('calories');
  const food = useTranslations('nutrition');
  const home = useTranslations('home');
  const format = useFormatter();
  const locale = readLocale(useLocale());
  const [editingGoal, setEditingGoal] = useState(false);
  const ready = state === 'ready';
  const progress = ready ? calorieProgress(consumed, goal) : null;
  const displayGoal = progress ? goal : null;
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  const range = progress ? t('range', { lower: number(progress.lower), upper: number(progress.upper) }) : '';
  const status = progress && t(progress.status, { kcal: number(progress.distanceToRange) });
  const diary = localePath(locale, '/comidas');
  useFoodDayRefresh(refreshAt);

  return (
    <section className="calories-card" aria-labelledby="calories-title">
      <div className="calories-content">
        <div className="calories-top">
          <h2 id="calories-title"><span className="flame-icon"><Flame size={19} aria-hidden /></span>{t('title')}</h2>
          {ready && <span className="estimate"><span className="estimate-mark" aria-hidden>≈</span>{t('estimate')}</span>}
        </div>
        <div className="calories-total">
          <strong>{ready && Number.isFinite(consumed) && consumed >= 0 ? number(consumed) : '—'}</strong>
          {(!ready || displayGoal === null || !live) && <span>{displayGoal !== null ? `/ ${number(displayGoal)} kcal` : 'kcal'}</span>}
          {live && ready && <button type="button" className="calories-goal" onClick={() => setEditingGoal(true)}
            aria-label={displayGoal === null ? food('setGoal') : `${food('editGoal')} · ${number(displayGoal)} kcal`}
            title={displayGoal === null ? undefined : food('editGoal')}>
            {displayGoal === null ? food('setGoal') : `/ ${number(displayGoal)} kcal`}
            <Pencil size={15} aria-hidden />
          </button>}
        </div>
        {progress && displayGoal !== null ? (
          <>
            <div className="calories-track" role="progressbar" aria-labelledby="calories-title"
              aria-valuemin={0} aria-valuemax={progress.scale} aria-valuenow={progress.visible}
              aria-valuetext={t('summary', { consumed: number(consumed), goal: number(displayGoal),
                percentage: number(progress.percentage) })}>
              <div className="calories-base" style={{ width: `${progress.baseFill}%` }} />
              <div className="calories-zone" style={{ left: `${progress.zoneStart}%`, width: `${progress.zoneWidth}%` }}>
                <div className="calories-zone-fill" style={{ width: `${progress.zoneFill}%` }} />
              </div>
              <div className="calories-excess" style={{ left: `${progress.excessStart}%`, width: `${progress.excessFill}%` }} />
              <span className="calories-marker" style={{ left: `${progress.goalMark}%` }} aria-hidden />
            </div>
            <div className="calories-footer">
              <span>{status}</span>
              <strong>{number(progress.percentage)}%</strong>
            </div>
            <p className="calories-range">{range}</p>
          </>
        ) : (
          <>
            <div className="calories-track" aria-hidden />
            {!ready && <p className="calories-footer" role="status">{food(state)}</p>}
          </>
        )}
        {live && <div className="calories-actions">
          {ready && log && <LogMealButton locale={locale} log={log} />}
          <Link className="button secondary" href={diary} prefetch={false}>{home('seeMeals')}</Link>
        </div>}
      </div>
      {editingGoal && <RecordDialog title={food('goal')} save={setCalorieGoal.bind(null, locale)} close={() => setEditingGoal(false)}>
        <label>{food('goalInput')}
          <input type="number" name="kcal" inputMode="numeric" min="1" max="10000" step="1" defaultValue={displayGoal ?? ''} />
        </label>
        <p className="section-copy">{food('goalHint')}</p>
      </RecordDialog>}
    </section>
  );
}
