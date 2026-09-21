import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  medications,
  medicationLogs,
  meals,
  mealLogs,
  exercises,
  exerciseLogs,
  routineLogs,
  waterLogs,
} from "@/db/schema";
import { todayKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface LogBody {
  kind: "med" | "meal" | "exercise" | "routine" | "water";
  patientId: number;
  id?: number;
  date?: string;
  done?: boolean;
  minutes?: number;
  glasses?: number;
}

// Las tablas de logs son compartidas con otra app y no podemos asumir que
// tengan un índice único (medication_id, date) etc. en producción, así que
// hacemos upsert manual en vez de depender de ON CONFLICT.
export async function POST(req: Request) {
  const body = (await req.json()) as LogBody;
  const pid = Number(body.patientId);
  const date = body.date ?? todayKey();

  if (!pid || Number.isNaN(pid)) {
    return NextResponse.json({ error: "Paciente no válido" }, { status: 400 });
  }

  try {
    switch (body.kind) {
      case "med": {
        const medicationId = Number(body.id);
        const taken = Boolean(body.done);
        const takenAt = taken ? new Date() : null;
        const existing = await db
          .select({ id: medicationLogs.id })
          .from(medicationLogs)
          .where(and(eq(medicationLogs.medicationId, medicationId), eq(medicationLogs.date, date)))
          .limit(1);
        if (existing.length) {
          await db
            .update(medicationLogs)
            .set({ taken, takenAt })
            .where(eq(medicationLogs.id, existing[0].id));
        } else {
          await db.insert(medicationLogs).values({ medicationId, patientId: pid, date, taken, takenAt });
        }
        break;
      }
      case "meal": {
        const mealId = Number(body.id);
        const done = Boolean(body.done);
        const existing = await db
          .select({ id: mealLogs.id })
          .from(mealLogs)
          .where(and(eq(mealLogs.mealId, mealId), eq(mealLogs.date, date)))
          .limit(1);
        if (existing.length) {
          await db.update(mealLogs).set({ done }).where(eq(mealLogs.id, existing[0].id));
        } else {
          await db.insert(mealLogs).values({ mealId, patientId: pid, date, done });
        }
        break;
      }
      case "exercise": {
        const exerciseId = Number(body.id);
        const done = Boolean(body.done);
        const minutes = done ? Number(body.minutes ?? 0) : 0;
        const [ex] = await db
          .select({ name: exercises.title })
          .from(exercises)
          .where(eq(exercises.id, exerciseId))
          .limit(1);
        const exerciseName = ex?.name ?? "Ejercicio";
        const existing = await db
          .select({ id: exerciseLogs.id })
          .from(exerciseLogs)
          .where(and(eq(exerciseLogs.exerciseId, exerciseId), eq(exerciseLogs.date, date)))
          .limit(1);
        if (existing.length) {
          await db.update(exerciseLogs).set({ done, minutes }).where(eq(exerciseLogs.id, existing[0].id));
        } else {
          await db
            .insert(exerciseLogs)
            .values({ exerciseId, exerciseName, patientId: pid, date, done, minutes });
        }
        break;
      }
      case "routine": {
        const taskId = Number(body.id);
        const done = Boolean(body.done);
        const existing = await db
          .select({ id: routineLogs.id })
          .from(routineLogs)
          .where(and(eq(routineLogs.taskId, taskId), eq(routineLogs.date, date)))
          .limit(1);
        if (existing.length) {
          await db.update(routineLogs).set({ done }).where(eq(routineLogs.id, existing[0].id));
        } else {
          await db.insert(routineLogs).values({ taskId, patientId: pid, date, done });
        }
        break;
      }
      case "water": {
        const glasses = Math.max(0, Math.min(16, Number(body.glasses ?? 0)));
        const existing = await db
          .select({ id: waterLogs.id })
          .from(waterLogs)
          .where(and(eq(waterLogs.patientId, pid), eq(waterLogs.date, date)))
          .limit(1);
        if (existing.length) {
          await db.update(waterLogs).set({ glasses }).where(eq(waterLogs.id, existing[0].id));
        } else {
          await db.insert(waterLogs).values({ patientId: pid, date, glasses });
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error registrando actividad:", err);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}
