'use client';

import { Search } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import type { CatalogFood } from '@/lib/food';
import { recipeEntries, recipeEntryDraft, recipeEntryKey, recipeEntryScore, recipeKinds } from '@/lib/recipe-catalog';
import { recipeChoice, recipeIngredients, recipePart, recipeVariation, type IngredientChoice, type RecipeDraft, type RecipeForLog } from '@/lib/recipe-composition';

function recipeDraft(recipeId: string, part?: string): RecipeDraft {
  return { recipeId, part, servings: 1, choices: {}, quantities: {} };
}

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
  const format = useFormatter();
  const part = recipePart(recipe, draft);
  const variant = recipeVariation(recipe, draft);
  const variants = part ? [] : recipe.variants ?? [];
  const hasEdits = Object.keys(draft.choices).length > 0 || Object.keys(draft.quantities).length > 0 || Object.keys(draft.weights ?? {}).length > 0;
  const slots = recipeIngredients(recipe, part).toSorted((a, b) => a.position - b.position);

  function changeWeight(position: number, value: string) {
    const weights = { ...draft.weights };
    if (value) weights[position] = Number(value);
    else delete weights[position];
    update({ ...draft, weights });
  }

  return <>
    <div className="meal-quantity-controls">
      <label>{recipe.purchase_unit === 'slice' ? t('slice') : recipe.purchase_unit === 'unit' ? n('unit') : n('servingCount')}
        <input type="number" min=".01" max="1000" step=".01" inputMode="decimal"
          value={draft.servings || ''} onChange={(event) => update({ ...draft, servings: Number(event.target.value) })} />
      </label>
      <QuickAmounts values={[0.5, 1, 1.5, 2]} selected={draft.servings} onChange={(servings) => update({ ...draft, servings })} />
    </div>
    {recipe.purchase_unit && <small>{t('purchaseEstimate')}</small>}
    <details className="recipe-options">
      <summary>{t('customize')}</summary>
      {!!recipe.parts?.length && <label>{t('choosePart')}
        <select aria-label={t('choosePart')} value={draft.part ?? ''} onChange={(event) => {
          update({ ...recipeDraft(recipe.id, event.target.value || undefined), servings: draft.servings });
        }}>
          <option value="">{t('wholeRecipe')}</option>
          {recipe.parts.map((option) => <option key={option.id} value={option.id}>{localizedText(option.names, locale)}</option>)}
        </select>
      </label>}
      {!!variants.length && <label>{t('variation')}
        <select aria-label={t('variation')} value={variant ? String(variants.indexOf(variant)) : hasEdits ? 'custom' : ''}
          onChange={(event) => {
            const chosen = event.target.value === '' ? undefined : variants[Number(event.target.value)];
            update({ ...draft, choices: chosen?.choices ?? {}, quantities: {}, weights: {} });
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
        const selected = recipeChoice(slot, draft.choices[slot.position]);
        const active = alternatives.find(({ position }) => position === selected);
        const activeRef = active ? refs.get(active.food_reference_id) : ref;
        const baseGrams = (active?.grams ?? slot.grams ?? 0) * draft.servings / recipe.base_servings;
        const defaultCount = activeRef?.portion_grams ? Number((baseGrams / activeRef.portion_grams).toFixed(2)) : 0;
        const quantity = draft.quantities[slot.position];
        return <div className="recipe-option" key={slot.position}>
          {(alternatives.length > 0 || slot.is_optional) && <label>{label}
            <select aria-label={label} value={selected} onChange={(event) => {
              const value = event.target.value;
              const choice: IngredientChoice = value === 'omit' || value === 'default' ? value : Number(value);
              const weights = { ...draft.weights };
              const quantities = { ...draft.quantities };
              delete weights[slot.position];
              delete quantities[slot.position];
              update({ ...draft, choices: { ...draft.choices, [slot.position]: choice }, weights, quantities });
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
              {slot.is_optional && <option value="omit">{t('omit')}</option>}
            </select>
          </label>}
          {selected !== 'omit' && (slot.adjustable_quantity && activeRef?.portion_unit ? <label>
            {t('ingredientCount', { food: localizedText(activeRef.food.names, locale) ?? label })} · {t(`measures.${activeRef.portion_unit}`)}
            <input type="number" inputMode="decimal" min=".01" max="1000" step=".01"
              value={quantity ?? (defaultCount || '')}
              onChange={(event) => update({ ...draft, quantities: { ...draft.quantities, [slot.position]: Number(event.target.value) } })} />
          </label> : <label>{t('ingredientWeight', { food: localizedText(activeRef?.food.names, locale) ?? label })}
            <input type="number" inputMode="decimal" min=".01" max="10000" step=".01"
              placeholder={format.number(baseGrams, { maximumFractionDigits: 2 })}
              value={draft.weights?.[slot.position] ?? ''} onChange={(event) => changeWeight(slot.position, event.target.value)} />
          </label>)}
        </div>;
      })}
    </details>
  </>;
}
