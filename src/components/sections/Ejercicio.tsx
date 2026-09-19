"use client";

import { useMemo, useState } from "react";
import {
  Timer,
  Flame,
  CalendarDays,
  ShieldCheck,
  Check,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardTitle, Chip, MiniBars, DyIcon, Bar } from "@/components/ui";
import { SectionHeader, StatTile } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn, dayNum, isToday, todayKey, weekdayShort, parseKey } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

function mondayOfWeek(d = new Date()) {
  const day = (d.getDay() + 6) % 7;
  const m = new Date(d);
  m.setDate(d.getDate() - day);
  return m;
}

export default function Ejercicio({
  data,
  onToggle,
}: {
  data: DashboardData;
  onToggle: (id: number, done: boolean, minutes: number) => void;
}) {
  const def = sectionById("exercise");
  const [selectedKey, setSelectedKey] = useState<string>(todayKey());
  const p = data.patient;
  const goal = p.goals?.exerciseMin ?? 30;

  const weekMap = useMemo(
    () => new Map(data.week.map((w) => [w.date, w])),
    [data.week]
  );

  const days = useMemo(() => {
    const mon = mondayOfWeek();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const dow = d.getDay();
      const plan = data.exercises.find((e) => e.dayOfWeek === dow);
      const isSelToday = key === todayKey();
      const past = weekMap.get(key);
      const done = plan ? (isSelToday ? plan.doneToday : past?.exDone ?? false) : false;
      const minutes = plan
        ? isSelToday
          ? plan.minutesToday
          : past?.minutes ?? 0
        : 0;
      return { key, plan: plan ?? null, done, minutes, future: parseKey(key).getTime() > new Date().setHours(23, 59, 59, 999) };
    });
  }, [data.exercises, weekMap]);

  const selected = days.find((d) => d.key === selectedKey) ?? days[6];
  const plan = selected.plan;
  const isTodaySel = selectedKey === todayKey();
  const past = parseKey(selectedKey).getTime() < parseKey(todayKey()).getTime();

  const weekMinutes = days.reduce((a, d) => a + (d.done ? d.plan?.durationMin ?? 0 : 0), 0);
  const weekKcal = days.reduce((a, d) => a + (d.done ? d.plan?.calories ?? 0 : 0), 0);
  const activeDays = days.filter((d) => d.done).length;
  const todayPlan = days.find((d) => d.key === todayKey())?.plan;
  const todayMinutes = days.find((d) => d.key === todayKey())?.minutes ?? 0;

  const maxHr = 220 - p.age;
  const asthma = p.conditions.some((c) => c.toLowerCase().includes("asma"));

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader
        def={def}
        subtitle={`Plan semanal de movimiento · objetivo ${goal} min/día`}
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatTile
          icon="Timer"
          tone="orange"
          label="Minutos esta semana"
          value={weekMinutes}
          unit={`/ ${goal * 7} min`}
          footer={<Bar value={weekMinutes} max={goal * 7} height={6} barClassName="bg-orange-500" />}
        />
        <StatTile
          icon="Flame"
          tone="rose"
          label="Calorías quemadas"
          value={weekKcal}
          unit="kcal"
          sub={
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CalendarDays size={12} /> {activeDays} días activos
            </span>
          }
        />
        <StatTile
          icon="Footprints"
          tone="emerald"
          label="Sesión de hoy"
          value={todayPlan ? `${todayMinutes || 0} min` : "Descanso"}
          sub={
            todayPlan ? (
              <Chip tone={todayPlan.doneToday ? "emerald" : "orange"}>
                {todayPlan.doneToday ? "Completado" : todayPlan.intensity}
              </Chip>
            ) : undefined
          }
        />
      </div>

      {/* Selector de día */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((d) => {
            const active = d.key === selectedKey;
            const rest = d.plan?.intensity === "Descanso";
            return (
              <button
                key={d.key}
                onClick={() => setSelectedKey(d.key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border py-2.5 transition active:scale-95",
                  active
                    ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : isToday(d.key)
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-slate-100 bg-slate-50/60 text-slate-500 hover:border-slate-200"
                )}
              >
                <span className="text-[10px] font-extrabold uppercase">
                  {weekdayShort(d.key).slice(0, 2)}
                </span>
                <span className="text-sm font-extrabold">{dayNum(d.key)}</span>
                {d.plan ? (
                  d.done ? (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        active ? "bg-white/25 text-white" : "bg-emerald-500 text-white"
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <DyIcon
                      name={rest ? "Coffee" : d.plan.icon}
                      size={14}
                      className={active ? "text-white" : rest ? "text-slate-400" : "text-orange-500"}
                    />
                  )
                ) : (
                  <span className="h-5 w-5" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Detalle de la sesión */}
      {plan ? (
        <Card className={cn("overflow-hidden p-0", plan.doneToday && isTodaySel && "border-emerald-200")}>
          <div
            className={cn(
              "flex flex-col gap-5 p-6 sm:p-7 sm:flex-row sm:items-center",
              plan.intensity === "Descanso"
                ? "bg-gradient-to-r from-slate-100 to-slate-50"
                : "bg-gradient-to-r from-orange-500 to-amber-400 text-white"
            )}
          >
            <span
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl",
                plan.intensity === "Descanso"
                  ? "bg-white text-slate-500 shadow-sm"
                  : "bg-white/20 text-white backdrop-blur"
              )}
            >
              <DyIcon name={plan.icon} size={30} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">{plan.title}</h2>
                <span
                  className={cn(
                            "chip",
                            plan.intensity === "Descanso"
                              ? "bg-white text-slate-500"
                              : "bg-white/20 text-white"
                          )}
                >
                  Intensidad {plan.intensity.toLowerCase()}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 max-w-lg text-sm font-medium",
                  plan.intensity === "Descanso" ? "text-slate-500" : "text-white/85"
                )}
              >
                {plan.description}
              </p>
              <div
                className={cn(
                  "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold",
                  plan.intensity === "Descanso" ? "text-slate-600" : "text-white"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Timer size={15} /> {plan.durationMin} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Flame size={15} /> {plan.calories} kcal
                </span>
              </div>
            </div>
            {isTodaySel && plan.intensity !== "Descanso" && (
              <button
                onClick={() => onToggle(plan.id, !plan.doneToday, plan.durationMin)}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold shadow-lg transition active:scale-95",
                  plan.doneToday
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white text-orange-600 hover:bg-orange-50"
                )}
              >
                {plan.doneToday ? (
                  <>
                    <RotateCcw size={16} /> Desmarcar
                  </>
                ) : (
                  <>
                    <Play size={16} /> Completar sesión
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {plan.items && plan.items.length > 0 ? (
              <>
                <CardTitle icon="ListOrdered" tone="orange" title="Desarrollo de la sesión" />
                <ol className="grid gap-2.5 sm:grid-cols-2">
                  {plan.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-extrabold text-orange-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-800">{it.name}</p>
                        <p className="truncate text-xs font-medium text-slate-400">{it.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                Día de recuperación: estiramientos suaves y paseo ligero opcional.
              </p>
            )}

            <div className="mt-4">
              {past && (
                <Chip tone={selected.done ? "emerald" : "rose"}>
                  {selected.done
                    ? "Sesión completada"
                    : "Sesión no registrada"}
                </Chip>
              )}
              {selected.future && (
                <Chip tone="slate" className="bg-slate-100 text-slate-500">
                  Sesión planificada
                </Chip>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-10 text-center text-sm font-semibold text-slate-400">
          No hay ejercicio planificado para este día.
        </Card>
      )}

      {/* Minutos por día */}
      <Card className="p-5 sm:p-6">
        <CardTitle icon="BarChart3" tone="orange" title="Minutos de actividad" subtitle="Objetivo diario marcado en sombra" />
        <MiniBars
          max={Math.max(goal, ...days.map((d) => d.plan?.durationMin ?? 0))}
          unit="m"
          items={days.map((d) => ({
            label: weekdayShort(d.key).slice(0, 2),
            value: d.done ? d.plan?.durationMin ?? 0 : 0,
            highlight: isToday(d.key),
            color: "#ea580c",
          }))}
        />
      </Card>

      {/* Seguridad */}
      <Card className="border-transparent bg-gradient-to-br from-orange-50 to-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-orange-800">
              Recomendaciones de seguridad
            </p>
            <ul className="mt-2 grid gap-1.5 text-sm font-medium leading-relaxed text-slate-600 sm:grid-cols-2">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                Zona de esfuerzo suave: {Math.round(maxHr * 0.5)}–{Math.round(maxHr * 0.7)} lpm.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                Detente si aparecen mareos, dolor en el pecho o falta de aire.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                Bebe agua antes, durante y después de moverte.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                {asthma
                  ? "Lleva el inhalador de rescate siempre encima durante el ejercicio."
                  : "Calienta 5 minutos antes y estira al finalizar."}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
