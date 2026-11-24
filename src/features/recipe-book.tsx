import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/page-heading';
import { localePath, type Locale } from '@/i18n/config';
import type { FoodAvailability, FoodNames } from '@/lib/food';
import { ingredientAvailability, recipeIntensities, type FridgeSelection, type RecipeFilter, type RecipeSummary } from '@/lib/recipe-catalog';
import { FoodNavigation } from './food';
import { FridgeControls } from './fridge';

const recipePath = '/comidas/recetario';

function filterQuery(filter: RecipeFilter) {
  return filter === 'all' ? '' : `?intensidad=${filter}`;
}

async function RecipeMeta({ locale, recipe }: { locale: Locale; recipe: RecipeSummary }) {
  const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'recipes' }), getFormatter({ locale })]);
  return <span className="recipe-meta">
    <span className="recipe-intensity">{t(recipe.intensity)}</span>
    {recipe.kcal_per_serving !== null && <span>{t('perServing', { kcal: format.number(recipe.kcal_per_serving) })}</span>}
    {recipe.preparation_minutes !== null && <span>{t('minutes', { count: recipe.preparation_minutes })}</span>}
  </span>;
}

export async function RecipeBook({ locale, state, recipes, filter, selections, demo }: {
  locale: Locale; state: FoodAvailability; recipes: (RecipeSummary & { ingredients: { food_id: string }[] })[];
  filter: RecipeFilter; selections: FridgeSelection[]; demo: boolean;
}) {
  const t = await getTranslations({ locale });
  const href = localePath(locale, recipePath);
  const listed = recipes.toSorted((a, b) => a.names[locale].localeCompare(b.names[locale], locale));

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
          : <ul className="recipe-list">{listed.map((recipe) => {
            const availability = ingredientAvailability(recipe.ingredients, selections);
            const marked = availability.available + availability.unavailable;
            return <li key={recipe.id}>
              <Link href={`${href}/${recipe.id}${filterQuery(filter)}`} prefetch={false}>
                <div className="recipe-list-copy">
                  <strong>{recipe.names[locale]}</strong>
                  <RecipeMeta locale={locale} recipe={recipe} />
                  {marked > 0 && <small className="recipe-availability">{t('recipes.marked', availability)}
                    {availability.unavailable > 0 && <> · {t('recipes.missing', availability)}</>}
                  </small>}
                </div>
                <ChevronRight size={18} aria-hidden />
              </Link>
            </li>;
          })}</ul>}
    </section>
  </>;
}

type Detail = RecipeSummary & {
  base_servings: number;
  instructions: Partial<FoodNames>;
  ingredients: { food_id: string; position: number; is_main: boolean; grams: number | null; food: { names: FoodNames } }[];
};

export async function RecipeDetail({ locale, recipe, filter, selections, fridgeReady }: {
  locale: Locale; recipe: Detail; filter: RecipeFilter; selections: FridgeSelection[]; fridgeReady: boolean;
}) {
  const [t, format] = await Promise.all([getTranslations({ locale }), getFormatter({ locale })]);
  const selected = new Map(selections.map(({ food_id, status }) => [food_id, status]));
  const instructions = recipe.instructions[locale]?.trim();
  return <>
    <PageHeading title={recipe.names[locale]}>
      <Link className="button secondary" href={localePath(locale, recipePath) + filterQuery(filter)} prefetch={false}>
        <ArrowLeft size={17} aria-hidden />{t('meals.recipes')}
      </Link>
    </PageHeading>
    <FoodNavigation section="recipes" demo={false} />
    <section className="panel section-panel recipe-detail">
      <RecipeMeta locale={locale} recipe={recipe} />
      {recipe.ingredients.length > 0 && <>
        <div className="panel-heading">
          <h2>{t('recipes.ingredients')}</h2>
          <small>{t('recipes.servings', { count: recipe.base_servings })}</small>
        </div>
        <ul className="compact-food-list">
          {recipe.ingredients.toSorted((a, b) => a.position - b.position).map((ingredient) => {
            const name = ingredient.food.names[locale];
            return <li key={ingredient.position}>
              <div><strong>{name}</strong>
                {ingredient.grams !== null && <small> · {format.number(ingredient.grams)} g</small>}
              </div>
              {fridgeReady && <FridgeControls locale={locale} id={ingredient.food_id} name={name}
                status={selected.get(ingredient.food_id) ?? null} />}
            </li>;
          })}
        </ul>
      </>}
      {instructions && <div className="recipe-instructions"><h2>{t('recipes.preparation')}</h2><p>{instructions}</p></div>}
    </section>
  </>;
}
