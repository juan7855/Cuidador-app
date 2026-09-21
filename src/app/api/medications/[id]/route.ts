import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { medications, medicationLogs } from "@/db/schema";
import { periodFromHour } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface MedBody {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const medId = Number(id);
  if (!medId || Number.isNaN(medId)) {
    return NextResponse.json({ error: "Medicamento no válido" }, { status: 400 });
  }

  const body = (await req.json()) as MedBody;
  if (!body.name?.trim() || !body.dosage?.trim() || !body.time) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const [row] = await db
    .update(medications)
    .set({
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
      instructions: body.instructions?.trim() || null,
      tone: body.tone || "blue",
    })
    .where(eq(medications.id, medId))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Medicamento no encontrado" }, { status: 404 });
  }

  return NextResponse.json(row);
}

// Borra también sus tomas registradas: la FK real hacia medications no tiene
// garantizado ON DELETE CASCADE en la base compartida (esta app no controla
// esa migración), así que lo hacemos a mano para no depender de eso.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const medId = Number(id);
  if (!medId || Number.isNaN(medId)) {
    return NextResponse.json({ error: "Medicamento no válido" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(medicationLogs).where(eq(medicationLogs.medicationId, medId));
      await tx.delete(medications).where(eq(medications.id, medId));
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando medicamento:", err);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
