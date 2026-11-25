'use client';

import { Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { EditRecordButton, RecordDialog } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { summarizeCalories } from '@/lib/calories';
import { calendarDate, isCalendarDay, localFormDateTime } from '@/lib/dates';
import {
  foodAmount, matchesFood, maxMealLines, mealCalories, mealCategories, portionCalories, portionInGrams,
  suggestedMealCategory, totalCalories, usableFood,
  type CatalogFood, type FoodUnit, type MealComponent, type MealRecord, type Portion,
} from '@/lib/food';
import { recordedPreparationLines, resolveRecipeDraft, type RecipeDraft, type RecipeForLog } from '@/lib/recipe-composition';
import { deleteMeal, saveMeal } from './food-actions';
import { RecipeComposer, recipeDraft } from './recipe-composer';

type Draft = { key: number; food: CatalogFood; amount: string; unit: FoodUnit; original?: MealComponent };
type Mode = 'new' | 'edit' | 'remove';
type Kind = 'catalog' | 'manual' | 'recipe' | 'recent' | 'snapshot';
export type FoodLogData = {
  catalog: CatalogFood[];
  recent: MealRecord[];
  recipes: RecipeForLog[];
  zone: string;
};

const preparationOrder = { cooked: 0, prepared: 1, raw: 2 };

function CatalogPicker({ catalog, locale, onSelect, onEstimate }: {
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
            <small>{usableFood(food) ? t(food.portion_unit ?? 'grams') : t('manual')}</small>
          </button>
        </li>)}</ul>
      </section>)}
    </div> : <p className="empty-state" role="status">{t(catalog.length ? 'noResults' : 'emptyCatalog')}</p>}
  </div>;
}

function lineNutrition(line: Draft) {
  const amount = foodAmount(line.amount);
  const original = line.original;
  const grams = amount === null ? null : portionInGrams(amount, line.unit,
    original && line.unit === original.unit
      ? { portion_unit: original.unit === 'g' ? null : original.unit, portion_grams: original.grams_per_unit }
      : line.food);
  const kcal = original?.kcal_per_100g ?? line.food.kcal_per_100g;
  return grams === null || kcal === null ? null : { grams, kcal: portionCalories(grams, kcal) };
}

function draftLines(meal: MealRecord | undefined, catalog: CatalogFood[], repeat = false): Draft[] {
  return (meal?.components ?? []).toSorted((a, b) => a.position - b.position).flatMap((component, key) => {
    const food = catalog.find((item) => item.id === component.food_reference_id);
    if (!food) return [];
    if (!repeat) return [{ key, food, amount: String(component.amount), unit: component.unit, original: component }];
    if (portionInGrams(component.amount, component.unit, food) !== null) {
      return [{ key, food, amount: String(component.amount), unit: component.unit }];
    }
    return [{ key, food, amount: String(Math.max(.01, Number((component.amount * component.grams_per_unit).toFixed(2)))), unit: 'g' }];
  });
}

function mealLabel(meal: MealRecord, catalog: CatalogFood[], locale: Locale, fallback: string) {
  if (meal.name) return meal.name;
  if (meal.preparations?.length) return meal.preparations.map(({ name }) => name).join(' + ');
  const names = meal.components.toSorted((a, b) => a.position - b.position)
    .map((line) => localizedText(catalog.find((item) => item.id === line.food_reference_id)?.food.names, locale))
    .filter(Boolean).join(', ');
  return names || fallback;
}

