import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  real,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relation: text("relation").notNull(), // Madre, Padre, Paciente personal…
  gender: text("gender").notNull(), // F | M
  age: integer("age").notNull(),
  birthDate: text("birth_date").notNull(),
  bloodType: text("blood_type"),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  avatarFrom: text("avatar_from").notNull(),
  avatarTo: text("avatar_to").notNull(),
  conditions: text("conditions").array().notNull().default([]),
  allergies: text("allergies").array().notNull().default([]),
  chronicMeds: text("chronic_meds").array().notNull().default([]),
  phone: text("phone"),
  insurance: text("insurance"),
  address: text("address"),
  emergencyContact: jsonb("emergency_contact"),
  doctors: jsonb("doctors").$type<
    { name: string; specialty: string; phone: string }[]
  >(),
  labs: jsonb("labs").$type<
    { name: string; value: string; status: "normal" | "high" | "low"; date: string }[]
  >(),
  notes: text("notes"),
  goals: jsonb("goals").$type<{
    calories: number;
    waterGlasses: number;
    exerciseMin: number;
    steps: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// Signos vitales diarios (una fila por paciente y día)
// ---------------------------------------------------------------------------
export const dailyVitals = pgTable(
  "daily_vitals",
  {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    heartRate: integer("heart_rate"),
    systolic: integer("systolic"),
    diastolic: integer("diastolic"),
    steps: integer("steps"),
    sleepHours: real("sleep_hours"),
    oxygen: integer("oxygen"),
    weightKg: real("weight_kg"),
    mood: text("mood"),
  },
  (t) => [uniqueIndex("vitals_patient_date_uq").on(t.patientId, t.date)]
);

// ---------------------------------------------------------------------------
// Medicamentos y su trazabilidad
// ---------------------------------------------------------------------------
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  activeSubstance: text("active_substance"),
  dosage: text("dosage").notNull(), // "50 mg"
  form: text("form").notNull(), // Tableta, Cápsula, Inhalador, Inyección…
  time: text("time").notNull(), // HH:MM
  period: text("period").notNull(), // Mañana | Tarde | Noche
  withFood: boolean("with_food").notNull().default(false),
  stock: real("stock").notNull().default(0),
  stockUnit: text("stock_unit").notNull().default("tabletas"),
  lowStockAt: real("low_stock_at").notNull().default(5),
  instructions: text("instructions"),
  tone: text("tone").notNull().default("blue"), // blue | violet | emerald | amber | rose
  active: boolean("active").notNull().default(true),
});

export const medicationLogs = pgTable(
  "medication_logs",
  {
    id: serial("id").primaryKey(),
    medicationId: integer("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    taken: boolean("taken").notNull().default(false),
    takenAt: timestamp("taken_at"),
  },
  (t) => [uniqueIndex("medlog_med_date_uq").on(t.medicationId, t.date)]
);

// ---------------------------------------------------------------------------
// Alimentación
// ---------------------------------------------------------------------------
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  slot: text("slot").notNull(), // Desayuno, Media mañana, Almuerzo, Merienda, Cena
  time: text("time").notNull(),
  title: text("title").notNull(),
  foods: text("foods").notNull(),
  calories: integer("calories").notNull().default(0),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  tone: text("tone").notNull().default("emerald"),
});

export const mealLogs = pgTable(
  "meal_logs",
  {
    id: serial("id").primaryKey(),
    mealId: integer("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    done: boolean("done").notNull().default(false),
  },
  (t) => [uniqueIndex("meallog_meal_date_uq").on(t.mealId, t.date)]
);

export const waterLogs = pgTable(
  "water_logs",
  {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    glasses: integer("glasses").notNull().default(0),
  },
  (t) => [uniqueIndex("water_patient_date_uq").on(t.patientId, t.date)]
);

// ---------------------------------------------------------------------------
// Ejercicio físico (plan semanal)
// ---------------------------------------------------------------------------
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = domingo … 6 = sábado
  title: text("title").notNull(),
  durationMin: integer("duration_min").notNull().default(20),
  calories: integer("calories").notNull().default(100),
  intensity: text("intensity").notNull(), // Suave | Moderada | Descanso
  icon: text("icon").notNull(), // nombre de icono lucide
  description: text("description").notNull(),
  items: jsonb("items").$type<{ name: string; detail: string }[]>(),
});

export const exerciseLogs = pgTable(
  "exercise_logs",
  {
    id: serial("id").primaryKey(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    patientId: integer("patient_id")
      .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    done: boolean("done").notNull().default(false),
    minutes: integer("minutes").notNull().default(0),
  },
  (t) => [uniqueIndex("exlog_ex_date_uq").on(t.exerciseId, t.date)]
);

// ---------------------------------------------------------------------------
// Rutina diaria
// ---------------------------------------------------------------------------
export const routineTasks = pgTable("routine_tasks", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  phase: text("phase").notNull(), // Amanecer | Mañana | Mediodía | Tarde | Noche
  time: text("time").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  icon: text("icon").notNull(),
});

export const routineLogs = pgTable(
  "routine_logs",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => routineTasks.id, { onDelete: "cascade" }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    done: boolean("done").notNull().default(false),
  },
  (t) => [uniqueIndex("rutlog_task_date_uq").on(t.taskId, t.date)]
);

// ---------------------------------------------------------------------------
// Mente activa: puntuaciones de los juegos cognitivos
// ---------------------------------------------------------------------------
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  game: text("game").notNull(), // memory | math | sequence
  score: integer("score").notNull(),
  detail: text("detail"),
  playedAt: timestamp("played_at").defaultNow(),
});
