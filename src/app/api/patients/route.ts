import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { patients, clinicalProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: patients.id,
      name: patients.name,
      relation: patients.relation,
      age: patients.age,
      gender: patients.gender,
      bloodType: patients.bloodType,
      avatarFrom: patients.avatarFrom,
      avatarTo: patients.avatarTo,
      conditions: clinicalProfiles.conditions,
    })
    .from(patients)
    .leftJoin(clinicalProfiles, eq(clinicalProfiles.patientId, patients.id))
    .orderBy(asc(patients.name));

  const list = rows.map((r) => ({ ...r, conditions: r.conditions ?? [] }));

  return NextResponse.json(list);
}