function MealEditor({ meal, mode, log, locale, day, now, close, initialRecipe }: {
  meal?: MealRecord; mode: Mode; log: FoodLogData; locale: Locale; day?: string; now: string; close: () => void;
  initialRecipe?: string;
}) {
  const { catalog, recent, recipes, zone } = log;
  const home = useTranslations('home');
  const app = useTranslations('app');
  const t = useTranslations('nutrition');
  const meals = useTranslations('meals');
  const tracking = useTranslations('tracking');
  const recipeText = useTranslations('recipes');
  const format = useFormatter();
  const editing = mode !== 'new';
  const initialTime = editing && meal ? localFormDateTime(meal.consumed_at, zone) : day && day < now.slice(0, 10) ? day + now.slice(10) : now;
  const [instant, setInstant] = useState(initialTime);
  const [category, setCategory] = useState(meal?.category ?? suggestedMealCategory(initialTime));
  const snapshots = meal?.preparations?.length ? meal.preparations : null;
  const [kind, setKind] = useState<Kind>(snapshots ? 'snapshot' : initialRecipe ? 'recipe'
    : meal?.manual_kcal != null || (!meal && !catalog.length) ? 'manual' : 'catalog');
  const [lines, setLines] = useState<Draft[]>(() => draftLines(meal, catalog));
  const [showCatalog, setShowCatalog] = useState(!lines.length);
  const [name, setName] = useState(meal?.name ?? '');
  const [kcal, setKcal] = useState(meal?.manual_kcal?.toString() ?? '');
  const [drafts, setDrafts] = useState<RecipeDraft[]>(() => initialRecipe ? [recipeDraft(initialRecipe)] : []);
  const [recordedServings, setRecordedServings] = useState(() => snapshots?.map(({ servings }) => String(servings)) ?? []);
  const [estimate, setEstimate] = useState(false);
  const key = useRef(lines.length);

  const nutrition = lines.map(lineNutrition);
  const total = totalCalories(nutrition.flatMap((line) => line ? [line.kcal] : []));
  const readyTotal = nutrition.length > 0 && nutrition.every((line) => line !== null);
  const incompleteEdit = editing && meal?.components.some((component) =>
    !catalog.some((food) => food.id === component.food_reference_id));
  const refs = new Map(catalog.map((ref) => [ref.id, ref]));
  const groups = drafts.map((draft) => {
    const recipe = recipes.find(({ id }) => id === draft.recipeId);
    return recipe ? resolveRecipeDraft(recipe, draft, refs) : null;
  });
  const recipeLines = groups.flatMap((group) => group ?? []);
  const recipeReady = recipeLines.length > 0 && recipeLines.length <= maxMealLines && groups.every(Boolean);
  const portions = recordedServings.map((servings) => foodAmount(servings, 1000));
  const archived = snapshots && portions.every((value): value is number => value !== null)
    ? recordedPreparationLines(snapshots, portions) : null;
  const displayFields = kind === 'manual' || kind === 'snapshot' || (kind === 'catalog' && lines.length > 0) ||
    (kind === 'recipe' && drafts.length > 0);
  const canSave = kind === 'manual' || (kind === 'catalog' && readyTotal && !incompleteEdit) ||
    (kind === 'recipe' && recipeReady) || (kind === 'snapshot' && !!archived);
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });

  function update(row: Draft) {
    setLines((previous) => previous.map((line) => line.key === row.key ? row : line));
  }

  function add(food: CatalogFood) {
    if (lines.length >= maxMealLines) return;
    const unit = food.portion_unit ?? 'g';
    setLines([...lines, { key: key.current++, food, amount: unit === 'g' ? '' : '1', unit }]);
    setShowCatalog(false);
  }

  function repeatMeal(record: MealRecord) {
    const canRepeat = record.manual_kcal === null && record.components.every((line) =>
      catalog.some((item) => item.id === line.food_reference_id && usableFood(item)));
    const nextLines = canRepeat ? draftLines(record, catalog, true) : [];
    setLines(nextLines);
    key.current = nextLines.length;
    setShowCatalog(!nextLines.length);
    setKind(canRepeat ? 'catalog' : 'manual');
    setEstimate(record.manual_kcal === null && !canRepeat);
    setName((canRepeat && !record.name && !record.preparations?.length
      ? '' : mealLabel(record, catalog, locale, meals(record.category))).slice(0, 120));
    setKcal(canRepeat ? '' : String(mealCalories(record)));
    setCategory(record.category);
  }

  return <RecordDialog title={mode === 'remove' ? app('remove') : editing ? meals('editMeal') : home('logMeal')}
    close={close} canSave={canSave}
    save={saveMeal.bind(null, locale, editing ? meal?.id ?? null : null, zone, snapshots)}
    remove={editing && meal ? deleteMeal.bind(null, locale, meal.id) : undefined}
    removePrompt={t('removeConfirm')} startWithRemoval={mode === 'remove'}>
    {!snapshots && <div className="periods food-kind" role="group" aria-label={t('entryType')}>
      <button type="button" aria-pressed={kind === 'catalog'} onClick={() => setKind('catalog')}>{t('catalog')}</button>
      {!editing && recipes.length > 0 && <button type="button" aria-pressed={kind === 'recipe'} onClick={() => setKind('recipe')}>{t('recipeMode')}</button>}
      {!editing && recent.length > 0 && <button type="button" aria-pressed={kind === 'recent'} onClick={() => setKind('recent')}>{t('repeatTitle')}</button>}
      <button type="button" aria-pressed={kind === 'manual'} onClick={() => setKind('manual')}>{t('manual')}</button>
    </div>}
    <input type="hidden" name="kind" value={kind} />
    {kind === 'recent' && <ul className="food-recent-picker">
      {recent.map((record) => <li key={record.id}>
        <button type="button" onClick={() => repeatMeal(record)}>
          <span><strong>{mealLabel(record, catalog, locale, meals(record.category))}</strong><small>
            {meals(record.category)} · {format.dateTime(new Date(record.consumed_at), { timeZone: zone, dateStyle: 'medium' })}
          </small></span>
          <RotateCcw size={17} aria-hidden />
        </button>
      </li>)}
    </ul>}
    {kind === 'recipe' && <>
      <RecipeComposer recipes={recipes} refs={refs} drafts={drafts} onChange={setDrafts} locale={locale} />
      {recipeLines.length > maxMealLines && <p role="status">{recipeText('maxIngredients', { count: maxMealLines })}</p>}
      {recipeReady && <p className="food-total" aria-live="polite">{t('mealTotal', {
        kcal: number(totalCalories(recipeLines.map(({ referenceId, grams }) => portionCalories(grams, refs.get(referenceId)?.kcal_per_100g ?? 0)))),
      })}</p>}
    </>}
    {kind === 'snapshot' && snapshots && <>
      <div className="recipe-composer">{snapshots.map((group, index) => <section className="recipe-preparation" key={index}>
        <div className="food-line-heading">
          <h3>{group.name}</h3>
          {snapshots.length > 1 && <button type="button" className="icon-button"
            aria-label={recipeText(recordedServings[index] === '0' ? 'restorePreparation' : 'removePreparation', { recipe: group.name })}
            onClick={() => setRecordedServings((values) => values.map((value, position) =>
              position === index ? value === '0' ? String(group.servings) : '0' : value))}>
            {recordedServings[index] === '0' ? <RotateCcw size={17} aria-hidden /> : <Trash2 size={17} aria-hidden />}
          </button>}
        </div>
        {recordedServings[index] === '0' ? <input type="hidden" name="recordedServings" value="0" />
          : <label>{t('servingCount')}
            <input name="recordedServings" type="number" min=".01" max="1000" step=".01" inputMode="decimal"
              value={recordedServings[index]} required onChange={(event) => setRecordedServings((values) =>
                values.map((value, position) => position === index ? event.target.value : value))} />
          </label>}
        {portions[index] !== null && portions[index] > 0 && <details className="recipe-options">
          <summary>{recipeText('ingredients')}</summary>
          <ul className="recipe-preview">{group.ingredients.map((ingredient, position) => <li key={position}>
            {localizedText(ingredient.names, locale) ?? t('food')} · ≈ {number(ingredient.grams * (portions[index] ?? 0) / group.servings)} g
          </li>)}</ul>
        </details>}
      </section>)}</div>
      {archived && <p className="food-total" aria-live="polite">{t('mealTotal', {
        kcal: number(totalCalories(archived.map(({ kcal }) => kcal))),
      })}</p>}
      <label>{t('optionalName')}
        <input name="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
    </>}
    {kind === 'manual' && <>
      {estimate && <p className="section-copy">{t('manualFallback')}</p>}
      <label>{meals('name')}
        <input name="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>{meals('kcal')}
        <input name="kcal" type="number" min="0" step=".01" max="100000" inputMode="decimal" required
          value={kcal} onChange={(event) => setKcal(event.target.value)} />
      </label>
    </>}
    {kind === 'catalog' && <>
      {incompleteEdit && <p role="alert">{t('unavailable')}</p>}
      {lines.length > 0 && <ul className="food-lines">{lines.map((line, index) => {
        const measures = new Set<Portion>();
        if (line.food.portion_unit) measures.add(line.food.portion_unit);
        for (const unit of Object.keys(line.food.additional_portions ?? {}) as Portion[]) measures.add(unit);
        if (line.original && line.original.unit !== 'g') measures.add(line.original.unit);
        const result = nutrition[index];
        const label = localizedText(line.food.food.names, locale) ?? t('food');
        return <li key={line.key}>
          <div className="food-line-heading">
            <div><strong>{label}</strong>
              <small>{localizedText(line.food.variant_names, locale) ?? t(line.food.preparation)}{line.food.is_estimate && <> · {t('estimate')}</>}</small>
            </div>
            <button type="button" className="icon-button" aria-label={t('removeFood', { food: label })} onClick={() => {
              setLines(lines.filter((item) => item.key !== line.key));
              if (lines.length === 1) setShowCatalog(true);
            }}><Trash2 size={17} aria-hidden /></button>
          </div>
          <input type="hidden" name="reference" value={line.food.id} />
          <input type="hidden" name="component_id" value={line.original?.id ?? ''} />
          <div className="food-field-pair">
            <label>{t(measures.size ? 'amount' : 'amountGrams')}
              <input name="amount" type="number" required min=".01" max="10000" step=".01" inputMode="decimal"
                value={line.amount} onChange={(event) => update({ ...line, amount: event.target.value })} />
            </label>
            {measures.size ? <label>{t('unit')}
              <select name="unit" value={line.unit} onChange={(event) => {
                const unit = event.target.value as FoodUnit;
                const amount = unit === 'g' ? (result ? numberForInput(result.grams) : '') : line.unit === 'g' ? '1' : line.amount;
                update({ ...line, unit, amount });
              }}>
                {[...measures].map((unit) => <option key={unit} value={unit}>{t(unit)}</option>)}
                <option value="g">{t('grams')}</option>
              </select>
            </label> : <input type="hidden" name="unit" value="g" />}
          </div>
          {line.unit !== 'g' && <div className="periods food-portions" role="group" aria-label={t('quickAmounts')}>
            {[['0.5', '½'], ['1', '1'], ['2', '2']].map(([amount, display]) =>
              <button key={amount} type="button" aria-pressed={Number(line.amount) === Number(amount)}
                aria-label={t('amountValue', { amount: number(Number(amount)) })}
                onClick={() => update({ ...line, amount })}>{display}</button>)}
          </div>}
          <div className="food-line-heading food-line-note">
            {result && <span>{line.unit !== 'g' && '≈ '}{t('lineEstimate', { grams: number(result.grams), kcal: number(result.kcal) })}</span>}
            {line.food.source_url && <a className="text-link" href={line.food.source_url} target="_blank"
              rel="noreferrer" aria-label={t('sourceFor', { food: label })}>{t('source')}</a>}
          </div>
        </li>;
      })}</ul>}
      {showCatalog && lines.length < maxMealLines && <CatalogPicker catalog={catalog} locale={locale} onSelect={add}
        onEstimate={(food) => {
          setName((localizedText(food.food.names, locale) ?? '').slice(0, 120));
          setKcal('');
          setEstimate(true);
          setKind('manual');
        }} />}
      {!showCatalog && lines.length < maxMealLines && <button type="button" className="button secondary"
        onClick={() => setShowCatalog(true)}>{t('addFood')}</button>}
      {readyTotal && <p className="food-total" aria-live="polite">{t('mealTotal', { kcal: number(total) })}</p>}
      {(editing || name) && <label>{t('optionalName')}
        <input name="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>}
    </>}

    {displayFields && <div className="food-field-pair">
      <label>{tracking('dateTime')}
        <input type="datetime-local" name="consumed_at" required min="1900-01-01T00:00" max={now}
          value={instant} onChange={(event) => setInstant(event.target.value)} />
      </label>
      <label>{meals('category')}
        <select name="category" value={category} onChange={(event) => {
          const selected = mealCategories.find((value) => value === event.target.value);
          if (selected) setCategory(selected);
        }}>
          {mealCategories.map((option) => <option value={option} key={option}>{meals(option)}</option>)}
        </select>
      </label>
    </div>}
  </RecordDialog>;
}

