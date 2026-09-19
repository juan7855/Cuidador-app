import type {
  patients,
  medications,
  meals,
  exercises,
  routineTasks,
  dailyVitals,
  gameScores,
} from "@/db/schema";

export type Patient = typeof patients.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type RoutineTask = typeof routineTasks.$inferSelect;
export type Vital = typeof dailyVitals.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;

export type MedicationRow = Medication & {
  scheduled: boolean;
  takenToday: boolean;
  adherence: number | null;
};

export type MealRow = Meal & { doneToday: boolean };

export type ExerciseRow = Exercise & {
  doneToday: boolean;
  minutesToday: number;
};

export type RoutineRow = RoutineTask & { doneToday: boolean };

export interface WeekDay {
  date: string;
  weekdayShort: string;
  weekdayLong: string;
  dayNum: number;
  medDone: number;
  medTotal: number;
  mealDone: number;
  mealTotal: number;
  routineDone: number;
  routineTotal: number;
  minutes: number;
  steps: number;
  planned: Exercise | null;
  exDone: boolean;
}

export interface DashboardData {
  patient: Patient;
  today: string;
  vitals: Vital[];
  todayVital: Vital;
  meds: MedicationRow[];
  meals: MealRow[];
  exercises: ExerciseRow[];
  routine: RoutineRow[];
  water: number;
  week: WeekDay[];
  best: Record<string, number>;
  recentScores: GameScore[];
  totals: {
    medsDone: number;
    medsTotal: number;
    mealsDone: number;
    mealsTotal: number;
    routineDone: number;
    routineTotal: number;
    exerciseDone: boolean;
    hasExercise: boolean;
    overall: number;
    adherence7: number;
  };
}
