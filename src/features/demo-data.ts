export const demoDay = '2026-11-24';
export const calorieGoal = 2100;
export const goalKg = 75;
export const mealCategories = ['firstMeal', 'lunch', 'snack', 'dinner', 'other'] as const;

export type MealCategory = (typeof mealCategories)[number];
type SampleMealName = 'yogurt' | 'chicken' | 'toast';

export type Meal = {
  id: string;
  category: MealCategory;
  kcal: number;
} & ({ sampleName: SampleMealName; name?: never } | { name: string; sampleName?: never });

export type WeighIn = { id: string; day: string; kg: number };

export const sampleMeals: Meal[] = [
  { id: 'm1', category: 'firstMeal', sampleName: 'yogurt', kcal: 420 },
  { id: 'm2', category: 'lunch', sampleName: 'chicken', kcal: 680 },
  { id: 'm3', category: 'snack', sampleName: 'toast', kcal: 350 },
];

export const sampleWeights: WeighIn[] = [
  { id: 'w1', day: '2026-08-24', kg: 81.2 },
  { id: 'w2', day: '2026-09-15', kg: 80.7 },
  { id: 'w3', day: '2026-10-12', kg: 80.4 },
  { id: 'w4', day: '2026-10-25', kg: 80.0 },
  { id: 'w5', day: '2026-10-30', kg: 79.2 },
  { id: 'w6', day: '2026-11-05', kg: 79.4 },
  { id: 'w7', day: '2026-11-10', kg: 78.6 },
  { id: 'w8', day: '2026-11-16', kg: 78.8 },
  { id: 'w9', day: demoDay, kg: 78.4 },
];

export const sampleLifts = [
  { name: 'leg', loads: [60, 65, 70] },
  { name: 'chest', loads: [30, 35, 35] },
  { name: 'biceps', loads: [10, 12, 12] },
  { name: 'triceps', loads: [15, 20, 18] },
] as const;

export const sampleRuns = [
  { day: '2026-11-08', km: 2.4, minutes: 22 },
  { day: '2026-11-11', km: 3, minutes: 26 },
  { day: '2026-11-15', km: 2.8, minutes: 25 },
  { day: '2026-11-19', km: 3.2, minutes: 28 },
  { day: '2026-11-22', km: 3.4, minutes: 28 },
];
