import type {
  patients,
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
// Estos campos se tipan como no-nulos a propósito: en la base de datos real
// `conditions`/`allergies` son nullable, pero la API siempre los normaliza a
// `[]`/`null` al construir este objeto (ver patients/route.ts y
// patients/[id]/route.ts), así que el UI no necesita revisar null.
// Valoración inicial (cuestionario de personalización del adulto mayor).
// Se guarda como jsonb en clinical_profiles.assessment; todo es opcional.
export interface Assessment {
  date?: string;
  // Prueba física
  skinfoldTricipital?: number; // mm
  skinfoldSuprailiac?: number; // mm
  skinfoldThigh?: number; // mm
  abdominalPerimeterCm?: number;
  tugSeconds?: number; // Timed Up and Go
  chairStandReps?: number; // levantarse de la silla en 30 s
  fitnessNotes?: string;
  // Test de hipertensión por el ejercicio
  exerciseBpTest?: "normal" | "hypertensive" | "not_done";
  exerciseBpPeak?: string; // ej. "190/95"
  // En diabéticos: glicemia antes de iniciar ejercicio (mg/dL)
  preExerciseGlucose?: number;
  // Bienestar y cognición
  wellbeing?: number; // 1 (muy mal) a 5 (muy bien)
  mood?: "good" | "low" | "anxious";
  cognition?: "normal" | "mild" | "moderate" | "severe";
  cognitionScore?: string; // MMSE / MoCA
  // Evaluación nutricional
  nutritionStatus?: "normal" | "malnutrition_risk" | "malnutrition" | "overweight" | "obesity";
  chronicConstipation?: boolean;
  appetite?: "good" | "regular" | "poor";
  nutritionNotes?: string;
  // Funcionalidad y seguridad
  fallsLastYear?: number;
  mobilityAid?: "none" | "cane" | "walker" | "wheelchair";
  independence?: "independent" | "partial" | "dependent";
  sleepHours?: number;
}

export type Patient = Omit<typeof patients.$inferSelect, "pin"> & {
  assessment: Assessment | null;
  conditions: string[];
  allergies: string[];
  chronicMeds: string[];
  doctors: { name: string; specialty: string; phone: string }[];
  labs: { name: string; value: string; status: "normal" | "high" | "low"; date: string }[];
  goals: { calories: number; waterGlasses: number; exerciseMin: number; steps: number } | null;
  notes: string | null;
};
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
  community: {
    member: boolean;
    addedAt: Date | null;
  };
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
