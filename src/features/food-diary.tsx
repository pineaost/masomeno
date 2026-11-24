'use client';

import { RotateCcw, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { AddRecordButton, EditRecordButton, RecordDialog } from '@/components/tracking-ui';
import { localePath, type Locale } from '@/i18n/config';
import { localFormDateTime } from '@/lib/dates';
import {
  foodAmount, matchesFood, maxMealLines, mealCalories, mealCategories, portionCalories, portionInGrams, totalCalories,
  type CatalogFood, type FoodUnit, type MealComponent, type MealRecord,
} from '@/lib/food';
import { deleteMeal, saveMeal } from './food-actions';

type Draft = {
  key: number;
  food: CatalogFood;
  amount: string;
  unit: FoodUnit;
  original?: MealComponent;
};
type EntryMode = 'new' | 'manual' | 'edit' | 'remove' | 'repeat';

function CatalogPicker({ catalog, locale, onSelect }: {
  catalog: CatalogFood[]; locale: Locale; onSelect: (food: CatalogFood) => void;
}) {
  const t = useTranslations('nutrition');
  const format = useFormatter();
  const [query, setQuery] = useState('');
  const groups = new Map<string, { title: string; foods: CatalogFood[] }>();
  for (const food of catalog.filter((item) => matchesFood(item, query))
    .sort((a, b) => a.food.names[locale].localeCompare(b.food.names[locale], locale))) {
    const category = food.food.category;
    const group = groups.get(category.id) ?? { title: category.names[locale], foods: [] };
    group.foods.push(food);
    groups.set(category.id, group);
  }

  return (
    <div className="food-catalog">
      <label className="search-field">
        <Search size={18} aria-hidden />
        <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
      </label>
      {groups.size ? <div className="food-results">
        {[...groups].map(([id, { title, foods }]) => (
          <section key={id}>
            <h3>{title}</h3>
            <ul>
              {foods.map((food) => (
                <li key={food.id}>
                  <button type="button" disabled={food.validation !== 'verified' || food.kcal_per_100g === null}
                    onClick={() => onSelect(food)}>
                    <span><strong>{food.food.names[locale]}</strong><small>{t(food.preparation)}</small></span>
                    <small>{food.validation !== 'verified' || food.kcal_per_100g === null
                      ? t('unverified') : t('per100', { kcal: format.number(food.kcal_per_100g) })}</small>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div> : <p className="empty-state" role="status">{t(catalog.length ? 'noResults' : 'emptyCatalog')}</p>}
    </div>
  );
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

function MealEditor({ meal, repeatName, mode, catalog, locale, dateTime, zone, close }: {
  meal?: MealRecord;
  repeatName?: string;
  mode: EntryMode;
  catalog: CatalogFood[];
  locale: Locale;
  dateTime: string;
  zone: string;
  close: () => void;
}) {
  const home = useTranslations('home');
  const app = useTranslations('app');
  const t = useTranslations('nutrition');
  const meals = useTranslations('meals');
  const tracking = useTranslations('tracking');
  const format = useFormatter();
  const repeat = mode === 'repeat';
  const editing = mode === 'edit' || mode === 'remove';
  const repeatAsEstimate = repeat && meal?.manual_kcal === null && meal.components.some((line) =>
    !catalog.some((item) => item.id === line.food_reference_id && item.validation === 'verified' && item.kcal_per_100g !== null));
  const [kind, setKind] = useState(mode === 'manual' || meal?.manual_kcal != null || repeatAsEstimate || !catalog.length
    ? 'manual' : 'catalog');
  const [lines, setLines] = useState<Draft[]>(() =>
    (repeatAsEstimate ? [] : meal?.components ?? []).toSorted((a, b) => a.position - b.position).flatMap((component, index) => {
      const food = catalog.find((item) => item.id === component.food_reference_id);
      if (!food) return [];
      if (!repeat) return [{ key: index, food, amount: String(component.amount), unit: component.unit, original: component }];
      if (portionInGrams(component.amount, component.unit, food) !== null) {
        return [{ key: index, food, amount: String(component.amount), unit: component.unit }];
      }
      return [{ key: index, food, amount: String(Math.max(.01, Number((component.amount * component.grams_per_unit).toFixed(2)))), unit: 'g' }];
    }));
  const key = useRef(lines.length);
  const [showCatalog, setShowCatalog] = useState(lines.length === 0);
  const nutrition = lines.map(lineNutrition);
  const readyTotal = nutrition.length > 0 && nutrition.every((line) => line !== null);
  const total = totalCalories(nutrition.flatMap((line) => line ? [line.kcal] : []));
  const number = (value: number) => format.number(value, { maximumFractionDigits: 2 });

  function update(row: Draft) {
    setLines(lines.map((line) => line.key === row.key ? row : line));
  }

  function add(food: CatalogFood) {
    if (lines.length >= maxMealLines) return;
    const unit = food.portion_unit ?? 'g';
    setLines([...lines, { key: key.current++, food, amount: unit === 'g' ? '' : '1', unit }]);
    setShowCatalog(false);
  }

  return (
    <RecordDialog title={mode === 'remove' ? app('remove') : editing ? meals('editMeal')
      : repeat ? t('repeatTitle') : mode === 'manual' ? t('manual') : home('logMeal')} close={close}
      save={saveMeal.bind(null, locale, editing ? meal?.id ?? null : null, zone)}
      remove={editing && meal ? deleteMeal.bind(null, locale, meal.id) : undefined}
      removePrompt={t('removeConfirm')} startWithRemoval={mode === 'remove'}>
      <div className="periods food-kind" role="group" aria-label={t('entryType')}>
        <button type="button" aria-pressed={kind === 'catalog'} onClick={() => setKind('catalog')}>{t('catalog')}</button>
        <button type="button" aria-pressed={kind === 'manual'} onClick={() => setKind('manual')}>{t('manual')}</button>
      </div>
      <input type="hidden" name="kind" value={kind} />
      <div className="food-field-pair">
        <label>
          {meals('category')}
          <select name="category" defaultValue={meal?.category ?? 'firstMeal'}>
            {mealCategories.map((category) => <option value={category} key={category}>{meals(category)}</option>)}
          </select>
        </label>
        <label>
          {tracking('dateTime')}
          <input type="datetime-local" name="consumed_at" required min="1900-01-01T00:00" max={dateTime}
            defaultValue={editing && meal ? localFormDateTime(meal.consumed_at, zone) : dateTime} />
          <small className="section-copy">{zone}</small>
        </label>
      </div>
      <label>
        {kind === 'manual' ? meals('name') : t('optionalName')}
        <input name="name" required={kind === 'manual'} maxLength={120}
          defaultValue={meal?.name ?? (repeatAsEstimate ? repeatName?.slice(0, 120) : '')} />
      </label>
      {kind === 'manual' ? (
        <>
          {repeatAsEstimate && <p className="section-copy">{t('repeatEstimate')}</p>}
          <label>
            {meals('kcal')}
            <input name="kcal" type="number" min="0" step=".01" max="100000" inputMode="decimal" required
              defaultValue={repeatAsEstimate && meal ? mealCalories(meal) : meal?.manual_kcal ?? ''} />
          </label>
        </>
      ) : (
        <>
          {lines.length > 0 && <p className="section-copy">{t('roughAmount')}</p>}
          {lines.length > 0 && <ul className="food-lines">
            {lines.map((line, index) => {
              const serving = line.original?.unit !== 'g' && line.original ? line.original.unit : line.food.portion_unit;
              const result = nutrition[index];
              const label = line.food.food.names[locale];
              return <li key={line.key}>
                <div className="food-line-heading">
                  <div><strong>{label}</strong><small>{t(line.food.preparation)}</small></div>
                  <button type="button" className="icon-button" aria-label={t('removeFood', { food: label })}
                    onClick={() => {
                      setLines(lines.filter((item) => item.key !== line.key));
                      if (lines.length === 1) setShowCatalog(true);
                    }}><Trash2 size={17} aria-hidden /></button>
                </div>
                <input type="hidden" name="reference" value={line.food.id} />
                <input type="hidden" name="component_id" value={line.original?.id ?? ''} />
                <div className="food-field-pair">
                  <label>{t('amount')}
                    <input name="amount" type="number" required min=".01" max="10000" step=".01" inputMode="decimal"
                      value={line.amount} onChange={(event) => update({ ...line, amount: event.target.value })} />
                  </label>
                  <label>{t('unit')}
                    <select name="unit" value={line.unit} onChange={(event) => update({ ...line, unit: event.target.value as FoodUnit })}>
                      <option value="g">{t('grams')}</option>
                      {serving && <option value={serving}>{t(serving)}</option>}
                    </select>
                  </label>
                </div>
                <div className="food-line-heading food-line-note">
                  <span>{result ? t('lineEstimate', { grams: number(result.grams), kcal: number(result.kcal) }) : '—'}</span>
                  {line.food.source_url && <a className="text-link" href={line.food.source_url} target="_blank"
                    rel="noreferrer" title={line.food.source_description ?? undefined}>{t('source')}</a>}
                </div>
              </li>;
            })}
          </ul>}
          {showCatalog && lines.length < maxMealLines && <CatalogPicker catalog={catalog} locale={locale} onSelect={add} />}
          {!showCatalog && lines.length < maxMealLines && <button type="button" className="button secondary"
            onClick={() => setShowCatalog(true)}>{t('addFood')}</button>}
          {readyTotal && <p className="food-total" aria-live="polite">{t('mealTotal', { kcal: number(total) })}</p>}
        </>
      )}
    </RecordDialog>
  );
}

export function FoodDiary({ locale, meals, recent, catalog, zone, dateTime, initialOpen }: {
  locale: Locale; meals: MealRecord[]; recent: MealRecord[]; catalog: CatalogFood[]; zone: string; dateTime: string; initialOpen: boolean;
}) {
  const router = useRouter();
  const home = useTranslations('home');
  const categories = useTranslations('meals');
  const food = useTranslations('nutrition');
  const format = useFormatter();
  const [selected, setSelected] = useState<{ dateTime: string; meal?: MealRecord; mode: EntryMode } | null>(
    initialOpen ? { dateTime, mode: 'new' } : null,
  );

  function open(mode: EntryMode, meal?: MealRecord) {
    setSelected({ dateTime: localFormDateTime(new Date().toISOString(), zone), meal, mode });
  }

  function close() {
    setSelected(null);
    if (initialOpen) router.replace(localePath(locale, '/comidas'), { scroll: false });
  }

  function mealName(meal: MealRecord) {
    const names = meal.components.toSorted((a, b) => a.position - b.position)
      .map((line) => catalog.find((item) => item.id === line.food_reference_id)?.food.names[locale])
      .filter(Boolean).join(', ');
    return meal.name ?? (names || categories(meal.category));
  }

  return (
    <section className="panel section-panel">
      <div className="panel-heading">
        <h2>{home('dailyMeals')}</h2>
        <div className="food-quick-actions">
          <AddRecordButton onClick={() => open('new')}>{home('logMeal')}</AddRecordButton>
          <button type="button" className="button secondary" onClick={() => open('manual')}>{food('manual')}</button>
        </div>
      </div>
      {recent.length > 0 && <details className="food-recent">
        <summary>{food('repeatRecent')}</summary>
        <ul>
          {recent.map((meal) => <li key={meal.id}>
            <button type="button" onClick={() => open('repeat', meal)}>
              <span><strong>{mealName(meal)}</strong><small>
                {categories(meal.category)} · {format.dateTime(new Date(meal.consumed_at), { timeZone: zone, day: 'numeric', month: 'short' })}
              </small></span>
              <RotateCcw size={17} aria-hidden />
            </button>
          </li>)}
        </ul>
      </details>}
      {meals.length ? <ul className="history food-history">
        {meals.map((meal) => {
          const name = mealName(meal);
          return <li key={meal.id}>
            <div className="record-row-copy">
              <strong>{name}</strong>
              <small>{categories(meal.category)} · <time dateTime={meal.consumed_at}>
                {format.dateTime(new Date(meal.consumed_at), { timeZone: zone, hour: 'numeric', minute: '2-digit' })}
              </time></small>
            </div>
            <strong>{format.number(mealCalories(meal), { maximumFractionDigits: 2 })} kcal</strong>
            <div className="food-row-actions">
              <EditRecordButton label={name} onClick={() => open('edit', meal)} />
              <button type="button" className="icon-button" aria-label={food('removeMeal', { meal: name })}
                onClick={() => open('remove', meal)}><Trash2 size={17} aria-hidden /></button>
            </div>
          </li>;
        })}
      </ul> : <p className="empty-state">{home('emptyMeals')}</p>}
      {selected && <MealEditor key={selected.meal?.id ?? 'new'} meal={selected.meal} mode={selected.mode}
        repeatName={selected.meal ? mealName(selected.meal) : undefined}
        catalog={catalog} locale={locale} zone={zone} dateTime={selected.dateTime} close={close} />}
    </section>
  );
}
