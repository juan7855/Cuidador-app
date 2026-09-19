"use client";

import { Check, PartyPopper } from "lucide-react";
import { Card, CardTitle, Chip, CheckButton, ProgressRing, MiniBars, DyIcon } from "@/components/ui";
import { SectionHeader } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn, hourLabel, isToday, toneOf } from "@/lib/utils";
import type { DashboardData, RoutineRow } from "@/lib/types";

const PHASES: { id: string; label: string; icon: string; tone: string }[] = [
  { id: "Amanecer", label: "Amanecer", icon: "Sunrise", tone: "amber" },
  { id: "Mañana", label: "Mañana", icon: "Sun", tone: "sky" },
  { id: "Mediodía", label: "Mediodía", icon: "SunMedium", tone: "emerald" },
  { id: "Tarde", label: "Tarde", icon: "CloudSun", tone: "orange" },
  { id: "Noche", label: "Noche", icon: "MoonStar", tone: "indigo" },
];

export default function RutinaDiaria({
  data,
  onToggle,
}: {
  data: DashboardData;
  onToggle: (id: number, done: boolean) => void;
}) {
  const def = sectionById("routine");
  const t = data.totals;
  const routinePct = t.routineTotal ? Math.round((100 * t.routineDone) / t.routineTotal) : 0;
  const allDone = t.routineDone === t.routineTotal && t.routineTotal > 0;

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader
        def={def}
        subtitle={`Línea de tiempo de hábitos de ${data.patient.name.split(" ")[0]}`}
      />

      {/* Resumen */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Card className="flex items-center gap-5 p-5 sm:p-6">
          <ProgressRing value={routinePct} size={104} stroke={11} color="#4f46e5">
            <span className="text-2xl font-extrabold text-indigo-700">
              {t.routineDone}/{t.routineTotal}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              hábitos
            </span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-slate-800">Rutina de hoy</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">
              {allDone
                ? "Jornada completada. ¡Excelente trabajo!"
                : `Te faltan ${t.routineTotal - t.routineDone} hábitos para terminar el día.`}
            </p>
            {allDone && (
              <Chip tone="emerald" icon="PartyPopper" className="mt-2">
                Día perfecto
              </Chip>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardTitle icon="CalendarCheck" tone="indigo" title="Cumplimiento por día" subtitle="Porcentaje de hábitos · últimos 7 días" />
          <MiniBars
            max={100}
            unit="%"
            items={data.week.map((w) => ({
              label: w.weekdayShort[0].toUpperCase(),
              value: w.routineTotal ? Math.round((100 * w.routineDone) / w.routineTotal) : 0,
              highlight: isToday(w.date),
              color: "#4f46e5",
            }))}
          />
        </Card>
      </div>

      {/* Línea de tiempo */}
      <div className="flex flex-col gap-5 sm:gap-6">
        {PHASES.map((phase) => {
          const tasks = data.routine
            .filter((r) => r.phase === phase.id)
            .sort((a, b) => a.time.localeCompare(b.time));
          if (!tasks.length) return null;
          const done = tasks.filter((x) => x.doneToday).length;
          const pt = toneOf(phase.tone);
          return (
            <Card key={phase.id} className="overflow-hidden">
              <div className={cn("flex items-center justify-between gap-3 p-5 sm:px-6", pt.soft)}>
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm", pt.text)}>
                    <DyIcon name={phase.icon} size={20} strokeWidth={2.3} />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 sm:text-base">
                      {phase.label}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500">
                      {done} de {tasks.length} completados
                    </p>
                  </div>
                </div>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-white/70 sm:block">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", pt.solid)}
                    style={{ width: `${(done / tasks.length) * 100}%` }}
                  />
                </div>
              </div>

              <ul className="relative px-5 py-2 sm:px-6">
                <span
                  className={cn("absolute bottom-6 left-[38px] top-6 w-0.5 sm:left-[42px]", pt.soft)}
                  aria-hidden
                />
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    tone={phase.tone}
                    onToggle={() => onToggle(task.id, !task.doneToday)}
                  />
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {allDone && (
        <Card className="flex items-center gap-4 border-transparent bg-gradient-to-r from-indigo-50 to-fuchsia-50 p-5 sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <PartyPopper size={22} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-indigo-900">
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
  onToggle,
}: {
  task: RoutineRow;
  tone: string;
  onToggle: () => void;
}) {
  const t = toneOf(tone);
  return (
    <li className="relative flex items-center gap-3.5 py-3 sm:gap-4">
      <span
        className={cn(
          "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
          task.doneToday ? cn(t.solid, "text-white") : cn(t.soft, t.text)
        )}
      >
        {task.doneToday ? <Check size={16} strokeWidth={3} /> : <DyIcon name={task.icon} size={16} strokeWidth={2.3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-extrabold",
            task.doneToday ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"
          )}
        >
          {task.title}
        </p>
        <p
          className={cn(
            "truncate text-xs font-medium",
            task.doneToday ? "text-slate-400" : "text-slate-400"
          )}
        >
          {task.detail}
        </p>
      </div>
      <span className="hidden w-16 shrink-0 text-right text-xs font-extrabold tabular-nums text-slate-400 sm:block">
        {hourLabel(task.time)}
      </span>
      <CheckButton
        done={task.doneToday}
        onClick={onToggle}
        label={task.doneToday ? "Desmarcar hábito" : "Marcar hábito"}
        tone="#4f46e5"
        size={40}
      />
    </li>
  );
}
