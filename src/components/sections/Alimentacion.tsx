"use client";

import {
  Plus,
  Minus,
  GlassWater,
  Check,
  Flame,
  Salad,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardTitle,
  Chip,
  CheckButton,
  ProgressRing,
  MiniBars,
  DyIcon,
} from "@/components/ui";
import { SectionHeader } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn, hourLabel, isToday, toneOf } from "@/lib/utils";
import type { DashboardData, MealRow } from "@/lib/types";

const SLOT_ICON: Record<string, string> = {
  Desayuno: "Sunrise",
  "Media mañana": "Coffee",
  Almuerzo: "Salad",
  Merienda: "Croissant",
  Cena: "MoonStar",
};

const MACRO_GOALS = { protein: 90, carbs: 210, fat: 65 };

export default function Alimentacion({
  data,
  onToggleMeal,
  onWater,
}: {
  data: DashboardData;
  onToggleMeal: (id: number, done: boolean) => void;
  onWater: (glasses: number) => void;
}) {
  const def = sectionById("food");
  const p = data.patient;
  const goalKcal = p.goals?.calories ?? 1800;
  const waterGoal = p.goals?.waterGlasses ?? 8;

  const doneMeals = data.meals.filter((m) => m.doneToday);
  const consumed = doneMeals.reduce((a, m) => a + m.calories, 0);
  const protein = doneMeals.reduce((a, m) => a + m.protein, 0);
  const carbs = doneMeals.reduce((a, m) => a + m.carbs, 0);
  const fat = doneMeals.reduce((a, m) => a + m.fat, 0);

  const tip = p.conditions.some((c) => c.toLowerCase().includes("diabetes"))
    ? "Prioriza hidratos de absorción lenta (legumbres, pan integral) y evita los zumos de fruta en ayunas: la fruta siempre entera."
    : p.conditions.some((c) => c.toLowerCase().includes("hipertensión"))
      ? "Cocina con hierbas aromáticas y limón en lugar de sal. Las verduras frescas aportan potasio y ayudan a controlar la tensión."
      : "Incluye verdura en dos comidas al día y una ración de pescado azul dos veces por semana para una dieta mediterránea equilibrada.";

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} subtitle={`Plan nutricional de ${p.name.split(" ")[0]}`} />

      {/* Resumen: energía, macros, agua */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Card className="flex items-center gap-5 p-5 sm:p-6">
          <ProgressRing
            value={Math.min(100, (consumed / goalKcal) * 100)}
            size={112}
            stroke={12}
            color="#059669"
            gradientId="kcal-grad"
          >
            <Flame size={14} className="text-emerald-500" />
            <span className="text-lg font-extrabold text-slate-800">{consumed}</span>
            <span className="text-[10px] font-bold text-slate-400">de {goalKcal} kcal</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-slate-800">Energía consumida</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
              {consumed >= goalKcal
                ? "Has alcanzado el objetivo calórico de hoy."
                : `Te quedan unas ${Math.max(0, goalKcal - consumed)} kcal para tu objetivo.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip tone="emerald">{doneMeals.length} comidas registradas</Chip>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardTitle icon="ChartPie" tone="emerald" title="Macronutrientes" />
          <div className="flex flex-col gap-3.5">
            <MacroRow label="Proteínas" value={protein} goal={MACRO_GOALS.protein} color="#2563eb" unit="g" />
            <MacroRow label="Carbohidratos" value={carbs} goal={MACRO_GOALS.carbs} color="#d97706" unit="g" />
            <MacroRow label="Grasas" value={fat} goal={MACRO_GOALS.fat} color="#7c3aed" unit="g" />
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <CardTitle
            icon="GlassWater"
            tone="cyan"
            title="Hidratación"
            subtitle={`${data.water * 250} ml de ${waterGoal * 250} ml`}
          />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: waterGoal }).map((_, i) => (
              <button
                key={i}
                onClick={() => onWater(i + 1 === data.water ? i : i + 1)}
                aria-label={`${i + 1} vasos`}
                className={cn(
                  "flex h-10 w-8 items-center justify-center rounded-xl border transition active:scale-90",
                  i < data.water
                    ? "border-cyan-300 bg-cyan-50 text-cyan-500"
                    : "border-slate-200 bg-slate-50 text-slate-300 hover:border-cyan-200"
                )}
              >
                <GlassWater size={17} />
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-3 pt-4">
            <button
              onClick={() => onWater(Math.max(0, data.water - 1))}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 transition hover:bg-slate-50 active:scale-95"
              aria-label="Quitar un vaso"
            >
              <Minus size={15} /> Quitar
            </button>
            <button
              onClick={() => onWater(Math.min(16, data.water + 1))}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-cyan-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-600 active:scale-95"
              aria-label="Añadir un vaso"
            >
              <Plus size={15} /> Añadir
            </button>
          </div>
        </Card>
      </div>

      {/* Plan de comidas */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-extrabold uppercase tracking-wide text-slate-500">
          <Salad size={16} className="text-emerald-600" />
          Plan de comidas de hoy
        </h3>
        <div className="relative flex flex-col gap-3 sm:gap-4">
          <span className="absolute bottom-6 left-10 top-6 w-px bg-emerald-100 sm:left-11" aria-hidden />
          {data.meals.map((m) => (
            <MealCard key={m.id} meal={m} onToggle={onToggleMeal} />
          ))}
        </div>
      </div>

      {/* Semana + consejo */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="CalendarDays" tone="teal" title="Cumplimiento del plan" subtitle="Comidas registradas · 7 días" />
          <MiniBars
            max={100}
            unit="%"
            items={data.week.map((w) => ({
              label: w.weekdayShort[0].toUpperCase(),
              value: w.mealTotal ? Math.round((100 * w.mealDone) / w.mealTotal) : 0,
              highlight: isToday(w.date),
              color: "#0d9488",
            }))}
          />
        </Card>
        <Card className="flex items-start gap-4 border-transparent bg-gradient-to-br from-emerald-50 to-teal-50 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <Lightbulb size={20} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-emerald-800">Consejo nutricional</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{tip}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MacroRow({
  label,
  value,
  goal,
  color,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-700">
          {Math.round(value)}
          <span className="text-slate-400"> / {goal}{unit}</span>
        </span>
      </div>
      <ColorBar value={value} goal={goal} color={color} />
    </div>
  );
}

function ColorBar({ value, goal, color }: { value: number; goal: number; color: string }) {
  const p = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${p}%`, backgroundColor: color }}
      />
    </div>
  );
}

