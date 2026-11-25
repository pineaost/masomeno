import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/page-heading';
import { localePath, type Locale } from '@/i18n/config';
import { localizedText, localizedValue } from '@/i18n/localized-text';
import type { FoodAvailability, FoodNames } from '@/lib/food';
import { readinessPriority, recipeAvailability, recipeIntensities,
  type FridgeSelection, type RecipeFilter, type RecipeSummary,
} from '@/lib/recipe-catalog';
import type { preparationNutrition, RecipeForLog } from '@/lib/recipe-composition';
import { FoodNavigation } from './food';
import { LogMealButton, type FoodLogData } from './food-diary';
import { FridgeControls } from './fridge';

const recipePath = '/comidas/recetario';

function filterQuery(filter: RecipeFilter) {
  return filter === 'all' ? '' : `?intensidad=${filter}`;
}

async function RecipeMeta({ locale, recipe }: { locale: Locale; recipe: RecipeSummary }) {
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'recipes' }), getFormatter({ locale })]);
  return <span className="recipe-meta">
    <span className="recipe-intensity">{t(recipe.intensity)}</span>
    {recipe.kcal_per_serving !== null && <span className="recipe-kcal">≈ {t('perServing', { kcal: format.number(recipe.kcal_per_serving, { maximumFractionDigits: 0 }) })}</span>}
    {recipe.preparation_minutes !== null && <span>{t('minutes', { count: recipe.preparation_minutes })}</span>}
  </span>;
}

export async function RecipeBook({ locale, state, recipes, filter, selections, demo }: {
  locale: Locale; state: FoodAvailability; recipes: (RecipeSummary & RecipeForLog)[];
  filter: RecipeFilter; selections: FridgeSelection[]; demo: boolean;
}) {
  const t = await getTranslations({ locale });
  const href = localePath(locale, recipePath);
  const listed = recipes.map((recipe) => ({
    recipe, name: localizedText(recipe.names, locale) ?? t('recipes.untitled'), availability: recipeAvailability(recipe, selections),
  })).sort((a, b) =>
    readinessPriority(b.availability) - readinessPriority(a.availability) || a.name.localeCompare(b.name, locale));

  return <>
    <PageHeading title={t('meals.recipes')} visuallyHidden />
    <FoodNavigation section="recipes" demo={demo} />
    <section className="panel section-panel recipe-book">
      <nav className="periods recipe-filters" aria-label={t('recipes.filters')}>
        {(['all', ...recipeIntensities] as const).map((option) => <Link key={option} href={href + filterQuery(option)} prefetch={false}
          aria-current={option === filter ? 'page' : undefined}>{t(`recipes.${option}`)}</Link>)}
      </nav>
      {state !== 'ready' ? <p className="empty-state" role="status">{t(`recipeState.${state}`)}</p>
        : !listed.length ? <p className="empty-state">{t(filter === 'all' ? 'empty.recipes.title' : 'recipes.emptyFilter')}</p>
          : <ul className="recipe-list">{listed.map(({ recipe, name, availability }) => <li key={recipe.id}>
            <Link href={`${href}/${recipe.id}${filterQuery(filter)}`} prefetch={false}>
              <div className="recipe-list-copy">
                <strong>{name}</strong>
                <RecipeMeta locale={locale} recipe={recipe} />
                {availability.total > 0 && <small className="recipe-availability">
                  {t('recipes.marked', availability)}
                  {availability.unavailable > 0 && <> · {t('recipes.missing', availability)}</>}
                  {availability.unknown > 0 && <> · {t('recipes.unknown', availability)}</>}
                </small>}
              </div>
              <ChevronRight size={18} aria-hidden />
            </Link>
          </li>)}</ul>}
    </section>
  </>;
}

type Detail = RecipeSummary & RecipeForLog & {
  instructions: Partial<FoodNames>;
  nutrition: ReturnType<typeof preparationNutrition>;
};

export async function RecipeDetail({ locale, recipe, filter, selections, fridgeReady, log }: {
  locale: Locale; recipe: Detail; filter: RecipeFilter; selections: FridgeSelection[]; fridgeReady: boolean; log: FoodLogData;
}) {
  const [t, format] = await Promise.all([getTranslations({ locale }), getFormatter({ locale })]);
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const refs = new Map(log.catalog.map((ref) => [ref.id, ref]));
  const instructions = localizedValue(recipe.instructions, locale);
  const title = localizedText(recipe.names, locale) ?? t('recipes.untitled');
  const canLog = log.recipes.some(({ id }) => id === recipe.id);
  const nutrition = recipe.nutrition;
  const number = (value: number) => format.number(value, { maximumFractionDigits: 1 });

  return <>
    <PageHeading title={title}>
      <Link className="button secondary" href={localePath(locale, recipePath) + filterQuery(filter)} prefetch={false}>
        <ArrowLeft size={17} aria-hidden />{t('meals.recipes')}
      </Link>
    </PageHeading>
    <FoodNavigation section="recipes" demo={false} />
    <section className="panel section-panel recipe-detail">
      <div className="food-line-heading">
        <RecipeMeta locale={locale} recipe={recipe} />
        {canLog && <LogMealButton locale={locale} log={log} initialRecipe={recipe.id} />}
      </div>
      {recipe.purchase_unit && <p className="section-copy">{t('recipes.purchaseEstimate')}</p>}
      {nutrition && <dl className="recipe-nutrients" aria-label={t('recipes.nutritionPerServing')}>
        {(['protein', 'carbs', 'fat'] as const).map((key) => <div key={key}>
          <dt>{t(`recipes.${key}`)}</dt><dd>{nutrition[key] === null ? '—' : `≈ ${number(nutrition[key])} g`}</dd>
        </div>)}
      </dl>}
      {recipe.ingredients.length > 0 && <>
        <div className="panel-heading">
          <h2>{t('recipes.ingredients')}</h2>
          <small>{t('recipes.servings', { count: recipe.base_servings })}</small>
        </div>
        <ul className="compact-food-list">
          {recipe.ingredients.toSorted((a, b) => a.position - b.position).map((ingredient) => {
            const ref = refs.get(ingredient.food_reference_id ?? '');
            const name = localizedText(ref?.food.names, locale) ?? t('nutrition.food');
            const alternatives = recipe.alternatives.filter(({ ingredient_position }) => ingredient_position === ingredient.position);
            const alternateNames = [...new Set(alternatives.map(({ food_reference_id }) => {
              const alternative = refs.get(food_reference_id);
              return alternative?.id === ref?.id ? null : localizedText(alternative?.variant_names ?? alternative?.food.names, locale);
            }).filter(Boolean))];
            const grams = ingredient.grams;
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
              {fridgeReady && !recipe.purchase_unit && <FridgeControls locale={locale} id={ingredient.food_id} name={name}
                status={selected.get(ingredient.food_id) ?? null} />}
            </li>;
          })}
        </ul>
      </>}
      {instructions && <div className="recipe-instructions">
        <h2>{t('recipes.preparation')}</h2><p lang={instructions.language}>{instructions.text}</p>
      </div>}
    </section>
  </>;
}
