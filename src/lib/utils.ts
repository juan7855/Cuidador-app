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
  if (v < 18.5) return { label: "Bajo peso", tone: "amber" };
  if (v < 25) return { label: "Peso normal", tone: "emerald" };
  if (v < 30) return { label: "Sobrepeso", tone: "amber" };
  return { label: "Obesidad", tone: "rose" };
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

export const TONES: Record<string, Tone> = {
  blue: {
    soft: "bg-blue-50",
    text: "text-blue-700",
    solid: "bg-blue-500",
    ring: "ring-blue-200",
    hex: "#2563eb",
  },
  violet: {
    soft: "bg-violet-50",
    text: "text-violet-700",
    solid: "bg-violet-500",
    ring: "ring-violet-200",
    hex: "#7c3aed",
  },
  emerald: {
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    solid: "bg-emerald-500",
    ring: "ring-emerald-200",
    hex: "#059669",
  },
  amber: {
    soft: "bg-amber-50",
    text: "text-amber-700",
    solid: "bg-amber-500",
    ring: "ring-amber-200",
    hex: "#d97706",
  },
  rose: {
    soft: "bg-rose-50",
    text: "text-rose-700",
    solid: "bg-rose-500",
    ring: "ring-rose-200",
    hex: "#e11d48",
  },
  teal: {
    soft: "bg-teal-50",
    text: "text-teal-700",
    solid: "bg-teal-500",
    ring: "ring-teal-200",
    hex: "#0d9488",
  },
  indigo: {
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    solid: "bg-indigo-500",
    ring: "ring-indigo-200",
    hex: "#4f46e5",
  },
  fuchsia: {
    soft: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    solid: "bg-fuchsia-500",
    ring: "ring-fuchsia-200",
    hex: "#c026d3",
  },
  cyan: {
    soft: "bg-cyan-50",
    text: "text-cyan-700",
    solid: "bg-cyan-500",
    ring: "ring-cyan-200",
    hex: "#0891b2",
  },
  orange: {
    soft: "bg-orange-50",
    text: "text-orange-700",
    solid: "bg-orange-500",
    ring: "ring-orange-200",
    hex: "#ea580c",
  },
  slate: {
    soft: "bg-slate-100",
    text: "text-slate-600",
    solid: "bg-slate-500",
    ring: "ring-slate-200",
    hex: "#64748b",
  },
};

export function toneOf(name: string): Tone {
  return TONES[name] ?? TONES.blue;
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
