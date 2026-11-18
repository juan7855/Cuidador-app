import { hourLabel } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

export interface Alert {
  id: string;
  icon: string;
  tone: string;
  text: string;
  severity: "info" | "warn";
}

/**
 * Lista de avisos derivada de DashboardData (sin persistencia ni estado de
 * leído/no leído): la usan tanto la campanita de AppChrome (recortada a 3)
 * como la sección "Avisos" (completa).
 */
export function buildAlerts(data: DashboardData): Alert[] {
  const out: Alert[] = [];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const pendingMeds = data.meds
    .filter((m) => m.scheduled && !m.takenToday)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextMed =
    pendingMeds.find((m) => {
      const [h, mi] = m.time.split(":").map(Number);
      return h * 60 + mi >= nowMin;
    }) ?? pendingMeds[0];
  if (nextMed) {
    out.push({
      id: `med-${nextMed.id}`,
      icon: "Pill",
      tone: "clay",
      text: `${nextMed.name} ${nextMed.dosage} · ${hourLabel(nextMed.time)}`,
      severity: "info",
    });
  }

  const pendingTask = data.routine
    .filter((t) => !t.doneToday)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  if (pendingTask) {
    out.push({
      id: `task-${pendingTask.id}`,
      icon: pendingTask.icon,
      tone: "ink",
      text: `${pendingTask.title} · ${hourLabel(pendingTask.time)}`,
      severity: "info",
    });
  }

  const goal = data.patient.goals?.waterGlasses ?? 8;
  if (data.water < goal) {
    out.push({
      id: "water",
      icon: "Droplets",
      tone: "aqua",
      text: `Hidratación: llevas ${data.water} de ${goal} vasos`,
      severity: "info",
    });
  }

  const lowStock = data.meds.filter((m) => m.stock <= m.lowStockAt);
  for (const m of lowStock) {
    out.push({
      id: `stock-${m.id}`,
      icon: "PackageX",
      tone: "sun",
      text: `Quedan pocas unidades de ${m.name}: pide cita o renueva la receta`,
      severity: "warn",
    });
  }

  return out;
}
