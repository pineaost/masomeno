'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@/components/dialog';
import { useLocalizedValidation } from '@/i18n/form-validation';
import { isCalendarDay } from '@/lib/dates';
import { parseDecimal } from '@/lib/decimal';
import { useUnit } from '@/lib/preferences';
import { weightInKg } from '@/lib/units';
import { demoDay, mealCategories, type Meal } from './demo-data';
import { useDemo } from './demo-provider';

export function MealDialog({ meal, onClose }: { meal?: Meal; onClose: () => void }) {
  const t = useTranslations('meals');
  const app = useTranslations('app');
  const home = useTranslations('home');
  const validation = useLocalizedValidation();
  const { saveMeal, removeMeal } = useDemo();
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initialName = meal?.sampleName ? t(meal.sampleName) : meal?.name;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name') ?? '').trim();
    const category = mealCategories.find((value) => value === fields.get('category'));
    const rawKcal = String(fields.get('kcal') ?? '');
    const kcal = Number(rawKcal);
    if (!name || !category || !rawKcal || !Number.isInteger(kcal) || kcal < 0 || kcal > 20000) {
      setError(true);
      return;
    }

    const title = meal?.sampleName && name === initialName ? { sampleName: meal.sampleName } : { name };
    saveMeal({ id: meal?.id ?? crypto.randomUUID(), category, kcal, ...title });
    event.currentTarget.closest('dialog')?.close();
  }

  return (
    <Dialog title={meal ? t('editMeal') : home('logMeal')} onClose={onClose}>
      <p className="dialog-note">{app('demoDetail')}</p>
      {confirmDelete && meal ? (
        <div className="form-stack">
          <p role="alert">{app('removeConfirm')}</p>
          <div className="form-actions">
            <button type="button" className="button secondary" onClick={() => setConfirmDelete(false)}>{app('cancel')}</button>
            <button type="button" className="button primary" onClick={(event) => {
              removeMeal(meal.id);
              event.currentTarget.closest('dialog')?.close();
            }}>{app('remove')}</button>
          </div>
        </div>
      ) : (
        <form className="form-stack" onSubmit={submit} {...validation}>
          <label>
            {t('name')}
            <input name="name" defaultValue={initialName} placeholder={t('exampleName')} maxLength={90} required />
          </label>
          <label>
            {t('category')}
            <select name="category" defaultValue={meal?.category ?? 'lunch'}>
              {mealCategories.map((category) => <option key={category} value={category}>{t(category)}</option>)}
            </select>
          </label>
          <label>
            {t('kcal')}
            <input name="kcal" defaultValue={meal?.kcal} inputMode="numeric" type="number" min="0" max="20000" required />
          </label>
          {error && <p role="alert">{app('invalid')}</p>}
          <div className="form-actions">
            {meal && <button type="button" className="button secondary" onClick={() => setConfirmDelete(true)}>{app('remove')}</button>}
            <button type="submit" className="button primary">{app('save')}</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

export function WeightDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('weight');
  const home = useTranslations('home');
  const app = useTranslations('app');
  const validation = useLocalizedValidation();
  const { addWeight } = useDemo();
  const [unit] = useUnit('weight');
  const [error, setError] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = fields.get('weight');
    const amount = typeof value === 'string' ? parseDecimal(value) : null;
    const kg = weightInKg(amount ?? NaN, unit);
    const day = String(fields.get('day') ?? '');
    if (!Number.isFinite(kg) || kg <= 0 || kg > 1000 || !isCalendarDay(day) || day > demoDay) {
      setError(true);
      return;
    }
    addWeight({ id: crypto.randomUUID(), day, kg });
    event.currentTarget.closest('dialog')?.close();
  }

  return (
    <Dialog title={home('logWeight')} onClose={onClose}>
      <p className="dialog-note">{app('demoDetail')}</p>
      <form className="form-stack" onSubmit={submit} {...validation}>
        <label>
          {t('weightInput', { unit })}
          <input name="weight" inputMode="decimal" type="text" maxLength={16} required />
        </label>
        <label>
          {t('date')}
          <input name="day" type="date" max={demoDay} defaultValue={demoDay} required />
        </label>
        {error && <p role="alert">{app('invalid')}</p>}
        <div className="form-actions"><button type="submit" className="button primary">{app('save')}</button></div>
      </form>
    </Dialog>
  );
}
