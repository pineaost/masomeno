'use client';

import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import {
  matchesFood, maxMealLines, preferredFoodUnit, quickFoodAmounts, usableFood, type CatalogFood, type FoodUnit, type Portion,
} from '@/lib/food';
import { foodDraftNutrition, type FoodDraft, type MealDraftItem } from '@/lib/meal-composition';
import {
  draftRecipeName, preparationNutrition, resolveRecipeDraft, type RecipeForLog,
} from '@/lib/recipe-composition';
import { QuickAmounts, RecipeFields, RecipePicker } from './recipe-composer';

export type ItemEdit = { index: number | null; draft: MealDraftItem };

const preparationOrder = { cooked: 0, prepared: 1, raw: 2 };

export function CatalogPicker({ catalog, locale, onSelect, onEstimate }: {
  catalog: CatalogFood[]; locale: Locale; onSelect: (food: CatalogFood) => void; onEstimate: (food: CatalogFood) => void;
}) {
  const t = useTranslations('nutrition');
  const [query, setQuery] = useState('');
  const foodName = (food: CatalogFood) => localizedText(food.food.names, locale) ?? t('food');
  const groups = new Map<string, { title: string; foods: CatalogFood[] }>();
  for (const food of catalog.filter((item) => matchesFood(item, query)).sort((a, b) =>
    foodName(a).localeCompare(foodName(b), locale) || Number(usableFood(b)) - Number(usableFood(a)) ||
    preparationOrder[a.preparation] - preparationOrder[b.preparation])) {
    const category = food.food.category;
    const group = groups.get(category.id) ?? { title: localizedText(category.names, locale) ?? t('food'), foods: [] };
    group.foods.push(food);
    groups.set(category.id, group);
  }

  return <div className="food-catalog">
    <label className="search-field">
      <Search size={18} aria-hidden />
      <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
    </label>
    {groups.size ? <div className="food-results">
      {[...groups].map(([id, { title, foods }]) => <section key={id}>
        <h3>{title}</h3>
        <ul>{foods.map((food) => <li key={food.id}>
          <button type="button" onClick={() => (usableFood(food) ? onSelect : onEstimate)(food)}>
            <span><strong>{foodName(food)}</strong>
              <small>{localizedText(food.variant_names, locale) ?? t(food.preparation)}{food.is_estimate && <> · {t('estimate')}</>}</small>
            </span>
            <small>{usableFood(food) ? t(preferredFoodUnit(food) === 'g' ? 'grams' : preferredFoodUnit(food) as Portion) : t('manual')}</small>
          </button>
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
  const measures = new Set<FoodUnit>([
    ...(food.portion_unit ? [food.portion_unit] : []), ...Object.keys(food.additional_portions ?? {}) as Portion[],
    ...(historicalUnit && historicalUnit !== 'g' ? [historicalUnit] : []),
  ]);
  return <>
    <div className="food-field-pair">
      <label>{t(unit === 'g' ? 'amountGrams' : 'amount')}
        <input type="number" inputMode="decimal" min=".01" max="10000" step=".01" value={amount}
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
    <QuickAmounts values={quickFoodAmounts(unit)} selected={Number(amount)} onChange={(value) => onChange(String(value), unit)} />
    <div className="food-line-note food-line-heading">
      {unit !== 'g' && grams !== undefined && <small>{t('estimatedWeight', { grams: format.number(grams, { maximumFractionDigits: 2 }) })}</small>}
      {food.source_url && <a className="text-link" href={food.source_url} target="_blank" rel="noreferrer">{t('source')}</a>}
    </div>
  </>;
}

export function mealItemValues(item: MealDraftItem, refs: Map<string, CatalogFood>, recipes: RecipeForLog[]) {
  if (item.type === 'food') {
    const food = refs.get(item.referenceId);
    const result = food && foodDraftNutrition(item, food);
    return result ? { kcal: result.kcal, count: 1 } : null;
  }
  const recipe = recipes.find(({ id }) => id === item.recipe.recipeId);
  const lines = recipe && resolveRecipeDraft(recipe, item.recipe, refs);
  const nutrition = lines && preparationNutrition(lines, refs);
  return lines && nutrition ? { kcal: nutrition.kcal, count: lines.length } : null;
}

export function MealItems({ locale, catalog, recipes, refs, items, edit, picking, source, onItems, onEdit, onPick, onEstimate }: {
  locale: Locale; catalog: CatalogFood[]; recipes: RecipeForLog[]; refs: Map<string, CatalogFood>;
  items: MealDraftItem[]; edit: ItemEdit | null; picking: boolean; source: 'catalog' | 'recipe';
  onItems: (items: MealDraftItem[]) => void; onEdit: (edit: ItemEdit | null) => void; onPick: (value: boolean) => void;
  onEstimate: (food: CatalogFood) => void;
}) {
  const t = useTranslations('nutrition');
  const r = useTranslations('recipes');
  const app = useTranslations('app');
  const format = useFormatter();
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const returnToAdd = useRef(false);
  const active = edit ? edit.index ?? 'new' : null;
  useEffect(() => {
    if (active !== null) heading.current?.focus();
    else if (returnToAdd.current) {
      addButton.current?.focus();
      returnToAdd.current = false;
    }
  }, [active]);
  const amountLabel = (value: string, unit: FoodUnit) => unit === 'g' ? `${number(Number(value))} g`
    : `${number(Number(value))} ${t(unit).toLocaleLowerCase(locale)}`;
  const recipeFor = (id: string) => recipes.find((recipe) => recipe.id === id);
  const itemName = (item: MealDraftItem) => {
    if (item.type === 'food') return localizedText(refs.get(item.referenceId)?.food.names, locale) ?? t('food');
    const recipe = recipeFor(item.recipe.recipeId);
    return localizedText(recipe && draftRecipeName(recipe, item.recipe), locale) ?? r('untitled');
  };
  const itemAmount = (item: MealDraftItem) => {
    if (item.type === 'food') return amountLabel(item.amount, item.unit);
    const unit = recipeFor(item.recipe.recipeId)?.purchase_unit;
    return unit ? amountLabel(String(item.recipe.servings), unit) : r('servings', { count: item.recipe.servings });
  };

  function modify(draft: MealDraftItem) {
    onPick(false);
    onEdit({ index: null, draft });
  }

  function editor() {
    if (!edit) return null;
    const { draft, index } = edit;
    const food = draft.type === 'food' ? refs.get(draft.referenceId) : undefined;
    const recipe = draft.type === 'recipe' ? recipeFor(draft.recipe.recipeId) : undefined;
    const estimate = food && draft.type === 'food' ? foodDraftNutrition(draft, food) : null;
    const result = mealItemValues(draft, refs, recipes);
    const name = itemName(draft);
    const update = (item: MealDraftItem) => onEdit({ index, draft: item });
    function confirm() {
      const next = index === null ? [...items, draft] : items.map((item, i) => i === index ? draft : item);
      onItems(next);
      returnToAdd.current = true;
      onEdit(null);
      onPick(false);
    }

    return <section className="meal-item-editor" aria-label={name}>
      <div className="food-line-heading"><h3 ref={heading} tabIndex={-1}>{name}</h3>{result && <strong>≈ {number(result.kcal)} kcal</strong>}</div>
      {draft.type === 'food' && food && <HouseholdAmount food={food} grams={estimate?.grams} amount={draft.amount} unit={draft.unit}
        onChange={(amount, unit) => update({ ...draft, amount, unit })} />}
      {draft.type === 'recipe' && recipe && <RecipeFields recipe={recipe} draft={draft.recipe} refs={refs} locale={locale}
        update={(recipe) => update({ ...draft, recipe })} />}
      <details className="recipe-options">
        <summary>{draft.role ? t(draft.role) : t('optionalRole')}</summary>
        <div className="periods food-portions" role="group" aria-label={t('optionalRole')}>
          {([undefined, 'main', 'side'] as const).map((role) => <button type="button" key={role ?? 'none'}
            aria-pressed={draft.role === role} onClick={() => update({ ...draft, role })}>{t(role ?? 'noRole')}</button>)}
        </div>
      </details>
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={() => { onEdit(null); if (!items.length) onPick(true); }}>{app('cancel')}</button>
        <button type="button" className="button primary compact-confirm" disabled={!result} onClick={confirm}>
          <Check size={16} aria-hidden />{t('confirmItem')}
        </button>
      </div>
    </section>;
  }

  return <div className="meal-items">
    <input type="hidden" name="mealItems" value={JSON.stringify(items)} />
    {!!items.length && <ul className="meal-items-list">{items.map((item, index) => {
      if (edit?.index === index) return <li key={index}>{editor()}</li>;
      const name = itemName(item);
      const data = mealItemValues(item, refs, recipes);
      return <li key={index} className="meal-item-row">
        <span className="record-row-copy"><strong>{name}</strong>
          <small>{item.role && <>{t(item.role)} · </>}{itemAmount(item)}{data && <> · ≈ {number(data.kcal)} kcal</>}</small>
        </span>
        <div className="food-row-actions">
          <button type="button" className="icon-button" aria-label={t('editItem', { food: name })} disabled={!!edit}
            onClick={() => onEdit({ index, draft: item })}><Pencil size={17} aria-hidden /></button>
          <button type="button" className="icon-button" aria-label={t('removeFood', { food: name })} disabled={!!edit}
            onClick={() => {
              onItems(items.filter((_, position) => position !== index));
              if (items.length === 1) onPick(true);
            }}><Trash2 size={17} aria-hidden /></button>
        </div>
      </li>;
    })}</ul>}
    {edit?.index === null && editor()}
    {!edit && picking && items.length < maxMealLines && (source === 'catalog'
      ? <CatalogPicker catalog={catalog} locale={locale} onSelect={(food) => {
        const unit = preferredFoodUnit(food);
        modify({ type: 'food', referenceId: food.id, unit, amount: unit === 'g' ? '' : '1' } satisfies FoodDraft);
      }} onEstimate={onEstimate} />
      : <RecipePicker recipes={recipes} locale={locale} select={(recipe) => modify({ type: 'recipe', recipe })} />)}
    {!edit && !picking && items.length < maxMealLines && <button type="button" className="button secondary add-meal-item" ref={addButton}
      onClick={() => onPick(true)}><Plus size={17} aria-hidden />{t('addItem')}</button>}
  </div>;
}
