"use client";

import { useState } from "react";
import { MessagesSquare } from "lucide-react";
import { Card, Toggle } from "@/components/ui";
import { SectionHeader, NoticeCard } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import type { DashboardData } from "@/lib/types";

export default function Comunidad({
  data,
  onChanged,
}: {
  data: DashboardData;
  onChanged: () => Promise<void>;
}) {
  const def = sectionById("community");
  const p = data.patient;
  const { member, addedAt } = data.community;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = p.name.split(" ")[0];

  const toggle = async (next: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${p.id}/community`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) {
        setError("No se pudo actualizar. Intenta de nuevo.");
        return;
      }
      await onChanged();
    } catch {
      setError("No se pudo actualizar. Revisa tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  const since = addedAt
    ? new Date(addedAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader
        def={def}
        subtitle={`Acceso de ${firstName} al foro y los mensajes de MiSalud`}
      />

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                member ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              <MessagesSquare size={22} strokeWidth={2.3} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {member ? "En la comunidad" : "Fuera de la comunidad"}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {member
                  ? since
                    ? `Agregado el ${since}`
                    : "Puede ver el foro y escribir a otros pacientes"
                  : "Todavía no puede usar el foro ni enviar mensajes"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
            )}
            <Toggle
              checked={member}
              onChange={toggle}
              label={`Agregar a ${firstName} a la comunidad`}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600">
            {error}
          </p>
        )}

        <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-600">
          {member ? (
            <>
              <strong className="text-slate-800">{firstName}</strong> ya ve la
              sección Comunidad en MiSalud: puede leer y publicar en el foro
              general, y enviar mensajes directos a cualquier otro paciente
              que también esté agregado. Puedes quitarlo cuando quieras con el
              interruptor de arriba.
            </>
          ) : (
            <>
              La Comunidad de MiSalud es un espacio cerrado: solo entran los
              pacientes que su cuidador agrega explícitamente. Activa el
              interruptor para que <strong className="text-slate-800">{firstName}</strong>{" "}
              pueda ver el foro general y escribir mensajes directos con otros
              pacientes que también estén agregados.
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        <NoticeCard tone="blue" icon="Users" title="Quién puede verse">
          Solo los pacientes agregados a la comunidad pueden verse entre sí y
          enviarse mensajes directos. Quitar a {firstName} de aquí lo saca de
          esa lista al instante.
        </NoticeCard>
        <NoticeCard tone="amber" icon="ShieldAlert" title="Moderación pendiente">
          Los reportes de contenido del foro se revisan de forma manual y
          todavía no tienen una pantalla en esta app. Por ahora, esta sección
          solo controla quién entra a la comunidad.
        </NoticeCard>
      </div>
    </div>
  );
}
