import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/page-heading';
import { localePath, type Locale } from '@/i18n/config';
import { localizedText, localizedValue } from '@/i18n/localized-text';
import type { FoodAvailability, FoodNames } from '@/lib/food';
import { readinessPriority, recipeAvailability, recipeEntryDraft, recipeEntryKey, recipeEntryScore, recipeIntensities, recipeKinds,
  type FridgeSelection, type RecipeEntry, type RecipeSummary, type RecipeView,
} from '@/lib/recipe-catalog';
import { preparationNutrition, recipeIngredients, resolveRecipeDraft, type RecipeForLog } from '@/lib/recipe-composition';
import { FoodNavigation } from './food';
import { LogMealButton, type FoodLogData } from './food-diary';
import { FridgeControls } from './fridge';
import { RecipeFilters } from './recipe-filters';

const recipePath = '/comidas/recetario';

function recipeQuery(view: RecipeView, entry?: RecipeEntry, substitutions?: string) {
  const params = new URLSearchParams();
  if (view.preferAvailable) params.set('disponibles', '1');
  if (substitutions) params.set('sustituciones', substitutions);
  if (view.filter !== 'all') params.set('intensidad', view.filter);
  if (view.kind !== 'all') params.set('tipo', view.kind);
  if (view.query) params.set('q', view.query);
  if (entry?.part) params.set('parte', entry.part.id);
  if (entry?.variant !== undefined) params.set('variante', String(entry.variant));
  return params.size ? `?${params}` : '';
}

async function RecipeMeta({ locale, recipe }: { locale: Locale; recipe: Omit<RecipeSummary, 'id' | 'names'> }) {
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'recipes' }), getFormatter({ locale })]);
  return <span className="recipe-meta">
    <span className="recipe-intensity">{t(recipe.intensity)}</span>
    {recipe.kcal_per_serving !== null && <span className="recipe-kcal">≈ {t('perServing', { kcal: format.number(recipe.kcal_per_serving, { maximumFractionDigits: 0 }) })}</span>}
    {recipe.preparation_minutes !== null && <span>{t('minutes', { count: recipe.preparation_minutes })}</span>}
  </span>;
}

async function RecipeAvailabilityText({ locale, availability, foodNames }: {
  locale: Locale; availability: ReturnType<typeof recipeAvailability>; foodNames: Record<string, FoodNames>;
}) {
  if (!availability.total) return null;
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'recipes' }), getFormatter({ locale })]);
  const ready = readinessPriority(availability) === 2;
  const { available, unavailable, unknown, total } = availability;
  if (ready && availability.substitutions.length) {
    const changes = availability.substitutions.map(({ from, to }) =>
      t('replaceIngredient', { from: localizedText(foodNames[from], locale) ?? from, to: localizedText(foodNames[to], locale) ?? to }));
    return <small className="recipe-availability">{t('readyWithSubstitutions', { changes: format.list(changes, { type: 'conjunction' }) })}</small>;
  }
  return <small className="recipe-availability">
    {ready ? t('allIngredients') : <>
      {t('marked', { available, total })}
      {availability.unavailable > 0 && <> · {t('missingIngredients', { unavailable })}</>}
      {availability.unknown > 0 && <> · {t('unknown', { unknown })}</>}
    </>}
  </small>;
}

