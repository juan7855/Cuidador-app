import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await db
    .select({
      id: patients.id,
      name: patients.name,
      relation: patients.relation,
      age: patients.age,
      gender: patients.gender,
      bloodType: patients.bloodType,
      avatarFrom: patients.avatarFrom,
      avatarTo: patients.avatarTo,
      conditions: patients.conditions,
    })
    .from(patients)
    .orderBy(asc(patients.name));

  return NextResponse.json(list);
}
