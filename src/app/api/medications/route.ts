import { NextResponse } from "next/server";
import { db } from "@/db";
import { medications } from "@/db/schema";
import { periodFromHour } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface MedBody {
  patientId: number;
  name: string;
  activeSubstance?: string;
  dosage: string;
  form: string;
  time: string;
  period?: string;
  withFood?: boolean;
  stock?: number;
  instructions?: string;
  tone?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as MedBody;
  const pid = Number(body.patientId);

  if (!pid || !body.name?.trim() || !body.dosage?.trim() || !body.time) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(medications)
    .values({
      patientId: pid,
      name: body.name.trim(),
      activeSubstance: body.activeSubstance?.trim() || null,
      dosage: body.dosage.trim(),
      form: body.form || "Tableta",
      time: body.time,
      period: body.period || periodFromHour(body.time),
      withFood: Boolean(body.withFood),
      stock: Number(body.stock ?? 0),
      stockUnit:
        body.form === "Inhalador" ? "dosis" : body.form === "Inyección" ? "plumas" : "tabletas",
      lowStockAt: 7,
      instructions: body.instructions?.trim() || null,
      tone: body.tone || "blue",
      active: true,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
