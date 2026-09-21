import type {
  patients,
  clinicalProfiles,
  medications,
  meals,
  exercises,
  routineTasks,
  dailyVitals,
  gameScores,
} from "@/db/schema";

// Forma plana que usa el UI: fila de `patients` fusionada con su
// `clinical_profiles` (conditions/allergies/doctors/labs/goals/notes viven
// en esa tabla en la base de datos real, compartida con la otra app).
export type Patient = typeof patients.$inferSelect &
  Pick<
    typeof clinicalProfiles.$inferSelect,
    "conditions" | "allergies" | "chronicMeds" | "doctors" | "labs" | "goals" | "notes"
  >;
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
