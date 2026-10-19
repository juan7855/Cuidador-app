import { NextResponse } from "next/server";
import { db } from "@/db";
import { meals } from "@/db/schema";

export const dynamic = "force-dynamic";

interface MealBody {
  patientId: number;
  slot: string;
  time: string;
  title: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tone?: string;
  slug?: string;
  article?: string;
  emoji?: string;
  accent?: string;
  items?: string[];
}

export async function POST(req: Request) {
  const body = (await req.json()) as MealBody;
  const pid = Number(body.patientId);

  if (!pid || !body.slot?.trim() || !body.time || !body.title?.trim()) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const [row] = await db
    .insert(meals)
    .values({
      patientId: pid,
      slot: body.slot.trim(),
      time: body.time,
      title: body.title.trim(),
      foods: body.foods?.trim() || "",
      calories: Number(body.calories ?? 0),
      protein: Number(body.protein ?? 0),
      carbs: Number(body.carbs ?? 0),
      fat: Number(body.fat ?? 0),
      tone: body.tone || "emerald",
      slug: body.slug || body.slot.toLowerCase().replace(/\s+/g, "-"),
      article: body.article || "la comida",
      emoji: body.emoji || "🍽️",
      accent: body.accent || "emerald",
      items: body.items || [],
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