function numberForInput(value: number) {
  return String(Number(value.toFixed(2)));
}

export function useFoodDayRefresh(refreshAt?: string) {
  const router = useRouter();
  useEffect(() => {
    if (!refreshAt) return;
    const boundary = Date.parse(refreshAt);
    let refreshed = false;
    function refresh() {
      if (!refreshed && Date.now() >= boundary && document.visibilityState === 'visible') {
        refreshed = true;
        router.refresh();
      }
    }
    const timer = setTimeout(refresh, Math.max(0, boundary - Date.now() + 100));
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshAt, router]);
}

export function LogMealButton({ locale, log, day, initialRecipe }: {
  locale: Locale; log: FoodLogData; day?: string; initialRecipe?: string;
}) {
  const t = useTranslations('home');
  const [now, setNow] = useState<string | null>(null);
  return <>
    <button type="button" className="button primary" onClick={() => setNow(localFormDateTime(new Date().toISOString(), log.zone))}>
      <Plus size={19} aria-hidden />{t('logMeal')}
    </button>
    {now && <MealEditor locale={locale} log={log} day={day} now={now} mode="new"
      initialRecipe={initialRecipe} close={() => setNow(null)} />}
  </>;
}

export function FoodDiary({ locale, meals, recent, catalog, recipes, zone, date, today, refreshAt, kcal, consumed }: {
  locale: Locale; meals: MealRecord[]; recent: MealRecord[]; catalog: CatalogFood[]; recipes: FoodLogData['recipes'];
  zone: string; date: string; today: string; refreshAt?: string; kcal: number | null; consumed: number;
}) {
  const router = useRouter();
  const home = useTranslations('home');
  const categories = useTranslations('meals');
  const nav = useTranslations('nav');
  const food = useTranslations('nutrition');
  const calories = useTranslations('calories');
  const format = useFormatter();
  const [selected, setSelected] = useState<{ now: string; meal: MealRecord; mode: 'edit' | 'remove' } | null>(null);
  const log = { catalog, recent, recipes, zone };
  const summary = kcal === null ? null : summarizeCalories(consumed, kcal);
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  useFoodDayRefresh(refreshAt);

  function open(mode: 'edit' | 'remove', meal: MealRecord) {
    setSelected({ now: localFormDateTime(new Date().toISOString(), zone), meal, mode });
  }

  return <section className="panel section-panel">
    <div className="panel-heading">
      <h2>{date === today ? home('dailyMeals') : format.dateTime(calendarDate(date), { timeZone: 'UTC', dateStyle: 'long' })}</h2>
      <LogMealButton locale={locale} log={log} day={date} />
    </div>
    <div className="food-day-controls">
      <label>{food('diaryDate')}
        <input type="date" min="1900-01-01" max={today} value={date} onChange={(event) => {
          const day = event.target.value;
          if (isCalendarDay(day) && day >= '1900-01-01' && day <= today) {
            router.push(localePath(locale, '/comidas') + (day === today ? '' : `?fecha=${day}`), { scroll: false });
          }
        }} />
      </label>
      {date !== today && <Link className="text-link" href={localePath(locale, '/comidas')} prefetch={false}>{nav('home')}</Link>}
      <dl className="food-day-totals">
        <div><dt>{food('dayTotal')}</dt><dd>{number(consumed)} kcal</dd></div>
        <div><dt>{food('goal')}</dt><dd>{kcal === null ? '—' : `${number(kcal)} kcal`}</dd></div>
        {summary && <div><dt>{calories(summary.status)}</dt><dd>{number(Math.abs(summary.difference))} kcal</dd></div>}
      </dl>
    </div>
    {meals.length ? <ul className="history food-history">
      {meals.map((meal) => {
        const name = mealLabel(meal, catalog, locale, categories(meal.category));
        return <li key={meal.id}>
          <div className="record-row-copy">
            <strong>{name}</strong>
            <small>{categories(meal.category)} · <time dateTime={meal.consumed_at}>
              {format.dateTime(new Date(meal.consumed_at), { timeZone: zone, hour: 'numeric', minute: '2-digit' })}
            </time></small>
          </div>
          <strong>{number(mealCalories(meal))} kcal</strong>
          <div className="food-row-actions">
            <EditRecordButton label={name} onClick={() => open('edit', meal)} />
            <button type="button" className="icon-button" aria-label={food('removeMeal', { meal: name })}
              onClick={() => open('remove', meal)}><Trash2 size={17} aria-hidden /></button>
          </div>
        </li>;
      })}
    </ul> : <p className="empty-state">{home('emptyMeals')}</p>}
    {selected && <MealEditor key={selected.meal.id} {...selected} log={log} locale={locale} close={() => setSelected(null)} />}
  </section>;
}
