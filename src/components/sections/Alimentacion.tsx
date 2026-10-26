"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Minus,
  GlassWater,
  Check,
  Flame,
  Salad,
  Lightbulb,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardTitle,
  Chip,
  CheckButton,
  ProgressRing,
  MiniBars,
  DyIcon,
  Modal,
  AnimatedNumber,
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

const MEAL_SLOTS = ["Desayuno", "Media mañana", "Almuerzo", "Merienda", "Cena"];
const MACRO_GOALS = { protein: 90, carbs: 210, fat: 65 };

export default function Alimentacion({
  data,
  onToggleMeal,
  onWater,
  onChanged,
}: {
  data: DashboardData;
  onToggleMeal: (id: number, done: boolean) => void;
  onWater: (glasses: number) => void;
  onChanged: () => Promise<void>;
}) {
  const def = sectionById("food");
  const p = data.patient;
  const goalKcal = p.goals?.calories ?? 1800;
  const waterGoal = p.goals?.waterGlasses ?? 8;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MealRow | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDelete = async (meal: MealRow) => {
    if (!window.confirm(`¿Eliminar ${meal.slot}? Se borrará también su historial.`)) {
      return;
    }
    setDeletingId(meal.id);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      if (res.ok) await onChanged();
    } finally {
      setDeletingId(null);
    }
  };

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
            color="#009a74"
            gradientId="kcal-grad"
          >
            <Flame size={14} className="text-leaf-500" />
            <span className="text-lg font-bold text-slate-800">
              <AnimatedNumber value={consumed} />
            </span>
            <span className="text-[10px] font-bold text-slate-400">de {goalKcal} kcal</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Energía consumida</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
              {consumed >= goalKcal
                ? "Has alcanzado el objetivo calórico de hoy."
                : `Te quedan unas ${Math.max(0, goalKcal - consumed)} kcal para tu objetivo.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip tone="leaf">{doneMeals.length} comidas registradas</Chip>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardTitle icon="ChartPie" tone="leaf" title="Macronutrientes" />
          <div className="flex flex-col gap-3.5">
            <MacroRow label="Proteínas" value={protein} goal={MACRO_GOALS.protein} color="#009a74" unit="g" />
            <MacroRow label="Carbohidratos" value={carbs} goal={MACRO_GOALS.carbs} color="#e09339" unit="g" />
            <MacroRow label="Grasas" value={fat} goal={MACRO_GOALS.fat} color="#cb7e2e" unit="g" />
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <CardTitle
            icon="GlassWater"
            tone="aqua"
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
                    ? "border-aqua-300 bg-aqua-50 text-aqua-500"
                    : "border-slate-200 bg-slate-50 text-slate-300 hover:border-aqua-200"
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
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-aqua-500 text-sm font-bold text-white shadow-lg shadow-aqua-500/25 transition hover:bg-aqua-600 active:scale-95"
              aria-label="Añadir un vaso"
            >
              <Plus size={15} /> Añadir
            </button>
          </div>
        </Card>
      </div>

      {/* Plan de comidas */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Salad size={16} className="text-leaf-600" />
            Plan de comidas de hoy
          </h3>
          <button onClick={() => setOpen(true)} className="btn-primary-sm">
            <Plus size={16} strokeWidth={2.6} />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
        <div className="relative flex flex-col gap-3 sm:gap-4">
          <span className="absolute bottom-6 left-10 top-6 w-px bg-leaf-100 sm:left-11" aria-hidden />
          {data.meals.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              onToggle={onToggleMeal}
              onEdit={() => setEditing(m)}
              onDelete={() => handleDelete(m)}
              deleting={deletingId === m.id}
            />
          ))}
        </div>
      </div>

      {/* Semana + consejo */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="CalendarDays" tone="aqua" title="Cumplimiento del plan" subtitle="Comidas registradas · 7 días" />
          <MiniBars
            max={100}
            unit="%"
            items={data.week.map((w) => ({
              label: w.weekdayShort[0].toUpperCase(),
              value: w.mealTotal ? Math.round((100 * w.mealDone) / w.mealTotal) : 0,
              highlight: isToday(w.date),
              color: "#4399b2",
            }))}
          />
        </Card>
        <Card className="flex items-start gap-4 border-transparent bg-gradient-to-br from-brand-50 to-brand-100 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-leaf-600 shadow-sm">
            <Lightbulb size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-leaf-800">Consejo nutricional</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{tip}</p>
          </div>
        </Card>
      </div>

      <MealModal
        open={open}
        onClose={() => setOpen(false)}
        patientId={data.patient.id}
        meal={editing}
        onSaved={async () => {
          setEditing(null);
          setOpen(false);
          await onChanged();
        }}
      />
      {editing && (
        <MealModal
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          patientId={data.patient.id}
          meal={editing}
          onSaved={async () => {
            setEditing(null);
            await onChanged();
          }}
        />
      )}
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

const EMPTY_MEAL_FORM = {
  slot: "Desayuno",
  time: "08:00",
  title: "",
  foods: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

function formFromMeal(meal: MealRow): typeof EMPTY_MEAL_FORM {
  return {
    slot: meal.slot,
    time: meal.time,
    title: meal.title,
    foods: meal.foods,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
  };
}

function MealModal({
  open,
  onClose,
  patientId,
  meal,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  patientId: number;
  meal?: MealRow | null;
  onSaved: () => Promise<void>;
}) {
  const isEdit = Boolean(meal);
  const [form, setForm] = useState(EMPTY_MEAL_FORM);
  const [saving, setSaving] = useState(false);

  const [synced, setSynced] = useState<{ open: boolean; meal?: MealRow | null }>({
    open: false,
  });
  if (synced.open !== open || synced.meal !== meal) {
    setSynced({ open, meal });
    if (open) setForm(meal ? formFromMeal(meal) : EMPTY_MEAL_FORM);
  }

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/meals/${meal!.id}` : "/api/meals",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            slot: form.slot,
            time: form.time,
            title: form.title,
            foods: form.foods,
            calories: Number(form.calories),
            protein: Number(form.protein),
            carbs: Number(form.carbs),
            fat: Number(form.fat),
            tone: "emerald",
          }),
        }
      );
      if (res.ok) {
        await onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Editar comida" : "Añadir comida"}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <label className="label">Tipo de comida *</label>
          <select
            className="input"
            value={form.slot}
            onChange={(e) => setForm({ ...form, slot: e.target.value })}
          >
            {MEAL_SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Hora</label>
            <input
              type="time"
              className="input"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Comidas registradas</label>
            <input
              type="number"
              min={0}
              max={16}
              className="input"
              disabled
              value="1"
            />
          </div>
        </div>

        <div>
          <label className="label">Nombre de la comida *</label>
          <input
            className="input"
            placeholder="Ej. Ensalada de pollo"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Alimentos</label>
          <textarea
            className="input min-h-16 resize-none"
            placeholder="Ej. Pechuga de pollo, lechuga, tomate, aceite de oliva"
            value={form.foods}
            onChange={(e) => setForm({ ...form, foods: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Calorías</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Proteínas (g)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className="input"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Carbohidratos (g)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className="input"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Grasas (g)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className="input"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving || !form.title.trim()}
            className="btn-primary flex-1"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MealCard({
  meal,
  onToggle,
  onEdit,
  onDelete,
  deleting,
}: {
  meal: MealRow;
  onToggle: (id: number, done: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const t = toneOf(meal.tone);
  return (
    <Card className={cn("relative flex items-start gap-3.5 p-4 sm:p-5", meal.doneToday && "border-leaf-200 bg-leaf-50/40")}>
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
          <p className="text-sm font-bold text-slate-800">{meal.slot}</p>
          <Chip tone="slate" className="bg-slate-100 text-slate-500" icon="Clock">
            {hourLabel(meal.time)}
          </Chip>
          {meal.doneToday && (
            <Chip tone="leaf" icon="Check">
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
          <span className="inline-flex items-center gap-1 text-leaf-600">
            <Flame size={12} /> {meal.calories} kcal
          </span>
          <span>P {Math.round(meal.protein)}g</span>
          <span>C {Math.round(meal.carbs)}g</span>
          <span>G {Math.round(meal.fat)}g</span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100"
          >
            <Pencil size={13} strokeWidth={2.4} /> Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-coral-50 hover:text-coral-600 disabled:opacity-50"
          >
            <Trash2 size={13} strokeWidth={2.4} /> {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
      <CheckButton
        done={meal.doneToday}
        onClick={() => onToggle(meal.id, !meal.doneToday)}
        label={meal.doneToday ? "Desmarcar comida" : "Marcar comida realizada"}
        tone="#009a74"
      />
    </Card>
  );
}
