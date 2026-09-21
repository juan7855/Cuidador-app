import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  patients,
  clinicalProfiles,
  dailyVitals,
  medications,
  medicationLogs,
  meals,
  mealLogs,
  exercises,
  exerciseLogs,
  routineTasks,
  routineLogs,
  waterLogs,
  gameScores,
} from "@/db/schema";
import {
  dayNum,
  lastNDates,
  parseKey,
  todayKey,
  weekdayLong,
  weekdayShort,
} from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

export const dynamic = "force-dynamic";

const MEAL_ORDER = [
  "Desayuno",
  "Media mañana",
  "Almuerzo",
  "Merienda",
  "Cena",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = Number(id);
  if (Number.isNaN(pid)) {
    return NextResponse.json({ error: "Paciente no válido" }, { status: 400 });
  }

  const [patientRow] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, pid))
    .limit(1);

  if (!patientRow) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const [clinicalRow] = await db
    .select()
    .from(clinicalProfiles)
    .where(eq(clinicalProfiles.patientId, pid))
    .limit(1);

  const patient = {
    ...patientRow,
    conditions: clinicalRow?.conditions ?? [],
    allergies: clinicalRow?.allergies ?? [],
    chronicMeds: clinicalRow?.chronicMeds ?? [],
    doctors: clinicalRow?.doctors ?? [],
    labs: clinicalRow?.labs ?? [],
    goals: clinicalRow?.goals ?? null,
    notes: clinicalRow?.notes ?? null,
  };

  const today = todayKey();
  const dates = lastNDates(7);
  const since = dates[0];

  const [vitalsRows, medRows, medLogRows, mealRows, mealLogRows, exRows, exLogRows, taskRows, taskLogRows, waterRows, scoreRows] =
    await Promise.all([
      db.select().from(dailyVitals).where(eq(dailyVitals.patientId, pid)).orderBy(dailyVitals.date),
      db.select().from(medications).where(eq(medications.patientId, pid)),
      db
        .select()
        .from(medicationLogs)
        .where(and(eq(medicationLogs.patientId, pid), gte(medicationLogs.date, since))),
      db.select().from(meals).where(eq(meals.patientId, pid)),
      db
        .select()
        .from(mealLogs)
        .where(and(eq(mealLogs.patientId, pid), gte(mealLogs.date, since))),
      db.select().from(exercises).where(eq(exercises.patientId, pid)),
      db
        .select()
        .from(exerciseLogs)
        .where(and(eq(exerciseLogs.patientId, pid), gte(exerciseLogs.date, since))),
      db.select().from(routineTasks).where(eq(routineTasks.patientId, pid)).orderBy(routineTasks.time),
      db
        .select()
        .from(routineLogs)
        .where(and(eq(routineLogs.patientId, pid), gte(routineLogs.date, since))),
      db
        .select()
        .from(waterLogs)
        .where(and(eq(waterLogs.patientId, pid), eq(waterLogs.date, today)))
        .limit(1),
      db
        .select()
        .from(gameScores)
        .where(eq(gameScores.patientId, pid))
        .orderBy(desc(gameScores.playedAt)),
    ]);

  const medLogMap = new Map(medLogRows.map((r) => [`${r.medicationId}|${r.date}`, r]));
  const mealLogMap = new Map(mealLogRows.map((r) => [`${r.mealId}|${r.date}`, r]));
  const exLogMap = new Map(exLogRows.map((r) => [`${r.exerciseId}|${r.date}`, r]));
  const taskLogMap = new Map(taskLogRows.map((r) => [`${r.taskId}|${r.date}`, r]));

  const meds = medRows
    .map((m) => {
      const scheduled = m.time !== "—";
      const past = medLogRows.filter((r) => r.medicationId === m.id && r.date !== today);
      const adherence =
        scheduled && past.length
          ? Math.round((100 * past.filter((r) => r.taken).length) / past.length)
          : null;
      return {
        ...m,
        scheduled,
        takenToday: medLogMap.get(`${m.id}|${today}`)?.taken ?? false,
        adherence,
      };
    })
    .sort((a, b) => {
      if (a.scheduled !== b.scheduled) return a.scheduled ? -1 : 1;
      return a.time.localeCompare(b.time);
    });

  const mealList = mealRows
    .map((m) => ({
      ...m,
      doneToday: mealLogMap.get(`${m.id}|${today}`)?.done ?? false,
    }))
    .sort(
      (a, b) => MEAL_ORDER.indexOf(a.slot) - MEAL_ORDER.indexOf(b.slot)
    );

  const exerciseList = exRows
    .map((e) => {
      const log = exLogMap.get(`${e.id}|${today}`);
      return {
        ...e,
        doneToday: log?.done ?? false,
        minutesToday: log?.minutes ?? 0,
      };
    })
    .sort((a, b) => {
      const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
      const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
      return orderA - orderB;
    });

  const routine = taskRows.map((t) => ({
    ...t,
    doneToday: taskLogMap.get(`${t.id}|${today}`)?.done ?? false,
  }));

  const week = dates.map((date) => {
    const dow = parseKey(date).getDay();
    const planned = exRows.find((e) => e.dayOfWeek === dow) ?? null;
    const exLog = planned ? exLogMap.get(`${planned.id}|${date}`) : undefined;
    const vital = vitalsRows.find((v) => v.date === date);
    return {
      date,
      weekdayShort: weekdayShort(date),
      weekdayLong: weekdayLong(date),
      dayNum: dayNum(date),
      medDone: medLogRows.filter((r) => r.date === date && r.taken).length,
      medTotal: medRows.filter((m) => m.time !== "—").length,
      mealDone: mealLogRows.filter((r) => r.date === date && r.done).length,
      mealTotal: mealRows.length,
      routineDone: taskLogRows.filter((r) => r.date === date && r.done).length,
      routineTotal: taskRows.length,
      minutes: exLog?.done ? exLog.minutes : 0,
      steps: vital?.steps ?? 0,
      planned,
      exDone: exLog?.done ?? false,
    };
  });

  const todayData = week[week.length - 1];
  const hasExercise = Boolean(todayData.planned && todayData.planned.intensity !== "Descanso");
  const totalTasks =
    todayData.medTotal +
    todayData.mealTotal +
    todayData.routineTotal +
    (hasExercise ? 1 : 0);
  const doneTasks =
    todayData.medDone +
    todayData.mealDone +
    todayData.routineDone +
    (todayData.exDone && hasExercise ? 1 : 0);

  let wDone = 0;
  let wTotal = 0;
  for (const w of week) {
    wDone += w.medDone + w.mealDone + w.routineDone + (w.exDone ? 1 : 0);
    wTotal += w.medTotal + w.mealTotal + w.routineTotal + (w.planned && w.planned.intensity !== "Descanso" ? 1 : 0);
  }

  const best: Record<string, number> = {};
  for (const s of scoreRows) {
    best[s.game] = Math.max(best[s.game] ?? 0, s.score);
  }

  const data: DashboardData = {
    patient,
    today,
    vitals: vitalsRows,
    todayVital: vitalsRows.find((v) => v.date === today) ?? vitalsRows[vitalsRows.length - 1],
    meds,
    meals: mealList,
    exercises: exerciseList,
    routine,
    water: waterRows[0]?.glasses ?? 0,
    week,
    best,
    recentScores: scoreRows.slice(0, 8),
    totals: {
      medsDone: todayData.medDone,
      medsTotal: todayData.medTotal,
      mealsDone: todayData.mealDone,
      mealsTotal: todayData.mealTotal,
      routineDone: todayData.routineDone,
      routineTotal: todayData.routineTotal,
      exerciseDone: todayData.exDone,
      hasExercise,
      overall: totalTasks ? Math.round((100 * doneTasks) / totalTasks) : 0,
      adherence7: wTotal ? Math.round((100 * wDone) / wTotal) : 0,
    },
  };

  return NextResponse.json(data);
}
