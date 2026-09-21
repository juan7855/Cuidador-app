import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  real,
  date,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Este schema convive con una base de datos ya usada por otra app.
// Las columnas marcadas "(real)" ya existían y NO se tocan.
// Las columnas marcadas "(nueva)" se agregan de forma aditiva vía migración
// SQL (ver scripts/extend_schema.sql) y son nullable/con default, así que no
// afectan las filas ni el código de la otra app.
// ---------------------------------------------------------------------------

// Pacientes — tabla real: solo id, name, pin, created_at existen de por sí.
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(), // (real)
  name: text("name").notNull(), // (real)
  // Estas columnas son nullable en la base de datos real (para no romper los
  // inserts de la otra app, que no las conoce), pero esta app siempre las
  // rellena para sus propios pacientes, así que se tipan como requeridas
  // para no tener que revisar null en cada componente. Un paciente creado
  // solo por la otra app (sin pasar por seed.mjs de esta app) mostraría
  // valores en blanco aquí hasta completarse su ficha.
  relation: text("relation").notNull().default("Familiar"), // (nueva)
  gender: text("gender").notNull().default("F"), // (nueva)
  age: integer("age").notNull().default(0), // (nueva)
  birthDate: text("birth_date").notNull().default(""), // (nueva)
  bloodType: text("blood_type"), // (nueva)
  heightCm: real("height_cm"), // (nueva)
  weightKg: real("weight_kg"), // (nueva)
  avatarFrom: text("avatar_from").notNull().default("#2F80ED"), // (nueva)
  avatarTo: text("avatar_to").notNull().default("#56CCF2"), // (nueva)
  phone: text("phone"), // (nueva)
  insurance: text("insurance"), // (nueva)
  address: text("address"), // (nueva)
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    phone: string;
    relation: string;
  }>(), // (nueva)
  createdAt: timestamp("created_at").defaultNow(), // (real)
});

// Perfil clínico — tabla real: conditions/diet_restrictions/allergies/
// mobility_notes/doctor_name/doctor_phone/notes/updated_at ya existían.
export const clinicalProfiles = pgTable("clinical_profiles", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .unique()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  conditions: text("conditions").array().notNull().default([]), // (real)
  allergies: text("allergies").array().notNull().default([]), // (real)
  chronicMeds: text("chronic_meds").array().notNull().default([]), // (nueva)
  doctors: jsonb("doctors").$type<
    { name: string; specialty: string; phone: string }[]
  >(), // (nueva)
  labs: jsonb("labs").$type<
    { name: string; value: string; status: "normal" | "high" | "low"; date: string }[]
  >(), // (nueva)
  goals: jsonb("goals").$type<{
    calories: number;
    waterGlasses: number;
    exerciseMin: number;
    steps: number;
  }>(), // (nueva)
  notes: text("notes"), // (real)
  updatedAt: timestamp("updated_at").defaultNow(), // (real)
});

// Signos vitales diarios — tabla nueva, no existe en la otra app.
export const dailyVitals = pgTable(
  "daily_vitals",
  {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
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

// Medicamentos — tabla real: name/time (NOT NULL), dose, image_emoji, color.
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  name: text("name").notNull(), // (real)
  activeSubstance: text("active_substance"), // (nueva)
  dosage: text("dose").notNull(), // (real, columna "dose")
  form: text("form").notNull().default("Tableta"), // (nueva)
  time: text("time").notNull(), // (real)
  period: text("period").notNull().default("Mañana"), // (nueva)
  withFood: boolean("with_food").notNull().default(false), // (nueva)
  stock: real("stock").notNull().default(0), // (nueva)
  stockUnit: text("stock_unit").notNull().default("tabletas"), // (nueva)
  lowStockAt: real("low_stock_at").notNull().default(5), // (nueva)
  instructions: text("instructions"), // (nueva)
  tone: text("tone").notNull().default("blue"), // (nueva)
  active: boolean("active").notNull().default(true), // (nueva)
  createdAt: timestamp("created_at").defaultNow(), // (real)
});

