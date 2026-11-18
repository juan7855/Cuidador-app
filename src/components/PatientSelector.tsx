"use client";

import MascotVideo from "@/components/MascotVideo";
import NewPatientWizard from "@/components/NewPatientWizard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Droplets,
  Cake,
  UserPlus,
  Trash2,
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
          <div className="flex items-center gap-4">
            <MascotVideo pose="pregunta" size={96} />
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                Panela
              </p>
              <p className="-mt-0.5 text-xs font-semibold text-slate-500">
                Plataforma de cuidado integral
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <UserPlus size={17} strokeWidth={2.6} />
              <span className="hidden sm:inline">Nuevo paciente</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </header>

        {/* Encabezado */}
        <div className="mt-10 max-w-2xl sm:mt-16">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            ¿A quién cuidamos{" "}
            <span className="text-brand-500">
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

                <h2 className="relative mt-4 text-xl font-bold tracking-tight text-slate-900">
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
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur sm:flex-row sm:items-center">
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

      <NewPatientWizard
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
