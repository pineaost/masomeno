'use client';

import { Check, Minus, Pencil, Plus, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useOptimistic, useState, useTransition } from 'react';
import { RecordDialog } from '@/components/tracking-ui';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { matchesFoodName, type FoodAvailability } from '@/lib/food';
import { ingredientNameKey, type FridgeFood, type FridgeSelection, type FridgeStatus, type PersonalFridgeIngredient } from '@/lib/recipe-catalog';
import { deletePersonalIngredient, savePersonalIngredient, setFridgeIngredient, setPersonalIngredientStatus } from './food-actions';

export function FridgeControls({ locale, id, name, status }: {
  locale: Locale; id: string; name: string; status: FridgeStatus | null;
}) {
  const t = useTranslations('fridge');
  const statusId = useId();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(status);
  const [error, setError] = useState(false);

  function toggle(next: FridgeStatus) {
    const value = selected === next ? null : next;
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
    <div className="periods" role="group" aria-label={name} aria-describedby={statusId} aria-busy={pending}>
      <span id={statusId} className="sr-only">{t(selected ?? 'unmarked')}</span>
      <button type="button" aria-pressed={selected === 'available'} disabled={pending}
        aria-label={t('availableFood', { food: name })} onClick={() => toggle('available')}>{t('available')}</button>
      <button type="button" aria-pressed={selected === 'unavailable'} disabled={pending}
        aria-label={t('unavailableFood', { food: name })} onClick={() => toggle('unavailable')}>{t('unavailable')}</button>
    </div>
    {error && <small role="alert">{t('saveError')}</small>}
  </div>;
}

type Ingredient = { id: string; name: string; category: { id: string; name: string }; match: boolean; personal: boolean };
const pageSize = 8;

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
  const [limit, setLimit] = useState(pageSize);
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
  const results = matches.filter((item) => !category || item.category.id === category);
  const searching = Boolean(key || category);

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
          onChange={(event) => { setQuery(event.target.value); setLimit(pageSize); }} />
      </label>
      <select className="fridge-filter" value={category} aria-label={t('category')}
        onChange={(event) => { setCategory(event.target.value); setLimit(pageSize); }}>
        <option value="">{t('allCategories')}</option>
        {[...categories].sort(([, a], [, b]) => a.localeCompare(b, locale)).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        {personalState === 'ready' && <option value="personal">{t('personal')}</option>}
      </select>
    </div>
    {error && <p className="section-copy" role="alert">{t('saveError')}</p>}
    {available.length > 0 && <section className="fridge-have">
      <h2>{t('availableTitle')}</h2>
      <ul className="fridge-chips">
        {available.map((item) => <li key={item.id}>
          <button type="button" disabled={busy} onClick={() => mark(item, null)}
            aria-label={t('clearAvailable', { food: item.name })} title={t('clearAvailable', { food: item.name })}>
            {item.name}<X size={15} aria-hidden />
          </button>
        </li>)}
      </ul>
    </section>}
    {searching && (results.length ? <ul className="fridge-results">
      {results.slice(0, limit).map((item) => {
        const status = marked.get(item.id);
        const has = status === 'available';
        const statusId = `fridge-status-${item.id}`;
        return <li key={item.id}>
          <button type="button" className="fridge-result" aria-pressed={has} disabled={busy}
            aria-label={t('availableFood', { food: item.name })} aria-describedby={statusId}
            onClick={() => mark(item, has ? null : 'available')}>
            {has ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
            <span><strong>{item.name}</strong><small>{status === 'unavailable' ? t('unavailable') : item.category.name}</small></span>
            <span id={statusId} className="sr-only">{t(status ?? 'unmarked')}</span>
          </button>
          <button type="button" className="icon-button fridge-negative" disabled={busy}
            aria-pressed={status === 'unavailable'} aria-label={t('unavailableFood', { food: item.name })}
            title={t('unavailableFood', { food: item.name })}
            onClick={() => mark(item, status === 'unavailable' ? null : 'unavailable')}>
            <Minus size={19} aria-hidden />
          </button>
          {item.personal && <button type="button" className="icon-button" disabled={busy}
            aria-label={t('editIngredient', { food: item.name })} onClick={() => setEditing({ id: item.id, name: item.name })}>
            <Pencil size={16} aria-hidden />
          </button>}
        </li>;
      })}
    </ul> : <p className="empty-state" role="status">{t('noResults')}</p>)}
    {!searching && !available.length && <p className="section-copy">{t('searchTip')}</p>}
    {searching && results.length > limit &&
      <button className="button secondary" type="button" onClick={() => setLimit(limit + pageSize)}>{t('more')}</button>}
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
