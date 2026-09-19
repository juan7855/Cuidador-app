import { asc } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";
import HealthApp from "@/components/HealthApp";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    .orderBy(asc(patients.id));

  return <HealthApp patients={list} />;
}
