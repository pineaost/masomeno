import type { Locale } from '@/i18n/config';
import type { FoodNames, FoodReference, MealCategory, MealComponent, MealLine, MealRecord } from '@/lib/food';
import type { FridgeSelection, FridgeStatus, RecipeSummary } from '@/lib/recipe-catalog';
import type { DistanceUnit, HeightUnit, WeightUnit } from '@/lib/units';

export type Profile = {
  display_name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  time_zone: string;
};

export type Preferences = {
  locale: Locale;
  weight_unit: WeightUnit;
  height_unit: HeightUnit;
  distance_unit: DistanceUnit;
};

export type WeightMeasurement = {
  id: string;
  weight_kg: number;
  measured_at: string;
  condition: string | null;
};
export type Exercise = { id: string; name: string; favorite_slot: number | null };
export type StrengthEntry = { id: string; exercise_id: string; load_kg: number; performed_on: string };
export type TreadmillSession = { id: string; distance_km: number; duration_seconds: number; performed_on: string };

type RecordTable<Row extends { id: string }, Insert, Update = Partial<Insert>> = {
  Row: Row & { user_id: string; created_at: string };
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile & { id: string; weight_goal_kg: number | null; created_at: string; updated_at: string };
        Insert: never;
        Update: Partial<Profile> & { weight_goal_kg?: number | null };
        Relationships: [];
      };
      user_preferences: {
        Row: Preferences & { user_id: string };
        Insert: never;
        Update: Partial<Preferences>;
        Relationships: [];
      };
      weight_measurements: RecordTable<WeightMeasurement, Omit<WeightMeasurement, 'id'>>;
      exercises: {
        Row: Exercise & { user_id: string };
        Insert: { name: string };
        Update: Partial<Omit<Exercise, 'id'>>;
        Relationships: [];
      };
      strength_entries: RecordTable<StrengthEntry, Omit<StrengthEntry, 'id'>, Partial<Pick<StrengthEntry, 'load_kg' | 'performed_on'>>>;
      treadmill_sessions: RecordTable<TreadmillSession, Omit<TreadmillSession, 'id'>>;
      calorie_goals: {
        Row: { user_id: string; effective_on: string; kcal: number | null };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      food_categories: {
        Row: { id: string; names: FoodNames };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      foods: {
        Row: { id: string; category_id: string; names: FoodNames; synonyms: string[] };
        Insert: never;
        Update: never;
        Relationships: [{
          foreignKeyName: 'foods_category_id_fkey';
          columns: ['category_id'];
          referencedRelation: 'food_categories';
          referencedColumns: ['id'];
        }];
      };
      food_references: {
        Row: FoodReference & { food_id: string; reference_grams: number; carbs_per_100g: number | null; fat_per_100g: number | null };
        Insert: never;
        Update: never;
        Relationships: [{
          foreignKeyName: 'food_references_food_id_fkey';
          columns: ['food_id'];
          referencedRelation: 'foods';
          referencedColumns: ['id'];
        }];
      };
      meals: {
        Row: Omit<MealRecord, 'components'> & { user_id: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      meal_components: {
        Row: MealComponent & { meal_id: string; user_id: string };
        Insert: never;
        Update: never;
        Relationships: [{
          foreignKeyName: 'meal_components_meal_id_user_id_fkey';
          columns: ['meal_id', 'user_id'];
          referencedRelation: 'meals';
          referencedColumns: ['id', 'user_id'];
        }];
      };
      fridge_ingredients: {
        Row: FridgeSelection & { user_id: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      recipes: {
        Row: RecipeSummary & { base_servings: number; instructions: Partial<FoodNames>; published: boolean };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      recipe_ingredients: {
        Row: { recipe_id: string; food_id: string; position: number; is_main: boolean; grams: number | null };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey';
            columns: ['recipe_id'];
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_ingredients_food_id_fkey';
            columns: ['food_id'];
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      masomeno_initialize_account: { Args: { initial_locale?: Locale }; Returns: undefined };
      masomeno_set_calorie_goal: { Args: { goal_kcal: number | null }; Returns: string };
      masomeno_set_fridge_ingredient: {
        Args: { ingredient_id: string; ingredient_status: FridgeStatus | null };
        Returns: boolean;
      };
      masomeno_save_meal: {
        Args: {
          meal_id: string | null;
          meal_category: MealCategory;
          meal_time: string;
          meal_name: string | null;
          estimated_kcal: number | null;
          lines: MealLine[];
        };
        Returns: string | null;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
