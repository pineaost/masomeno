'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import {
  foodAmount, maxMealLines, preferredFoodUnit, quickFoodAmounts,
  type CatalogFood, type FoodUnit,
} from '@/lib/food';
import { foodDraftNutrition, repeatedNutrition, type FoodDraft, type MealDraftItem } from '@/lib/meal-composition';
import {
  draftRecipeName, preparationNutrition, resolveRecipeDraft, type RecipeForLog,
} from '@/lib/recipe-composition';
import { CatalogPicker, HouseholdAmount, QuickAmounts } from './food-picker';
import { RecipeFields, RecipePicker } from './recipe-composer';

export type ItemEdit = { index: number | null; draft: MealDraftItem; ingredientOpen?: boolean };

export function mealItemValues(item: MealDraftItem, refs: Map<string, CatalogFood>, recipes: RecipeForLog[]) {
  if (item.type === 'repeat') return repeatedNutrition(item);
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

export function MealItems({ locale, catalog, recipes, refs, items, effectiveItems, lineCount, edit, picking, source, onItems, onEdit, onPick, onEstimate }: {
  locale: Locale; catalog: CatalogFood[]; recipes: RecipeForLog[]; refs: Map<string, CatalogFood>;
  items: MealDraftItem[]; effectiveItems: MealDraftItem[]; lineCount: number; edit: ItemEdit | null; picking: boolean; source: 'catalog' | 'recipe';
  onItems: (items: MealDraftItem[]) => void; onEdit: (edit: ItemEdit | null) => void; onPick: (value: boolean) => void;
  onEstimate: (food: CatalogFood) => void;
}) {
  const t = useTranslations('nutrition');
  const r = useTranslations('recipes');
  const app = useTranslations('app');
  const format = useFormatter();
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const confirmedIndex = useRef<number | null>(null);
  const active = edit ? edit.index ?? 'new' : null;
  const editResult = edit && mealItemValues(edit.draft, refs, recipes);
  const canConfirm = !!editResult && !edit?.ingredientOpen && lineCount <= maxMealLines;
  useEffect(() => {
    if (active !== null) {
      heading.current?.focus();
    } else if (confirmedIndex.current !== null) {
      list.current?.children[confirmedIndex.current]?.querySelector('button')?.focus();
      confirmedIndex.current = null;
    }
  }, [active]);
  const amountLabel = (value: string, unit: FoodUnit) => unit === 'g' ? `${number(foodAmount(value, 100000) ?? 0)} g`
    : `${number(foodAmount(value, 100000) ?? 0)} ${t(unit).toLocaleLowerCase(locale)}`;
  const recipeFor = (id: string) => recipes.find((recipe) => recipe.id === id);
  const itemName = (item: MealDraftItem) => {
    if (item.type === 'repeat') {
      if ('ingredients' in item.original) return item.original.name;
      return localizedText(refs.get(item.original.food_reference_id)?.food.names, locale) ?? item.original.food_reference_id;
    }
    if (item.type === 'food') return localizedText(refs.get(item.referenceId)?.food.names, locale) ?? t('food');
    const recipe = recipeFor(item.recipe.recipeId);
    return localizedText(recipe && draftRecipeName(recipe, item.recipe), locale) ?? r('untitled');
  };
  const itemAmount = (item: MealDraftItem) => {
    if (item.type === 'repeat') {
      const unit = 'ingredients' in item.original ? item.original.measureUnit : item.original.unit;
      return unit ? amountLabel(item.amount, unit) : r('servings', { count: foodAmount(item.amount) ?? 0 });
    }
    if (item.type === 'food') return amountLabel(item.amount, item.unit);
    const unit = recipeFor(item.recipe.recipeId)?.purchase_unit;
    return unit ? amountLabel(String(item.recipe.servings), unit) : r('servings', { count: item.recipe.servings });
  };

  function modify(draft: MealDraftItem) {
    onPick(false);
    onEdit({ index: null, draft });
  }

  function confirmPreparation(openPicker: boolean) {
    if (edit) {
      if (!canConfirm) return;
      if (!openPicker) confirmedIndex.current = edit.index ?? items.length;
      onItems(effectiveItems);
      onEdit(null);
    }
    onPick(openPicker);
  }

  function editor() {
    if (!edit) return null;
    const { draft, index } = edit;
    const food = draft.type === 'food' ? refs.get(draft.referenceId) : undefined;
    const recipe = draft.type === 'recipe' ? recipeFor(draft.recipe.recipeId) : undefined;
    const estimate = food && draft.type === 'food' ? foodDraftNutrition(draft, food) : null;
    const name = itemName(draft);
    const variant = localizedText(food?.variant_names, locale);
    const update = (item: MealDraftItem, ingredientOpen = edit.ingredientOpen) => onEdit({ index, draft: item, ingredientOpen });
    const saved = draft.type === 'repeat' ? draft.original : null;
    const savedUnit = saved && ('ingredients' in saved ? saved.measureUnit : saved.unit);
    return <section className="meal-item-editor" aria-label={name}>
      <div className="food-line-heading">
        <div><h3 ref={heading} tabIndex={-1}>{name}</h3>{variant && <small>{variant}</small>}</div>
        <strong aria-live="polite">{editResult && <>≈ {number(editResult.kcal)} kcal</>}</strong>
      </div>
      {draft.type === 'food' && food && <HouseholdAmount food={food} grams={estimate?.grams} amount={draft.amount} unit={draft.unit}
        onChange={(amount, unit) => update({ ...draft, amount, unit })} />}
      {draft.type === 'recipe' && recipe && <RecipeFields recipe={recipe} draft={draft.recipe} refs={refs} locale={locale}
        update={(recipe, ingredientOpen) => update({ ...draft, recipe }, ingredientOpen)} />}
      {draft.type === 'repeat' && saved && <>
        <label>{savedUnit ? t(savedUnit === 'g' ? 'amountGrams' : savedUnit) : t('servingCount')}
          <input type="text" inputMode="decimal" maxLength={10} value={draft.amount}
            onChange={(event) => update({ ...draft, amount: event.target.value })} />
        </label>
        <QuickAmounts values={savedUnit ? quickFoodAmounts(savedUnit) : [0.5, 1, 1.5, 2]}
          selected={foodAmount(draft.amount) ?? 0} onChange={(value) => update({ ...draft, amount: String(value) })} />
        {'ingredients' in saved && <details className="recipe-options"><summary>{r('ingredients')}</summary>
          <ul className="recipe-preview">{saved.ingredients.map((ingredient, position) =>
            <li key={position}>{localizedText(ingredient.names, locale)}{ingredient.variantNames && ` · ${localizedText(ingredient.variantNames, locale)}`}</li>)}</ul>
        </details>}
      </>}
      <details className="recipe-options">
        <summary>{draft.role ? t(draft.role) : t('optionalRole')}</summary>
        <div className="periods food-portions meal-role-picker" role="group" aria-label={t('optionalRole')}>
          {([undefined, 'main', 'side'] as const).map((role) => <button type="button" key={role ?? 'none'}
            aria-pressed={draft.role === role} onClick={() => update({ ...draft, role })}>{t(role ?? 'noRole')}</button>)}
        </div>
      </details>
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={() => { onEdit(null); if (!items.length) onPick(true); }}>{app('cancel')}</button>
        <button type="button" className="button primary" disabled={!canConfirm}
          onClick={() => confirmPreparation(false)}>{t('confirmPreparation')}</button>
      </div>
    </section>;
  }

  return <div className="meal-items">
    <input type="hidden" name="mealItems" value={JSON.stringify(effectiveItems)} />
    {!!items.length && <ul className="meal-items-list" ref={list}>{items.map((item, index) => {
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
          <button type="button" className="icon-button destructive" aria-label={t('removeFood', { food: name })} disabled={!!edit}
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
      }} autoFocus={items.length > 0} onEstimate={items.length ? undefined : onEstimate} />
      : <RecipePicker recipes={recipes} locale={locale} select={(recipe) => modify({ type: 'recipe', recipe })} />)}
    {(edit || (!picking && items.length < maxMealLines)) && <div className="meal-composition-actions">
      <button type="button" className="button secondary add-meal-item"
        disabled={!!edit && (!canConfirm || lineCount >= maxMealLines)}
        onClick={() => confirmPreparation(true)}><Plus size={17} aria-hidden />{t('addAnother')}</button>
    </div>}
  </div>;
}
