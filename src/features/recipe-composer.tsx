'use client';

import { Plus, Search, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import type { CatalogFood } from '@/lib/food';
import { ingredientNameKey } from '@/lib/recipe-catalog';
import {
  maxRecipeGroups, recipeChoice, recipeVariation, resolveRecipeDraft, type IngredientChoice, type RecipeDraft, type RecipeForLog,
} from '@/lib/recipe-composition';

export function recipeDraft(recipeId: string): RecipeDraft {
  return { recipeId, servings: 1, choices: {}, quantities: {} };
}

export function RecipeComposer({ recipes, refs, drafts, onChange, locale }: {
  recipes: RecipeForLog[]; refs: Map<string, CatalogFood>; drafts: RecipeDraft[]; locale: Locale;
  onChange: (drafts: RecipeDraft[]) => void;
}) {
  const [adding, setAdding] = useState(!drafts.length);
  const [query, setQuery] = useState('');
  const t = useTranslations('recipes');
  const n = useTranslations('nutrition');
  const format = useFormatter();
  const name = (recipe: RecipeForLog) => localizedText(recipe.names, locale) ?? t('untitled');
  const options = recipes.filter((recipe) => !drafts.some(({ recipeId }) => recipe.id === recipeId));
  const matches = options.filter((recipe) => ingredientNameKey(name(recipe)).includes(ingredientNameKey(query)))
    .sort((a, b) => name(a).localeCompare(name(b), locale));

  function update(draft: RecipeDraft) {
    onChange(drafts.map((row) => row.recipeId === draft.recipeId ? draft : row));
  }

  function add(id: string) {
    if (!options.some((recipe) => recipe.id === id)) return;
    onChange([...drafts, recipeDraft(id)]);
    setQuery('');
    setAdding(false);
  }

  return <div className="recipe-composer">
    <input type="hidden" name="recipeGroups" value={JSON.stringify(drafts)} />
    {drafts.map((draft) => {
      const recipe = recipes.find(({ id }) => id === draft.recipeId);
      if (!recipe) return null;
      const variant = recipeVariation(recipe, draft);
      const title = localizedText(variant?.names, locale) ?? name(recipe);
      const hasEdits = Object.keys(draft.choices).length > 0 || Object.keys(draft.quantities).length > 0;
      const lines = resolveRecipeDraft(recipe, draft, refs);
      const customize = recipe.ingredients.some((slot) => slot.is_optional || slot.adjustable_quantity) ||
        recipe.alternatives.length > 0 || !!recipe.variants?.length;
      return <section key={draft.recipeId} className="recipe-preparation">
        <div className="food-line-heading">
          <h3>{title}</h3>
          <button type="button" className="icon-button" aria-label={t('removePreparation', { recipe: title })}
            onClick={() => {
              onChange(drafts.filter((row) => row.recipeId !== draft.recipeId));
              if (drafts.length === 1) setAdding(true);
            }}><Trash2 size={17} aria-hidden /></button>
        </div>
        <label>{recipe.purchase_unit ? t(recipe.purchase_unit) : n('servingCount')}
          <input type="number" min=".01" max="1000" step=".01" inputMode="decimal" required
            value={draft.servings || ''} onChange={(event) => update({ ...draft, servings: Number(event.target.value) })} />
        </label>
        {recipe.purchase_unit && <small>{t('purchaseEstimate')}</small>}
        {customize && <details className="recipe-options">
          <summary>{t('customize')}</summary>
          {!!recipe.variants?.length && <label>{t('variation')}
            <select aria-label={t('variation')} value={variant ? String(recipe.variants.indexOf(variant)) : hasEdits ? 'custom' : ''}
              onChange={(event) => {
              const selected = event.target.value === '' ? undefined : recipe.variants?.[Number(event.target.value)];
              update({ ...draft, choices: selected?.choices ?? {}, quantities: {} });
            }}>
              <option value="">{t('base')}</option>
              <option value="custom" disabled>{t('customVariation')}</option>
              {recipe.variants.map((option, index) => <option key={index} value={index}>
                {localizedText(option.names, locale)}
              </option>)}
            </select>
          </label>}
          {recipe.ingredients.toSorted((a, b) => a.position - b.position).map((slot) => {
            const ref = refs.get(slot.food_reference_id ?? '');
            if (!ref) return null;
            const label = localizedText(ref.food.names, locale) ?? n('food');
            const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === slot.position);
            const selected = recipeChoice(slot, draft.choices[slot.position]);
            const active = alternatives.find(({ position }) => position === selected);
            const activeRef = active ? refs.get(active.food_reference_id) : ref;
            const defaultCount = activeRef?.portion_grams
              ? Number((((active?.grams ?? slot.grams ?? 0) * draft.servings) / recipe.base_servings / activeRef.portion_grams).toFixed(2))
              : 0;
            if (!alternatives.length && !slot.is_optional && !slot.adjustable_quantity) return null;
            return <div className="recipe-option" key={slot.position}>
              {(alternatives.length > 0 || slot.is_optional) && <label>{label}
                <select aria-label={label} value={selected} onChange={(event) => {
                  const value = event.target.value;
                  const choice: IngredientChoice = value === 'omit' || value === 'default' ? value : Number(value);
                  update({ ...draft, choices: { ...draft.choices, [slot.position]: choice } });
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
              {slot.adjustable_quantity && selected !== 'omit' && <label>{t('ingredientCount', { food: localizedText(activeRef?.food.names, locale) ?? label })}
                <input type="number" inputMode="decimal" min=".01" max="1000" step=".01" required
                  value={draft.quantities[slot.position] ?? (defaultCount || '')}
                  onChange={(event) => update({
                    ...draft, quantities: { ...draft.quantities, [slot.position]: Number(event.target.value) },
                  })} />
              </label>}
            </div>;
          })}
        </details>}
        {lines && <details className="recipe-options">
          <summary>{t('ingredients')}</summary>
          <ul className="recipe-preview">{lines.map(({ referenceId, grams }, index) => {
            const ref = refs.get(referenceId);
            return <li key={index}>{localizedText(ref?.food.names, locale) ?? n('food')} · ≈ {format.number(grams)} g</li>;
          })}</ul>
        </details>}
      </section>;
    })}
    {drafts.length < maxRecipeGroups && (adding || !drafts.length) && options.length > 0 && <div className="recipe-options">
      <label className="search-field">
        <Search size={17} aria-hidden />
        <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
      </label>
      <label>{n('chooseRecipe')}
        <select aria-label={n('chooseRecipe')} value="" onChange={(event) => add(event.target.value)}>
          <option value="" disabled>{n('chooseRecipe')}</option>
          {matches.map((option) => <option key={option.id} value={option.id}>{name(option)}</option>)}
        </select>
      </label>
      {!matches.length && <small role="status">{t('noResults')}</small>}
    </div>}
    {drafts.length > 0 && drafts.length < maxRecipeGroups && !adding && options.length > 0 && <button type="button"
      className="button secondary" onClick={() => setAdding(true)}><Plus size={17} aria-hidden />{t('addPreparation')}</button>}
  </div>;
}
