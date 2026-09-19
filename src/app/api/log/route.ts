import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  medicationLogs,
  mealLogs,
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
        await db
          .insert(medicationLogs)
          .values({
            medicationId,
            patientId: pid,
            date,
            taken,
            takenAt: taken ? new Date() : null,
          })
          .onConflictDoUpdate({
            target: [medicationLogs.medicationId, medicationLogs.date],
            set: { taken, takenAt: taken ? new Date() : null },
          });
        break;
      }
      case "meal": {
        const mealId = Number(body.id);
        const done = Boolean(body.done);
        await db
          .insert(mealLogs)
          .values({ mealId, patientId: pid, date, done })
          .onConflictDoUpdate({
            target: [mealLogs.mealId, mealLogs.date],
            set: { done },
          });
        break;
      }
      case "exercise": {
        const exerciseId = Number(body.id);
        const done = Boolean(body.done);
        const minutes = done ? Number(body.minutes ?? 0) : 0;
        await db
          .insert(exerciseLogs)
          .values({ exerciseId, patientId: pid, date, done, minutes })
          .onConflictDoUpdate({
            target: [exerciseLogs.exerciseId, exerciseLogs.date],
            set: { done, minutes },
          });
        break;
      }
      case "routine": {
        const taskId = Number(body.id);
        const done = Boolean(body.done);
        await db
          .insert(routineLogs)
          .values({ taskId, patientId: pid, date, done })
          .onConflictDoUpdate({
            target: [routineLogs.taskId, routineLogs.date],
            set: { done },
          });
        break;
      }
      case "water": {
        const glasses = Math.max(0, Math.min(16, Number(body.glasses ?? 0)));
        await db
          .insert(waterLogs)
          .values({ patientId: pid, date, glasses })
          .onConflictDoUpdate({
            target: [waterLogs.patientId, waterLogs.date],
            set: { glasses },
          });
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
