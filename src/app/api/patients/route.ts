import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  patients,
  clinicalProfiles,
  routineTasks,
  exercises,
  cognitiveActivities,
  meals,
} from "@/db/schema";

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

interface CreateBody {
  name: string;
  pin?: string;
  relation?: string;
  gender?: string;
  age?: number;
  birthDate?: string;
  bloodType?: string;
  phone?: string;
  insurance?: string;
  address?: string;
  emergencyContact?: { name: string; phone: string; relation: string } | null;
  conditions?: string[];
  allergies?: string[];
  chronicMeds?: string[];
  notes?: string;
  avatarFrom?: string;
  avatarTo?: string;
}

const AVATAR_PALETTE: [string, string][] = [
  ["#2F80ED", "#56CCF2"],
  ["#5B86E5", "#36D1DC"],
  ["#EE6FB3", "#8E5CF6"],
  ["#F2994A", "#F2C94C"],
  ["#00B09B", "#96C93D"],
];

async function generateUniquePin(): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const existing = await db.select({ id: patients.id }).from(patients).where(eq(patients.pin, pin)).limit(1);
    if (!existing.length) return pin;
  }
  throw new Error("No se pudo generar un PIN único");
}

// Siembra contenido inicial en las tablas reales que MiSalud consulta
// (solo lectura para el paciente): sin esto, un paciente recién creado
// entraría a MiSalud y vería todas las secciones vacías. time_of_day usa
// "morning"/"afternoon"/"evening" porque así agrupa MiSalud su vista de
// Rutina (src/app/rutina/RutinaList.tsx) — es un valor distinto al que usan
// las secciones de Rutina de ESTA app (ver limitación conocida).
async function seedStarterContent(patientId: number) {
  await db.insert(routineTasks).values([
    { patientId, phase: "morning", time: "08:00", title: "Tomar medicamentos", detail: "Pastillas de la mañana con agua", icon: "Pill" },
    { patientId, phase: "morning", time: "08:30", title: "Desayuno saludable", detail: "Avena o huevo con fruta", icon: "Sunrise" },
    { patientId, phase: "morning", time: "09:30", title: "Caminata matutina", detail: "15 minutos al aire libre", icon: "Footprints" },
    { patientId, phase: "afternoon", time: "12:30", title: "Almuerzo", detail: "Comida balanceada con verduras", icon: "Salad" },
    { patientId, phase: "afternoon", time: "16:00", title: "Llamar a familiar", detail: "Hablar con hijo/a o familiar", icon: "Phone" },
    { patientId, phase: "evening", time: "19:00", title: "Cena ligera", detail: "Ensalada o sopa", icon: "MoonStar" },
    { patientId, phase: "evening", time: "21:30", title: "Preparar para dormir", detail: "Higiene y descanso", icon: "BedDouble" },
  ]);

  await db.insert(exercises).values([
    {
      patientId,
      title: "Caminata suave",
      description: "Caminata pausada para activar el cuerpo",
      dayOfWeek: 1,
      durationMin: 15,
      intensity: "Suave",
      icon: "Footprints",
      items: [
        { name: "Calentamiento", detail: "Camina despacio 2 minutos" },
        { name: "Caminata", detail: "Paso normal durante 10 minutos" },
        { name: "Vuelta a la calma", detail: "3 minutos muy lento" },
      ],
      level: "Ligero",
      emoji: "🚶",
      durationSeconds: 900,
      steps: [
        "Ponte ropa cómoda y zapatos antideslizantes",
        "Camina despacio durante 2 minutos",
        "Mantén la espalda recta y camina a paso normal 10 minutos",
        "Termina con 3 minutos de caminata muy lenta",
      ],
      tip: "Si sientes dolor, detente y descansa.",
    },
    {
      patientId,
      title: "Estiramiento",
      description: "Ejercicios de flexibilidad sentado",
      dayOfWeek: 3,
      durationMin: 10,
      intensity: "Suave",
      icon: "Wind",
      items: [
        { name: "Cuello y hombros", detail: "Movimientos lentos, 5 veces cada lado" },
        { name: "Piernas", detail: "Estira cada pierna 5 veces" },
        { name: "Respiración", detail: "5 respiraciones profundas" },
      ],
      level: "Ligero",
      emoji: "🧘",
      durationSeconds: 600,
      steps: [
        "Siéntate en una silla firme con los pies en el suelo",
        "Gira el cuello lentamente de lado a lado (5 veces)",
        "Estira las piernas hacia adelante una a una (5 veces)",
        "Respira profundo 5 veces para terminar",
      ],
      tip: "Haz cada movimiento sin prisa y sin dolor.",
    },
  ]);

  await db.insert(cognitiveActivities).values([
    {
      patientId,
      name: "Memoria de palabras",
      level: "Fácil",
      emoji: "🧠",
      durationLabel: "5 min",
      description: "Recuerda una lista corta de palabras",
      steps: [
        "Escribe 8 palabras cualquiera",
        "Léelas en voz alta dos veces",
        "Tapa la hoja un minuto",
        "Escribe todas las que recuerdes",
      ],
      tip: "No importa cuántas recuerdes hoy: repetirlo cada día es lo que ayuda.",
    },
    {
      patientId,
      name: "Cuentas del día",
      level: "Fácil",
      emoji: "🧮",
      durationLabel: "5 min",
      description: "Cálculo mental con cosas de casa",
      steps: ["Piensa en el precio de tres cosas", "Súmalas de cabeza", "Comprueba con una calculadora"],
      tip: "Usa números pequeños si te cuesta: la idea es pensar, no acertar.",
    },
  ]);

  await db.insert(meals).values([
    {
      patientId,
      slot: "Desayuno",
      time: "07:30",
      title: "Desayuno",
      foods: "Avena con fruta, té o leche, pan integral",
      calories: 350,
      protein: 12,
      carbs: 50,
      fat: 8,
      tone: "amber",
      slug: "desayuno",
      article: "el desayuno",
      emoji: "🥐",
      accent: "yellow",
      items: ["Avena con fruta", "Té o leche", "Pan integral"],
    },
    {
      patientId,
      slot: "Almuerzo",
      time: "12:30",
      title: "Almuerzo",
      foods: "Sopa de verduras, pollo al vapor, ensalada verde, arroz integral",
      calories: 550,
      protein: 32,
      carbs: 55,
      fat: 16,
      tone: "emerald",
      slug: "almuerzo",
      article: "el almuerzo",
      emoji: "🍲",
      accent: "orange",
      items: ["Sopa de verduras", "Pollo al vapor", "Ensalada verde", "Arroz integral"],
    },
    {
      patientId,
      slot: "Cena",
      time: "19:00",
      title: "Cena",
      foods: "Ensalada con atún, pan integral, fruta de temporada",
      calories: 380,
      protein: 24,
      carbs: 30,
      fat: 14,
      tone: "indigo",
      slug: "cena",
      article: "la cena",
      emoji: "🥗",
      accent: "green",
      items: ["Ensalada con atún", "Pan integral", "Fruta de temporada"],
    },
  ]);
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  let pin = body.pin?.trim();
  if (pin) {
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "El PIN debe ser de 4 dígitos" }, { status: 400 });
    }
    const existing = await db.select({ id: patients.id }).from(patients).where(eq(patients.pin, pin)).limit(1);
    if (existing.length) {
      return NextResponse.json({ error: "Ese PIN ya está en uso por otro paciente" }, { status: 409 });
    }
  } else {
    pin = await generateUniquePin();
  }

  const palette = AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];

  try {
    const [patient] = await db
      .insert(patients)
      .values({
        name,
        pin,
        relation: body.relation?.trim() || "Familiar",
        gender: body.gender || "F",
        age: body.age ?? 0,
        birthDate: body.birthDate || "",
        bloodType: body.bloodType?.trim() || null,
        avatarFrom: body.avatarFrom || palette[0],
        avatarTo: body.avatarTo || palette[1],
        phone: body.phone?.trim() || null,
        insurance: body.insurance?.trim() || null,
        address: body.address?.trim() || null,
        emergencyContact: body.emergencyContact ?? null,
      })
      .returning();

    await db.insert(clinicalProfiles).values({
      patientId: patient.id,
      conditions: body.conditions?.length ? body.conditions : null,
      allergies: body.allergies?.length ? body.allergies : null,
      chronicMeds: body.chronicMeds ?? [],
      notes: body.notes?.trim() || null,
    });

    await seedStarterContent(patient.id);

    return NextResponse.json({ patient, pin }, { status: 201 });
  } catch (err) {
    console.error("Error creando paciente:", err);
    return NextResponse.json({ error: "No se pudo crear el paciente" }, { status: 500 });
  }
}
