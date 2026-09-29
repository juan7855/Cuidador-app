import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patients, communityMembers } from "@/db/schema";

export const dynamic = "force-dynamic";

// Agrega al paciente a la lista blanca de Comunidad (foro + DM en MiSalud).
// Insertar esta fila es lo único que necesita esa app para dejarlo entrar;
// como esta app no identifica cuidadores individuales (clave de acceso
// compartida, ver src/lib/access.ts), added_by_caregiver_id queda en null.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = Number(id);
  if (!pid || Number.isNaN(pid)) {
    return NextResponse.json({ error: "Paciente no válido" }, { status: 400 });
  }

  const [patient] = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, pid)).limit(1);
  if (!patient) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const [row] = await db
    .insert(communityMembers)
    .values({ patientId: pid })
    .onConflictDoNothing({ target: communityMembers.patientId })
    .returning();

  const current =
    row ??
    (
      await db
        .select()
        .from(communityMembers)
        .where(eq(communityMembers.patientId, pid))
        .limit(1)
    )[0];

  return NextResponse.json({
    member: true,
    addedAt: current?.createdAt ?? null,
  });
}

// Quita al paciente de la Comunidad: deja de ver el foro y los mensajes en
// MiSalud hasta que se le vuelva a agregar.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = Number(id);
  if (!pid || Number.isNaN(pid)) {
    return NextResponse.json({ error: "Paciente no válido" }, { status: 400 });
  }

  await db.delete(communityMembers).where(eq(communityMembers.patientId, pid));

  return NextResponse.json({ member: false, addedAt: null });
}
