"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy, Sparkles, Eye, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

const PADS = [
  { base: "bg-sky-500", soft: "bg-sky-100 text-sky-700", glow: "shadow-sky-400/60", label: "Azul" },
  { base: "bg-emerald-500", soft: "bg-emerald-100 text-emerald-700", glow: "shadow-emerald-400/60", label: "Verde" },
  { base: "bg-amber-500", soft: "bg-amber-100 text-amber-700", glow: "shadow-amber-400/60", label: "Ámbar" },
  { base: "bg-fuchsia-500", soft: "bg-fuchsia-100 text-fuchsia-700", glow: "shadow-fuchsia-400/60", label: "Magenta" },
];

type Phase = "intro" | "showing" | "input" | "over";

export default function SequenceGame({
  best,
  onFinish,
}: {
  best?: number;
  onFinish: (score: number, detail: string) => Promise<number>;
}) {
  const [seq, setSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [lit, setLit] = useState<number | null>(null);
  const [userIdx, setUserIdx] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; best: number; record: boolean } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sentRef = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const play = useCallback((sequence: number[]) => {
    clearTimers();
    setPhase("showing");
    setLit(null);
    const speed = Math.max(280, 620 - sequence.length * 28);
    sequence.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => setLit(pad), 500 + i * speed)
      );
      timers.current.push(
        setTimeout(() => setLit(null), 500 + i * speed + speed * 0.62)
      );
    });
    timers.current.push(
      setTimeout(() => {
        setPhase("input");
        setUserIdx(0);
      }, 500 + sequence.length * speed)
    );
  }, []);

  const start = useCallback(() => {
    clearTimers();
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    setResult(null);
    setWrong(null);
    sentRef.current = false;
    play(first);
  }, [play]);

  const press = (i: number) => {
    if (phase !== "input") return;
    setLit(i);
    setTimeout(() => setLit(null), 180);
    if (i === seq[userIdx]) {
      if (userIdx + 1 === seq.length) {
        // Ronda superada
        setPhase("showing");
        const extended = [...seq, Math.floor(Math.random() * 4)];
        timers.current.push(
          setTimeout(() => {
            setSeq(extended);
            play(extended);
          }, 700)
        );
      } else {
        setUserIdx((v) => v + 1);
      }
    } else {
      setWrong(i);
      setPhase("over");
      const score = Math.max(0, (seq.length - 1) * 100);
      if (!sentRef.current) {
        sentRef.current = true;
        void onFinish(score, `Alcanzaste el nivel ${seq.length}`).then((newBest) => {
          setResult({ score, best: newBest, record: score >= newBest && score > 0 });
        });
      }
    }
  };

  const level = seq.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Nivel" value={phase === "intro" ? "—" : String(level)} />
        <Stat
          label="Estado"
          value={phase === "showing" ? "Observa" : phase === "input" ? "Tu turno" : phase === "over" ? "Fin" : "Listo"}
          icon={phase === "showing" ? <Eye size={15} /> : <Hand size={15} />}
        />
        <Stat label="Récord" value={best ? String(best) : "—"} />
      </div>

      {phase === "intro" && (
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-purple-50 p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
            <Sparkles size={28} />
          </span>
          <div>
            <p className="text-lg font-extrabold text-slate-900">Secuencia de colores</p>
            <p className="mx-auto mt-1 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
              Observa la secuencia de colores y repítela en el mismo orden.
              Cada ronda añade un paso nuevo. Cada nivel completado vale 100
              puntos.
            </p>
          </div>
          {best != null && best > 0 && (
            <span className="chip bg-white text-fuchsia-700 shadow-sm">
              <Trophy size={13} /> Mejor marca: {best}
            </span>
          )}
          <button onClick={start} className="btn-primary">
            <Play size={16} /> Empezar
          </button>
        </div>
      )}

      {phase !== "intro" && (
        <>
          <div
            className={cn(
              "grid grid-cols-2 gap-3 sm:gap-4",
              wrong !== null && "animate-shake"
            )}
          >
            {PADS.map((pad, i) => {
              const isLit = lit === i;
              const isWrong = wrong === i;
              return (
                <button
                  key={i}
                  onClick={() => press(i)}
                  disabled={phase !== "input"}
                  aria-label={pad.label}
                  className={cn(
                    "flex aspect-[5/4] items-center justify-center rounded-3xl transition-all duration-150 sm:aspect-[2/1]",
                    pad.base,
                    isLit
                      ? cn("scale-[1.03] brightness-110 shadow-2xl", pad.glow)
                      : "brightness-[0.55] saturate-50",
                    isWrong && "!bg-rose-600 brightness-100",
                    phase === "input" && "cursor-pointer hover:brightness-90 active:scale-95"
                  )}
                >
                  <span className="h-6 w-6 rounded-full bg-white/40 sm:h-8 sm:w-8" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">
              {phase === "showing" && (
                <span className="inline-flex items-center gap-2">
                  <Eye size={16} className="text-fuchsia-500" /> Observa con atención…
                </span>
              )}
              {phase === "input" && (
                <span className="inline-flex items-center gap-2">
                  <Hand size={16} className="text-emerald-500" />
                  Repite la secuencia ({userIdx}/{seq.length})
                </span>
              )}
              {phase === "over" && (
                <span className="inline-flex items-center gap-2 text-rose-600">
                  ¡Oh! Fallaste en el nivel {seq.length}
                </span>
              )}
            </p>
            {phase === "over" ? (
              <button onClick={start} className="btn-soft !py-2 text-xs">
                <RotateCcw size={14} /> Reintentar
              </button>
            ) : (
              <button onClick={start} className="btn-ghost !py-2 text-xs">
                <RotateCcw size={14} /> Reiniciar
              </button>
            )}
          </div>

          {phase === "over" && result && (
            <div className="animate-pop rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-6 text-center">
              <p className="text-sm font-bold text-slate-500">
                {result.record ? "¡Nuevo récord!" : "Puntuación obtenida"}
              </p>
              <p className="mt-1 text-4xl font-extrabold text-fuchsia-600">
                {result.score}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                Mejor marca: {Math.max(result.best, result.score)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
      <p className="flex items-center justify-center gap-1 text-base font-extrabold text-slate-800">
        {icon}
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
