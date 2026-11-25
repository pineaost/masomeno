'use client';

import { Pencil, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useOptimistic, useState, useTransition } from 'react';
import { RecordDialog } from '@/components/tracking-ui';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { matchesFoodName, type FoodAvailability } from '@/lib/food';
import { ingredientNameKey, type FridgeFood, type FridgeSelection, type FridgeStatus, type PersonalFridgeIngredient } from '@/lib/recipe-catalog';
import { deletePersonalIngredient, savePersonalIngredient, setFridgeIngredient, setPersonalIngredientStatus } from './food-actions';

function AvailabilityButtons({ name, status, pending, onSelect }: {
  name: string; status: FridgeStatus | null; pending: boolean; onSelect: (value: FridgeStatus | null) => void;
}) {
  const t = useTranslations('fridge');
  const statusId = useId();
  return <div className="periods fridge-status" role="group" aria-label={name} aria-describedby={statusId}>
    <span id={statusId} className="sr-only">{t(status ?? 'unmarked')}</span>
    {(['available', 'unavailable'] as const).map((option) => <button key={option} type="button"
      className={option === 'available' ? 'fridge-primary' : undefined} disabled={pending} aria-pressed={status === option}
      aria-label={t(option === 'available' ? 'availableFood' : 'unavailableFood', { food: name })}
      onClick={() => onSelect(status === option ? null : option)}>{t(option)}</button>)}
  </div>;
}

export function FridgeControls({ locale, id, name, status }: {
  locale: Locale; id: string; name: string; status: FridgeStatus | null;
}) {
  const t = useTranslations('fridge');
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(status);
  const [error, setError] = useState(false);

  function toggle(value: FridgeStatus | null) {
    setError(false);
    startTransition(async () => {
      setSelected(value);
      try {
        setError((await setFridgeIngredient(locale, id, value)) !== 'saved');
      } catch {
        setError(true);
      }
    });
  }

  return <div className="fridge-options">
    <AvailabilityButtons name={name} status={selected} pending={pending} onSelect={toggle} />
    {error && <small role="alert">{t('saveError')}</small>}
  </div>;
}

type Ingredient = { id: string; name: string; category: { id: string; name: string }; match: boolean; personal: boolean };


export function Fridge({ locale, foods, selections, personal, personalState }: {
  locale: Locale;
  foods: FridgeFood[];
  selections: FridgeSelection[];
  personal: PersonalFridgeIngredient[];
  personalState: FoodAvailability;
}) {
  const t = useTranslations('fridge');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const [availableOnly, setAvailableOnly] = useState(false);
  const [editing, setEditing] = useState<{ id: string | null; name: string } | null>(null);
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [marked, setMarked] = useOptimistic(new Map<string, FridgeStatus | null>([
    ...selections.map(({ food_id, status }) => [food_id, status] as const),
    ...personal.map(({ id, status }) => [id, status] as const),
  ]), (state, change: { id: string; status: FridgeStatus | null }) => {
    const next = new Map(state);
    next.set(change.id, change.status);
    return next;
  });

  const key = ingredientNameKey(query);
  const ingredients: Ingredient[] = [
    ...foods.map((food) => ({
      id: food.id, name: localizedText(food.names, locale) ?? t('ingredientName'),
      category: { id: food.category.id, name: localizedText(food.category.names, locale) ?? t('category') },
      match: matchesFoodName(food, query), personal: false,
    })),
    ...personal.map((item) => ({
      id: item.id, name: item.name, category: { id: 'personal', name: t('personal') },
      match: ingredientNameKey(item.name).includes(key), personal: true,
    })),
  ].toSorted((a, b) => a.name.localeCompare(b.name, locale));
  const categories = new Map(foods.map(({ category: item }) => [item.id, localizedText(item.names, locale) ?? t('category')]));
  const available = ingredients.filter(({ id }) => marked.get(id) === 'available');
  const matches = ingredients.filter(({ match }) => match);
  const results = matches.filter((item) => (!category || item.category.id === category) &&
    (!availableOnly || marked.get(item.id) === 'available'));

  function mark(item: Ingredient, status: FridgeStatus | null) {
    setError(false);
    startTransition(async () => {
      setMarked({ id: item.id, status });
      try {
        const save = item.personal ? setPersonalIngredientStatus : setFridgeIngredient;
        setError((await save(locale, item.id, status)) !== 'saved');
      } catch {
        setError(true);
      }
    });
  }

  return <section className="panel section-panel fridge-panel" aria-busy={busy}>
    <div className="fridge-search">
      <label className="search-field">
        <Search size={18} aria-hidden />
        <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
          onChange={(event) => setQuery(event.target.value)} />
      </label>
      <select className="fridge-filter" value={category} aria-label={t('category')}
        onChange={(event) => setCategory(event.target.value)}>
        <option value="">{t('allCategories')}</option>
        {[...categories].sort(([, a], [, b]) => a.localeCompare(b, locale)).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        {personalState === 'ready' && <option value="personal">{t('personal')}</option>}
      </select>
    </div>
    {error && <p className="section-copy" role="alert">{t('saveError')}</p>}
    <div className="fridge-summary">
      <small role="status">{t('availableCount', { count: available.length })}</small>
      <div className="periods" role="group" aria-label={t('statusFilter')}>
        <button type="button" aria-pressed={!availableOnly} onClick={() => setAvailableOnly(false)}>{t('allFoods')}</button>
        <button type="button" aria-pressed={availableOnly} onClick={() => setAvailableOnly(true)}>{t('onlyAvailable')}</button>
      </div>
    </div>
    {results.length ? <ul className="fridge-results">
      {results.map((item) => {
        const status = marked.get(item.id) ?? null;
        return <li key={item.id}>
          <div className="fridge-result">
            <strong>{item.name}</strong>
            <small>{item.category.name}{status === null && <> · {t('unmarked')}</>}</small>
          </div>
          <div className="fridge-row-actions">
            <AvailabilityButtons name={item.name} status={status} pending={busy} onSelect={(value) => mark(item, value)} />
            {item.personal && <button type="button" className="icon-button" disabled={busy}
              aria-label={t('editIngredient', { food: item.name })} onClick={() => setEditing({ id: item.id, name: item.name })}>
              <Pencil size={16} aria-hidden />
            </button>}
          </div>
        </li>;
      })}
    </ul> : <p className="empty-state" role="status">{t(availableOnly && !key && !category ? 'noneAvailable' : 'noResults')}</p>}

    {key && !matches.length && (personalState === 'ready'
      ? <button className="button secondary" type="button" disabled={busy}
        onClick={() => setEditing({ id: null, name: query.trim().slice(0, 80) })}><Plus size={18} aria-hidden />{t('addIngredient')}</button>
      : <p className="section-copy" role="status">{t(personalState === 'pending' ? 'personalPending' : 'loadError')}</p>)}
    {editing && <RecordDialog title={t(editing.id ? 'editTitle' : 'addIngredient')} close={() => setEditing(null)}
      save={savePersonalIngredient.bind(null, locale, editing.id)}
      remove={editing.id ? deletePersonalIngredient.bind(null, locale, editing.id) : undefined}
      removePrompt={t('removeIngredient')} duplicateMessage={t('duplicate')}>
      <label>{t('ingredientName')}
        <input name="name" maxLength={80} defaultValue={editing.name} required />
      </label>
    </RecordDialog>}
  </section>;
}
