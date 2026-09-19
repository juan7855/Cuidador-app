"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Check, X, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  text: string;
  answer: number;
  options: number[];
}

const TOTAL_Q = 10;
const TIME_LIMIT = 45;

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genQuestion(): Question {
  const kind = rnd(0, 2);
  let text = "";
  let answer = 0;
  if (kind === 0) {
    const a = rnd(12, 79);
    const b = rnd(11, 49);
    answer = a + b;
    text = `${a} + ${b}`;
  } else if (kind === 1) {
    const a = rnd(30, 99);
    const b = rnd(9, a - 2);
    answer = a - b;
    text = `${a} − ${b}`;
  } else {
    const a = rnd(3, 9);
    const b = rnd(4, 12);
    answer = a * b;
    text = `${a} × ${b}`;
  }
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const delta = rnd(-9, 9) || 3;
    const cand = answer + delta;
    if (cand > 0) options.add(cand);
  }
  const opts = [...options].sort(() => Math.random() - 0.5);
  return { text, answer, options: opts };
}

export default function MathGame({
  best,
  onFinish,
}: {
  best?: number;
  onFinish: (score: number, detail: string) => Promise<number>;
}) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [result, setResult] = useState<{ score: number; best: number; record: boolean } | null>(null);
  const sentRef = useRef(false);

  const finish = useCallback(
    (correctCount: number, left: number, completed: boolean) => {
      if (sentRef.current) return;
      sentRef.current = true;
      const score = correctCount * 10 + (completed ? left * 4 : 0);
      const detail = `${correctCount}/${TOTAL_Q} aciertos · ${TIME_LIMIT - left} s`;
      void onFinish(score, detail).then((newBest) => {
        setResult({ score, best: newBest, record: score >= newBest && score > 0 });
        setPhase("done");
      });
    },
    [onFinish]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      finish(correct, 0, index >= TOTAL_Q);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, correct, index, finish]);

  const start = () => {
    setQuestions(Array.from({ length: TOTAL_Q }, genQuestion));
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setTimeLeft(TIME_LIMIT);
    setResult(null);
    sentRef.current = false;
    setPhase("playing");
  };

  const choose = (opt: number) => {
    if (picked !== null) return;
    setPicked(opt);
    const q = questions[index];
    const ok = opt === q.answer;
    const nextCorrect = correct + (ok ? 1 : 0);
    setCorrect(nextCorrect);
    setTimeout(() => {
      if (index + 1 >= TOTAL_Q) {
        finish(nextCorrect, timeLeft, true);
      } else {
        setIndex((i) => i + 1);
        setPicked(null);
      }
    }, 550);
  };

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-purple-50 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
          <span className="text-2xl font-extrabold">∑</span>
        </span>
        <div>
          <p className="text-lg font-extrabold text-slate-900">Cálculo mental exprés</p>
          <p className="mx-auto mt-1 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
            Responde {TOTAL_Q} operaciones en {TIME_LIMIT} segundos. Cada acierto
            suma 10 puntos y el tiempo restante, al terminar todas, da puntos
            extra.
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
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="animate-pop flex flex-col items-center gap-4 rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
          <Sparkles size={26} />
        </span>
        <p className="text-lg font-extrabold text-slate-900">
          {result.record ? "¡Nuevo récord!" : "¡Buen trabajo!"}
        </p>
        <p className="text-sm font-semibold text-slate-500">
          Has acertado {correct} de {TOTAL_Q} operaciones.
        </p>
        <p className="text-4xl font-extrabold text-fuchsia-600">{result.score}</p>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Mejor marca: {Math.max(result.best, result.score)}
        </p>
        <button onClick={start} className="btn-primary">
          <RotateCcw size={16} /> Jugar de nuevo
        </button>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-[11px] font-extrabold text-slate-500">
            <span>
              Pregunta {index + 1}/{TOTAL_Q}
            </span>
            <span>{correct} aciertos</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-fuchsia-500 transition-all duration-300"
              style={{ width: `${((index + (picked !== null ? 1 : 0)) / TOTAL_Q) * 100}%` }}
            />
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-extrabold tabular-nums",
            timeLeft <= 10 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
          )}
        >
          <Timer size={15} /> {timeLeft}s
        </span>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-center sm:p-10">
        <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {q.text} <span className="text-fuchsia-300">= ?</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === q.answer;
          const reveal = picked !== null;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={reveal}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 py-5 text-2xl font-extrabold transition active:scale-95",
                !reveal &&
                  "border-slate-100 bg-white text-slate-800 shadow-sm hover:border-fuchsia-300 hover:bg-fuchsia-50",
                reveal && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700",
                reveal && isPicked && !isCorrect && "border-rose-500 bg-rose-50 text-rose-700",
                reveal && !isCorrect && !isPicked && "border-slate-100 bg-white text-slate-300"
              )}
            >
              {opt}
              {reveal && isCorrect && <Check size={18} />}
              {reveal && isPicked && !isCorrect && <X size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
