/* Lift Log data model, version 1.2.
   The app is plain JavaScript (no build step), so these types document the shapes
   and can be used with `// @ts-check` + JSDoc or in a future TS migration. */

export interface SplitExercise {
  exerciseId: string;          // slug, e.g. "incline-barbell-bench-press"
  exerciseName: string;
  targetSets: number;          // lower bound, e.g. 3
  targetSetsMax?: number;      // for ranges like "2–3 sets"
  targetRepsMin: number;       // e.g. 6
  targetRepsMax: number;       // e.g. 8
  techniqueCues?: string[];
}

export interface SplitDay {
  id: string;
  name: string;
  weekday: number;             // 0 = Sunday … 6 = Saturday, -1 = any day
  rest: boolean;
  note?: string;               // rest-day guidance
  exercises: SplitExercise[];
}

export interface CardioEntry {
  id: string;
  date: string;                // YYYY-MM-DD
  type: 'walk' | 'run' | 'stairmaster' | 'cycle' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  inclinePercentage?: number;  // 0–15
}

export interface UserProfile {
  weightKg: number | null;
  targetWeightLossRatePercent: number;   // default 0.75, range 0.5–1.0 per week
  oneRmFormula: 'epley' | 'brzycki';
}

export interface DietEntry { id: string; date: string; name: string; kcal: number; proteinG: number; carbsG: number; fatG: number }
export interface DailyStepsEntry { date: string; steps: number }          // target 8,000–10,000
export interface BodyweightEntry { date: string; weightKg: number }
export interface WorkoutLog {
  id: string; date: string; exercise: string; weightKg: number; reps: number;
  warmup?: boolean; failure?: boolean; rpe?: number; note?: string; sides?: 1 | 2;
}

export interface ComprehensiveAppData {
  version: '1.2';
  exportedAt: string;
  userProfile: UserProfile;
  workoutSplits: SplitDay[];
  workoutLogs: WorkoutLog[];
  cardioLogs: CardioEntry[];
  dietLogs: DietEntry[];
  dailyStepsLogs: DailyStepsEntry[];
  bodyweightLogs: BodyweightEntry[];
}

/* What the app actually writes today. Old key names are kept so v1 backups still import. */
export interface LiftLogBackupV12 {
  app: 'lift-log'; version: '1.2'; exportedAt: string; unit: 'kg' | 'lb';
  userProfile: UserProfile;
  sets: unknown[];                                             // WorkoutLog (internal field names)
  split: unknown[];                                            // SplitDay with `targets` map keyed by lowercase exercise name
  bw: { date: string; kg: number }[];
  sl: { date: string; h: number }[];                           // sleep
  cd: { id: string; type: string; min: number; km: number | null; inc: number | null; date: string }[];
  diet: Record<string, { id: string; n: string; k: number; p: number; c: number; f: number }[]>;  // by date
  steps: Record<string, number>;                               // by date
}
