export interface UserProfile {
  username: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  goalWeight?: number; // kg
  goal?: 'gain' | 'loss' | 'maintain' | 'fitness';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  joinedAt: string;
  onboardingCompleted?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export type EntryType = 'workout' | 'hydration' | 'sleep' | 'food' | 'journal' | 'biometrics';

export interface BaseEntry {
  id: string;
  timestamp: string;
  type: EntryType;
}

export interface WorkoutEntry extends BaseEntry {
  type: 'workout';
  exerciseType: string;
  duration: number; // minutes
  caloriesBurned: number;
}

export interface HydrationEntry extends BaseEntry {
  type: 'hydration';
  amountMl: number;
}

export interface SleepEntry extends BaseEntry {
  type: 'sleep';
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  cycles: number;
}

export interface JournalEntry extends BaseEntry {
  type: 'journal';
  title: string;
  content: string;
  mood?: string;
}

export interface BiometricEntry extends BaseEntry {
  type: 'biometrics';
  weight: number;
  bmi: number;
}

export type AppEntry = WorkoutEntry | HydrationEntry | SleepEntry | JournalEntry | BiometricEntry;

export const EXERCISE_METS: Record<string, number> = {
  running: 9.8,
  cycling: 7.5,
  yoga: 3.0,
  boxing: 12.8,
  hiit: 11.0,
  weightlifting: 6.0,
  swimming: 8.0,
};