import {
  LayoutDashboard,
  IdCard,
  Pill,
  UtensilsCrossed,
  Dumbbell,
  Brain,
  CalendarCheck,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export type SectionId =
  | "panel"
  | "perfil"
  | "meds"
  | "food"
  | "exercise"
  | "mind"
  | "routine"
  | "community";

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
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "perfil",
    label: "Perfil clínico",
    short: "Perfil",
    description: "Historial, alergias, analíticas y equipo médico",
    icon: IdCard,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "meds",
    label: "Medicamentos",
    short: "Medicación",
    description: "Tratamiento, tomas y adherencia",
    icon: Pill,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "food",
    label: "Alimentación",
    short: "Alimentación",
    description: "Plan de comidas, hidratación y nutrición",
    icon: UtensilsCrossed,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "exercise",
    label: "Ejercicio físico",
    short: "Ejercicio",
    description: "Plan semanal de movimiento y actividad",
    icon: Dumbbell,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "mind",
    label: "Mente activa",
    short: "Mente",
    description: "Juegos cognitivos para entrenar la memoria",
    icon: Brain,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "routine",
    label: "Rutina diaria",
    short: "Rutina",
    description: "Línea de tiempo de hábitos del día",
    icon: CalendarCheck,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
  {
    id: "community",
    label: "Comunidad",
    short: "Comunidad",
    description: "Foro y mensajes con otros pacientes en MiSalud",
    icon: MessagesSquare,
    soft: "bg-brand-100",
    text: "text-brand-700",
    solid: "bg-brand-500",
    hex: "#009a74",
  },
];

export const sectionById = (id: SectionId): SectionDef =>
  SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
