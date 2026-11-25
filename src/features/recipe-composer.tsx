'use client';

import { Plus, Search, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { foodAmount, foodQuantityGrams, maxMealLines, preferredFoodUnit, type CatalogFood, type FoodSelection } from '@/lib/food';
import { recipeEntries, recipeEntryDraft, recipeEntryKey, recipeEntryScore, recipeKinds } from '@/lib/recipe-catalog';
import { recipeChoice, recipeIngredientChoice, recipeIngredients, recipePart, recipeVariation, type IngredientChoice, type RecipeDraft, type RecipeForLog } from '@/lib/recipe-composition';

import { CatalogPicker, HouseholdAmount, QuickAmounts } from './food-picker';

function recipeDraft(recipeId: string, part?: string): RecipeDraft {
  return { recipeId, part, servings: 1, choices: {}, quantities: {} };
}

export function RecipePicker({ recipes, locale, select }: {
  recipes: RecipeForLog[]; locale: Locale; select: (draft: RecipeDraft) => void;
}) {
  const t = useTranslations('recipes');
  const [query, setQuery] = useState('');
  const results = recipes.flatMap((recipe) => recipeEntries(recipe).map((entry) => ({
    recipe, entry, score: recipeEntryScore(entry, recipe, query), title: localizedText(entry.names, locale) ?? t('untitled'),
  }))).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, locale));
  const sections = query.trim() ? [undefined] : recipeKinds;
  return <div className="food-catalog">
    <label className="search-field">
      <Search size={17} aria-hidden />
      <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
    </label>
    {results.length ? <div className="food-results">{sections.map((kind) => {
      const options = kind ? results.filter(({ entry }) => entry.kind === kind) : results;
      return options.length > 0 && <section key={kind ?? 'all'}>
        {kind && <h3>{t(`kinds.${kind}`)}</h3>}
        <ul>{options.map(({ title, entry, recipe }) => <li key={recipeEntryKey(recipe.id, entry)}>
          <button type="button" onClick={() => select(recipeEntryDraft(recipe, entry))}>
            <span><strong>{title}</strong>{entry.part && <small>{t('partOf', { recipe: localizedText(recipe.names, locale) ?? t('untitled') })}</small>}</span>
          </button>
        </li>)}</ul>
      </section>;
    })}</div> : <p className="empty-state" role="status">{t('noResults')}</p>}
  </div>;
}

