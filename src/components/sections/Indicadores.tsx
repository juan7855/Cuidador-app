"use client";

import { useState } from "react";
import { Card, CardTitle, LineChart, MiniBars, Segmented } from "@/components/ui";
import { SectionHeader, StatTile, NoticeCard } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { isToday, lastNDates, pct, toneOf, weekdayShort } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

type Tab = "bienestar" | "meds" | "actividad" | "comunidad";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function moodScore(mood?: string | null) {
  if (mood === "good") return 3;
  if (mood === "anxious") return 2;
  if (mood === "low") return 1;
  return 0;
}

function moodTone(mood?: string | null) {
  if (mood === "good") return "leaf";
  if (mood === "anxious") return "sun";
  if (mood === "low") return "coral";
  return "slate";
}

function moodLabel(mood?: string | null) {
  if (mood === "good") return "Animado";
  if (mood === "anxious") return "Ansioso";
  if (mood === "low") return "Decaído";
  return "Sin evaluar";
}

export default function Indicadores({ data }: { data: DashboardData }) {
  const def = sectionById("indicadores");
  const [tab, setTab] = useState<Tab>("bienestar");
  const dates = lastNDates(7);
  const lowStock = data.meds.filter((m) => m.stock <= m.lowStockAt);

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} />
      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: "bienestar", label: "Bienestar" },
            { value: "meds", label: "Medicamentos" },
            { value: "actividad", label: "Actividad y alimentación" },
            { value: "comunidad", label: "Comunidad" },
          ]}
        />
      </div>

      {tab === "bienestar" && <Bienestar data={data} dates={dates} />}
      {tab === "meds" && <Medicamentos data={data} lowStock={lowStock} />}
      {tab === "actividad" && <Actividad data={data} />}
      {tab === "comunidad" && <Comunidad data={data} />}
    </div>
  );
}

function Bienestar({ data, dates }: { data: DashboardData; dates: string[] }) {
  const sleepSeries = dates.map((d) => data.vitals.find((v) => v.date === d)?.sleepHours ?? 0);
  const moods = dates.map((d) => data.vitals.find((v) => v.date === d)?.mood ?? null);

  return (
    <>
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="MoonStar" tone="ink" title="Cómo durmió" subtitle="Últimos 7 días" />
          <LineChart
            series={[{ values: sleepSeries, color: toneOf("ink").hex }]}
            labels={dates.map((d) => cap(weekdayShort(d)))}
            min={0}
          />
        </Card>
        <Card className="p-5 sm:p-6">
          <CardTitle icon="Smile" tone="brand" title="Cómo está de ánimo" subtitle="Últimos 7 días" />
          <MiniBars
            max={3}
            items={dates.map((d, i) => ({
              label: cap(weekdayShort(d)),
              value: moodScore(moods[i]),
              highlight: isToday(d),
              color: toneOf(moodTone(moods[i])).hex,
            }))}
          />
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          icon="Heart"
          tone="brand"
          label="Bienestar subjetivo"
          value={data.patient.assessment?.wellbeing ?? "—"}
          unit="/5"
        />
        <StatTile
          icon="Smile"
          tone={moodTone(data.todayVital?.mood)}
          label="Ánimo de hoy"
          value={moodLabel(data.todayVital?.mood)}
        />
      </div>
    </>
  );
}

function Medicamentos({
  data,
  lowStock,
}: {
  data: DashboardData;
  lowStock: DashboardData["meds"];
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon="CalendarCheck"
          tone="brand"
          label="Adherencia (7 días)"
          value={data.totals.adherence7}
          unit="%"
        />
        <StatTile
          icon="Pill"
          tone="brand"
          label="Tomas de hoy"
          value={`${data.totals.medsDone}/${data.totals.medsTotal}`}
        />
        <StatTile
          icon="PackageX"
          tone={lowStock.length ? "sun" : "leaf"}
          label="Stock bajo"
          value={lowStock.length}
        />
      </div>
      <Card className="p-5 sm:p-6">
        <CardTitle icon="CalendarCheck" tone="ink" title="Adherencia diaria" subtitle="Últimos 7 días" />
        <MiniBars
          max={100}
          unit="%"
          items={data.week.map((w) => ({
            label: cap(w.weekdayShort),
            value: w.medTotal ? pct(w.medDone, w.medTotal) : 0,
            highlight: isToday(w.date),
            color: toneOf("brand").hex,
          }))}
        />
      </Card>
      {lowStock.length > 0 && (
        <NoticeCard tone="sun" icon="TriangleAlert" title="Medicamentos con stock bajo">
          <strong>{lowStock.map((m) => m.name).join(", ")}</strong>. Pide cita o renueva la
          receta para no interrumpir el tratamiento.
        </NoticeCard>
      )}
    </>
  );
}

function Actividad({ data }: { data: DashboardData }) {
  const maxSteps = Math.max(...data.week.map((w) => w.steps), 1);
  const maxMinutes = Math.max(...data.week.map((w) => w.minutes), 1);
  const goals = data.patient.goals;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon="UtensilsCrossed"
          tone="brand"
          label="Comidas de hoy"
          value={`${data.totals.mealsDone}/${data.totals.mealsTotal}`}
        />
        <StatTile
          icon="Droplets"
          tone="aqua"
          label="Agua de hoy"
          value={`${data.water}/${goals?.waterGlasses ?? 8}`}
        />
        <StatTile
          icon="Footprints"
          tone="sun"
          label="Pasos de hoy"
          value={data.week[data.week.length - 1]?.steps ?? 0}
        />
      </div>
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="Footprints" tone="sun" title="Pasos" subtitle="Últimos 7 días" />
          <MiniBars
            max={maxSteps}
            items={data.week.map((w) => ({
              label: cap(w.weekdayShort),
              value: w.steps,
              highlight: isToday(w.date),
              color: toneOf("sun").hex,
            }))}
          />
        </Card>
        <Card className="p-5 sm:p-6">
          <CardTitle icon="Dumbbell" tone="brand" title="Minutos de actividad" subtitle="Últimos 7 días" />
          <MiniBars
            max={maxMinutes}
            items={data.week.map((w) => ({
              label: cap(w.weekdayShort),
              value: w.minutes,
              highlight: isToday(w.date),
              color: toneOf("brand").hex,
            }))}
          />
        </Card>
      </div>
      <Card className="p-5 sm:p-6">
        <CardTitle icon="UtensilsCrossed" tone="leaf" title="Comidas cumplidas" subtitle="Últimos 7 días" />
        <MiniBars
          max={100}
          unit="%"
          items={data.week.map((w) => ({
            label: cap(w.weekdayShort),
            value: w.mealTotal ? pct(w.mealDone, w.mealTotal) : 0,
            highlight: isToday(w.date),
            color: toneOf("leaf").hex,
          }))}
        />
      </Card>
    </>
  );
}

function Comunidad({ data }: { data: DashboardData }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardTitle icon="MessagesSquare" tone="brand" title="Comunidad" />
      {data.community.member ? (
        <NoticeCard tone="leaf" icon="Check" title="Participa en la comunidad">
          Tiene acceso al foro y mensajes de MiSalud
          {data.community.addedAt
            ? ` desde el ${new Date(data.community.addedAt).toLocaleDateString("es-ES")}`
            : ""}
          .
        </NoticeCard>
      ) : (
        <NoticeCard tone="slate" icon="MessagesSquare" title="Sin acceso a la comunidad">
          Actívalo desde la sección Comunidad si quieres que participe en el foro.
        </NoticeCard>
      )}
    </Card>
  );
}
