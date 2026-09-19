"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HeartPulse } from "lucide-react";
import PatientSelector, { type LitePatient } from "@/components/PatientSelector";
import AppChrome, { type Reminder } from "@/components/AppChrome";
import { type SectionId } from "@/components/nav";
import { jsonFetch, hourLabel } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";
import PanelGeneral from "@/components/sections/PanelGeneral";
import PerfilClinico from "@/components/sections/PerfilClinico";
import Medicamentos from "@/components/sections/Medicamentos";
import Alimentacion from "@/components/sections/Alimentacion";
import Ejercicio from "@/components/sections/Ejercicio";
import MenteActiva from "@/components/sections/MenteActiva";
import RutinaDiaria from "@/components/sections/RutinaDiaria";

const STORAGE_KEY = "vitalcare.patient";

function applyTodayTotals(d: DashboardData): DashboardData {
  const dow = new Date().getDay();
  const todaysPlan = d.exercises.find((e) => e.dayOfWeek === dow);
  const hasExercise = Boolean(todaysPlan && todaysPlan.intensity !== "Descanso");
  const medsDone = d.meds.filter((m) => m.scheduled && m.takenToday).length;
  const mealsDone = d.meals.filter((m) => m.doneToday).length;
  const routineDone = d.routine.filter((r) => r.doneToday).length;
  const exDone = hasExercise && todaysPlan ? todaysPlan.doneToday : false;

  const medsTotal = d.meds.filter((m) => m.scheduled).length;
  const total = medsTotal + d.meals.length + d.routine.length + (hasExercise ? 1 : 0);
  const done = medsDone + mealsDone + routineDone + (exDone ? 1 : 0);

  return {
    ...d,
    totals: {
      ...d.totals,
      medsDone,
      medsTotal,
      mealsDone,
      mealsTotal: d.meals.length,
      routineDone,
      routineTotal: d.routine.length,
      exerciseDone: exDone,
      hasExercise,
      overall: total ? Math.round((100 * done) / total) : 0,
    },
  };
}

function Splash() {
  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center gap-5">
      <span className="flex h-14 w-14 animate-pop items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-sky-400 text-white shadow-xl shadow-brand-500/30">
        <HeartPulse size={28} />
      </span>
      <p className="text-lg font-extrabold tracking-tight text-slate-800">VitalCare</p>
      <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
    </div>
  );
}

