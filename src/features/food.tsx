'use client';

import { BookOpen, CalendarDays, Clock3, NotebookPen, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { localePath } from '@/i18n/config';
import { sampleRecipes, type Meal } from './demo-data';
import { useDemo } from './demo-provider';
import { MealDialog } from './log-dialogs';
import { MealList } from './meal-list';

const sections = [
  { id: 'diary', path: '/comidas', icon: NotebookPen },
  { id: 'recipes', path: '/comidas/recetario', icon: BookOpen },
  { id: 'plan', path: '/comidas/plan', icon: CalendarDays },
] as const;

function RecipeExamples() {
  const t = useTranslations('meals');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const normalize = (text: string) => text.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '');
  const recipes = sampleRecipes.filter((recipe) =>
    normalize(`${t(recipe.name)} ${t(recipe.hint)}`).includes(normalize(query.trim())),
  );

  return (
    <section className="panel section-panel">
      <div className="panel-heading"><h2>{t('recipes')}</h2></div>
      <label className="search-field">
        <Search size={18} aria-hidden />
        <input type="search" aria-label={t('search')} placeholder={t('search')} value={query}
          onChange={(event) => setQuery(event.target.value)} />
      </label>
      {recipes.length ? (
        <ul className="recipe-grid">
          {recipes.map((recipe) => (
            <li className="recipe" key={recipe.name}>
              <span className="category-icon"><BookOpen size={20} aria-hidden /></span>
              <h3>{t(recipe.name)}</h3>
              <p>{t(recipe.hint)}</p>
              <span className="recipe-time"><Clock3 size={15} aria-hidden />{t('minutes', { count: recipe.minutes })}</span>
            </li>
          ))}
        </ul>
      ) : <p className="empty-state" role="status">{t('noneFound')}</p>}
    </section>
  );
}

export function Food({ section }: { section: (typeof sections)[number]['id'] }) {
  const t = useTranslations('meals');
  const nav = useTranslations('nav');
  const home = useTranslations('home');
  const locale = useLocale();
  const { meals } = useDemo();
  const [open, setOpen] = useState<Meal | 'new' | null>(null);

  return (
    <>
      <PageHeading title={nav('meals')} description={t('intro')} />
      <nav className="section-nav" aria-label={t('sections')}>
        {sections.map(({ id, path, icon: Icon }) => (
          <Link href={localePath(locale, path)} key={id} aria-current={id === section ? 'page' : undefined}>
            <Icon size={18} strokeWidth={1.8} aria-hidden />{t(id)}
          </Link>
        ))}
      </nav>
      {section === 'diary' && (
        <section className="panel section-panel">
          <div className="panel-heading">
            <h2>{home('dailyMeals')}</h2>
            <button type="button" className="button primary" onClick={() => setOpen('new')}>
              <Plus size={19} aria-hidden />{home('logMeal')}
            </button>
          </div>
          <MealList meals={meals} onSelect={setOpen} />
        </section>
      )}
      {section === 'recipes' && <RecipeExamples />}
      {section === 'plan' && (
        <section className="panel plan-empty">
          <span className="quick-icon accent"><CalendarDays size={22} aria-hidden /></span>
          <h2>{t('planTitle')}</h2>
          <p>{t('planEmpty')}</p>
        </section>
      )}
      {open && <MealDialog meal={open === 'new' ? undefined : open} onClose={() => setOpen(null)} />}
    </>
  );
}
