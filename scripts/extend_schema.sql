-- Extiende el schema compartido de Supabase para "app cuidador".
-- 100% aditivo: solo ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.
-- No modifica, renombra ni borra ninguna columna/tabla existente, así que
-- no afecta a la otra app que ya usa esta base de datos.
--
-- Cómo ejecutarlo: Supabase → SQL Editor → pega este archivo completo → Run.

-- ---------------------------------------------------------------------------
-- patients: datos demográficos que la otra app no usa
-- ---------------------------------------------------------------------------
ALTER TABLE patients ADD COLUMN IF NOT EXISTS relation text NOT NULL DEFAULT 'Familiar';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'F';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age integer NOT NULL DEFAULT 0;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS birth_date text NOT NULL DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_type text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS height_cm real;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight_kg real;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_from text NOT NULL DEFAULT '#2F80ED';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_to text NOT NULL DEFAULT '#56CCF2';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact jsonb;

-- ---------------------------------------------------------------------------
-- clinical_profiles: ya existía (conditions/allergies/doctor_name/
-- doctor_phone/notes); se agregan solo los campos que faltan.
-- ---------------------------------------------------------------------------
ALTER TABLE clinical_profiles ADD COLUMN IF NOT EXISTS chronic_meds text[] NOT NULL DEFAULT '{}';
ALTER TABLE clinical_profiles ADD COLUMN IF NOT EXISTS doctors jsonb;
ALTER TABLE clinical_profiles ADD COLUMN IF NOT EXISTS labs jsonb;
ALTER TABLE clinical_profiles ADD COLUMN IF NOT EXISTS goals jsonb;

-- ---------------------------------------------------------------------------
-- medications: ya existía (name/dose/time/image_emoji/color)
-- ---------------------------------------------------------------------------
ALTER TABLE medications ADD COLUMN IF NOT EXISTS active_substance text;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS form text NOT NULL DEFAULT 'Tableta';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'Mañana';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS with_food boolean NOT NULL DEFAULT false;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS stock real NOT NULL DEFAULT 0;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS stock_unit text NOT NULL DEFAULT 'tabletas';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS low_stock_at real NOT NULL DEFAULT 5;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS tone text NOT NULL DEFAULT 'blue';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- meals: ya existía (slug/name/article/time/emoji/accent/items)
-- ---------------------------------------------------------------------------
ALTER TABLE meals ADD COLUMN IF NOT EXISTS slot text NOT NULL DEFAULT 'Comida';
ALTER TABLE meals ADD COLUMN IF NOT EXISTS foods text NOT NULL DEFAULT '';
ALTER TABLE meals ADD COLUMN IF NOT EXISTS calories integer NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS protein real NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS carbs real NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS fat real NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS tone text NOT NULL DEFAULT 'emerald';

-- ---------------------------------------------------------------------------
-- exercises: ya existía como catálogo (name/level/emoji/duration_seconds/
-- description/steps/tip); esta app añade su propio modelo de plan semanal.
-- ---------------------------------------------------------------------------
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL DEFAULT 0;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS duration_min integer NOT NULL DEFAULT 20;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS calories integer NOT NULL DEFAULT 100;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS intensity text NOT NULL DEFAULT 'Suave';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Footprints';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS items jsonb;

-- exercise_logs: ya existía con exercise_name (texto libre, sin FK); se
-- agrega exercise_id opcional para que esta app pueda referenciar por id.
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS exercise_id integer REFERENCES exercises(id) ON DELETE CASCADE;
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS minutes integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS exercise_logs_exercise_id_idx ON exercise_logs(exercise_id);

-- ---------------------------------------------------------------------------
-- routine_activities: ya existía (title/time_of_day/scheduled_time/
-- description/emoji/is_recurring)
-- ---------------------------------------------------------------------------
ALTER TABLE routine_activities ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Sun';

-- ---------------------------------------------------------------------------
-- daily_vitals: tabla nueva, no existe en la otra app
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_vitals (
  id serial PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date date NOT NULL,
  heart_rate integer,
  systolic integer,
  diastolic integer,
  steps integer,
  sleep_hours real,
  oxygen integer,
  weight_kg real,
  mood text
);
CREATE UNIQUE INDEX IF NOT EXISTS vitals_patient_date_uq ON daily_vitals(patient_id, date);

-- ---------------------------------------------------------------------------
-- game_scores: tabla nueva, no existe en la otra app
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_scores (
  id serial PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  game text NOT NULL,
  score integer NOT NULL,
  detail text,
  played_at timestamp DEFAULT now()
);
