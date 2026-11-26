'use client';

import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { foodAmount, foodQuantityGrams, maxMealLines, preferredFoodUnit, type CatalogFood, type FoodQuantity, type FoodSelection } from '@/lib/food';
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
  recipe: RecipeForLog; draft: RecipeDraft; refs: Map<string, CatalogFood>; locale: Locale;
  update: (draft: RecipeDraft, ingredientOpen?: boolean) => void;
}) {
  const t = useTranslations('recipes');
  const n = useTranslations('nutrition');
  const app = useTranslations('app');
  const format = useFormatter();
  const [servingsInput, setServingsInput] = useState(() => String(draft.servings));
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<
    { position: number; choice: IngredientChoice; measure?: FoodQuantity } |
    { index: number | null; selection: FoodSelection } | null
  >(null);
  const editorField = useRef<HTMLFieldSetElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
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
  const ingredientOpen = editing !== null;
  useEffect(() => {
    if (editorField.current) {
      editorField.current.querySelector<HTMLElement>('select, input')?.focus();
    } else {
      returnFocus.current?.focus();
      returnFocus.current = null;
    }
  }, [ingredientOpen]);

  function changeServings(value: string) {
    setServingsInput(value);
    update({ ...draft, servings: foodAmount(value, 1000) ?? 0 });
  }

  function confirmSlot(position: number, previous: IngredientChoice, choice: IngredientChoice, measure?: FoodQuantity) {
    if (choice === previous && !measure) {
      endEdit(draft);
      return;
    }
    const weights = { ...draft.weights };
    const quantities = { ...draft.quantities };
    const measures = { ...draft.measures };
    delete weights[position];
    delete quantities[position];
    delete measures[position];
    if (measure && choice !== 'omit') measures[position] = measure;
    endEdit({ ...draft, choices: { ...draft.choices, [position]: choice }, weights, quantities, measures });
  }

  function addIngredient(food: CatalogFood) {
    const unit = preferredFoodUnit(food);
    startEdit({ index: null, selection: { referenceId: food.id, amount: unit === 'g' ? '' : '1', unit } }, addButton.current);
  }

  function startEdit(next: NonNullable<typeof editing>, trigger: HTMLButtonElement | null) {
    returnFocus.current = trigger;
    setPicking(false);
    setEditing(next);
    update(draft, true);
  }

  function endEdit(next: RecipeDraft) {
    setEditing(null);
    update(next, false);
  }

  const formatAmount = (amount: number) => format.number(amount, { maximumFractionDigits: 2 });
  const amountLabel = ({ amount, unit }: FoodQuantity) =>
    `${formatAmount(foodAmount(amount) ?? 0)} ${unit === 'g' ? 'g' : n(unit).toLocaleLowerCase(locale)}`;
  const savedAddition = editing && 'selection' in editing ? editing : null;
  const additionFood = savedAddition && refs.get(savedAddition.selection.referenceId);
  const additionGrams = savedAddition && additionFood && foodQuantityGrams(savedAddition.selection, additionFood);

  function editorActions(confirm: () => void, valid: boolean) {
    return <div className="form-actions">
      <button type="button" className="button secondary" onClick={() => endEdit(draft)}>{app('cancel')}</button>
      <button type="button" className="button secondary ingredient-confirm" disabled={!valid} onClick={confirm}>
        <Check size={16} aria-hidden />{n('confirmItem')}
      </button>
    </div>;
  }

  const additionEditor = savedAddition && additionFood && <fieldset className="recipe-extra" ref={editorField}>
    <legend>{localizedText(additionFood.food.names, locale) ?? n('food')}</legend>
    <HouseholdAmount food={additionFood} {...savedAddition.selection} grams={additionGrams ?? undefined}
      onChange={(amount, unit) => setEditing({ ...savedAddition, selection: { ...savedAddition.selection, amount, unit } })} />
    {editorActions(() => {
      const { index, selection } = savedAddition;
      const next = index === null ? [...additions, selection] : additions.map((item, position) => position === index ? selection : item);
      endEdit({ ...draft, additions: next });
    }, Boolean(additionGrams))}
  </fieldset>;

  return <>
    <div className="meal-quantity-controls">
      <label>{recipe.purchase_unit === 'slice' ? t('slice') : recipe.purchase_unit === 'unit' ? n('unit') : n('servingCount')}
        <input type="text" inputMode="decimal" maxLength={8}
          value={servingsInput} onChange={(event) => changeServings(event.target.value)} />
      </label>
      <QuickAmounts values={[0.5, 1, 1.5, 2]} selected={draft.servings} onChange={(servings) => changeServings(String(servings))} />
    </div>
    {recipe.purchase_unit && <small>{t('purchaseEstimate')}</small>}
    <details className="recipe-options recipe-customization">
      <summary onClick={(event) => { if (editing) event.preventDefault(); }}>{t('customize')}</summary>
      {!!recipe.parts?.length && <label>{t('choosePart')}
        <select aria-label={t('choosePart')} disabled={!!editing} value={draft.part ?? ''} onChange={(event) => {
          update({ ...recipeDraft(recipe.id, event.target.value || undefined), servings: draft.servings, additions });
        }}>
          <option value="">{t('wholeRecipe')}</option>
          {recipe.parts.map((option) => <option key={option.id} value={option.id}>{localizedText(option.names, locale)}</option>)}
        </select>
      </label>}
      {!!variants.length && <label>{t('variation')}
        <select aria-label={t('variation')} disabled={!!editing} value={variant ? String(variants.indexOf(variant)) : hasEdits ? 'custom' : ''}
          onChange={(event) => {
            const chosen = event.target.value === '' ? undefined : variants[Number(event.target.value)];
            update({ ...draft, choices: chosen?.choices ?? {}, quantities: {}, weights: {}, measures: {} });
          }}>
          <option value="">{t('base')}</option>
          <option value="custom" disabled>{t('customVariation')}</option>
          {variants.map((option, index) => <option key={index} value={index}>{localizedText(option.names, locale)}</option>)}
        </select>
      </label>}
      <ul className="recipe-ingredient-list">{slots.map((slot) => {
        const ref = refs.get(slot.food_reference_id ?? '');
        if (!ref) return null;
        const label = localizedText(ref.food.names, locale) ?? n('food');
        const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === slot.position);
        const choice = recipeChoice(slot, draft.choices[slot.position]);
        function ingredientFor(selected: IngredientChoice) {
          const active = recipeIngredientChoice(slot, alternatives, selected);
          const food = refs.get(active?.food_reference_id ?? '');
          const baseGrams = (active?.grams ?? 0) * draft.servings / recipe.base_servings;
          const quantity = selected === choice ? draft.quantities[slot.position] : undefined;
          const defaultWeight = quantity && food?.portion_grams ? quantity * food.portion_grams : baseGrams;
          const weight = (selected === choice ? draft.weights?.[slot.position] : undefined) ?? defaultWeight;
          const measure: FoodQuantity = (selected === choice ? draft.measures?.[slot.position] : undefined) ??
            { amount: weight > 0 ? String(Number(weight.toFixed(2))) : '', unit: 'g' };
          return { food, measure };
        }
        const current = ingredientFor(choice);
        const name = localizedText(current.food?.food.names, locale) ?? label;
        const slotEdit = editing && 'position' in editing && editing.position === slot.position ? editing : null;
        const selected = slotEdit && ingredientFor(slotEdit.choice);
        const measure = slotEdit?.measure ?? selected?.measure;
        const grams = selected?.food && measure && foodQuantityGrams(measure, selected.food);
        return <li key={slot.position}>
          <div className="meal-item-row">
            <span className="record-row-copy"><strong>{name}</strong>
              <small>{choice === 'omit' ? t('omit') : amountLabel(current.measure)}</small>
            </span>
            <div className="food-row-actions">
              <button type="button" className="icon-button" aria-label={n('editItem', { food: name })} disabled={ingredientOpen}
                onClick={(event) => startEdit({ position: slot.position, choice }, event.currentTarget)}><Pencil size={17} aria-hidden /></button>
              {choice !== 'omit' && <button type="button" className="icon-button destructive" aria-label={t('removeIngredient', { food: name })}
                disabled={ingredientOpen} onClick={(event) => {
                  confirmSlot(slot.position, choice, 'omit');
                  event.currentTarget.parentElement?.querySelector('button')?.focus();
                }}><Trash2 size={17} aria-hidden /></button>}
            </div>
          </div>
          {slotEdit && <fieldset className="recipe-extra" ref={editorField}>
            <legend>{name}</legend>
            <label>{label}
              <select aria-label={label} value={slotEdit.choice} onChange={(event) => {
                const value = event.target.value;
                setEditing({ position: slot.position, choice: value === 'omit' || value === 'default' ? value : Number(value) });
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
            {selected?.food && measure && <HouseholdAmount food={selected.food} {...measure} grams={grams ?? undefined}
              onChange={(amount, unit) => setEditing({ ...slotEdit, measure: { amount, unit } })} />}
            {editorActions(() => confirmSlot(slot.position, choice, slotEdit.choice, slotEdit.measure),
              slotEdit.choice === 'omit' || Boolean(grams))}
          </fieldset>}
        </li>;
      })}
      {additions.map((ingredient, index) => {
        const food = refs.get(ingredient.referenceId);
        if (!food) return null;
        const name = localizedText(food.food.names, locale) ?? n('food');
        return <li key={ingredient.referenceId}>
          <div className="meal-item-row">
            <span className="record-row-copy"><strong>{name}</strong><small>{amountLabel(ingredient)}</small></span>
            <div className="food-row-actions">
              <button type="button" className="icon-button" aria-label={n('editItem', { food: name })} disabled={!!editing}
                onClick={(event) => startEdit({ index, selection: ingredient }, event.currentTarget)}><Pencil size={17} aria-hidden /></button>
              <button type="button" className="icon-button destructive" aria-label={t('removeIngredient', { food: name })} disabled={!!editing}
                onClick={() => {
                  update({ ...draft, additions: additions.filter((_, position) => position !== index) });
                  addButton.current?.focus();
                }}><Trash2 size={17} aria-hidden /></button>
            </div>
          </div>
          {savedAddition?.index === index && additionEditor}
        </li>;
      })}</ul>
      {savedAddition?.index === null && additionEditor}
      <button type="button" className="button secondary add-recipe-ingredient" aria-expanded={picking} ref={addButton}
        disabled={!!editing || included.length + additions.length >= maxMealLines}
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
