"use client";

import { useEffect } from "react";
import { Check, X, icons, type LucideProps } from "lucide-react";
import { cn, initials, toneOf, type Tone } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Iconos dinámicos por nombre (lucide)                                */
/* ------------------------------------------------------------------ */
export function DyIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const map = icons as Record<string, React.FC<LucideProps>>;
  const Cmp = map[name] ?? map.Circle;
  return <Cmp {...props} />;
}

/* ------------------------------------------------------------------ */
/* Tarjetas                                                            */
/* ------------------------------------------------------------------ */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function CardTitle({
  icon,
  title,
  subtitle,
  action,
  tone = "blue",
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  tone?: string;
}) {
  const t = toneOf(tone);
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
              t.soft,
              t.text
            )}
          >
            <DyIcon name={icon} size={20} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-xs font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar con gradiente                                                */
/* ------------------------------------------------------------------ */
export function Avatar({
  name,
  from,
  to,
  size = 44,
  className,
}: {
  name: string;
  from: string;
  to: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-extrabold text-white shadow-inner ring-2 ring-white/70",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Anillo de progreso                                                  */
/* ------------------------------------------------------------------ */
export function ProgressRing({
  value,
  size = 128,
  stroke = 12,
  color = "#2f80ed",
  track = "#e6eef9",
  children,
  gradientId,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  gradientId?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#56ccf2" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={gradientId ? `url(#${gradientId})` : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de progreso                                                   */
/* ------------------------------------------------------------------ */
export function Bar({
  value,
  max,
  className,
  barClassName,
  height = 8,
}: {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
  height?: number;
}) {
  const p = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-slate-100", className)}
      style={{ height }}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barClassName ?? "bg-brand-500")}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Botón circular de hecho / pendiente                                 */
/* ------------------------------------------------------------------ */
export function CheckButton({
  done,
  onClick,
  label,
  size = 44,
  tone = "#2f80ed",
}: {
  done: boolean;
  onClick: () => void;
  label: string;
  size?: number;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done}
      aria-label={label}
      title={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90",
        done ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-slate-400"
      )}
      style={
        done
          ? { width: size, height: size, backgroundColor: tone, boxShadow: `0 8px 18px -8px ${tone}` }
          : { width: size, height: size }
      }
    >
      <Check size={size * 0.5} strokeWidth={3} className={done ? "animate-pop" : ""} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Chips / etiquetas                                                   */
/* ------------------------------------------------------------------ */
export function Chip({
  children,
  tone = "blue",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  icon?: string;
  className?: string;
}) {
  const t = toneOf(tone);
  return (
    <span className={cn("chip", t.soft, t.text, className)}>
      {icon && <DyIcon name={icon} size={13} strokeWidth={2.6} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal / hoja                                                        */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-sheet rounded-t-3xl bg-white p-6 shadow-[var(--shadow-pop)] sm:rounded-3xl sm:animate-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-brand-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Gráfica de líneas (SVG)                                             */
/* ------------------------------------------------------------------ */
export function LineChart({
  series,
  height = 90,
  labels,
  min: minProp,
  max: maxProp,
}: {
  series: { values: number[]; color: string; fill?: string; width?: number }[];
  height?: number;
  labels?: string[];
  min?: number;
  max?: number;
}) {
  const W = 320;
  const H = height;
  const pad = 6;
  const all = series.flatMap((s) => s.values);
  const min = minProp ?? Math.min(...all);
  const max = maxProp ?? Math.max(...all);
  const span = max - min || 1;
  const n = series[0]?.values.length ?? 0;

  const points = (values: number[]) =>
    values
      .map((v, i) => {
        const x = n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1);
        const y = H - pad - ((v - min) / span) * (H - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {series[0] && (
          <>
            <polygon
              points={`${pad},${H - pad} ${points(series[0].values)} ${W - pad},${H - pad}`}
              fill={series[0].fill ?? `${series[0].color}1f`}
            />
            <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} stroke="#e2e8f0" strokeWidth={1} />
          </>
        )}
        {series.map((s, i) => (
          <polyline
            key={i}
            points={points(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width ?? 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {series.map((s, si) =>
          s.values.map((v, i) => {
            const x = n === 1 ? W / 2 : pad + (i * (W - pad * 2)) / (n - 1);
            const y = H - pad - ((v - min) / span) * (H - pad * 2);
            return <circle key={`${si}-${i}`} cx={x} cy={y} r={i === n - 1 ? 3.4 : 0} fill={s.color} />;
          })
        )}
      </svg>
      {labels && (
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini barras semanales                                               */
/* ------------------------------------------------------------------ */
export function MiniBars({
  items,
  max,
  unit,
  height = 88,
}: {
  items: { label: string; value: number; highlight?: boolean; color?: string; sub?: string }[];
  max: number;
  unit?: string;
  height?: number;
}) {
  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height: height + 34 }}>
      {items.map((it, i) => {
        const h = max ? Math.max(4, Math.round((it.value / max) * height)) : 4;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">
              {it.value}
              {unit ?? ""}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-full transition-all duration-500",
                  it.highlight ? "" : "opacity-45"
                )}
                style={{
                  height: h,
                  backgroundColor: it.color ?? "#2f80ed",
                }}
                title={`${it.label}: ${it.value}`}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                it.highlight ? "text-slate-700" : "text-slate-400"
              )}
            >
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Selector pequeño de pestañas                                        */
/* ------------------------------------------------------------------ */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition",
            value === o.value
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
