"use client";

import {
  Phone,
  Siren,
  Cake,
  Ruler,
  Weight,
  Droplet,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Stethoscope,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Card, CardTitle, Chip, Avatar, DyIcon, LineChart, MiniBars } from "@/components/ui";
import { SectionHeader, StatTile } from "@/components/sections/_shared";
import { sectionById } from "@/components/nav";
import { bmi, bmiCategory, cn, isToday, toneOf } from "@/lib/utils";
import type { DashboardData } from "@/lib/types";

export default function PerfilClinico({ data }: { data: DashboardData }) {
  const def = sectionById("perfil");
  const p = data.patient;
  const v = data.todayVital;
  const value = bmi(p.weightKg, p.heightCm);
  const cat = value ? bmiCategory(value) : null;

  const birth = p.birthDate.split("-").reverse().join("/");
  const emergency = p.emergencyContact as
    | { name: string; phone: string; relation: string }
    | null;

  return (
    <div className="stagger flex flex-col gap-5 sm:gap-6">
      <SectionHeader def={def} subtitle={`Ficha clínica de ${p.name}`} />

      {/* Tarjeta de identificación */}
      <Card className="overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-r from-cyan-500 via-sky-500 to-brand-500 sm:h-28" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                name={p.name}
                from={p.avatarFrom}
                to={p.avatarTo}
                size={84}
                className="ring-4 ring-white"
              />
              <div className="pb-1">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {p.name}
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  {p.relation} · {p.age} años · {p.gender === "F" ? "Mujer" : "Hombre"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-1">
              {p.bloodType && (
                <Chip tone="rose" icon="Droplet">
                  Grupo {p.bloodType}
                </Chip>
              )}
              {p.conditions.slice(0, 2).map((c) => (
                <Chip key={c} tone="cyan" icon="HeartPulse">
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                <Phone size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Teléfono
                </p>
                <p className="truncate text-sm font-extrabold text-slate-700">
                  {p.phone ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <ShieldCheck size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Seguro médico
                </p>
                <p className="truncate text-sm font-extrabold text-slate-700">
                  {p.insurance ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <MapPin size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Domicilio
                </p>
                <p className="truncate text-sm font-extrabold text-slate-700">
                  {p.address ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Datos + salud + contacto */}
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <CardTitle icon="IdCard" tone="cyan" title="Datos personales" />
          <dl className="flex flex-col gap-3">
            <DataRow icon={<Cake size={16} />} label="Fecha de nacimiento" value={birth} />
            <DataRow icon={<Ruler size={16} />} label="Altura" value={`${Math.round(p.heightCm ?? 0)} cm`} />
            <DataRow
              icon={<Weight size={16} />}
              label="Peso"
              value={`${(p.weightKg ?? 0).toFixed(1).replace(".", ",")} kg`}
            />
            <DataRow
              icon={<Droplet size={16} />}
              label="Grupo sanguíneo"
              value={p.bloodType ?? "—"}
            />
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-cyan-50/70 px-3.5 py-3">
              <span className="flex items-center gap-2.5 text-xs font-bold text-cyan-800">
                <DyIcon name="Calculator" size={16} />
                IMC
              </span>
              <span className="flex items-center gap-2">
                <strong className="text-sm font-extrabold text-cyan-900">
                  {value ? String(value).replace(".", ",") : "—"}
                </strong>
                {cat && (
                  <span
                    className={cn(
                      "chip px-2 py-0.5 text-[10px]",
                      toneOf(cat.tone).soft,
                      toneOf(cat.tone).text
                    )}
                  >
                    {cat.label}
                  </span>
                )}
              </span>
            </div>
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardTitle icon="Stethoscope" tone="violet" title="Historial de salud" />
          <div className="flex flex-col gap-4">
            <InfoGroup
              icon="HeartPulse"
              tone="rose"
              title="Patologías crónicas"
              items={p.conditions}
              empty="Sin patologías registradas"
            />
            <InfoGroup
              icon="ShieldAlert"
              tone="amber"
              title="Alergias"
              items={p.allergies}
              empty="Sin alergias conocidas"
            />
            <InfoGroup
              icon="Pill"
              tone="violet"
              title="Medicación habitual"
              items={p.chronicMeds}
              empty="Sin medicación crónica"
            />
          </div>
          {p.notes && (
            <div className="mt-4 rounded-2xl bg-amber-50/70 p-3.5">
              <p className="flex items-center gap-2 text-xs font-extrabold text-amber-800">
                <FileText size={14} />
                Observaciones de enfermería
              </p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-amber-900/80">
                {p.notes}
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-5 sm:gap-6">
          {emergency && (
            <Card className="overflow-hidden border-transparent bg-gradient-to-br from-rose-500 to-red-600 p-5 text-white sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  <Siren size={22} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                    Contacto de emergencia
                  </p>
                  <p className="text-base font-extrabold">{emergency.name}</p>
                </div>
              </div>
              <a
                href={`tel:${emergency.phone.replace(/\s/g, "")}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-rose-600 shadow-lg transition hover:bg-rose-50 active:scale-[0.98]"
              >
                <PhoneCall size={17} />
                Llamar · {emergency.phone}
              </a>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <CardTitle icon="Users" tone="blue" title="Equipo médico" />
            <ul className="flex flex-col gap-3">
              {(p.doctors ?? []).map((d, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Stethoscope size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">
                      {d.name}
                    </p>
                    <p className="truncate text-xs font-medium text-slate-400">
                      {d.specialty}
                    </p>
                  </div>
                  <a
                    href={`tel:${d.phone.replace(/\s/g, "")}`}
                    aria-label={`Llamar a ${d.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                  >
                    <Phone size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Analíticas */}
      <Card className="p-5 sm:p-6">
        <CardTitle
          icon="ClipboardList"
          tone="teal"
          title="Analíticas recientes"
          subtitle="Últimos resultados de laboratorio"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4">Parámetro</th>
                <th className="pb-3 pr-4">Resultado</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(p.labs ?? []).map((l, i) => {
                const t =
                  l.status === "normal"
                    ? toneOf("emerald")
                    : l.status === "high"
                      ? toneOf("rose")
                      : toneOf("amber");
                return (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-bold text-slate-700">{l.name}</td>
                    <td className="py-3 pr-4 font-extrabold text-slate-900">{l.value}</td>
                    <td className="py-3 pr-4">
                      <span className={cn("chip", t.soft, t.text)}>
                        <DyIcon
                          name={l.status === "normal" ? "CheckCircle2" : "AlertCircle"}
                          size={13}
                        />
                        {l.status === "normal"
                          ? "Normal"
                          : l.status === "high"
                            ? "Alto"
                            : "Bajo"}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-semibold text-slate-400">
                      {l.date.split("-").reverse().join("/")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Evolción */}
      <div>
        <h3 className="mb-3 px-1 text-sm font-extrabold uppercase tracking-wide text-slate-400">
          Evolción · últimos 7 días
        </h3>
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          <StatTile
            icon="HeartPulse"
            tone="rose"
            label="Pulso medio"
            value={Math.round(avg(data.vitals.map((x) => x.heartRate)))}
            unit="lpm"
            footer={
              <LineChart
                height={56}
                series={[
                  {
                    values: data.vitals.map((x) => x.heartRate ?? 0),
                    color: "#e11d48",
                    fill: "#e11d4822",
                    width: 2,
                  },
                ]}
              />
            }
          />
          <StatTile
            icon="Activity"
            tone="blue"
            label="Presión arterial"
            value={`${v?.systolic}/${v?.diastolic}`}
            unit="mmHg"
            footer={
              <LineChart
                height={56}
                series={[
                  { values: data.vitals.map((x) => x.systolic ?? 0), color: "#2563eb", width: 2 },
                  { values: data.vitals.map((x) => x.diastolic ?? 0), color: "#38bdf8", width: 2 },
                ]}
              />
            }
          />
          <StatTile
            icon="Footprints"
            tone="emerald"
            label="Pasos hoy"
            value={(v?.steps ?? 0).toLocaleString("es-ES")}
            footer={
              <MiniBars
                height={48}
                max={Math.max(...data.week.map((w) => w.steps), 1)}
                items={data.week.map((w) => ({
                  label: w.weekdayShort[0].toUpperCase(),
                  value: w.steps,
                  highlight: isToday(w.date),
                  color: "#059669",
                }))}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

function DataRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <strong className="text-sm font-extrabold text-slate-800">{value}</strong>
    </div>
  );
}

function InfoGroup({
  icon,
  tone,
  title,
  items,
  empty,
}: {
  icon: string;
  tone: string;
  title: string;
  items: string[];
  empty: string;
}) {
  const t = toneOf(tone);
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", t.soft, t.text)}>
          <DyIcon name={icon} size={13} />
        </span>
        {title}
      </p>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <Chip key={i} tone={tone}>
              {i}
            </Chip>
          ))}
        </div>
      ) : (
        <p className="text-xs font-medium text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function avg(xs: (number | null | undefined)[]) {
  const vals = xs.filter((x): x is number => x != null);
  return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
}
