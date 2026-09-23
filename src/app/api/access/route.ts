import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  getAccessCode,
  sessionToken,
} from "@/lib/access";

export const dynamic = "force-dynamic";

// Límite de intentos fallidos por IP (en memoria: es un freno básico, no una
// garantía en entornos serverless con varias instancias).
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; first: number }>();

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

const sha = (s: string) => createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const code = getAccessCode();
  if (!code) {
    return NextResponse.json(
      { error: "La clave de acceso no está configurada en el servidor" },
      { status: 500 }
    );
  }

  const ip = clientIp(req);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && now - rec.first > WINDOW_MS) fails.delete(ip);
  const current = fails.get(ip);
  if (current && current.count >= MAX_FAILS) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  const given = typeof body.code === "string" ? body.code : "";

  if (!timingSafeEqual(sha(given), sha(code))) {
    fails.set(ip, {
      count: (current?.count ?? 0) + 1,
      first: current?.first ?? now,
    });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, await sessionToken(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return res;
}

// Cerrar sesión (bloquear la app de nuevo).
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
