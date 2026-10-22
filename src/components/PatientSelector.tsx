"use client";

import Mascot from "@/components/Mascot";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Users,
  Droplets,
  Cake,
  UserPlus,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { Avatar, Card, Chip, Modal } from "@/components/ui";
import { bmi, bmiCategory, cn } from "@/lib/utils";
import type { Assessment } from "@/lib/types";

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
  const [toDelete, setToDelete] = useState<LitePatient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const closeDelete = () => {
    if (deleting) return;
    setToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/patients/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setDeleteError(json.error ?? "No se pudo eliminar el paciente");
        return;
      }
      setToDelete(null);
      router.refresh();
    } catch {
      setDeleteError("No se pudo eliminar. Revisa tu conexión.");
    } finally {
      setDeleting(false);
    }
  };

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
            <Mascot size={56} />
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900">
                Panela
              </p>
              <p className="-mt-0.5 text-[11px] font-semibold text-slate-500">
                Plataforma de cuidado integral
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="leaf" icon="ShieldCheck" className="hidden sm:inline-flex">
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
            <span className="bg-gradient-to-r from-brand-600 to-aqua-500 bg-clip-text text-transparent">
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
                "group relative animate-fade-up overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-pop)]"
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
                      <Chip key={c} tone="brand">
                        {c}
                      </Chip>
                    ))
                  ) : (
                    <Chip tone="leaf" icon="Heart">
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
              <button
                onClick={() => setToDelete(p)}
                aria-label={`Eliminar a ${p.name}`}
                title="Eliminar paciente"
                className="absolute bottom-5 right-14 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-coral-50 hover:text-coral-600"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>

        {/* Pie */}
        <footer className="mt-auto pt-12">
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-white/80 bg-white/70 p-5 backdrop-blur sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-600">
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

      <Modal
        open={toDelete !== null}
        onClose={closeDelete}
        title="Eliminar paciente"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-slate-600">
            ¿Seguro que quieres eliminar a{" "}
            <strong className="text-slate-900">{toDelete?.name}</strong>? Se
            borrarán también sus medicamentos, comidas, ejercicios, rutina,
            signos vitales y todo su historial. Esta acción no se puede
            deshacer.
          </p>
          {deleteError && (
            <p className="rounded-xl bg-coral-50 px-3.5 py-2.5 text-xs font-bold text-coral-600">
              {deleteError}
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={closeDelete} className="btn-ghost flex-1" disabled={deleting}>
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 rounded-full bg-coral-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-coral-700 active:scale-[0.98] disabled:opacity-60"
            >
              {deleting ? "Eliminando…" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </Modal>

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
    // Valoración inicial
    heightCm: "",
    weightKg: "",
    skinfoldTricipital: "",
    skinfoldSuprailiac: "",
    skinfoldThigh: "",
    abdominalPerimeterCm: "",
    systolic: "",
    diastolic: "",
    heartRate: "",
    oxygen: "",
    exerciseBpTest: "not_done",
    exerciseBpPeak: "",
    preExerciseGlucose: "",
    tugSeconds: "",
    chairStandReps: "",
    fitnessNotes: "",
    wellbeing: "",
    mood: "",
    cognition: "",
    cognitionScore: "",
    nutritionStatus: "",
    appetite: "",
    chronicConstipation: false,
    nutritionNotes: "",
    fallsLastYear: "",
    mobilityAid: "none",
    independence: "",
    sleepHours: "",
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedPatient | null>(null);
  const [copied, setCopied] = useState(false);

  // Cierra y descarta todo: se usa tras crear el paciente o al pulsar "Cancelar".
  const close = () => {
    onClose();
    setTimeout(() => {
      setForm(empty);
      setError(null);
      setCreated(null);
      setCopied(false);
    }, 200);
  };

  // Cierre accidental (clic fuera, X, Escape): conserva el borrador del formulario.
  // Si ya se creó el paciente no hay borrador que guardar, así que se limpia todo.
  const dismiss = () => (created ? close() : onClose());

  const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(",", ".")));
  const conditionList = form.conditions
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const isDiabetic = conditionList.some((c) => c.toLowerCase().includes("diabet"));
  const bmiValue = bmi(num(form.weightKg), num(form.heightCm));
  const bmiCat = bmiValue ? bmiCategory(bmiValue) : null;

  const toggleCondition = (c: string) => {
    const has = conditionList.some((x) => x.toLowerCase() === c.toLowerCase());
    const next = has
      ? conditionList.filter((x) => x.toLowerCase() !== c.toLowerCase())
      : [...conditionList, c];
    setForm({ ...form, conditions: next.join(", ") });
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    const assessment: Assessment = {
      skinfoldTricipital: num(form.skinfoldTricipital),
      skinfoldSuprailiac: num(form.skinfoldSuprailiac),
      skinfoldThigh: num(form.skinfoldThigh),
      abdominalPerimeterCm: num(form.abdominalPerimeterCm),
      tugSeconds: num(form.tugSeconds),
      chairStandReps: num(form.chairStandReps),
      fitnessNotes: form.fitnessNotes.trim() || undefined,
      exerciseBpTest: form.exerciseBpTest as Assessment["exerciseBpTest"],
      exerciseBpPeak: form.exerciseBpPeak.trim() || undefined,
      preExerciseGlucose: isDiabetic ? num(form.preExerciseGlucose) : undefined,
      wellbeing: num(form.wellbeing),
      mood: (form.mood || undefined) as Assessment["mood"],
      cognition: (form.cognition || undefined) as Assessment["cognition"],
      cognitionScore: form.cognitionScore.trim() || undefined,
      nutritionStatus: (form.nutritionStatus || undefined) as Assessment["nutritionStatus"],
      appetite: (form.appetite || undefined) as Assessment["appetite"],
      chronicConstipation: form.chronicConstipation,
      nutritionNotes: form.nutritionNotes.trim() || undefined,
      fallsLastYear: num(form.fallsLastYear),
      mobilityAid: form.mobilityAid as Assessment["mobilityAid"],
      independence: (form.independence || undefined) as Assessment["independence"],
      sleepHours: num(form.sleepHours),
    };
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
          heightCm: num(form.heightCm),
          weightKg: num(form.weightKg),
          heartRate: num(form.heartRate),
          systolic: num(form.systolic),
          diastolic: num(form.diastolic),
          oxygen: num(form.oxygen),
          assessment,
          conditions: conditionList,
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
          <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600">
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
              <Check size={18} className="text-leaf-600" />
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
    <Modal open={open} onClose={dismiss} title="Nuevo paciente">
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
        <div className="flex flex-wrap gap-1.5">
          {CONDITION_PRESETS.map((c) => {
            const on = conditionList.some((x) => x.toLowerCase() === c.toLowerCase());
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCondition(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold transition",
                  on
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-brand-300"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>

        <FormSection title="Medidas corporales">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Peso (kg)">
              <input type="number" min={0} step="0.1" className="input" value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
            </Field>
            <Field label="Talla (cm)">
              <input type="number" min={0} className="input" value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
            </Field>
            <Field label="IMC (automático)">
              <div className="input flex items-center bg-slate-50 font-extrabold text-slate-700">
                {bmiValue ? String(bmiValue).replace(".", ",") : "—"}
                {bmiCat && (
                  <span className="ml-2 text-[10px] font-bold text-slate-400">{bmiCat.label}</span>
                )}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Perímetro abdominal (cm)">
              <input type="number" min={0} className="input" value={form.abdominalPerimeterCm}
                onChange={(e) => setForm({ ...form, abdominalPerimeterCm: e.target.value })} />
            </Field>
            <Field label="Sueño (horas por noche)">
              <input type="number" min={0} step="0.5" className="input" value={form.sleepHours}
                onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} />
            </Field>
          </div>
          <p className="-mb-1 text-[11px] font-bold text-slate-400">Pliegues cutáneos (mm)</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tricipital">
              <input type="number" min={0} step="0.5" className="input" value={form.skinfoldTricipital}
                onChange={(e) => setForm({ ...form, skinfoldTricipital: e.target.value })} />
            </Field>
            <Field label="Suprailíaco">
              <input type="number" min={0} step="0.5" className="input" value={form.skinfoldSuprailiac}
                onChange={(e) => setForm({ ...form, skinfoldSuprailiac: e.target.value })} />
            </Field>
            <Field label="Muslo">
              <input type="number" min={0} step="0.5" className="input" value={form.skinfoldThigh}
                onChange={(e) => setForm({ ...form, skinfoldThigh: e.target.value })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Signos vitales en reposo">
          <div className="grid grid-cols-4 gap-3">
            <Field label="PA sistólica">
              <input type="number" min={0} placeholder="120" className="input" value={form.systolic}
                onChange={(e) => setForm({ ...form, systolic: e.target.value })} />
            </Field>
            <Field label="PA diastólica">
              <input type="number" min={0} placeholder="80" className="input" value={form.diastolic}
                onChange={(e) => setForm({ ...form, diastolic: e.target.value })} />
            </Field>
            <Field label="F.C. (lpm)">
              <input type="number" min={0} className="input" value={form.heartRate}
                onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
            </Field>
            <Field label="SpO₂ (%)">
              <input type="number" min={0} max={100} className="input" value={form.oxygen}
                onChange={(e) => setForm({ ...form, oxygen: e.target.value })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Prueba física y ejercicio">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Levantarse y caminar, TUG (seg)">
              <input type="number" min={0} step="0.1" className="input" value={form.tugSeconds}
                onChange={(e) => setForm({ ...form, tugSeconds: e.target.value })} />
            </Field>
            <Field label="Sentarse y pararse en 30 s (rep.)">
              <input type="number" min={0} className="input" value={form.chairStandReps}
                onChange={(e) => setForm({ ...form, chairStandReps: e.target.value })} />
            </Field>
          </div>
          <div>
            <Field label="Test de hipertensión por el ejercicio">
              <select className="input" value={form.exerciseBpTest}
                onChange={(e) => setForm({ ...form, exerciseBpTest: e.target.value })}>
                <option value="not_done">No realizado</option>
                <option value="normal">Respuesta normal</option>
                <option value="hypertensive">Respuesta hipertensiva</option>
              </select>
            </Field>
          </div>
          {form.exerciseBpTest !== "not_done" && (
            <div>
            <Field label="PA máxima durante el esfuerzo">
              <input placeholder="Ej. 180/90" className="input" value={form.exerciseBpPeak}
                onChange={(e) => setForm({ ...form, exerciseBpPeak: e.target.value })} />
            </Field>
            </div>
          )}
          {isDiabetic && (
            <div>
            <Field label="Glicemia antes de iniciar ejercicio (mg/dL) — diabético">
              <input type="number" min={0} className="input" value={form.preExerciseGlucose}
                onChange={(e) => setForm({ ...form, preExerciseGlucose: e.target.value })} />
            </Field>
            </div>
          )}
          <div>
            <Field label="Notas de la prueba física">
              <input placeholder="Limitaciones, dolor, observaciones…" className="input" value={form.fitnessNotes}
                onChange={(e) => setForm({ ...form, fitnessNotes: e.target.value })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Bienestar subjetivo y cognición">
          <div className="grid grid-cols-2 gap-3">
            <Field label="¿Cómo se siente? (1 a 5)">
              <select className="input" value={form.wellbeing}
                onChange={(e) => setForm({ ...form, wellbeing: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="1">1 · Muy mal</option>
                <option value="2">2 · Mal</option>
                <option value="3">3 · Regular</option>
                <option value="4">4 · Bien</option>
                <option value="5">5 · Muy bien</option>
              </select>
            </Field>
            <Field label="Estado de ánimo">
              <select className="input" value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="good">Animado</option>
                <option value="low">Decaído / triste</option>
                <option value="anxious">Ansioso</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cognición">
              <select className="input" value={form.cognition}
                onChange={(e) => setForm({ ...form, cognition: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="normal">Normal</option>
                <option value="mild">Deterioro leve</option>
                <option value="moderate">Deterioro moderado</option>
                <option value="severe">Deterioro severo</option>
              </select>
            </Field>
            <Field label="Puntaje (MMSE / MoCA)">
              <input placeholder="Ej. 26/30" className="input" value={form.cognitionScore}
                onChange={(e) => setForm({ ...form, cognitionScore: e.target.value })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Evaluación nutricional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado nutricional">
              <select className="input" value={form.nutritionStatus}
                onChange={(e) => setForm({ ...form, nutritionStatus: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="normal">Normal</option>
                <option value="malnutrition_risk">Riesgo de desnutrición</option>
                <option value="malnutrition">Desnutrición</option>
                <option value="overweight">Sobrepeso</option>
                <option value="obesity">Obesidad</option>
              </select>
            </Field>
            <Field label="Apetito">
              <select className="input" value={form.appetite}
                onChange={(e) => setForm({ ...form, appetite: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="good">Bueno</option>
                <option value="regular">Regular</option>
                <option value="poor">Malo</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.chronicConstipation}
              onChange={(e) => setForm({ ...form, chronicConstipation: e.target.checked })}
            />
            Estreñimiento crónico
          </label>
          <div>
            <Field label="Notas de nutrición (dieta, intolerancias, hidratación)">
              <input  className="input" value={form.nutritionNotes}
                onChange={(e) => setForm({ ...form, nutritionNotes: e.target.value })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Funcionalidad y seguridad">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Caídas (último año)">
              <input type="number" min={0} className="input" value={form.fallsLastYear}
                onChange={(e) => setForm({ ...form, fallsLastYear: e.target.value })} />
            </Field>
            <Field label="Ayuda para caminar">
              <select className="input" value={form.mobilityAid}
                onChange={(e) => setForm({ ...form, mobilityAid: e.target.value })}>
                <option value="none">Ninguna</option>
                <option value="cane">Bastón</option>
                <option value="walker">Andador</option>
                <option value="wheelchair">Silla de ruedas</option>
              </select>
            </Field>
            <Field label="Independencia">
              <select className="input" value={form.independence}
                onChange={(e) => setForm({ ...form, independence: e.target.value })}>
                <option value="">Sin evaluar</option>
                <option value="independent">Independiente</option>
                <option value="partial">Ayuda parcial</option>
                <option value="dependent">Dependiente</option>
              </select>
            </Field>
          </div>
        </FormSection>

        {error && (
          <p className="rounded-xl bg-coral-50 px-3.5 py-2.5 text-xs font-bold text-coral-600">
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

const CONDITION_PRESETS = [
  "Diabetes",
  "Hipertensión arterial",
  "Estreñimiento crónico",
  "Dislipidemia",
  "Artrosis",
  "Osteoporosis",
];

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
      <legend className="px-1.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-600">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
