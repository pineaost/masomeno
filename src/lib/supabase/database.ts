import type { Locale } from '@/i18n/config';
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
    };
    Views: Record<never, never>;
    Functions: {
      masomeno_initialize_account: { Args: { initial_locale?: Locale }; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
