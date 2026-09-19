"use client";

import { useEffect, useRef, useState, type FC } from "react";
import {
  RotateCcw,
  Timer,
  MousePointerClick,
  Trophy,
  Sparkles,
  icons,
} from "lucide-react";
import { cn, toneOf } from "@/lib/utils";

function MemoIcon({ name, size }: { name: string; size: number }) {
  const map = icons as Record<string, FC<{ size?: number; strokeWidth?: number }>>;
  const Cmp = map[name] ?? map.Brain;
  return <Cmp size={size} strokeWidth={2.2} />;
}

interface CardDef {
  uid: number;
  name: string;
  tone: string;
}

const ICONS = [
  { name: "Heart", tone: "rose" },
  { name: "Star", tone: "amber" },
  { name: "Sun", tone: "orange" },
  { name: "Moon", tone: "indigo" },
  { name: "Music", tone: "fuchsia" },
  { name: "Flower2", tone: "emerald" },
  { name: "Droplets", tone: "cyan" },
  { name: "Brain", tone: "violet" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): CardDef[] {
  return shuffle(
    ICONS.flatMap((i) => [
      { uid: Math.random(), name: i.name, tone: i.tone },
      { uid: Math.random(), name: i.name, tone: i.tone },
    ])
  );
}

export default function MemoryGame({
  best,
  onFinish,
}: {
  best?: number;
  onFinish: (score: number, detail: string) => Promise<number>;
}) {
  const [deck, setDeck] = useState<CardDef[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<{ score: number; best: number; record: boolean } | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!started || matched.length === ICONS.length) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, matched.length]);

  useEffect(() => {
    if (matched.length === ICONS.length && started && !sentRef.current) {
      sentRef.current = true;
      const score = Math.max(150, 1600 - moves * 25 - seconds * 4);
      const detail = `${moves} movimientos · ${seconds} s`;
      void onFinish(score, detail).then((newBest) => {
        setResult({ score, best: newBest, record: score >= newBest });
      });
    }
  }, [matched.length, started, moves, seconds, onFinish]);

  const flip = (i: number) => {
    if (locked || result) return;
    if (flipped.includes(i) || matched.includes(deck[i].name)) return;
    if (!started) setStarted(true);
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (deck[a].name === deck[b].name) {
        setTimeout(() => {
          setMatched((m) => [...m, deck[a].name]);
          setFlipped([]);
          setLocked(false);
        }, 380);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 850);
      }
    }
  };

  const reset = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setLocked(false);
    setResult(null);
    sentRef.current = false;
  };

  const pairs = matched.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <Metric icon={<MousePointerClick size={16} />} label="Movimientos" value={String(moves)} />
        <Metric icon={<Timer size={16} />} label="Tiempo" value={`${seconds}s`} />
        <Metric
          icon={<Trophy size={16} />}
          label="Parejas"
          value={`${pairs}/${ICONS.length}`}
        />
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {deck.map((c, i) => {
          const up = flipped.includes(i) || matched.includes(c.name);
          const done = matched.includes(c.name);
          const t = toneOf(c.tone);
          return (
            <button
              key={c.uid}
              onClick={() => flip(i)}
              aria-label={up ? c.name : "Tarjeta oculta"}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border text-2xl transition-all duration-300 sm:rounded-3xl",
                up
                  ? cn(
                      "scale-[1.02] border-transparent shadow-md",
                      t.soft,
                      t.text,
                      done && "opacity-70"
                    )
                  : "border-brand-100 bg-gradient-to-br from-brand-500 to-sky-400 text-white/85 shadow-md shadow-brand-500/20 hover:brightness-110 active:scale-95"
              )}
            >
              <MemoIcon name={up ? c.name : "Brain"} size={30} />
            </button>
          );
        })}
      </div>

      {result ? (
        <div className="animate-pop rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
            <Sparkles size={26} />
          </span>
          <p className="mt-3 text-lg font-extrabold text-slate-900">
            {result.record ? "¡Nuevo récord!" : "¡Bien hecho!"}
          </p>
          <p className="text-sm font-semibold text-slate-500">
            Has completado el tablero en {moves} movimientos y {seconds} segundos.
          </p>
          <p className="mt-3 text-4xl font-extrabold text-fuchsia-600">{result.score}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Mejor marca: {Math.max(result.best, result.score)}
          </p>
          <button onClick={reset} className="btn-primary mt-5">
            <RotateCcw size={16} /> Jugar de nuevo
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">
            {started
              ? "Toca dos tarjetas para encontrar parejas iguales."
              : "Toca cualquier tarjeta para empezar a contar el tiempo."}
          </p>
          <button onClick={reset} className="btn-ghost shrink-0 !px-3 !py-2 text-xs">
            <RotateCcw size={14} /> Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
      <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
        {icon}
      </span>
      <p className="text-base font-extrabold text-slate-800">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
