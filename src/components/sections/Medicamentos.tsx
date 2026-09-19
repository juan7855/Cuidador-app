"use client";

import { useState } from "react";
import { Plus, PackageX, Clock, UtensilsCrossed, Info, Pill as PillIcon } from "lucide-react";
import {
  Card,
  Chip,
  CheckButton,
  Bar,
  DyIcon,
  Modal,
  Toggle,
  ProgressRing,
} from "@/components/ui";
import { SectionHeader, NoticeCard } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { cn, hourLabel, toneOf } from "@/lib/utils";
import type { DashboardData, MedicationRow } from "@/lib/types";

const PHASES: { id: string; label: string; icon: string; tone: string }[] = [
  { id: "Mañana", label: "Mañana", icon: "Sunrise", tone: "amber" },
  { id: "Tarde", label: "Tarde", icon: "Sun", tone: "orange" },
  { id: "Noche", label: "Noche", icon: "MoonStar", tone: "indigo" },
];

const FORM_OPTIONS = ["Tableta", "Comprimido", "Cápsula", "Inhalador", "Inyección", "Jarabe"];

export default function Medicamentos({
  data,
  onToggle,
  onAdded,
}: {
  data: DashboardData;
  onToggle: (id: number, done: boolean) => void;
  onAdded: () => Promise<void>;
}) {
  const def = sectionById("meds");
  const [open, setOpen] = useState(false);

  const scheduled = data.meds.filter((m) => m.scheduled);
  const takenToday = scheduled.filter((m) => m.takenToday).length;
  const avgAdherence = Math.round(
    scheduled.reduce((a, m) => a + (m.adherence ?? 0), 0) / Math.max(1, scheduled.length)
  );
  const lowStock = data.meds.filter((m) => m.stock <= m.lowStockAt);
  const prn = data.meds.filter((m) => !m.scheduled);

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader
        def={def}
        subtitle={`Tratamiento activo de ${data.patient.name.split(" ")[0]}`}
        actions={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={17} strokeWidth={2.6} />
            <span className="hidden sm:inline">Añadir medicamento</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <ProgressRing
            value={scheduled.length ? (takenToday / scheduled.length) * 100 : 0}
            size={84}
            stroke={9}
            color="#7c3aed"
          >
            <span className="text-lg font-extrabold text-violet-700">
              {takenToday}/{scheduled.length}
            </span>
          </ProgressRing>
          <div>
            <p className="text-sm font-extrabold text-slate-800">Dosis de hoy</p>
            <p className="text-xs font-medium text-slate-400">
              {takenToday === scheduled.length
                ? "Todas completadas"
                : `Faltan ${scheduled.length - takenToday} tomas`}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <ProgressRing value={avgAdherence} size={84} stroke={9} color="#059669">
            <span className="text-lg font-extrabold text-emerald-600">{avgAdherence}%</span>
          </ProgressRing>
          <div>
            <p className="text-sm font-extrabold text-slate-800">Adherencia 7 días</p>
            <p className="text-xs font-medium text-slate-400">
              {avgAdherence >= 90
                ? "Cumplimiento excelente"
                : avgAdherence >= 70
                  ? "Cumplimiento aceptable"
                  : "Requiere refuerzo"}
            </p>
          </div>
        </Card>
        <Card className={cn("col-span-2 flex items-center gap-4 p-5 lg:col-span-1", lowStock.length && "bg-amber-50/60")}>
          <span
            className={cn(
              "flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full",
              lowStock.length ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
            )}
          >
            {lowStock.length ? <PackageX size={28} /> : <PillIcon size={28} />}
          </span>
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              {lowStock.length ? "Revisar stock" : "Stock correcto"}
            </p>
            <p className="text-xs font-medium text-slate-400">
              {lowStock.length
                ? `${lowStock.length} medicamento${lowStock.length > 1 ? "s" : ""} por reponer`
                : "Todos los tratamientos tienen existencias"}
            </p>
          </div>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <NoticeCard tone="amber" icon="TriangleAlert" title="Stock bajo — renueva la receta">
          <ul className="ml-4 list-disc">
            {lowStock.map((m) => (
              <li key={m.id}>
                <strong>{m.name} {m.dosage}</strong>: quedan {m.stock} {m.stockUnit}.
              </li>
            ))}
          </ul>
        </NoticeCard>
      )}

      {/* Grupos horarios */}
      {PHASES.map((phase) => {
        const items = scheduled
          .filter((m) => m.period === phase.id)
          .sort((a, b) => a.time.localeCompare(b.time));
        if (!items.length) return null;
        const pt = toneOf(phase.tone);
        return (
          <div key={phase.id}>
            <div className="mb-3 flex items-center gap-2.5 px-1">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", pt.soft, pt.text)}>
                <DyIcon name={phase.icon} size={16} strokeWidth={2.4} />
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
                {phase.label}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {items.filter((m) => m.takenToday).length}/{items.length}
              </span>
              <div className="ml-2 h-px flex-1 bg-slate-200/70" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {items.map((m) => (
                <MedCard key={m.id} med={m} onToggle={onToggle} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Rescate / si es necesario */}
      {prn.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Clock size={16} strokeWidth={2.4} />
            </span>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
              Según necesidad
            </h3>
            <div className="ml-2 h-px flex-1 bg-slate-200/70" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {prn.map((m) => (
              <Card key={m.id} className="border-dashed p-5">
                <div className="flex items-start gap-3.5">
                  <MedIcon med={m} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-800">{m.name}</p>
                      <Chip tone="slate" className="bg-slate-100 text-slate-500">
                        Rescate
                      </Chip>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {m.activeSubstance} · {m.dosage}
                    </p>
                    {m.instructions && (
                      <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 text-[11px] font-medium leading-relaxed text-slate-500">
                        <Info size={13} className="mt-0.5 shrink-0" />
                        {m.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AddMedModal
        open={open}
        onClose={() => setOpen(false)}
        patientId={data.patient.id}
        onAdded={onAdded}
      />
    </div>
  );
}

function MedIcon({ med }: { med: MedicationRow }) {
  const t = toneOf(med.tone);
  return (
    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", t.soft, t.text)}>
      <PillIcon size={20} strokeWidth={2.3} />
    </span>
  );
}

function MedCard({
  med,
  onToggle,
}: {
  med: MedicationRow;
  onToggle: (id: number, done: boolean) => void;
}) {
  const t = toneOf(med.tone);
  const low = med.stock <= med.lowStockAt;
  return (
    <Card
      className={cn(
        "p-5 transition-colors",
        med.takenToday && "border-emerald-200 bg-emerald-50/40"
      )}
    >
      <div className="flex items-start gap-3.5">
        <MedIcon med={med} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                "text-sm font-extrabold",
                med.takenToday ? "text-slate-500 line-through decoration-emerald-500/60" : "text-slate-800"
              )}
            >
              {med.name}
            </p>
            {med.withFood && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <UtensilsCrossed size={12} /> Con comida
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
            {med.activeSubstance} · {med.dosage} · {med.form}
          </p>
        </div>
        <CheckButton
          done={med.takenToday}
          onClick={() => onToggle(med.id, !med.takenToday)}
          label={med.takenToday ? "Deshacer toma" : "Marcar toma realizada"}
          tone={t.hex}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip tone={med.tone} icon="Clock">
          {hourLabel(med.time)}
        </Chip>
        {med.adherence != null && (
          <Chip tone={med.adherence >= 80 ? "emerald" : med.adherence >= 50 ? "amber" : "rose"}>
            {med.adherence}% cumplimiento
          </Chip>
        )}
      </div>

      {med.instructions && med.time !== "—" && (
        <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 text-[11px] font-medium leading-relaxed text-slate-500">
          <Info size={13} className="mt-0.5 shrink-0" />
          {med.instructions}
        </p>
      )}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-400">
            Stock: {med.stock} {med.stockUnit}
          </span>
          {low && <span className="text-amber-600">Reponer pronto</span>}
        </div>
        <Bar
          value={med.stock}
          max={Math.max(med.lowStockAt * 3, 30)}
          height={6}
          barClassName={low ? "bg-amber-500" : "bg-emerald-500"}
        />
      </div>
    </Card>
  );
}

function AddMedModal({
  open,
  onClose,
  patientId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  patientId: number;
  onAdded: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    activeSubstance: "",
    dosage: "",
    form: "Tableta",
    time: "08:00",
    rescue: false,
    withFood: false,
    stock: 30,
    instructions: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.dosage.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          name: form.name,
          activeSubstance: form.activeSubstance,
          dosage: form.dosage,
          form: form.form,
          time: form.rescue ? "—" : form.time,
          withFood: form.withFood,
          stock: Number(form.stock),
          instructions: form.instructions,
          tone: "blue",
        }),
      });
      if (res.ok) {
        await onAdded();
        onClose();
        setForm({
          name: "",
          activeSubstance: "",
          dosage: "",
          form: "Tableta",
          time: "08:00",
          rescue: false,
          withFood: false,
          stock: 30,
          instructions: "",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Añadir medicamento">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <label className="label">Nombre comercial *</label>
          <input
            className="input"
            placeholder="Ej. Losartán potásico"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Dosis *</label>
            <input
              className="input"
              placeholder="Ej. 50 mg"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Forma</label>
            <select
              className="input"
              value={form.form}
              onChange={(e) => setForm({ ...form, form: e.target.value })}
            >
              {FORM_OPTIONS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Principio activo</label>
          <input
            className="input"
            placeholder="Ej. Losartán"
            value={form.activeSubstance}
            onChange={(e) => setForm({ ...form, activeSubstance: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-bold text-slate-600">
            Es un medicamento de rescate (sin hora fija)
          </span>
          <Toggle
            checked={form.rescue}
            onChange={(v) => setForm({ ...form, rescue: v })}
            label="Medicamento de rescate"
          />
        </div>

        {!form.rescue && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Hora de toma</label>
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Stock actual</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-bold text-slate-600">Tomar con comida</span>
          <Toggle
            checked={form.withFood}
            onChange={(v) => setForm({ ...form, withFood: v })}
            label="Tomar con comida"
          />
        </div>

        <div>
          <label className="label">Instrucciones</label>
          <textarea
            className="input min-h-20 resize-none"
            placeholder="Indicaciones especiales…"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving || !form.name.trim() || !form.dosage.trim()}
            className="btn-primary flex-1"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
