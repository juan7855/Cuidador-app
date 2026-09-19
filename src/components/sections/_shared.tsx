"use client";

import type { LucideIcon } from "lucide-react";
import { Card, DyIcon } from "@/components/ui";
import { cn, toneOf, type Tone } from "@/lib/utils";
import type { SectionDef } from "@/components/nav";

/* Encabezado de sección */
export function SectionHeader({
  def,
  subtitle,
  actions,
}: {
  def: SectionDef;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const Icon = def.icon;
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm sm:h-13 sm:w-13",
            def.soft,
            def.text
          )}
        >
          <Icon size={23} strokeWidth={2.3} />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {def.label}
          </h1>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {subtitle ?? def.description}
          </p>
        </div>
      </div>
      {actions}
    </div>
  );
}

/* Mini estadística */
export function StatTile({
  icon,
  tone = "blue",
  label,
  value,
  unit,
  sub,
  footer,
  className,
}: {
  icon: string;
  tone?: string;
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const t: Tone = toneOf(tone);
  return (
    <Card className={cn("h-full p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", t.soft, t.text)}>
          <DyIcon name={icon} size={18} strokeWidth={2.3} />
        </span>
        {sub}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {value}
        {unit && <span className="ml-1 text-xs font-bold text-slate-400">{unit}</span>}
      </p>
      {footer && <div className="mt-2">{footer}</div>}
    </Card>
  );
}

/* Acceso directo a sección */
export function ShortcutTile({
  def,
  onClick,
}: {
  def: SectionDef;
  onClick: () => void;
}) {
  const Icon: LucideIcon = def.icon;
  return (
    <button
      onClick={onClick}
      className="card group flex items-center gap-3.5 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
          def.soft,
          def.text
        )}
      >
        <Icon size={20} strokeWidth={2.3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-slate-800">
          {def.label}
        </span>
        <span className="block truncate text-[11px] font-medium text-slate-400">
          {def.description}
        </span>
      </span>
      <DyIcon
        name="ChevronRight"
        size={16}
        className="text-slate-300 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  );
}

/* Banner de alerta / consejo */
export function NoticeCard({
  tone = "amber",
  icon,
  title,
  children,
}: {
  tone?: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const t = toneOf(tone);
  return (
    <Card className={cn("flex h-full gap-3.5 p-4 sm:p-5", t.soft, "border-transparent")}>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm", t.text)}>
        <DyIcon name={icon} size={19} strokeWidth={2.3} />
      </span>
      <div className="min-w-0">
        <p className={cn("text-sm font-extrabold", t.text)}>{title}</p>
        <div className="mt-0.5 text-xs font-medium leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </Card>
  );
}
