"use client";

import { SectionHeader, NoticeCard } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { buildAlerts } from "@/lib/alerts";
import type { DashboardData } from "@/lib/types";

export default function Avisos({ data }: { data: DashboardData }) {
  const def = sectionById("avisos");
  const alerts = buildAlerts(data);

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} />

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-leaf-50/70 py-12 text-center">
          <p className="text-sm font-bold text-leaf-800">Todo al día</p>
          <p className="text-xs font-medium text-leaf-700/80">
            No hay pendientes ni alertas en este momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {alerts.map((a) => (
            <NoticeCard
              key={a.id}
              tone={a.severity === "warn" ? "sun" : a.tone}
              icon={a.icon}
              title={a.severity === "warn" ? "Necesita atención" : "Pendiente"}
            >
              {a.text}
            </NoticeCard>
          ))}
        </div>
      )}
    </div>
  );
}
