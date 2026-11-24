'use client';

import { BookOpen, CalendarDays, NotebookPen, Plus, Refrigerator } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { localePath } from '@/i18n/config';
import type { Meal } from './demo-data';
import { useDemo } from './demo-provider';
import { MealDialog } from './log-dialogs';
import { MealList } from './meal-list';

const sections = [
  { id: 'diary', path: '/comidas', icon: NotebookPen },
  { id: 'recipes', path: '/comidas/recetario', icon: BookOpen },
  { id: 'plan', path: '/comidas/plan', icon: CalendarDays },
  { id: 'fridge', path: '/comidas/heladera', icon: Refrigerator },
] as const;

export function FoodNavigation({ section, demo }: { section: (typeof sections)[number]['id']; demo: boolean }) {
  const t = useTranslations('meals');
  const locale = useLocale();
  return (
    <nav className="section-nav" aria-label={t('sections')}>
      {sections.map(({ id, path, icon: Icon }) => (
        <Link href={localePath(locale, path)} key={id} prefetch={demo ? undefined : false} className={id === 'fridge' ? 'fridge-link' : undefined}
          aria-current={id === section ? 'page' : undefined}>
          <Icon size={18} strokeWidth={1.8} aria-hidden />{t(id)}
        </Link>
      ))}
    </nav>
  );
}

export function Food({ section }: { section: 'diary' | 'plan' }) {
  const t = useTranslations('meals');
  const nav = useTranslations('nav');
  const home = useTranslations('home');
  const { meals } = useDemo();
  const [open, setOpen] = useState<Meal | 'new' | null>(null);

  return (
    <>
      <PageHeading title={section === 'plan' ? t('plan') : nav('meals')} visuallyHidden />
      <FoodNavigation section={section} demo />
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
