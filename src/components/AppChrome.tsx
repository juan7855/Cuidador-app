"use client";

import { useState } from "react";
import {
  HeartPulse,
  Bell,
  SwitchCamera,
  LayoutGrid,
  IdCard,
  UtensilsCrossed,
  Dumbbell,
  ChevronRight,
  Pill,
  Brain,
  CalendarCheck,
  LayoutDashboard,
  X,
  type LucideIcon,
} from "lucide-react";
import { SECTIONS, type SectionId, type SectionDef } from "@/components/nav";
import { Avatar, DyIcon } from "@/components/ui";
import { cn, greeting, toneOf } from "@/lib/utils";
import type { Patient } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  panel: LayoutDashboard,
  perfil: IdCard,
  meds: Pill,
  food: UtensilsCrossed,
  exercise: Dumbbell,
  mind: Brain,
  routine: CalendarCheck,
};

const MOBILENAV: SectionId[] = ["panel", "meds", "mind", "routine"];
const SHEET_NAV: SectionId[] = ["perfil", "food", "exercise"];

export interface Reminder {
  icon: string;
  tone: string;
  text: string;
}

function NavRow({
  section,
  active,
  onClick,
  compact,
}: {
  section: SectionDef;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl text-left font-bold transition-all",
        compact ? "px-3.5 py-3 text-sm" : "px-4 py-3 text-sm",
        active
          ? cn("text-white shadow-lg", section.solid)
          : "text-slate-600 hover:bg-slate-100"
      )}
      style={active ? { boxShadow: `0 12px 24px -12px ${section.hex}` } : undefined}
    >
      <Icon size={19} strokeWidth={2.3} className="shrink-0" />
      <span className="flex-1 truncate">{section.label}</span>
      {!active && <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-400" />}
    </button>
  );
}