export function RecipeFields({ recipe, draft, refs, locale, update }: {
  recipe: RecipeForLog; draft: RecipeDraft; refs: Map<string, CatalogFood>; locale: Locale; update: (draft: RecipeDraft) => void;
}) {
  const t = useTranslations('recipes');
  const n = useTranslations('nutrition');
  const app = useTranslations('app');
  const format = useFormatter();
  const [servingsInput, setServingsInput] = useState(() => String(draft.servings));
  const [picking, setPicking] = useState(false);
  const [focusedIngredient, setFocusedIngredient] = useState<string | null>(null);
  const addedField = useRef<HTMLFieldSetElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const part = recipePart(recipe, draft);
  const variant = recipeVariation(recipe, draft);
  const variants = part ? [] : recipe.variants ?? [];
  const additions = draft.additions ?? [];
  const slots = recipeIngredients(recipe, part).toSorted((a, b) => a.position - b.position);
  const hasEdits = [draft.choices, draft.quantities, draft.weights, draft.measures, draft.additions]
    .some((fields) => fields && Object.keys(fields).length);
  const included = slots.filter((slot) => recipeChoice(slot, draft.choices[slot.position]) !== 'omit');
  const includedIds = new Set([
    ...included.map((slot) => recipeIngredientChoice(slot, recipe.alternatives, recipeChoice(slot, draft.choices[slot.position]))?.food_reference_id),
    ...additions.map(({ referenceId }) => referenceId),
  ]);
  useEffect(() => {
    if (focusedIngredient) addedField.current?.querySelector('input')?.focus();
  }, [focusedIngredient]);

  function changeServings(value: string) {
    setServingsInput(value);
    update({ ...draft, servings: foodAmount(value, 1000) ?? 0 });
  }

  function changeChoice(position: number, choice: IngredientChoice) {
    const weights = { ...draft.weights };
    const quantities = { ...draft.quantities };
    const measures = { ...draft.measures };
    delete weights[position];
    delete quantities[position];
    delete measures[position];
    update({ ...draft, choices: { ...draft.choices, [position]: choice }, weights, quantities, measures });
  }

  function addIngredient(food: CatalogFood) {
    const unit = preferredFoodUnit(food);
    update({ ...draft, additions: [...additions, { referenceId: food.id, amount: unit === 'g' ? '' : '1', unit }] });
    setFocusedIngredient(food.id);
    setPicking(false);
  }

  function changeAddition(index: number, next?: FoodSelection) {
    update({ ...draft, additions: next ? additions.map((item, position) => position === index ? next : item)
      : additions.filter((_, position) => position !== index) });
  }

  const gramsLabel = (grams: number) => n('estimatedWeight', { grams: format.number(grams, { maximumFractionDigits: 2 }) });

  return <>
    <div className="meal-quantity-controls">
      <label>{recipe.purchase_unit === 'slice' ? t('slice') : recipe.purchase_unit === 'unit' ? n('unit') : n('servingCount')}
        <input type="text" inputMode="decimal" maxLength={8}
          value={servingsInput} onChange={(event) => changeServings(event.target.value)} />
      </label>
      <QuickAmounts values={[0.5, 1, 1.5, 2]} selected={draft.servings} onChange={(servings) => changeServings(String(servings))} />
    </div>
    {recipe.purchase_unit && <small>{t('purchaseEstimate')}</small>}
    <details className="recipe-options">
      <summary>{t('customize')}</summary>
      {!!recipe.parts?.length && <label>{t('choosePart')}
        <select aria-label={t('choosePart')} value={draft.part ?? ''} onChange={(event) => {
          update({ ...recipeDraft(recipe.id, event.target.value || undefined), servings: draft.servings, additions });
        }}>
          <option value="">{t('wholeRecipe')}</option>
          {recipe.parts.map((option) => <option key={option.id} value={option.id}>{localizedText(option.names, locale)}</option>)}
        </select>
      </label>}
      {!!variants.length && <label>{t('variation')}
        <select aria-label={t('variation')} value={variant ? String(variants.indexOf(variant)) : hasEdits ? 'custom' : ''}
          onChange={(event) => {
            const chosen = event.target.value === '' ? undefined : variants[Number(event.target.value)];
            update({ ...draft, choices: chosen?.choices ?? {}, quantities: {}, weights: {}, measures: {} });
          }}>
          <option value="">{t('base')}</option>
          <option value="custom" disabled>{t('customVariation')}</option>
          {variants.map((option, index) => <option key={index} value={index}>{localizedText(option.names, locale)}</option>)}
        </select>
      </label>}
      {slots.map((slot) => {
        const ref = refs.get(slot.food_reference_id ?? '');
        if (!ref) return null;
        const label = localizedText(ref.food.names, locale) ?? n('food');
        const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === slot.position);
        const choice = recipeChoice(slot, draft.choices[slot.position]);
        const active = recipeIngredientChoice(slot, alternatives, choice);
        const activeRef = refs.get(active?.food_reference_id ?? '');
        const baseGrams = (active?.grams ?? 0) * draft.servings / recipe.base_servings;
        const quantity = draft.quantities[slot.position];
        const weight = draft.weights?.[slot.position] ?? (quantity && activeRef?.portion_grams ? quantity * activeRef.portion_grams : baseGrams);
        const measure = draft.measures?.[slot.position] ?? { amount: weight > 0 ? String(Number(weight.toFixed(2))) : '', unit: 'g' };
        const grams = activeRef && foodQuantityGrams(measure, activeRef);
        return <div className="recipe-option" key={slot.position}>
          <label>{label}
            <select aria-label={label} value={choice} onChange={(event) => {
              const value = event.target.value;
              changeChoice(slot.position, value === 'omit' || value === 'default' ? value : Number(value));
            }}>
              <option value="default">{label}</option>
              {alternatives.map(({ position, food_id, food_reference_id, grams }) => {
                const alternate = refs.get(food_reference_id);
                if (!alternate) return null;
                return <option key={position} value={position}>
                  {localizedText(alternate.food.names, locale) ?? n('food')}
                  {food_id === slot.food_id && ` · ${localizedText(alternate.variant_names, locale) ?? format.number(grams) + ' g'}`}
                  {food_reference_id === ref.id && localizedText(alternate.variant_names, locale) && ` · ${format.number(grams)} g`}
                </option>;
              })}
              <option value="omit">{t('omit')}</option>
            </select>
          </label>
          {activeRef && choice !== 'omit' && <details className="recipe-ingredient-quantity">
            <summary>{t('editIngredientAmount', { food: localizedText(activeRef.food.names, locale) ?? label })}
              {grams && ` · ${gramsLabel(grams)}`}</summary>
            <HouseholdAmount food={activeRef} {...measure} grams={grams ?? undefined}
              onChange={(amount, unit) => update({ ...draft, measures: { ...draft.measures, [slot.position]: { amount, unit } } })} />
          </details>}
        </div>;
      })}
      {additions.map((ingredient, index) => {
        const food = refs.get(ingredient.referenceId);
        if (!food) return null;
        const name = localizedText(food.food.names, locale) ?? n('food');
        return <fieldset key={ingredient.referenceId} className="recipe-option recipe-extra"
          ref={focusedIngredient === ingredient.referenceId ? addedField : undefined}>
          <legend>{name}</legend>
          <HouseholdAmount food={food} {...ingredient} grams={foodQuantityGrams(ingredient, food) ?? undefined}
            onChange={(amount, unit) => changeAddition(index, { ...ingredient, amount, unit })} />
          <button type="button" className="button secondary" onClick={() => {
            changeAddition(index);
            if (focusedIngredient === ingredient.referenceId) setFocusedIngredient(null);
            addButton.current?.focus();
          }}>
            <Trash2 size={16} aria-hidden />{t('removeIngredient', { food: name })}
          </button>
        </fieldset>;
      })}
      <button type="button" className="button secondary add-recipe-ingredient" aria-expanded={picking} ref={addButton}
        disabled={included.length + additions.length >= maxMealLines}
        onClick={() => setPicking(!picking)}><Plus size={17} aria-hidden />{t('addIngredient')}</button>
      {picking && <div className="recipe-add-picker">
        <CatalogPicker catalog={[...refs.values()].filter(({ id }) => !includedIds.has(id))}
          locale={locale} onSelect={addIngredient} autoFocus />
        <button className="button secondary" type="button" onClick={() => {
          setPicking(false);
          addButton.current?.focus();
        }}>{app('cancel')}</button>
      </div>}
    </details>
  </>;
}
