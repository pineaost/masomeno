'use client';

import { Check, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { EditRecordButton, RecordDialog } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { localizedText } from '@/i18n/localized-text';
import { calorieProgress } from '@/lib/calories';
import { calendarDate, localFormDateTime } from '@/lib/dates';
import {
  foodAmount, maxMealLines, mealCalories, mealCategories, portionCalories, portionInGrams, preferredFoodUnit, quickFoodAmounts,
  suggestedMealCategory, totalCalories, usableFood,
  type CatalogFood, type FoodUnit, type MealComponent, type MealRecord,
} from '@/lib/food';
import type { MealDraftItem } from '@/lib/meal-composition';
import { mealLabel } from '@/lib/meal-label';
import { recordedPreparationLines, type RecipeDraft, type RecipeForLog } from '@/lib/recipe-composition';
import { DiaryCalendar } from './diary-calendar';
import { deleteMeal, saveMeal } from './food-actions';
import { CatalogPicker, HouseholdAmount, QuickAmounts } from './food-picker';
import { MealItems, mealItemValues, type ItemEdit } from './meal-items';

type Draft = { key: number; food: CatalogFood; amount: string; unit: FoodUnit; original?: MealComponent };
type Mode = 'new' | 'edit' | 'remove';
type Kind = 'catalog' | 'manual' | 'recipe' | 'recent' | 'snapshot';
export type FoodLogData = {
  catalog: CatalogFood[];
  recent: MealRecord[];
  recipes: RecipeForLog[];
  zone: string;
};

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

function draftLines(meal: MealRecord | undefined, catalog: CatalogFood[]): Draft[] {
  return (meal?.components ?? []).toSorted((a, b) => a.position - b.position).flatMap((component, key) => {
    const food = catalog.find((item) => item.id === component.food_reference_id);
    return food ? [{ key, food, amount: String(component.amount), unit: component.unit, original: component }] : [];
  });
}

function MealEditor({ meal, mode, log, locale, day, now, close, initialRecipe }: {
  meal?: MealRecord; mode: Mode; log: FoodLogData; locale: Locale; day?: string; now: string; close: () => void;
  initialRecipe?: RecipeDraft;
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
  const [items, setItems] = useState<MealDraftItem[]>([]);
  const [itemEdit, setItemEdit] = useState<ItemEdit | null>(() => initialRecipe
    ? { index: null, draft: { type: 'recipe', recipe: initialRecipe } } : null);
  const [picking, setPicking] = useState(!initialRecipe);
  const [lines, setLines] = useState<Draft[]>(() => draftLines(meal, catalog));
  const [showCatalog, setShowCatalog] = useState(!lines.length);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [name, setName] = useState(meal?.name ?? '');
  const [kcal, setKcal] = useState(meal?.manual_kcal?.toString() ?? '');
  const [recordedServings, setRecordedServings] = useState(() => snapshots?.map(({ servings }) => String(servings)) ?? []);
  const [estimate, setEstimate] = useState(false);
  const key = useRef(lines.length);

  const composing = !editing && (kind === 'catalog' || kind === 'recipe');
  const legacy = editing && kind === 'catalog';
  const legacyValues = lines.map(lineNutrition);
  const incompleteEdit = legacy && meal?.components.some((component) =>
    !catalog.some((food) => food.id === component.food_reference_id));
  const refs = new Map(catalog.map((ref) => [ref.id, ref]));
  const values = items.map((item) => mealItemValues(item, refs, recipes));
  const count = values.reduce((sum, item) => sum + (item?.count ?? 0), 0);
  const editingValue = itemEdit && mealItemValues(itemEdit.draft, refs, recipes);
  const previewValues = itemEdit?.index === null ? [...values, editingValue]
    : values.map((item, index) => index === itemEdit?.index ? editingValue : item);
  const portions = recordedServings.map((servings, index) => foodAmount(servings, snapshots?.[index]?.measureUnit ? 10000 : 1000));
  const archived = snapshots && portions.every((value): value is number => value !== null)
    ? recordedPreparationLines(snapshots, portions) : null;
  const visibleValues = composing ? previewValues : legacy ? legacyValues : archived ?? [];
  const total = visibleValues.length && visibleValues.every(Boolean)
    ? totalCalories(visibleValues.flatMap((item) => item ? [item.kcal] : [])) : null;
  const canSave = kind === 'manual' || (legacy && legacyValues.length > 0 && legacyValues.every(Boolean) && !incompleteEdit && activeLine === null) ||
    (composing && !itemEdit && count > 0 && count <= maxMealLines && values.every(Boolean)) ||
    (kind === 'snapshot' && !!archived && activeLine === null);
  const number = (value: number) => format.number(value, { useGrouping: 'always', maximumFractionDigits: 2 });
  const amountText = (value: number, unit?: FoodUnit) => unit === 'g' ? `${number(value)} g`
    : unit ? `${number(value)} ${t(unit).toLocaleLowerCase(locale)}` : recipeText('servings', { count: value });

  function changeKind(next: Kind) {
    setKind(next);
    if (next === 'catalog' || next === 'recipe') setPicking(true);
  }

  function useManual(food: CatalogFood) {
    setName((localizedText(food.food.names, locale) ?? '').slice(0, 120));
    setKcal('');
    setEstimate(true);
    setKind('manual');
  }

  function addLegacy(food: CatalogFood) {
    if (lines.length >= maxMealLines) return;
    const unit = preferredFoodUnit(food);
    const id = key.current++;
    setLines([...lines, { key: id, food, amount: unit === 'g' ? '' : '1', unit }]);
    setActiveLine(id);
    setShowCatalog(false);
  }

  function repeatMeal(record: MealRecord) {
    const canRepeat = record.manual_kcal === null && record.components.length > 0 &&
      record.components.every(({ food_reference_id }) => {
        const ref = refs.get(food_reference_id);
        return ref && usableFood(ref);
      });
    const next: MealDraftItem[] = [];
    if (canRepeat && record.preparations?.length) {
      for (const group of record.preparations) {
        for (const ingredient of group.ingredients) {
          const ref = refs.get(ingredient.referenceId);
          const unit = ref && group.measureUnit && portionInGrams(group.servings, group.measureUnit, ref) !== null ? group.measureUnit : 'g';
          next.push({
            type: 'food', referenceId: ingredient.referenceId, unit,
            amount: String(unit === 'g' ? ingredient.grams : group.servings), role: group.role,
          });
        }
      }
    } else if (canRepeat) {
      for (const { original, food, amount, unit } of draftLines(record, catalog)) {
        const grams = original && portionCalories(original.amount * original.grams_per_unit, 100);
        const usesGrams = grams !== undefined && portionInGrams(Number(amount), unit, food) === null;
        next.push({ type: 'food', referenceId: food.id, unit: usesGrams ? 'g' : unit, amount: usesGrams ? String(grams) : amount });
      }
    }
    setItems(next);
    setItemEdit(null);
    setPicking(!next.length);
    setKind(canRepeat ? 'catalog' : 'manual');
    setEstimate(record.manual_kcal === null && !canRepeat);
    setName((canRepeat && !record.name && !record.preparations?.length
      ? '' : mealLabel(record, catalog, locale, meals(record.category))).slice(0, 120));
    setKcal(canRepeat ? '' : String(mealCalories(record)));
  }

  function changeArchived(index: number, value: string) {
    setRecordedServings((previous) => previous.map((old, position) => position === index ? value : old));
  }

  return <RecordDialog title={mode === 'remove' ? app('remove') : editing ? meals('editMeal') : home('logMeal')}
    close={close} canSave={canSave} fitViewport
    footer={total === null ? undefined : <p className="food-total meal-total-bar" aria-live="polite">{t('mealTotal', { kcal: number(total) })}</p>}
    save={saveMeal.bind(null, locale, editing ? meal?.id ?? null : null, zone, snapshots)}
    remove={editing && meal ? deleteMeal.bind(null, locale, meal.id) : undefined}
    removePrompt={t('removeConfirm')} startWithRemoval={mode === 'remove'}>
    {!snapshots && <div className="periods food-kind" role="group" aria-label={t('entryType')}>
      <button type="button" aria-pressed={kind === 'catalog'} disabled={!!itemEdit || activeLine !== null}
        onClick={() => changeKind('catalog')}>{t('catalog')}</button>
      {!editing && recipes.length > 0 && <button type="button" aria-pressed={kind === 'recipe'} disabled={!!itemEdit}
        onClick={() => changeKind('recipe')}>{t('recipeMode')}</button>}
      {!editing && recent.length > 0 && <button type="button" aria-pressed={kind === 'recent'} disabled={!!itemEdit}
        onClick={() => changeKind('recent')}>{t('repeatTitle')}</button>}
      <button type="button" aria-pressed={kind === 'manual'} disabled={!!itemEdit || activeLine !== null}
        onClick={() => changeKind('manual')}>{t('manual')}</button>
    </div>}
    <div className="food-field-pair">
      <label>{meals('category')}
        <select name="category" value={category} onChange={(event) => {
          const selected = mealCategories.find((value) => value === event.target.value);
          if (selected) setCategory(selected);
        }}>
          {mealCategories.map((option) => <option value={option} key={option}>{meals(option)}</option>)}
        </select>
      </label>
      <label>{tracking('dateTime')}
        <input type="datetime-local" name="consumed_at" required min="1900-01-01T00:00" max={now}
          value={instant} onChange={(event) => setInstant(event.target.value)} />
      </label>
    </div>
    <input type="hidden" name="kind" value={composing ? 'composition' : kind} />
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
    {composing && <MealItems key={kind} {...{ locale, catalog, recipes, refs, items, picking }}
      source={kind} edit={itemEdit} onItems={setItems} onEdit={setItemEdit} onPick={setPicking} onEstimate={useManual} />}
    {composing && count > maxMealLines && <p role="status">{recipeText('maxIngredients', { count: maxMealLines })}</p>}
    {kind === 'snapshot' && snapshots && <ul className="meal-items-list">
      {snapshots.map((group, index) => {
        const portion = portions[index];
        const removed = portion === 0;
        const preview = portion ? recordedPreparationLines([group], [portion]) : null;
        return <li key={index}>
          <input type="hidden" name="recordedServings" value={recordedServings[index]} />
          <div className="meal-item-row">
            <span className="record-row-copy">
              <strong>{group.name}</strong>
              <small>{removed ? t('itemRemoved') : <>
                {group.role && <>{t(group.role)} · </>}{amountText(portion ?? group.servings, group.measureUnit)}
                {preview && <> · ≈ {number(totalCalories(preview.map(({ kcal }) => kcal)))} kcal</>}
              </>}</small>
            </span>
            <div className="food-row-actions">
              {!removed && <button type="button" className="icon-button" aria-label={t('editItem', { food: group.name })}
                disabled={activeLine !== null} onClick={() => setActiveLine(index)}><Pencil size={17} aria-hidden /></button>}
              {snapshots.length > 1 && <button type="button" className="icon-button" disabled={activeLine !== null}
                aria-label={recipeText(removed ? 'restorePreparation' : 'removePreparation', { recipe: group.name })}
                onClick={() => changeArchived(index, removed ? String(group.servings) : '0')}>
                {removed ? <RotateCcw size={17} aria-hidden /> : <Trash2 size={17} aria-hidden />}
              </button>}
            </div>
          </div>
          {preview && (!group.measureUnit || activeLine === index) && <details className="recipe-options recorded-ingredients">
            <summary>{recipeText('ingredients')}</summary>
            <ul className="recipe-preview">{group.ingredients.map((ingredient, position) => <li key={position}>
              {localizedText(ingredient.names, locale) ?? t('food')}
              {ingredient.variantNames && <> · {localizedText(ingredient.variantNames, locale)}</>} · ≈ {number(preview[position].grams)} g
            </li>)}</ul>
          </details>}
          {activeLine === index && <div className="meal-item-editor">
            <div className="meal-quantity-controls">
              <label>{group.measureUnit ? t(group.measureUnit === 'g' ? 'amountGrams' : group.measureUnit) : t('servingCount')}
                <input type="text" inputMode="decimal" maxLength={10}
                  value={recordedServings[index]} onChange={(event) => changeArchived(index, event.target.value)} />
              </label>
              <QuickAmounts values={group.measureUnit ? quickFoodAmounts(group.measureUnit) : [0.5, 1, 1.5, 2]}
                selected={portion ?? 0} onChange={(value) => changeArchived(index, String(value))} />
            </div>
            <button type="button" className="button primary compact-confirm" disabled={!preview}
              onClick={() => setActiveLine(null)}><Check size={16} aria-hidden />{t('confirmItem')}</button>
          </div>}
        </li>;
      })}
    </ul>}
    {kind === 'manual' && <>
      {estimate && <p className="section-copy">{t('manualFallback')}</p>}
      <label>{meals('name')}
        <input name="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>{meals('kcal')}
        <input name="kcal" type="text" inputMode="decimal" maxLength={10} required
          value={kcal} onChange={(event) => setKcal(event.target.value)} />
      </label>
    </>}
    {legacy && <>
      {incompleteEdit && <p role="alert">{t('unavailable')}</p>}
      <ul className="meal-items-list">{lines.map((line, index) => {
        const result = legacyValues[index];
        const label = localizedText(line.food.food.names, locale) ?? t('food');
        const change = (amount: string, unit: FoodUnit) =>
          setLines((previous) => previous.map((item) => item.key === line.key ? { ...item, amount, unit } : item));
        return <li key={line.key}>
          <input type="hidden" name="reference" value={line.food.id} />
          <input type="hidden" name="component_id" value={line.original?.id ?? ''} />
          <input type="hidden" name="amount" value={line.amount} />
          <input type="hidden" name="unit" value={line.unit} />
          <div className="meal-item-row">
            <span className="record-row-copy"><strong>{label}</strong>
              {result && <small>{amountText(Number(line.amount), line.unit)} · ≈ {number(result.kcal)} kcal</small>}
            </span>
            <div className="food-row-actions">
              <button type="button" className="icon-button" aria-label={t('editItem', { food: label })} disabled={activeLine !== null}
                onClick={() => { setActiveLine(line.key); setShowCatalog(false); }}><Pencil size={17} aria-hidden /></button>
              <button type="button" className="icon-button" aria-label={t('removeFood', { food: label })}
                disabled={activeLine !== null && activeLine !== line.key} onClick={() => {
                  setLines(lines.filter((item) => item.key !== line.key));
                  setActiveLine(null);
                  if (lines.length === 1) setShowCatalog(true);
                }}><Trash2 size={17} aria-hidden /></button>
            </div>
          </div>
          {activeLine === line.key && <div className="meal-item-editor">
            <HouseholdAmount food={line.food} amount={line.amount} unit={line.unit} grams={result?.grams} historicalUnit={line.original?.unit}
              onChange={change} />
            <button type="button" className="button primary compact-confirm" disabled={!result}
              onClick={() => setActiveLine(null)}><Check size={16} aria-hidden />{t('confirmItem')}</button>
          </div>}
        </li>;
      })}</ul>
      {activeLine === null && lines.length < maxMealLines && (showCatalog
        ? <CatalogPicker catalog={catalog} locale={locale} onSelect={addLegacy} onEstimate={useManual} />
        : <button type="button" className="button secondary add-meal-item" onClick={() => setShowCatalog(true)}>{t('addFood')}</button>)}
    </>}
    {kind !== 'manual' && (editing || (composing && items.length > 0)) && <details className="recipe-options">
      <summary>{t('optionalName')}</summary>
      <label>{t('optionalName')}
        <input name="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
    </details>}
  </RecordDialog>;
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
  locale: Locale; log: FoodLogData; day?: string; initialRecipe?: RecipeDraft;
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
  const balance = calorieProgress(consumed, kcal);
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
      <DiaryCalendar date={date} today={today} onSelect={(day) =>
        router.push(localePath(locale, '/comidas') + (day === today ? '' : `?fecha=${day}`), { scroll: false })} />
      {date !== today && <Link className="text-link" href={localePath(locale, '/comidas')} prefetch={false}>{nav('home')}</Link>}
      <dl className="food-day-totals">
        <div><dt>{food('dayTotal')}</dt><dd>{number(consumed)} kcal</dd></div>
        <div><dt>{food('goal')}</dt><dd>{kcal === null ? '—' : `${number(kcal)} kcal`}</dd></div>
        {balance && <div><dt>{calories('targetZone')}</dt>
          <dd>{calories(`diary.${balance.status}`, { kcal: number(balance.distanceToRange) })}</dd></div>}
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