export default function AppChrome({
  patient,
  section,
  onNavigate,
  onSwitch,
  reminders,
  children,
}: {
  patient?: Patient;
  section: SectionId;
  onNavigate: (id: SectionId) => void;
  onSwitch: () => void;
  reminders: Reminder[];
  children: React.ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const go = (id: SectionId) => {
    onNavigate(id);
    setSheetOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sheetActive = SHEET_NAV.includes(section);

  return (
    <div className="app-bg min-h-screen lg:pl-[284px]">
      {/* ------------------------------------------------ Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[284px] flex-col border-r border-slate-200/70 bg-white/80 px-5 py-7 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-white shadow-lg shadow-brand-500/30">
            <HeartPulse size={20} strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-base font-extrabold tracking-tight text-slate-900">
              VitalCare
            </p>
            <p className="-mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Salud integral
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1.5">
          <p className="px-4 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Secciones
          </p>
          {SECTIONS.map((s) => (
            <NavRow
              key={s.id}
              section={s}
              active={section === s.id}
              onClick={() => go(s.id)}
            />
          ))}
        </nav>

        {patient && (
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-3">
              <Avatar
                name={patient.name}
                from={patient.avatarFrom}
                to={patient.avatarTo}
                size={42}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-800">
                  {patient.name}
                </p>
                <p className="truncate text-[11px] font-semibold text-slate-500">
                  {patient.relation} · {patient.age} años
                </p>
              </div>
            </div>
            <button
              onClick={onSwitch}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-brand-50 hover:text-brand-700"
            >
              <SwitchCamera size={15} />
              Cambiar de paciente
            </button>
          </div>
        )}
      </aside>

      {/* ------------------------------------------------ Cabecera móvil */}
      <header className="pb-safe sticky top-0 z-30 border-b border-slate-200/60 bg-[#f1f6fd]/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button onClick={onSwitch} className="flex min-w-0 items-center gap-3 text-left">
            {patient && (
              <Avatar
                name={patient.name}
                from={patient.avatarFrom}
                to={patient.avatarTo}
                size={42}
              />
            )}
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500">
                {greeting()}
              </span>
              <span className="block truncate text-sm font-extrabold text-slate-900">
                {patient?.name ?? "VitalCare"}
              </span>
            </span>
          </button>
          <div className="relative">
            <button
              onClick={() => setBellOpen((v) => !v)}
              aria-label="Recordatorios"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm"
            >
              <Bell size={18} />
              {reminders.length > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-72 animate-pop rounded-3xl border border-slate-100 bg-white p-3 shadow-[var(--shadow-pop)]">
                  <div className="mb-2 flex items-center justify-between px-2 pt-1">
                    <p className="text-sm font-extrabold text-slate-900">Recordatorios</p>
                    <button onClick={() => setBellOpen(false)} aria-label="Cerrar" className="text-slate-400">
                      <X size={16} />
                    </button>
                  </div>
                  {reminders.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs font-semibold text-slate-500">
                      Todo al día. ¡Buen trabajo!
                    </p>
                  ) : (
                    reminders.map((r, i) => {
                      const t = toneOf(r.tone);
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-slate-50">
                          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.soft, t.text)}>
                            <DyIcon name={r.icon} size={17} strokeWidth={2.3} />
                          </span>
                          <p className="flex-1 text-xs font-semibold leading-snug text-slate-600">
                            {r.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------ Contenido */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-36 pt-4 sm:px-6 lg:pb-20 lg:pt-8">
        <div key={section} className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* ------------------------------------------------ Navegación inferior (móvil) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-3 mb-3 flex items-end justify-around rounded-3xl border border-slate-200/70 bg-white/95 px-2 py-2 shadow-[var(--shadow-pop)] backdrop-blur">
          {MOBILENAV.slice(0, 2).map((id) => (
            <MobileTab
              key={id}
              def={SECTIONS.find((s) => s.id === id)!}
              active={section === id}
              onClick={() => go(id)}
            />
          ))}

          {/* Botón central: Mente activa */}
          <button
            onClick={() => go("mind")}
            aria-label="Mente activa"
            className={cn(
              "flex -translate-y-3 flex-col items-center gap-1 rounded-3xl px-4 py-2 text-white shadow-lg transition active:scale-95",
              section === "mind"
                ? "bg-gradient-to-br from-fuchsia-500 to-purple-600"
                : "bg-gradient-to-br from-fuchsia-500 to-purple-600"
            )}
            style={{ boxShadow: "0 14px 26px -10px rgba(192,38,211,.6)" }}
          >
            <Brain size={24} strokeWidth={2.3} />
            <span className="text-[10px] font-extrabold">Mente</span>
          </button>

          <MobileTab
            def={SECTIONS.find((s) => s.id === "routine")!}
            active={section === "routine"}
            onClick={() => go("routine")}
          />
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Ver más secciones"
            className={cn(
              "flex w-16 flex-col items-center gap-1 rounded-2xl py-2 transition",
              sheetActive ? "text-brand-600" : "text-slate-400"
            )}
          >
            <LayoutGrid size={22} strokeWidth={2.2} />
            <span className="text-[10px] font-extrabold">Más</span>
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------ Hoja “Más” */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 animate-sheet rounded-t-[28px] bg-white p-5 pb-8 shadow-[var(--shadow-pop)]">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                Todas las secciones
              </h3>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {SHEET_NAV.map((id) => {
                const s = SECTIONS.find((x) => x.id === id)!;
                const Icon = s.icon;
                return (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl p-3.5 text-left transition",
                      section === id ? cn(s.soft, s.text) : "hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl",
                        section === id ? "bg-white/70" : s.soft,
                        s.text
                      )}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-extrabold">{s.label}</span>
                      <span className="block text-xs font-medium text-slate-500">
                        {s.description}
                      </span>
                    </span>
                    <ChevronRight size={17} className="text-slate-300" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setSheetOpen(false);
                onSwitch();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <SwitchCamera size={17} />
              Cambiar de paciente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTab({
  def,
  active,
  onClick,
}: {
  def: SectionDef;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[def.id] ?? LayoutDashboard;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-16 flex-col items-center gap-1 rounded-2xl py-2 transition",
        active ? "text-brand-600" : "text-slate-400"
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2.1} />
      <span className="text-[10px] font-extrabold">{def.short}</span>
    </button>
  );
}
