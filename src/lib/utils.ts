import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(todayKey(d));
  }
  return out;
}

const DAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DAY_LONG = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function weekdayShort(key: string) {
  return DAY_SHORT[parseKey(key).getDay()];
}
export function weekdayLong(key: string) {
  return DAY_LONG[parseKey(key).getDay()];
}
export function dayNum(key: string) {
  return parseKey(key).getDate();
}
export function isToday(key: string) {
  return key === todayKey();
}

export function formatLongDate(key = todayKey()): string {
  const d = parseKey(key);
  return `${DAY_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function hourLabel(time: string): string {
  if (!time || time === "—") return "Según necesidad";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "h" : "h";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function bmi(weightKg?: number | null, heightCm?: number | null) {
  if (!weightKg || !heightCm) return null;
  const v = weightKg / Math.pow(heightCm / 100, 2);
  return Math.round(v * 10) / 10;
}

export function bmiCategory(v: number) {
  if (v < 18.5) return { label: "Bajo peso", tone: "sun" };
  if (v < 25) return { label: "Peso normal", tone: "leaf" };
  if (v < 30) return { label: "Sobrepeso", tone: "sun" };
  return { label: "Obesidad", tone: "coral" };
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export interface Tone {
  soft: string;
  text: string;
  solid: string;
  ring: string;
  hex: string;
}

// Clases literales para que Tailwind las detecte.
const BRAND: Tone = { soft: "bg-brand-50", text: "text-brand-700", solid: "bg-brand-500", ring: "ring-brand-200", hex: "#009a74" };
const AQUA: Tone = { soft: "bg-aqua-50", text: "text-aqua-700", solid: "bg-aqua-500", ring: "ring-aqua-200", hex: "#4399b2" };
const SUN: Tone = { soft: "bg-sun-50", text: "text-sun-700", solid: "bg-sun-500", ring: "ring-sun-200", hex: "#e09339" };
const CLAY: Tone = { soft: "bg-clay-50", text: "text-clay-700", solid: "bg-clay-500", ring: "ring-clay-200", hex: "#cb7e2e" };
const LEAF: Tone = { soft: "bg-leaf-50", text: "text-leaf-700", solid: "bg-leaf-500", ring: "ring-leaf-200", hex: "#009a74" };
const INK: Tone = { soft: "bg-ink-50", text: "text-ink-700", solid: "bg-ink-500", ring: "ring-ink-200", hex: "#1e2b28" };
const CORAL: Tone = { soft: "bg-coral-50", text: "text-coral-700", solid: "bg-coral-500", ring: "ring-coral-200", hex: "#b85f59" };

/**
 * Los tonos se guardan en la base compartida con MiSalud con los nombres
 * antiguos (blue, emerald, violet…), así que siguen siendo válidos y se
 * traducen a la paleta Panela.
 */
export const TONES: Record<string, Tone> = {
  brand: BRAND,
  aqua: AQUA,
  sun: SUN,
  clay: CLAY,
  leaf: LEAF,
  ink: INK,
  coral: CORAL,
  // alias heredados
  blue: BRAND,
  sky: AQUA,
  cyan: AQUA,
  teal: AQUA,
  violet: CLAY,
  purple: CLAY,
  indigo: INK,
  fuchsia: SUN,
  orange: SUN,
  amber: SUN,
  emerald: LEAF,
  rose: CORAL,
  red: CORAL,
  slate: {
    soft: "bg-slate-100",
    text: "text-slate-600",
    solid: "bg-slate-500",
    ring: "ring-slate-200",
    hex: "#6f7773",
  },
};

export function toneOf(name: string): Tone {
  return TONES[name] ?? TONES.brand;
}

export function periodFromHour(time: string): string {
  if (time === "—") return "Mañana";
  const h = Number(time.split(":")[0]);
  if (h < 12) return "Mañana";
  if (h < 19) return "Tarde";
  return "Noche";
}

// routine_activities.time_of_day es una columna compartida con MiSalud (la
// app del adulto mayor), que agrupa su rutina en 3 franjas en inglés
// ("morning"/"afternoon"/"evening"). Esta app históricamente usa 5 franjas
// en español. Sin este mapeo, las filas que crea el flujo de "Nuevo
// paciente" (que sigue la convención de MiSalud) no aparecerían en ninguna
// franja aquí, aunque sí se vean bien del lado del paciente.
const PHASE_ALIASES: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  evening: "Noche",
};

export function normalizePhase(phase: string): string {
  return PHASE_ALIASES[phase] ?? phase;
}

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Petición fallida (${res.status})`);
  }
  return res.json() as Promise<T>;
}