export async function RecipeBook({ locale, state, entries, view, foodNames, fridgeReady, demo }: {
  locale: Locale; state: FoodAvailability;
  entries: { recipe: RecipeSummary & RecipeForLog; entry: RecipeEntry; kcal: number; availability: ReturnType<typeof recipeAvailability> }[];
  view: RecipeView; foodNames: Record<string, FoodNames>; fridgeReady: boolean; demo: boolean;
}) {
  const t = await getTranslations({ locale });
  const href = localePath(locale, recipePath);
  const listed = entries.map(({ recipe, entry, kcal, availability }) => ({
    recipe, entry, kcal,
    intensity: entry.part ? entry.part.intensity ?? 'light' : recipe.intensity,
    name: localizedText(entry.names, locale) ?? t('recipes.untitled'),
    availability, score: recipeEntryScore(entry, recipe, view.query),
  })).filter(({ entry, score, intensity }) => score > 0 && (view.kind === 'all' || view.kind === entry.kind) &&
    (view.filter === 'all' || view.filter === intensity)).sort((a, b) => {
      const priority = readinessPriority(b.availability) - readinessPriority(a.availability);
      return (view.preferAvailable ? priority : b.score - a.score) ||
        (view.preferAvailable ? b.score - a.score : priority) || a.name.localeCompare(b.name, locale);
    });

  return <>
    <PageHeading title={t('meals.recipes')} visuallyHidden />
    <FoodNavigation section="recipes" demo={demo} />
    <section className="panel section-panel recipe-book">
      <form className="recipe-search" action={href} method="get">
        {view.preferAvailable && <input type="hidden" name="disponibles" value="1" />}
        {view.kind !== 'all' && <input type="hidden" name="tipo" value={view.kind} />}
        {view.filter !== 'all' && <input type="hidden" name="intensidad" value={view.filter} />}
        <label className="search-field">
          <Search size={17} aria-hidden />
          <input key={view.query} type="search" name="q" maxLength={100} aria-label={t('recipes.search')}
            defaultValue={view.query} placeholder={t('recipes.search')} />
        </label>
        <button className="button secondary" type="submit">{t('recipes.searchSubmit')}</button>
      </form>
      <RecipeFilters label={t('recipes.filterToggle', { count: Number(view.kind !== 'all') + Number(view.filter !== 'all') })}>
        <nav className="periods recipe-filters" aria-label={t('recipes.kindFilter')}>
          {(['all', ...recipeKinds] as const).map((kind) => <Link key={kind} href={href + recipeQuery({ ...view, kind })} prefetch={false}
            aria-current={kind === view.kind ? 'page' : undefined}>{t(`recipes.kinds.${kind}`)}</Link>)}
        </nav>
        <nav className="periods recipe-filters" aria-label={t('recipes.filters')}>
          {(['all', ...recipeIntensities] as const).map((filter) => <Link key={filter} href={href + recipeQuery({ ...view, filter })} prefetch={false}
            aria-current={filter === view.filter ? 'page' : undefined}>{t(`recipes.${filter}`)}</Link>)}
        </nav>
      </RecipeFilters>
      {view.preferAvailable && <p className="section-copy recipe-order">
        {t('recipes.availableFirst')}{' '}
        <Link className="text-link" href={href + recipeQuery({ ...view, preferAvailable: false })} prefetch={false}>
          {t('recipes.defaultOrder')}
        </Link>
      </p>}
      {state !== 'ready' ? <p className="empty-state" role="status">{t(`recipeState.${state}`)}</p>
        : !listed.length ? <p className="empty-state" role="status">{t(view.query ? 'recipes.noResults'
          : view.filter === 'all' && view.kind === 'all' ? 'empty.recipes.title' : 'recipes.emptyFilter')}</p>
          : <ul className="recipe-list">{listed.map(({ recipe, entry, name, availability, intensity, kcal }) => <li key={recipeEntryKey(recipe.id, entry)}>
            <Link href={`${href}/${recipe.id}${recipeQuery(view, entry)}`} prefetch={false}>
              <div className="recipe-list-copy">
                <strong>{name}</strong>
                <RecipeMeta locale={locale} recipe={{ intensity, kcal_per_serving: kcal,
                  preparation_minutes: entry.part ? entry.part.minutes ?? null : recipe.preparation_minutes }} />
                {fridgeReady && <RecipeAvailabilityText {...{ locale, availability, foodNames }} />}
              </div>
              <ChevronRight size={18} aria-hidden />
            </Link>
          </li>)}</ul>}
    </section>
  </>;
}

type Detail = RecipeSummary & RecipeForLog & {
  instructions: Partial<FoodNames>;
};

