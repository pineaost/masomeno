'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useOptimistic, useState, useTransition } from 'react';
import type { Locale } from '@/i18n/config';
import { matchesFoodName, type FoodNames } from '@/lib/food';
import type { FridgeFood, FridgeSelection, FridgeStatus } from '@/lib/recipe-catalog';
import { setFridgeIngredient } from './food-actions';

export function FridgeControls({ locale, id, name, status }: {
  locale: Locale; id: string; name: string; status: FridgeStatus | null;
}) {
  const t = useTranslations('fridge');
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
    <div className="periods" role="group" aria-label={name} aria-busy={pending}>
      <button type="button" aria-pressed={selected === 'available'} disabled={pending}
        aria-label={t('availableFood', { food: name })} onClick={() => toggle('available')}>{t('available')}</button>
      <button type="button" aria-pressed={selected === 'unavailable'} disabled={pending}
        aria-label={t('unavailableFood', { food: name })} onClick={() => toggle('unavailable')}>{t('unavailable')}</button>
    </div>
    {error && <small role="alert">{t('saveError')}</small>}
  </div>;
}

export function Fridge({ locale, foods, selections }: { locale: Locale; foods: FridgeFood[]; selections: FridgeSelection[] }) {
  const t = useTranslations('fridge');
  const [query, setQuery] = useState('');
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const sections = new Map<string, { names: FoodNames; items: FridgeFood[] }>();
  const visible = foods.filter((food) => matchesFoodName(food, query))
    .toSorted((a, b) => a.names[locale].localeCompare(b.names[locale], locale));
  for (const food of visible) {
    const group = sections.get(food.category.id) ?? { names: food.category.names, items: [] };
    group.items.push(food);
    sections.set(food.category.id, group);
  }

  return <section className="panel section-panel fridge-panel">
    <label className="search-field">
      <Search size={18} aria-hidden />
      <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
        onChange={(event) => setQuery(event.target.value)} />
    </label>
    <p className="section-copy">{t('hint')}</p>
    {[...sections].map(([id, { names, items }]) => <section className="fridge-category" key={id}>
      <h2>{names[locale]}</h2>
      <ul className="compact-food-list">
        {items.map((food) => <li key={food.id}>
          <strong>{food.names[locale]}</strong>
          <FridgeControls locale={locale} id={food.id} name={food.names[locale]} status={selected.get(food.id) ?? null} />
        </li>)}
      </ul>
    </section>)}
    {!sections.size && <p className="empty-state" role="status">{t(foods.length ? 'noResults' : 'empty')}</p>}
  </section>;
}