function MealCard({
  meal,
  onToggle,
}: {
  meal: MealRow;
  onToggle: (id: number, done: boolean) => void;
}) {
  const t = toneOf(meal.tone);
  return (
    <Card className={cn("relative flex items-start gap-3.5 p-4 sm:p-5", meal.doneToday && "border-emerald-200 bg-emerald-50/40")}>
      <span
        className={cn(
          "z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ring-white",
          t.soft,
          t.text
        )}
      >
        <DyIcon name={SLOT_ICON[meal.slot] ?? "UtensilsCrossed"} size={21} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold text-slate-800">{meal.slot}</p>
          <Chip tone="slate" className="bg-slate-100 text-slate-500" icon="Clock">
            {hourLabel(meal.time)}
          </Chip>
          {meal.doneToday && (
            <Chip tone="emerald" icon="Check">
              Registrado
            </Chip>
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-sm font-bold",
            meal.doneToday ? "text-slate-500" : "text-slate-800"
          )}
        >
          {meal.title}
        </p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-400">{meal.foods}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <Flame size={12} /> {meal.calories} kcal
          </span>
          <span>P {Math.round(meal.protein)}g</span>
          <span>C {Math.round(meal.carbs)}g</span>
          <span>G {Math.round(meal.fat)}g</span>
        </div>
      </div>
      <CheckButton
        done={meal.doneToday}
        onClick={() => onToggle(meal.id, !meal.doneToday)}
        label={meal.doneToday ? "Desmarcar comida" : "Marcar comida realizada"}
        tone="#059669"
      />
    </Card>
  );
}
