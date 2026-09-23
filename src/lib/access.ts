// Clave de acceso de 6 dígitos para entrar a la app.
// La clave real vive en la variable de entorno ACCESS_CODE (nunca en el código).
// La cookie de sesión no contiene la clave: guarda un HMAC derivado de ella, así
// que cambiar ACCESS_CODE invalida todas las sesiones abiertas.
// La cookie es de sesión (sin maxAge): se descarta al cerrar el navegador.

export const ACCESS_COOKIE = "vc_access";

export function getAccessCode(): string | null {
  const code = process.env.ACCESS_CODE?.trim();
  return code && /^\d{6}$/.test(code) ? code : null;
}

export async function sessionToken(code: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(code),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("vitalcare-session-v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
