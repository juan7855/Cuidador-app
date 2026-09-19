import {
  LayoutDashboard,
  IdCard,
  Pill,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

export type SectionId =
  | "panel"
  | "perfil"
  | "meds"
  | "food"
  | "exercise"
  | "mind"
  | "routine";

export interface SectionDef {
  id: SectionId;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  /** clases Tailwind literales para el acento de color de la sección */
  soft: string;
  text: string;
  solid: string;
  hex: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: "panel",
    label: "Panel general",
    short: "Inicio",
    description: "Resumen del día y constantes vitales",
    icon: LayoutDashboard,
    soft: "bg-blue-50",
    text: "text-blue-700",
    solid: "bg-blue-600",
    hex: "#2563eb",
  },
  {
    id: "perfil",
    label: "Perfil clínico",
    short: "Perfil",
    description: "Historial, alergias, analíticas y equipo médico",
    icon: IdCard,
    soft: "bg-cyan-50",
    text: "text-cyan-700",
    solid: "bg-cyan-600",
    hex: "#0891b2",
  },
  {
    id: "meds",
    label: "Medicamentos",
    short: "Medicación",
    description: "Tratamiento, tomas y adherencia",
    icon: Pill,
    soft: "bg-violet-50",
    text: "text-violet-700",
    solid: "bg-violet-600",
    hex: "#7c3aed",
  },
  {
    id: "food",
    label: "Alimentación",
    short: "Alimentación",
    description: "Plan de comidas, hidratación y nutrición",
    icon: UtensilsCrossed,
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    solid: "bg-emerald-600",
    hex: "#059669",
  },
  {
    id: "exercise",
    label: "Ejercicio físico",
    short: "Ejercicio",
    description: "Plan semanal de movimiento y actividad",
    icon: Dumbbell,
    soft: "bg-orange-50",
    text: "text-orange-700",
    solid: "bg-orange-600",
    hex: "#ea580c",
  },
  {
    id: "mind",
    label: "Mente activa",
    short: "Mente",
    description: "Juegos cognitivos para entrenar la memoria",
    icon: Brain,
    soft: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    solid: "bg-fuchsia-600",
    hex: "#c026d3",
  },
  {
    id: "routine",
    label: "Rutina diaria",
    short: "Rutina",
    description: "Línea de tiempo de hábitos del día",
    icon: CalendarCheck,
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    solid: "bg-indigo-600",
    hex: "#4f46e5",
  },
];

export const sectionById = (id: SectionId): SectionDef =>
  SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