export async function RecipeDetail({ locale, recipe, entry, view, selections, fridgeReady, log, substitutions }: {
  locale: Locale; recipe: Detail; entry: RecipeEntry; view: RecipeView;
  selections: FridgeSelection[]; fridgeReady: boolean; log: FoodLogData; substitutions?: string;
}) {
  const [t, format] = await Promise.all([getTranslations({ locale }), getFormatter({ locale })]);
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const refs = new Map(log.catalog.map((ref) => [ref.id, ref]));
  const variantInstructions = entry.variant === undefined ? undefined : recipe.variants?.[entry.variant]?.instructions;
  const instructions = localizedValue(entry.part ? entry.part.instructions : variantInstructions ?? recipe.instructions, locale);
  const title = localizedText(entry.names, locale) ?? t('recipes.untitled');
  const base = recipeEntryDraft(recipe, entry);
  const availability = recipeAvailability(recipe, selections, entry, refs);
  const ready = fridgeReady && readinessPriority(availability) === 2;
  const suggestion = ready && availability.substitutions.length
    ? availability.substitutions.map(({ position, choice }) => `${position}-${choice}`).join('.') : undefined;
  const usingSuggestion = Boolean(suggestion && substitutions === suggestion);
  const draft = usingSuggestion ? {
    ...base, choices: { ...base.choices, ...Object.fromEntries(availability.substitutions.map(({ position, choice }) => [position, choice])) },
  } : base;
  const detailHref = `${localePath(locale, recipePath)}/${recipe.id}`;
  const foodNames = Object.fromEntries(log.catalog.map((ref) => [ref.food_id, ref.food.names]));
  const lines = resolveRecipeDraft(recipe, draft, refs);
  const nutrition = lines && preparationNutrition(lines, refs);
  const canLog = nutrition && log.recipes.some(({ id }) => id === recipe.id);
  const ingredients = recipeIngredients(recipe, entry.part).filter(({ position }) => draft.choices[position] !== 'omit');
  const number = (value: number) => format.number(value, { maximumFractionDigits: 1 });

  return <>
    <PageHeading title={title}>
      <Link className="button secondary" href={localePath(locale, recipePath) + recipeQuery(view)} prefetch={false}>
        <ArrowLeft size={17} aria-hidden />{t('meals.recipes')}
      </Link>
    </PageHeading>
    <FoodNavigation section="recipes" demo={false} />
    <section className="panel section-panel recipe-detail">
      <div className="food-line-heading">
        <RecipeMeta locale={locale} recipe={{ intensity: entry.part ? entry.part.intensity ?? 'light' : recipe.intensity,
          kcal_per_serving: nutrition?.kcal ?? null, preparation_minutes: entry.part ? entry.part.minutes ?? null : recipe.preparation_minutes }} />
        {canLog && <LogMealButton locale={locale} log={log} initialRecipe={draft} />}
      </div>
      {fridgeReady && availability.total > 0 && <div className="recipe-fridge-detail">
        <RecipeAvailabilityText {...{ locale, availability, foodNames }} />
        {suggestion && <Link className="text-link" prefetch={false}
          href={detailHref + recipeQuery(view, entry, usingSuggestion ? undefined : suggestion)}>
          {t(usingSuggestion ? 'recipes.viewOriginal' : 'recipes.useSubstitutions')}
        </Link>}
      </div>}
      {recipe.purchase_unit && <p className="section-copy">{t('recipes.purchaseEstimate')}</p>}
      {nutrition && <dl className="recipe-nutrients" aria-label={t('recipes.nutritionPerServing')}>
        {(['protein', 'carbs', 'fat'] as const).map((key) => <div key={key}>
          <dt>{t(`recipes.${key}`)}</dt><dd>{nutrition[key] === null ? '—' : `≈ ${number(nutrition[key])} g`}</dd>
        </div>)}
      </dl>}
      {ingredients.length > 0 && <>
        <div className="panel-heading">
          <h2>{t('recipes.ingredients')}</h2>
          <small>{t('recipes.servings', { count: recipe.base_servings })}</small>
        </div>
        <ul className="compact-food-list">
          {ingredients.toSorted((a, b) => a.position - b.position).map((ingredient) => {
            const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === ingredient.position);
            const choice = alternatives.find(({ position }) => position === draft.choices[ingredient.position]) ?? ingredient;
            const ref = refs.get(choice.food_reference_id ?? '');
            const name = localizedText(ref?.food.names, locale) ?? t('nutrition.food');
            const alternateNames = [...new Set([ingredient, ...alternatives].map(({ food_reference_id }) => {
              const alternative = refs.get(food_reference_id ?? '');
              if (!alternative || alternative.id === ref?.id) return null;
              return localizedText(alternative.food_id === ref?.food_id ? alternative.variant_names ?? alternative.food.names
                : alternative.food.names, locale);
            }).filter(Boolean))];
            const grams = choice.grams;
            const household = grams && ref?.portion_grams && ref.portion_unit ? t('recipes.householdAmount', {
              count: number(grams / ref.portion_grams), unit: t(`recipes.measures.${ref.portion_unit}`),
            }) : null;
            return <li key={ingredient.position}>
              <div><strong>{name}</strong>
                {ref && <small> · {localizedText(ref.variant_names, locale) ?? t(`nutrition.${ref.preparation}`)}</small>}
                {grams !== null && <small> · ≈ {number(grams)} g{household && ` (${household})`}</small>}
                {ingredient.is_optional && <small> · {t(ingredient.optional_default ? 'recipes.optional' : 'recipes.extra')}</small>}
                {!!alternateNames.length && <div><small>{t('recipes.alternatives', { foods: alternateNames.join(', ') })}</small></div>}
              </div>
              {fridgeReady && !recipe.purchase_unit && <FridgeControls locale={locale} id={choice.food_id} name={name}
                status={selected.get(choice.food_id) ?? null} />}
            </li>;
          })}
        </ul>
      </>}
      {instructions && <div className="recipe-instructions">
        <h2>{t('recipes.preparation')}</h2>
        {usingSuggestion && <p className="section-copy">{t('recipes.adaptInstructions')}</p>}
        <p lang={instructions.language}>{instructions.text}</p>
      </div>}
    </section>
  </>;
}
