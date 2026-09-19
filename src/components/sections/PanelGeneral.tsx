"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Sparkles,
  Pill,
  Target,
} from "lucide-react";
import { Card, CardTitle, ProgressRing, Bar, MiniBars, CheckButton, DyIcon } from "@/components/ui";
import { SectionHeader, StatTile, ShortcutTile, NoticeCard } from "@/components/sections/_shared";
import { SECTIONS, sectionById, type SectionId } from "@/components/nav";
import {
  cn,
  formatLongDate,
  greeting,
  hourLabel,
  isToday,
  pct,
  toneOf,
} from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

interface Props {
  data: DashboardData;
  go: (s: SectionId) => void;
  onToggleMed: (id: number, done: boolean) => void;
  onToggleMeal: (id: number, done: boolean) => void;
  onToggleRoutine: (id: number, done: boolean) => void;
}

interface Action {
  time: string;
  title: string;
  sub: string;
  icon: string;
  tone: string;
  hex: string;
  kind: "med" | "meal" | "routine";
  id: number;
}

export default function PanelGeneral({
  data,
  go,
  onToggleMed,
  onToggleMeal,
  onToggleRoutine,
}: Props) {
  const def = sectionById("panel");
  const p = data.patient;
  const v = data.todayVital;
  const prev = data.vitals[data.vitals.length - 2];
  const firstName = p.name.split(" ")[0];
  const goals = p.goals;

  const delta = (a?: number | null, b?: number | null) => {
    if (a == null || b == null) return 0;
    return Math.round((a - b) * 10) / 10;
  };
  const hrDelta = delta(v?.heartRate, prev?.heartRate);

  const dayPct = (w: (typeof data.week)[number]) => {
    const total =
      w.medTotal +
      w.mealTotal +
      w.routineTotal +
      (w.planned && w.planned.intensity !== "Descanso" ? 1 : 0);
    const done = w.medDone + w.mealDone + w.routineDone + (w.exDone ? 1 : 0);
    return total ? pct(done, total) : 0;
  };

  const actions: Action[] = [
    ...data.meds
      .filter((m) => m.scheduled && !m.takenToday)
      .map((m) => ({
        time: m.time,
        title: `${m.name} · ${m.dosage}`,
        sub: `${m.form}${m.withFood ? " · con comida" : ""}`,
        icon: "Pill",
        tone: m.tone,
        hex: toneOf(m.tone).hex,
        kind: "med" as const,
        id: m.id,
      })),
    ...data.meals
      .filter((m) => !m.doneToday)
      .map((m) => ({
        time: m.time,
        title: m.title,
        sub: `${m.slot} · ${m.calories} kcal`,
        icon: "UtensilsCrossed",
        tone: m.tone,
        hex: toneOf(m.tone).hex,
        kind: "meal" as const,
        id: m.id,
      })),
    ...data.routine
      .filter((r) => !r.doneToday)
      .map((r) => ({
        time: r.time,
        title: r.title,
        sub: r.detail,
        icon: r.icon,
        tone: "indigo",
        hex: toneOf("indigo").hex,
        kind: "routine" as const,
        id: r.id,
      })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const fireAction = (a: Action) => {
    if (a.kind === "med") onToggleMed(a.id, true);
    if (a.kind === "meal") onToggleMeal(a.id, true);
    if (a.kind === "routine") onToggleRoutine(a.id, true);
  };

  const nextMed = data.meds.find((m) => m.scheduled && !m.takenToday);
  const lowStock = data.meds.filter((m) => m.stock <= m.lowStockAt);

  const tip = p.conditions.some((c) => c.toLowerCase().includes("diabetes"))
    ? "Camina 10 minutos después de las comidas principales: ayuda a reducir el pico de glucosa postprandial."
    : p.conditions.some((c) => c.toLowerCase().includes("hipertensión"))
      ? "Recuerda evitar añadir sal a las comidas y mantener una hidratación constante a lo largo del día."
      : p.conditions.some((c) => c.toLowerCase().includes("asma"))
        ? "Evita el ejercicio intenso en días con alto índice de polen y lleva siempre el inhalador de rescate encima."
        : "Una caminata de 20 minutos al aire libre mejora el estado de ánimo y la calidad del sueño.";

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} subtitle={cap(formatLongDate(data.today))} />

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8"
        style={{
          background:
            "linear-gradient(130deg,#1f66d6 0%,#2f80ed 48%,#45b4ef 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/[0.07]" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Sparkles size={12} />
              Plan de hoy
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greeting()}, {firstName}
            </h2>
            <p className="mt-1.5 max-w-md text-sm font-medium leading-relaxed text-white/85">
              Llevas {data.totals.medsDone + data.totals.mealsDone + data.totals.routineDone + (data.totals.exerciseDone ? 1 : 0)}{" "}
              de{" "}
              {data.totals.medsTotal +
                data.totals.mealsTotal +
                data.totals.routineTotal +
                (data.totals.hasExercise ? 1 : 0)}{" "}
              actividades completadas. ¡Vas a buen ritmo!
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextMed ? (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
                  <Pill size={14} />
                  Próxima toma: {nextMed.name} · {hourLabel(nextMed.time)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
                  <CheckCircle2 size={14} />
                  Medicación del día completada
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
                <DyIcon name="Droplets" size={14} />
                {data.water} de {goals?.waterGlasses ?? 8} vasos de agua
              </span>
            </div>
          </div>
          <ProgressRing
            value={data.totals.overall}
            size={132}
            stroke={13}
            color="#ffffff"
            track="rgba(255,255,255,0.22)"
          >
            <span className="text-3xl font-extrabold">{data.totals.overall}%</span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-white/80">
              completado
            </span>
          </ProgressRing>
        </div>
      </div>

      {/* Constantes */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatTile
          icon="HeartPulse"
          tone="rose"
          label="Pulso"
          value={v?.heartRate ?? "—"}
          unit="lpm"
          sub={<DeltaTag value={hrDelta} suffix=" lpm" goodWhen="down" />}
        />
        <StatTile
          icon="Activity"
          tone="blue"
          label="Presión arterial"
          value={
            v?.systolic ? (
              <>
                {v.systolic}
                <span className="text-slate-300">/</span>
                {v.diastolic}
              </>
            ) : (
              "—"
            )
          }
          unit="mmHg"
        />
        <StatTile
          icon="Footprints"
          tone="emerald"
          label="Pasos"
          value={(v?.steps ?? 0).toLocaleString("es-ES")}
          sub={
            <span className="text-[11px] font-bold text-slate-400">
              meta {(goals?.steps ?? 6000).toLocaleString("es-ES")}
            </span>
          }
          footer={
            <Bar
              value={v?.steps ?? 0}
              max={goals?.steps ?? 6000}
              barClassName="bg-emerald-500"
              height={6}
            />
          }
        />
        <StatTile
          icon="MoonStar"
          tone="indigo"
          label="Sueño"
          value={fmt1(v?.sleepHours)}
          unit="h"
          sub={
            <span className="text-[11px] font-bold text-slate-400">
              {v?.mood ?? ""}
            </span>
          }
        />
        <StatTile
          icon="Wind"
          tone="teal"
          label="Oxígeno"
          value={v?.oxygen ?? "—"}
          unit="%"
          className="col-span-2 sm:col-span-1"
          sub={
            <span className="chip bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
              Normal
            </span>
          }
        />
      </div>

      {/* Acciones + columna lateral */}
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardTitle
            icon="ListChecks"
            tone="blue"
            title="Próximas acciones"
            subtitle="Las tareas pendientes se ordenan por hora"
            action={
              <span className="chip bg-brand-50 text-brand-700">
                <Target size={13} />
                {actions.length} pendientes
              </span>
            }
          />
          {actions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50/70 py-10 text-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <div>
                <p className="text-sm font-extrabold text-emerald-800">
                  Día completado
                </p>
                <p className="text-xs font-medium text-emerald-700/80">
                  Todas las actividades de hoy están registradas.
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col">
              {actions.slice(0, 6).map((a, i) => {
                const t = toneOf(a.tone);
                return (
                  <li
                    key={`${a.kind}-${a.id}`}
                    className={cn(
                      "flex items-center gap-3 py-3 sm:gap-4",
                      i !== 0 && "border-t border-slate-100"
                    )}
                  >
                    <span className="w-12 shrink-0 text-xs font-extrabold tabular-nums text-slate-400">
                      {hourLabel(a.time)}
                    </span>
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        t.soft,
                        t.text
                      )}
                    >
                      <DyIcon name={a.icon} size={18} strokeWidth={2.3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-slate-800">
                        {a.title}
                      </p>
                      <p className="truncate text-xs font-medium text-slate-400">
                        {a.sub}
                      </p>
                    </div>
                    <CheckButton
                      done={false}
                      onClick={() => fireAction(a)}
                      label={`Marcar ${a.title}`}
                      tone={a.hex}
                      size={40}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-5 sm:gap-6">
          <Card className="p-5 sm:p-6">
            <CardTitle icon="CalendarCheck" tone="indigo" title="Adherencia semanal" />
            <MiniBars
              max={100}
              unit="%"
              items={data.week.map((w) => ({
                label: cap(w.weekdayShort),
                value: dayPct(w),
                highlight: isToday(w.date),
                color: "#4f46e5",
              }))}
            />
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3">
              <span className="text-xs font-bold text-indigo-700">
                Media de los últimos 7 días
              </span>
              <span className="text-lg font-extrabold text-indigo-700">
                {data.totals.adherence7}%
              </span>
            </div>
          </Card>

          {lowStock.length > 0 && (
            <NoticeCard tone="amber" icon="TriangleAlert" title="Stock de medicación bajo">
              Quedan pocas unidades de{" "}
              <strong>{lowStock.map((m) => m.name).join(", ")}</strong>. Pide
              cita o renueva la receta para no interrumpir el tratamiento.
            </NoticeCard>
          )}
          {p.allergies.length > 0 && (
            <NoticeCard tone="rose" icon="ShieldAlert" title="Alergias registradas">
              {p.allergies.join(", ")}. El equipo médico debe verificarlo antes
              de recetar cualquier nuevo medicamento.
            </NoticeCard>
          )}
        </div>
      </div>

      {/* Consejo de salud */}
      <Card className="flex items-start gap-4 overflow-hidden border-transparent bg-gradient-to-r from-brand-50 to-sky-50 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
          <Sparkles size={20} />
        </span>
        <div>
          <p className="text-sm font-extrabold text-brand-800">
            Consejo de hoy para {firstName}
          </p>
          <p className="mt-0.5 text-sm font-medium leading-relaxed text-slate-600">
            {tip}
          </p>
        </div>
      </Card>

      {/* Accesos rápidos */}
      <div>
        <h3 className="mb-3 px-1 text-sm font-extrabold uppercase tracking-wide text-slate-400">
          Accesos rápidos
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {SECTIONS.filter((s) => s.id !== "panel").map((s) => (
            <ShortcutTile key={s.id} def={s} onClick={() => go(s.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DeltaTag({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
  goodWhen?: "up" | "down";
}) {
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  const tone =
    value === 0
      ? "text-slate-400"
      : value > 0
        ? "text-rose-500"
        : "text-emerald-600";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold", tone)}>
      <Icon size={13} />
      {value > 0 ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function fmt1(n?: number | null) {
  if (n == null) return "—";
  return String(n).replace(".", ",");
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