export default function HealthApp({ patients }: { patients: LitePatient[] }) {
  const [hydrated, setHydrated] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [section, setSection] = useState<SectionId>("panel");

  const load = useCallback(async (id: number) => {
    try {
      const d = await jsonFetch<DashboardData>(`/api/patients/${id}?t=${Date.now()}`, {
        cache: "no-store",
      });
      setData(applyTodayTotals(d));
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const id = Number(raw);
      if (patients.some((p) => p.id === id)) {
        setPatientId(id);
        void load(id);
      }
    }
    setHydrated(true);
  }, [load, patients]);

  const select = useCallback(
    (id: number) => {
      localStorage.setItem(STORAGE_KEY, String(id));
      setPatientId(id);
      setSection("panel");
      window.scrollTo({ top: 0 });
      return load(id);
    },
    [load]
  );

  const exit = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(null);
    setPatientId(null);
    setSection("panel");
  }, []);

  const go = useCallback((id: SectionId) => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const postLog = useCallback(
    (payload: Record<string, unknown>) => {
      if (!patientId) return;
      void fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => load(patientId));
    },
    [patientId, load]
  );

  const markMed = useCallback(
    (id: number, done: boolean) => {
      setData((d) => {
        if (!d) return d;
        return applyTodayTotals({
          ...d,
          meds: d.meds.map((m) => (m.id === id ? { ...m, takenToday: done } : m)),
        });
      });
      if (data) postLog({ kind: "med", patientId, id, date: data.today, done });
    },
    [data, patientId, postLog]
  );

  const markMeal = useCallback(
    (id: number, done: boolean) => {
      setData((d) =>
        d ? applyTodayTotals({ ...d, meals: d.meals.map((m) => (m.id === id ? { ...m, doneToday: done } : m)) }) : d
      );
      if (data) postLog({ kind: "meal", patientId, id, date: data.today, done });
    },
    [data, patientId, postLog]
  );

  const markExercise = useCallback(
    (id: number, done: boolean, minutes: number) => {
      setData((d) =>
        d
          ? applyTodayTotals({
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === id ? { ...e, doneToday: done, minutesToday: done ? minutes : 0 } : e
              ),
            })
          : d
      );
      if (data)
        postLog({ kind: "exercise", patientId, id, date: data.today, done, minutes });
    },
    [data, patientId, postLog]
  );

  const markRoutine = useCallback(
    (id: number, done: boolean) => {
      setData((d) =>
        d
          ? applyTodayTotals({
              ...d,
              routine: d.routine.map((r) => (r.id === id ? { ...r, doneToday: done } : r)),
            })
          : d
      );
      if (data) postLog({ kind: "routine", patientId, id, date: data.today, done });
    },
    [data, patientId, postLog]
  );

  const setWater = useCallback(
    (glasses: number) => {
      setData((d) => (d ? { ...d, water: glasses } : d));
      if (data) postLog({ kind: "water", patientId, date: data.today, glasses });
    },
    [data, patientId, postLog]
  );

  const addMedication = useCallback(async () => {
    if (patientId) await load(patientId);
  }, [patientId, load]);

  const saveScore = useCallback(
    async (game: string, score: number, detail: string) => {
      if (!patientId || !data) return score;
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, game, score, detail }),
      });
      const json = (await res.json()) as { best: Record<string, number> };
      setData((d) => (d ? { ...d, best: json.best } : d));
      return json.best[game] ?? score;
    },
    [patientId, data]
  );

  const reminders = useMemo<Reminder[]>(() => {
    if (!data) return [];
    const out: Reminder[] = [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const pendingMeds = data.meds
      .filter((m) => m.scheduled && !m.takenToday)
      .sort((a, b) => a.time.localeCompare(b.time));
    const nextMed =
      pendingMeds.find((m) => {
        const [h, mi] = m.time.split(":").map(Number);
        return h * 60 + mi >= nowMin;
      }) ?? pendingMeds[0];
    if (nextMed) {
      out.push({
        icon: "Pill",
        tone: "violet",
        text: `${nextMed.name} ${nextMed.dosage} · ${hourLabel(nextMed.time)}`,
      });
    }
    const pendingTask = data.routine
      .filter((t) => !t.doneToday)
      .sort((a, b) => a.time.localeCompare(b.time))[0];
    if (pendingTask) {
      out.push({
        icon: pendingTask.icon,
        tone: "indigo",
        text: `${pendingTask.title} · ${hourLabel(pendingTask.time)}`,
      });
    }
    const goal = data.patient.goals?.waterGlasses ?? 8;
    if (data.water < goal) {
      out.push({
        icon: "Droplets",
        tone: "cyan",
        text: `Hidratación: llevas ${data.water} de ${goal} vasos`,
      });
    }
    return out.slice(0, 3);
  }, [data]);

  if (!hydrated || (patientId !== null && !data)) return <Splash />;
  if (!patientId || !data)
    return <PatientSelector patients={patients} onSelect={select} />;

  return (
    <AppChrome
      patient={data.patient}
      section={section}
      onNavigate={go}
      onSwitch={exit}
      reminders={reminders}
    >
      {section === "panel" && (
        <PanelGeneral
          data={data}
          go={go}
          onToggleMed={markMed}
          onToggleMeal={markMeal}
          onToggleRoutine={markRoutine}
        />
      )}
      {section === "perfil" && <PerfilClinico data={data} />}
      {section === "meds" && (
        <Medicamentos data={data} onToggle={markMed} onAdded={addMedication} />
      )}
      {section === "food" && (
        <Alimentacion
          data={data}
          onToggleMeal={markMeal}
          onWater={setWater}
        />
      )}
      {section === "exercise" && (
        <Ejercicio data={data} onToggle={markExercise} />
      )}
      {section === "mind" && (
        <MenteActiva data={data} onSaveScore={saveScore} />
      )}
      {section === "routine" && (
        <RutinaDiaria data={data} onToggle={markRoutine} />
      )}
    </AppChrome>
  );
}
