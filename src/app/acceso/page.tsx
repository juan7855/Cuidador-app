"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Lock } from "lucide-react";

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
    <div className="selector-bg flex min-h-screen items-center justify-center px-5">
      <div className="card w-full max-w-sm p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-white shadow-lg shadow-brand-500/30">
          <HeartPulse size={26} strokeWidth={2.4} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          VitalCare
        </h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500">
          <Lock size={14} />
          Ingresa tu clave de acceso
        </p>

        <div className="mt-6 flex justify-center gap-2">
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
              className="input h-14 w-11 px-0 text-center text-xl font-extrabold"
            />
          ))}
        </div>

        <div className="mt-4 h-9">
          {error ? (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600">
              {error}
            </p>
          ) : loading ? (
            <p className="text-xs font-semibold text-slate-400">Verificando…</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
