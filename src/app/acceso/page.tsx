"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import Mascot from "@/components/Mascot";

const LENGTH = 6;

export default function AccesoPage() {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const submit = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "No se pudo verificar la clave");
    } catch {
      setError("No se pudo verificar. Revisa tu conexión.");
    }
    setDigits(Array(LENGTH).fill(""));
    setLoading(false);
    setTimeout(() => refs.current[0]?.focus(), 0);
  };

  const fill = (start: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) return;
    const next = [...digits];
    for (let i = 0; i < clean.length && start + i < LENGTH; i++) {
      next[start + i] = clean[i];
    }
    setDigits(next);
    refs.current[Math.min(start + clean.length, LENGTH - 1)]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
      } else if (i > 0) {
        next[i - 1] = "";
        refs.current[i - 1]?.focus();
      }
      setDigits(next);
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  return (
    <div className="selector-bg grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="flex flex-col justify-between bg-slate-100 px-8 py-8 sm:px-14 sm:py-12">
        <div className="flex items-center gap-2.5">
          <Mascot size={34} />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Panela
          </span>
        </div>
        <div className="my-8 flex flex-col items-center text-center lg:items-start lg:text-left">
          <Mascot size={200} className="animate-floaty" />
          <h2 className="mt-8 max-w-sm text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Acompañe a su familiar desde el computador o el celular.
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium text-slate-500">
            Vea cómo va su día y reciba un aviso si algo cambia.
          </p>
        </div>
        <span />
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Entrar
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <Lock size={14} />
            Ingrese su clave de acceso de 6 dígitos.
          </p>

          <div className="mt-6 flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus={i === 0}
                disabled={loading}
                aria-label={`Dígito ${i + 1}`}
                value={d}
                onChange={(e) => fill(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className="input h-14 w-full min-w-0 px-0 text-center text-xl font-bold"
              />
            ))}
          </div>

          <div className="mt-4 h-10">
            {error ? (
              <p className="rounded-xl bg-coral-50 px-3.5 py-2 text-xs font-bold text-coral-600">
                {error}
              </p>
            ) : loading ? (
              <p className="text-xs font-semibold text-slate-400">Verificando…</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