// Trazabilidad de tomas — tabla real, coincide casi 1:1 con lo que usa esta app.
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(), // (real)
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  date: date("date", { mode: "string" }).notNull(), // (real)
  taken: boolean("taken").notNull().default(false), // (real)
  takenAt: timestamp("taken_at"), // (real)
});

// Comidas — tabla real: slug/name/article/time/emoji/accent/items son NOT
// NULL pero esta app no los usa; solo se rellenan en scripts/seed.mjs.
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  slot: text("slot").notNull().default("Comida"), // (nueva)
  time: text("time").notNull(), // (real)
  title: text("name").notNull(), // (real, columna "name")
  foods: text("foods").notNull().default(""), // (nueva)
  calories: integer("calories").notNull().default(0), // (nueva)
  protein: real("protein").notNull().default(0), // (nueva)
  carbs: real("carbs").notNull().default(0), // (nueva)
  fat: real("fat").notNull().default(0), // (nueva)
  tone: text("tone").notNull().default("emerald"), // (nueva)
});

export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(), // (real)
  mealId: integer("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  date: date("date", { mode: "string" }).notNull(), // (real)
  done: boolean("eaten").notNull().default(false), // (real, columna "eaten")
});

export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  date: date("date", { mode: "string" }).notNull(), // (real)
  glasses: integer("glasses").notNull().default(0), // (real)
});

// Ejercicio — tabla real es un catálogo (level/emoji/duration_seconds/steps/
// tip, todos NOT NULL); esta app usa un plan semanal por día de la semana,
// así que se agregan columnas propias y se ignoran las de la otra app.
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  dayOfWeek: integer("day_of_week").notNull().default(0), // (nueva)
  title: text("name").notNull(), // (real, columna "name")
  durationMin: integer("duration_min").notNull().default(20), // (nueva)
  calories: integer("calories").notNull().default(100), // (nueva)
  intensity: text("intensity").notNull().default("Suave"), // (nueva)
  icon: text("icon").notNull().default("Footprints"), // (nueva)
  description: text("description").notNull(), // (real)
  items: jsonb("items").$type<{ name: string; detail: string }[]>(), // (nueva)
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: serial("id").primaryKey(), // (real)
  exerciseId: integer("exercise_id").references(() => exercises.id, {
    onDelete: "cascade",
  }), // (nueva, nullable: las filas de la otra app no la tienen)
  exerciseName: text("exercise_name").notNull(), // (real, requerida por la otra app)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  date: date("date", { mode: "string" }).notNull(), // (real)
  done: boolean("completed").notNull().default(false), // (real, columna "completed")
  minutes: integer("minutes").notNull().default(0), // (nueva)
});

// Rutina diaria — la tabla real se llama "routine_activities" (no
// "routine_tasks"); routine_logs.activity_id ya referencia esa tabla.
export const routineTasks = pgTable("routine_activities", {
  id: serial("id").primaryKey(), // (real)
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  phase: text("time_of_day").notNull(), // (real, columna "time_of_day")
  time: text("scheduled_time").notNull(), // (real, columna "scheduled_time")
  title: text("title").notNull(), // (real)
  detail: text("description").notNull().default(""), // (real, columna "description")
  icon: text("icon").notNull().default("Sun"), // (nueva)
});

export const routineLogs = pgTable("routine_logs", {
  id: serial("id").primaryKey(), // (real)
  taskId: integer("activity_id")
    .notNull()
    .references(() => routineTasks.id, { onDelete: "cascade" }), // (real, columna "activity_id")
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }), // (real)
  date: date("date", { mode: "string" }).notNull(), // (real)
  done: boolean("completed").notNull().default(false), // (real, columna "completed")
});

// Mente activa: puntuaciones de juegos — tabla nueva, no existe en la otra app.
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  game: text("game").notNull(),
  score: integer("score").notNull(),
  detail: text("detail"),
  playedAt: timestamp("played_at").defaultNow(),
});
