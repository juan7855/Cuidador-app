"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  ChevronRight,
  ShieldCheck,
  Users,
  Droplets,
  Cake,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { Avatar, Card, Chip, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface LitePatient {
  id: number;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodType: string | null;
  avatarFrom: string;
  avatarTo: string;
  conditions: string[];
}

export default function PatientSelector({
  patients,
  onSelect,
}: {
  patients: LitePatient[];
  onSelect: (id: number) => void | Promise<void>;
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  const choose = async (id: number) => {
    setLoadingId(id);
    try {
      await onSelect(id);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="selector-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        {/* Marca */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-white shadow-lg shadow-brand-500/30">
              <HeartPulse size={22} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900">
                VitalCare
              </p>
              <p className="-mt-0.5 text-[11px] font-semibold text-slate-500">
                Plataforma de cuidado integral
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="emerald" icon="ShieldCheck" className="hidden sm:inline-flex">
              Datos confidenciales
            </Chip>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <UserPlus size={17} strokeWidth={2.6} />
              <span className="hidden sm:inline">Nuevo paciente</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </header>

        {/* Encabezado */}
        <div className="mt-10 max-w-2xl sm:mt-16">
          <span className="chip bg-brand-50 text-brand-700">
            <Users size={13} strokeWidth={2.6} />
            Modo cuidador
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            ¿A quién cuidamos{" "}
            <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
              hoy?
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Selecciona un paciente para acceder a su panel de salud:
            medicación, alimentación, actividad física, estimulación cognitiva y
            rutina diaria en un solo lugar.
          </p>
        </div>

        {/* Tarjetas de pacientes */}
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p, i) => (
            <Card
              key={p.id}
              className={cn(
                "group animate-fade-up overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)]"
              )}
            >
              <button
                onClick={() => choose(p.id)}
                className="flex h-full w-full flex-col p-6 text-left"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${p.avatarFrom}22, ${p.avatarTo}10)`,
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <Avatar
                    name={p.name}
                    from={p.avatarFrom}
                    to={p.avatarTo}
                    size={64}
                    className="ring-4 ring-white shadow-lg"
                  />
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {p.relation}
                  </span>
                </div>

                <h2 className="relative mt-4 text-xl font-extrabold tracking-tight text-slate-900">
                  {p.name}
                </h2>

                <div className="relative mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Cake size={13} />
                    {p.age} años · {p.gender === "F" ? "Mujer" : "Hombre"}
                  </span>
                  {p.bloodType && (
                    <span className="inline-flex items-center gap-1.5">
                      <Droplets size={13} />
                      Sangre {p.bloodType}
                    </span>
                  )}
                </div>

                <div className="relative mt-4 flex flex-wrap gap-1.5">
                  {p.conditions.length ? (
                    p.conditions.slice(0, 2).map((c) => (
                      <Chip key={c} tone="blue">
                        {c}
                      </Chip>
                    ))
                  ) : (
                    <Chip tone="emerald" icon="Heart">
                      Sin patologías crónicas
                    </Chip>
                  )}
                </div>

                <span className="relative mt-auto inline-flex items-center justify-between gap-2 pt-6 text-sm font-bold text-brand-600">
                  {loadingId === p.id ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                      Abriendo panel…
                    </>
                  ) : (
                    <>
                      Ver panel de salud
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all group-hover:bg-brand-500 group-hover:text-white">
                        <ChevronRight size={17} strokeWidth={2.6} />
                      </span>
                    </>
                  )}
                </span>
              </button>
            </Card>
          ))}
        </div>

        {/* Pie */}
        <footer className="mt-auto pt-12">
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-white/80 bg-white/70 p-5 backdrop-blur sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </span>
            <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
              <strong className="text-slate-700">Información protegida.</strong>{" "}
              Los datos clínicos mostrados son confidenciales y están pensados
              para el seguimiento entre el paciente, su familia y su equipo
              médico. No sustituyen el diagnóstico de un profesional sanitario.
            </p>
          </div>
        </footer>
      </div>

      <NewPatientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

interface CreatedPatient {
  name: string;
  pin: string;
}

function NewPatientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const empty = {
    name: "",
    pin: "",
    relation: "Madre",
    gender: "F",
    age: "",
    birthDate: "",
    bloodType: "",
    phone: "",
    address: "",
    conditions: "",
    allergies: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedPatient | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    onClose();
    setTimeout(() => {
      setForm(empty);
      setError(null);
      setCreated(null);
      setCopied(false);
    }, 200);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          pin: form.pin || undefined,
          relation: form.relation,
          gender: form.gender,
          age: form.age ? Number(form.age) : undefined,
          birthDate: form.birthDate || undefined,
          bloodType: form.bloodType || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          conditions: form.conditions
            ? form.conditions.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          allergies: form.allergies
            ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo crear el paciente");
        return;
      }
      setCreated({ name: json.patient.name, pin: json.pin });
      onCreated();
    } catch {
      setError("No se pudo crear el paciente. Revisa tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  const copyPin = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // portapapeles no disponible: no es crítico
    }
  };

  if (created) {
    return (
      <Modal open={open} onClose={close} title="Paciente creado">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <UserPlus size={26} />
          </span>
          <p className="text-sm font-semibold text-slate-600">
            <strong className="text-slate-900">{created.name}</strong> ya está
            registrado. Este es su PIN para entrar a MiSalud (la app del
            adulto mayor) — apúntalo, no se muestra de nuevo:
          </p>
          <button
            onClick={copyPin}
            className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 px-6 py-4 transition hover:bg-brand-100 active:scale-[0.98]"
          >
            <span className="text-3xl font-extrabold tracking-[0.3em] text-brand-700">
              {created.pin}
            </span>
            {copied ? (
              <Check size={18} className="text-emerald-600" />
            ) : (
              <Copy size={18} className="text-brand-500" />
            )}
          </button>
          <p className="text-xs font-medium text-slate-400">
            Ya se sembró una rutina, ejercicios, menú y actividades de mente
            activa de ejemplo para que la app no se vea vacía. Puedes
            editarlos desde aquí cuando quieras.
          </p>
          <button onClick={close} className="btn-primary mt-2 w-full">
            Listo
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} title="Nuevo paciente">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <label className="label">Nombre completo *</label>
          <input
            className="input"
            placeholder="Ej. Rosa Jiménez"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">PIN de 4 dígitos</label>
            <input
              className="input"
              placeholder="Se genera solo si lo dejas vacío"
              maxLength={4}
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div>
            <label className="label">Relación</label>
            <input
              className="input"
              placeholder="Madre, Padre, Tía…"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Género</label>
            <select
              className="input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="F">Mujer</option>
              <option value="M">Hombre</option>
            </select>
          </div>
          <div>
            <label className="label">Edad</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Grupo sanguíneo</label>
            <input
              className="input"
              placeholder="O+"
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Fecha de nacimiento</label>
          <input
            type="date"
            className="input"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Patologías crónicas (separadas por coma)</label>
          <input
            className="input"
            placeholder="Hipertensión, Diabetes tipo 2…"
            value={form.conditions}
            onChange={(e) => setForm({ ...form, conditions: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Alergias (separadas por coma)</label>
          <input
            className="input"
            placeholder="Penicilina…"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={close} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving || !form.name.trim()}
            className="btn-primary flex-1"
          >
            {saving ? "Creando…" : "Crear paciente"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
