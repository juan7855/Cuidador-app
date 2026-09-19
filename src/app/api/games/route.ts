import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gameScores } from "@/db/schema";

export const dynamic = "force-dynamic";

interface ScoreBody {
  patientId: number;
  game: string;
  score: number;
  detail?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as ScoreBody;
  const pid = Number(body.patientId);
  const score = Math.max(0, Math.round(Number(body.score) || 0));

  if (!pid || !body.game) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }

  await db.insert(gameScores).values({
    patientId: pid,
    game: body.game,
    score,
    detail: body.detail ?? null,
  });

  const rows = await db
    .select()
    .from(gameScores)
    .where(eq(gameScores.patientId, pid))
    .orderBy(desc(gameScores.score));

  const best: Record<string, number> = {};
  for (const r of rows) {
    best[r.game] = Math.max(best[r.game] ?? 0, r.score);
  }

  return NextResponse.json({ ok: true, best });
}
