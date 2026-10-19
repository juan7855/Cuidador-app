import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { meals, mealLogs } from "@/db/schema";

export const dynamic = "force-dynamic";

interface MealBody {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mealId = Number(id);
  if (!mealId || Number.isNaN(mealId)) {
    return NextResponse.json({ error: "Comida no válida" }, { status: 400 });
  }

  const body = (await req.json()) as MealBody;
  if (!body.slot?.trim() || !body.time || !body.title?.trim()) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios" },
      { status: 400 }
    );
  }

  const [row] = await db
    .update(meals)
    .set({
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
    .where(eq(meals.id, mealId))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mealId = Number(id);
  if (!mealId || Number.isNaN(mealId)) {
    return NextResponse.json({ error: "Comida no válida" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(mealLogs).where(eq(mealLogs.mealId, mealId));
      await tx.delete(meals).where(eq(meals.id, mealId));
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando comida:", err);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
