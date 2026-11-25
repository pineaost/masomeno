'use client';

import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { catalogChoices } from '@/lib/catalog-search';
import { foodAmount, packageFractionGrams, preferredFoodUnit, quickFoodAmounts, usableFood,
  type CatalogFood, type FoodUnit, type Portion } from '@/lib/food';

export function QuickAmounts({ values, selected, onChange }: {
  values: number[]; selected: number; onChange: (amount: number) => void;
}) {
  const t = useTranslations('nutrition');
  const format = useFormatter();
  if (!values.length) return null;
  return <div className="periods food-portions" role="group" aria-label={t('quickAmounts')}>
    {values.map((value) => <button key={value} type="button" aria-pressed={selected === value}
      aria-label={t('amountValue', { amount: format.number(value) })} onClick={() => onChange(value)}>
      {value === 0.5 ? '½' : value === 1.5 ? '1½' : format.number(value)}
    </button>)}
  </div>;
}

export function CatalogPicker({ catalog, locale, onSelect, onEstimate, autoFocus }: {
  catalog: CatalogFood[]; locale: Locale; onSelect: (food: CatalogFood) => void; onEstimate?: (food: CatalogFood) => void; autoFocus?: boolean;
}) {
  const t = useTranslations('nutrition');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const variantsId = useId();
  const foodName = (food: CatalogFood) => localizedText(food.food.names, locale) ?? t('food');
  const choices = useMemo(() => catalogChoices(onEstimate ? catalog : catalog.filter(usableFood), query, locale),
    [catalog, query, locale, onEstimate]);
  const groups = new Map<string, { title: string; foods: typeof choices }>();
  for (const choice of choices) {
    const category = choice.primary.food.category;
    const group = groups.get(category.id) ?? { title: localizedText(category.names, locale) ?? t('food'), foods: [] };
    group.foods.push(choice);
    groups.set(category.id, group);
  }
  const foodButton = (food: CatalogFood, showVariant: boolean) =>
    <button type="button" onClick={() => usableFood(food) ? onSelect(food) : onEstimate?.(food)}>
      <span><strong>{foodName(food)}</strong>
        {(showVariant || food.is_estimate) && <small>
          {showVariant && (localizedText(food.variant_names, locale) ?? t(food.preparation))}
          {showVariant && food.is_estimate && ' · '}{food.is_estimate && t('estimate')}
        </small>}
      </span>
      <small>{usableFood(food) ? t(preferredFoodUnit(food) === 'g' ? 'grams' : preferredFoodUnit(food) as Portion) : t('manual')}</small>
    </button>;

  return <div className="food-catalog">
    <label className="search-field">
      <Search size={18} aria-hidden />
      <input type="search" autoFocus={autoFocus} aria-label={t('search')} placeholder={t('search')} value={query}
        onChange={(event) => { setQuery(event.target.value); setExpanded(null); }}
        onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
    </label>
    {groups.size ? <div className="food-results">
      {[...groups].map(([id, { title, foods }]) => <section key={id}>
        <h3>{title}</h3>
        <ul>{foods.map(({ key, primary, variants }) => <li key={key}>
          <div className="food-result-row">
            {foodButton(primary, expanded === key || variants.some((variant) => variant.food.names.es === primary.food.names.es) ||
              (query.trim() !== '' && Boolean(primary.variant_names)))}
            {variants.length > 0 && <button type="button" className="food-variants-toggle"
              aria-label={t('variantsOf', { food: foodName(primary) })} aria-expanded={expanded === key}
              aria-controls={expanded === key ? variantsId : undefined}
              onClick={() => setExpanded(expanded === key ? null : key)}>
              {expanded === key ? <ChevronUp size={17} aria-hidden /> : <ChevronDown size={17} aria-hidden />}
            </button>}
          </div>
          {expanded === key && <ul id={variantsId} className="food-variants">
            {variants.map((food) => <li key={food.id}>{foodButton(food, true)}</li>)}
          </ul>}
        </li>)}</ul>
      </section>)}
    </div> : <p className="empty-state" role="status">{t(catalog.length ? 'noResults' : 'emptyCatalog')}</p>}
  </div>;
}

export function HouseholdAmount({ food, amount, unit, grams, onChange, historicalUnit }: {
  food: CatalogFood; amount: string; unit: FoodUnit; grams: number | undefined;
  onChange: (amount: string, unit: FoodUnit) => void; historicalUnit?: FoodUnit;
}) {
  const t = useTranslations('nutrition');
  const format = useFormatter();
  const [netWeight, setNetWeight] = useState('');
  const biscuit = food.food.category.id === 'biscuits';
  const quickAmounts = biscuit && unit === 'unit' ? [1, 3, 6] : quickFoodAmounts(unit);
  const measures = new Set<FoodUnit>([
    ...(food.portion_unit ? [food.portion_unit] : []), ...Object.keys(food.additional_portions ?? {}) as Portion[],
    ...(historicalUnit && historicalUnit !== 'g' ? [historicalUnit] : []),
  ]);
  return <>
    <div className="food-field-pair">
      <label>{t(unit === 'g' ? 'amountGrams' : 'amount')}
        <input type="text" inputMode="decimal" maxLength={10} value={amount}
          onChange={(event) => onChange(event.target.value, unit)} />
      </label>
      {measures.size > 0 && <label>{t('unit')}
        <select aria-label={t('unit')} value={unit} onChange={(event) => {
          const next = event.target.value as FoodUnit;
          onChange(next === 'g' ? grams === undefined ? '' : String(Number(grams.toFixed(2))) : unit === 'g' ? '1' : amount, next);
        }}>
          {[...measures].map((measure) => <option key={measure} value={measure}>{t(measure === 'g' ? 'grams' : measure)}</option>)}
          <option value="g">{t('grams')}</option>
        </select>
      </label>}
    </div>
    <QuickAmounts values={quickAmounts} selected={foodAmount(amount) ?? 0} onChange={(value) => onChange(String(value), unit)} />
    {biscuit && <details className="recipe-options">
      <summary>{t('packageFraction')}</summary>
      <div className="meal-quantity-controls">
        <label>{t('netPackageWeight')}
          <input type="text" inputMode="decimal" maxLength={10} value={netWeight}
            onChange={(event) => setNetWeight(event.target.value)} onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault();
            }} />
        </label>
        <div className="periods food-portions" role="group" aria-label={t('packageFraction')}>
          {([0.25, 0.5] as const).map((fraction) => {
            const weight = packageFractionGrams(netWeight, fraction);
            return <button key={fraction} type="button" disabled={weight === null}
              aria-pressed={weight !== null && unit === 'g' && foodAmount(amount) === weight}
              onClick={() => { if (weight !== null) onChange(String(weight), 'g'); }}>
              {t(fraction === 0.25 ? 'quarterPackage' : 'halfPackage')}
            </button>;
          })}
        </div>
      </div>
    </details>}
    <div className="food-line-note food-line-heading">
      {unit !== 'g' && grams !== undefined && <small>{t('estimatedWeight', { grams: format.number(grams, { maximumFractionDigits: 2 }) })}</small>}
      {food.source_url && <a className="text-link" href={food.source_url} target="_blank" rel="noreferrer">{t('source')}</a>}
    </div>
  </>;
}
