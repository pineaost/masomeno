'use client';

import { createContext, useContext, useState } from 'react';
import { sampleMeals, sampleWeights, type Meal, type WeighIn } from './demo-data';

type DemoState = {
  meals: Meal[];
  weights: WeighIn[];
  saveMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  addWeight: (weighIn: WeighIn) => void;
};

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState(sampleMeals);
  const [weights, setWeights] = useState(sampleWeights);

  return (
    <DemoContext.Provider value={{
      meals,
      weights,
      saveMeal: (meal) => setMeals((current) => current.some((entry) => entry.id === meal.id)
        ? current.map((entry) => entry.id === meal.id ? meal : entry)
        : [...current, meal]),
      removeMeal: (id) => setMeals((current) => current.filter((entry) => entry.id !== id)),
      addWeight: (weighIn) => setWeights((current) => (
        [...current, weighIn].sort((first, second) => first.day.localeCompare(second.day))
      )),
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('DemoProvider is missing');
  return context;
}
