import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, getAccessCode, sessionToken } from "@/lib/access";

// Todo requiere la clave de acceso salvo la pantalla de acceso y su endpoint.
// Si ACCESS_CODE no está configurada, la app queda bloqueada (falla cerrada).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/acceso" || pathname === "/api/access") {
    return NextResponse.next();
  }

  const code = getAccessCode();
  const cookie = req.cookies.get(ACCESS_COOKIE)?.value;
  if (code && cookie && cookie === (await sessionToken(code))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/acceso", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)$).*)",
  ],
};
