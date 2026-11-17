import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { patients, clinicalProfiles, careProfessionals } from "@/db/schema";
import HealthApp from "@/components/HealthApp";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    .orderBy(asc(patients.id));

  const list = rows.map((r) => ({ ...r, conditions: r.conditions ?? [] }));

  // Por ahora solo hay un profesional de salud usando la app (sin login
  // individual todavía); se toma el primero que exista.
  const [professional] = await db
    .select({ name: careProfessionals.name })
    .from(careProfessionals)
    .orderBy(asc(careProfessionals.id))
    .limit(1);

  return (
    <HealthApp
      patients={list}
      professionalName={professional?.name ?? "Profesional de la salud"}
    />
  );
}
