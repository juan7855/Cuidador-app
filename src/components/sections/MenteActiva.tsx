"use client";

import { useState } from "react";
import {
  Brain,
  Calculator,
  Grid2X2,
  Images,
  Play,
  Trophy,
  Timer,
  Lock,
  ArrowLeft,
  Lightbulb,
  History,
} from "lucide-react";
import { Card, CardTitle, Chip, DyIcon } from "@/components/ui";
import { SectionHeader } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";
import MemoryGame from "@/components/sections/games/MemoryGame";
import MathGame from "@/components/sections/games/MathGame";
import SequenceGame from "@/components/sections/games/SequenceGame";

type GameId = "memory" | "math" | "sequence";

const GAMES: {
  id: GameId;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  icon: typeof Brain;
  gradient: string;
  soft: string;
  text: string;
}[] = [
  {
    id: "memory",
    title: "Memoria de parejas",
    tagline: "Memoria visual",
    description:
      "Encuentra las 8 parejas de iconos. Cuantos menos movimientos y menos tiempo uses, más alta será tu puntuación.",
    duration: "3-5 min",
    icon: Images,
    gradient: "from-fuchsia-500 to-purple-600",
    soft: "bg-fuchsia-50",
    text: "text-fuchsia-700",
  },
  {
    id: "math",
    title: "Cálculo mental",
    tagline: "Agilidad numérica",
    description:
      "Responde 10 operaciones seguidas antes de 45 segundos. Los aciertos y la rapidez suman puntos.",
    duration: "1 min",
    icon: Calculator,
    gradient: "from-sky-500 to-blue-600",
    soft: "bg-sky-50",
    text: "text-sky-700",
  },
  {
    id: "sequence",
    title: "Secuencia de colores",
    tagline: "Atención y memoria",
    description:
      "Observa la secuencia iluminada y repítela en orden. Cada ronda superada añade un nuevo paso y 100 puntos.",
    duration: "2-4 min",
    icon: Grid2X2,
    gradient: "from-violet-500 to-fuchsia-600",
    soft: "bg-violet-50",
    text: "text-violet-700",
  },
];

const GAME_LABEL: Record<string, string> = {
  memory: "Memoria",
  math: "Cálculo",
  sequence: "Secuencia",
};

export default function MenteActiva({
  data,
  onSaveScore,
}: {
  data: DashboardData;
  onSaveScore: (game: string, score: number, detail: string) => Promise<number>;
}) {
  const def = sectionById("mind");
  const [active, setActive] = useState<GameId | null>(null);

  if (active) {
    const meta = GAMES.find((g) => g.id === active)!;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActive(null)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
            aria-label="Volver a juegos"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              {meta.title}
            </h1>
            <p className="text-xs font-medium text-slate-500">{meta.tagline}</p>
          </div>
        </div>
        <Card className="mx-auto w-full max-w-2xl p-5 sm:p-7">
          {active === "memory" && (
            <MemoryGame best={data.best.memory} onFinish={(s, d) => onSaveScore("memory", s, d)} />
          )}
          {active === "math" && (
            <MathGame best={data.best.math} onFinish={(s, d) => onSaveScore("math", s, d)} />
          )}
          {active === "sequence" && (
            <SequenceGame
              best={data.best.sequence}
              onFinish={(s, d) => onSaveScore("sequence", s, d)}
            />
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} subtitle="Entrenamiento cognitivo diario" />

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8"
        style={{
          background: "linear-gradient(130deg,#a21caf 0%,#c026d3 45%,#7c3aed 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-28 h-48 w-48 rounded-full bg-white/[0.07]" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/18 backdrop-blur">
            <Brain size={32} />
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Entrena tu mente, 10 minutos al día
            </h2>
            <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-white/85">
              Juegos sencillos diseñados para ejercitar la memoria, la atención y
              el cálculo mental. La constancia ayuda a mantener una mente ágil.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
              {data.recentScores.length} partidas
            </span>
            <span className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
              <Trophy size={12} className="mr-1 inline" />
              Récord {Math.max(0, ...Object.values(data.best))}
            </span>
          </div>
        </div>
      </div>

      {/* Juegos */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        {GAMES.map((g) => {
          const Icon = g.icon;
          const best = data.best[g.id];
          return (
            <Card key={g.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-13 w-13 items-center justify-center rounded-2xl",
                    g.soft,
                    g.text
                  )}
                >
                  <Icon size={24} strokeWidth={2.2} />
                </span>
                <Chip tone="slate" className="bg-slate-100 text-slate-500" icon="Timer">
                  {g.duration}
                </Chip>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900">{g.title}</h3>
              <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-slate-500">
                {g.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600">
                  <Trophy size={14} />
                  {best ? `${best} pts` : "Sin marca aún"}
                </span>
                <button
                  onClick={() => setActive(g.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-95",
                    g.gradient
                  )}
                >
                  <Play size={13} /> Jugar
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Beneficios + historial */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="Lightbulb" tone="fuchsia" title="Beneficios del entrenamiento" />
          <ul className="flex flex-col gap-3">
            {[
              ["Brain", "Memoria", "Refuerza la memoria de trabajo y la capacidad de reconocer patrones."],
              ["Crosshair", "Atención", "Mejora la concentración y la velocidad de reacción."],
              ["Calculator", "Cálculo", "Mantiene ágiles el razonamiento numérico y la lógica."],
              ["HeartHandshake", "Bienestar", "Las rutinas cortas y diarias reducen la ansiedad y motivan."],
            ].map(([icon, title, text]) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                  <DyIcon name={icon} size={17} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{title}</p>
                  <p className="text-xs font-medium leading-relaxed text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardTitle icon="History" tone="violet" title="Partidas recientes" />
          {data.recentScores.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Brain size={30} className="text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">
                Aún no has jugado. ¡Elige un juego y estrena tu marcador!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {data.recentScores.slice(0, 6).map((s, i) => (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 py-2.5",
                    i !== 0 && "border-t border-slate-100"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    {s.game === "memory" ? (
                      <Images size={16} />
                    ) : s.game === "math" ? (
                      <Calculator size={16} />
                    ) : (
                      <Grid2X2 size={16} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-800">
                      {GAME_LABEL[s.game] ?? s.game}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-400">
                      {s.detail ?? "Partida completada"} ·{" "}
                      {s.playedAt
                        ? new Intl.DateTimeFormat("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(s.playedAt))
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-violet-700">
                    {s.score} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-violet-50/70 p-3 text-[11px] font-semibold text-violet-700">
            <Lightbulb size={14} className="shrink-0" />
            Consejo: juega siempre a la misma hora para convertirlo en hábito.
          </div>
        </Card>
      </div>

      {/* Próximamente */}
      <Card className="flex items-center gap-4 border-dashed p-5 opacity-80 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock size={19} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-slate-600">Sopa de letras · Próximamente</p>
          <p className="text-xs font-medium text-slate-400">
            Estamos preparando nuevos juegos para seguir estimulando la mente.
          </p>
        </div>
      </Card>
    </div>
  );
}
