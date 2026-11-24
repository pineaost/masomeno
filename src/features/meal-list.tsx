'use client';

import { Coffee, Moon, Sandwich, Utensils, UtensilsCrossed } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { mealCategories, type Meal } from './demo-data';

const icons = { firstMeal: Coffee, lunch: Utensils, snack: Sandwich, dinner: Moon, other: UtensilsCrossed };

export function MealList({ meals, onSelect }: { meals: Meal[]; onSelect: (meal: Meal) => void }) {
  const t = useTranslations('meals');
  const home = useTranslations('home');
  const format = useFormatter();

  if (!meals.length) return <p className="empty-state">{home('emptyMeals')}</p>;

  return (
    <ul className="meal-list">
      {mealCategories.flatMap((category) => meals.filter((meal) => meal.category === category)).map((meal) => {
        const Icon = icons[meal.category];
        return (
          <li key={meal.id}>
            <button type="button" className="meal-row" onClick={() => onSelect(meal)}>
              <span className={`category-icon ${meal.category}`}><Icon size={19} strokeWidth={1.7} aria-hidden /></span>
              <span className="meal-copy">
                <strong>{t(meal.category)}</strong>
                <small>{meal.sampleName ? t(meal.sampleName) : meal.name}</small>
              </span>
              <span className="meal-kcal"><strong>{format.number(meal.kcal)}</strong> kcal</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
