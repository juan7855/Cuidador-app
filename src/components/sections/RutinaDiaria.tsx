"use client";

import { useState } from "react";
import { Check, ChevronDown, PartyPopper, Smartphone } from "lucide-react";
import { Card, CardTitle, Chip, ProgressRing, MiniBars, DyIcon, AnimatedNumber } from "@/components/ui";
import { SectionHeader } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn, hourLabel, isToday, normalizePhase, toneOf } from "@/lib/utils";
import type { DashboardData, RoutineRow } from "@/lib/types";

const PHASES: { id: string; label: string; icon: string; tone: string }[] = [
  { id: "Amanecer", label: "Amanecer", icon: "Sunrise", tone: "sun" },
  { id: "Mañana", label: "Mañana", icon: "Sun", tone: "aqua" },
  { id: "Mediodía", label: "Mediodía", icon: "SunMedium", tone: "leaf" },
  { id: "Tarde", label: "Tarde", icon: "CloudSun", tone: "sun" },
  { id: "Noche", label: "Noche", icon: "MoonStar", tone: "ink" },
];

export default function RutinaDiaria({
  data,
}: {
  data: DashboardData;
}) {
  const def = sectionById("routine");
  const t = data.totals;
  const routinePct = t.routineTotal ? Math.round((100 * t.routineDone) / t.routineTotal) : 0;
  const allDone = t.routineDone === t.routineTotal && t.routineTotal > 0;

  const phasesWithTasks = PHASES.map((phase) => {
    const tasks = data.routine
      .filter((r) => normalizePhase(r.phase) === phase.id)
      .sort((a, b) => a.time.localeCompare(b.time));
    const done = tasks.filter((x) => x.doneToday).length;
    return { ...phase, tasks, done };
  }).filter((p) => p.tasks.length > 0);

  const [openPhases, setOpenPhases] = useState<Set<string>>(() => {
    const incomplete = phasesWithTasks.find((p) => p.done < p.tasks.length);
    return new Set(incomplete ? [incomplete.id] : []);
  });

  const toggle = (id: string) => {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader
        def={def}
        subtitle={`Línea de tiempo de hábitos de ${data.patient.name.split(" ")[0]}`}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
            <Smartphone size={13} />
            Registrado desde la app de {data.patient.name.split(" ")[0]}
          </span>
        }
      />

      {/* Resumen compacto */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Card className="flex items-center gap-5 p-5 sm:p-6">
          <ProgressRing value={routinePct} size={104} stroke={11} color="#1e2b28">
            <span className="text-2xl font-bold text-ink-700">
              <AnimatedNumber value={t.routineDone} />/{t.routineTotal}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              hábitos
            </span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Rutina de hoy</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
              {allDone
                ? "Jornada completada. ¡Excelente trabajo!"
                : `Te faltan ${t.routineTotal - t.routineDone} hábitos para terminar el día.`}
            </p>
            {allDone && (
              <Chip tone="leaf" icon="PartyPopper" className="mt-2">
                Día perfecto
              </Chip>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardTitle icon="CalendarCheck" tone="ink" title="Cumplimiento por día" subtitle="Porcentaje de hábitos · últimos 7 días" />
          <MiniBars
            max={100}
            unit="%"
            items={data.week.map((w) => ({
              label: w.weekdayShort[0].toUpperCase(),
              value: w.routineTotal ? Math.round((100 * w.routineDone) / w.routineTotal) : 0,
              highlight: isToday(w.date),
              color: "#1e2b28",
            }))}
          />
        </Card>
      </div>

      {/* Fases desplegables */}
      <Card className="divide-y divide-slate-100 overflow-hidden p-0">
        {phasesWithTasks.map((phase) => {
          const isOpen = openPhases.has(phase.id);
          const phasePct = phase.tasks.length
            ? Math.round((100 * phase.done) / phase.tasks.length)
            : 0;
          const pt = toneOf(phase.tone);
          const phaseComplete = phase.done === phase.tasks.length;

          return (
            <div key={phase.id}>
              {/* Cabecera de fase — siempre visible */}
              <button
                onClick={() => toggle(phase.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6",
                  isOpen && "bg-slate-50/60"
                )}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", pt.soft, pt.text)}>
                  <DyIcon name={phase.icon} size={20} strokeWidth={2.3} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{phase.label}</h3>
                    {phaseComplete && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf-100 text-leaf-600">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">
                    {phase.done}/{phase.tasks.length} completados
                  </p>
                </div>

                {/* Barra de progreso inline */}
                <div className="hidden w-28 sm:block">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", pt.solid)}
                      style={{ width: `${phasePct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] font-bold tabular-nums text-slate-400">
                    {phasePct}%
                  </p>
                </div>

                <ChevronDown
                  size={18}
                  strokeWidth={2.5}
                  className={cn(
                    "shrink-0 text-slate-400 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Contenido desplegable */}
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {phase.tasks.map((task) => (
                        <TaskRow key={task.id} task={task} tone={phase.tone} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {allDone && (
        <Card className="flex items-center gap-4 border-transparent bg-gradient-to-r from-ink-50 to-sun-50 p-5 sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-ink-600 shadow-sm">
            <PartyPopper size={22} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">
              {data.patient.name.split(" ")[0]} ha completado toda la rutina
            </p>
            <p className="text-xs font-medium text-slate-500">
              Una rutina estable ayuda a dormir mejor y refuerza el resto de
              hábitos saludables.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function TaskRow({
  task,
  tone,
}: {
  task: RoutineRow;
  tone: string;
}) {
  const t = toneOf(tone);
  return (
    <tr
      className={cn(
        "group border-t border-slate-50 transition-colors",
        task.doneToday ? "bg-slate-50/50" : "hover:bg-slate-50/40"
      )}
    >
      {/* Icono */}
      <td className="w-12 py-3 pl-5 sm:pl-6">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            task.doneToday ? cn(t.solid, "text-white") : cn(t.soft, t.text)
          )}
        >
          {task.doneToday ? <Check size={14} strokeWidth={3} /> : <DyIcon name={task.icon} size={14} strokeWidth={2.3} />}
        </span>
      </td>

      {/* Título y detalle */}
      <td className="py-3">
        <p
          className={cn(
            "text-sm font-bold",
            task.doneToday ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"
          )}
        >
          {task.title}
        </p>
        <p className="truncate text-xs font-medium text-slate-400">
          {task.detail}
        </p>
      </td>

      {/* Hora */}
      <td className="hidden w-20 py-3 text-right text-xs font-bold tabular-nums text-slate-400 sm:table-cell">
        {hourLabel(task.time)}
      </td>

      {/* Estado (solo lectura) */}
      <td className="w-28 py-3 pr-5 text-right sm:pr-6">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
            task.doneToday ? "bg-leaf-100 text-leaf-700" : "bg-slate-100 text-slate-400"
          )}
        >
          {task.doneToday ? <Check size={12} strokeWidth={3} /> : null}
          {task.doneToday ? "Hecho" : "Pendiente"}
        </span>
      </td>
    </tr>
  );
}
