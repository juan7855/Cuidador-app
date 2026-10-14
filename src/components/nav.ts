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
    soft: "bg-brand-50",
    text: "text-brand-700",
    solid: "bg-brand-600",
    hex: "#31836f",
  },
  {
    id: "perfil",
    label: "Perfil clínico",
    short: "Perfil",
    description: "Historial, alergias, analíticas y equipo médico",
    icon: IdCard,
    soft: "bg-aqua-50",
    text: "text-aqua-700",
    solid: "bg-aqua-600",
    hex: "#329caf",
  },
  {
    id: "meds",
    label: "Medicamentos",
    short: "Medicación",
    description: "Tratamiento, tomas y adherencia",
    icon: Pill,
    soft: "bg-clay-50",
    text: "text-clay-700",
    solid: "bg-clay-600",
    hex: "#ad6540",
  },
  {
    id: "food",
    label: "Alimentación",
    short: "Alimentación",
    description: "Plan de comidas, hidratación y nutrición",
    icon: UtensilsCrossed,
    soft: "bg-leaf-50",
    text: "text-leaf-700",
    solid: "bg-leaf-600",
    hex: "#7a9a55",
  },
  {
    id: "exercise",
    label: "Ejercicio físico",
    short: "Ejercicio",
    description: "Plan semanal de movimiento y actividad",
    icon: Dumbbell,
    soft: "bg-sun-50",
    text: "text-sun-700",
    solid: "bg-sun-600",
    hex: "#d58c56",
  },
  {
    id: "mind",
    label: "Mente activa",
    short: "Mente",
    description: "Juegos cognitivos para entrenar la memoria",
    icon: Brain,
    soft: "bg-sun-50",
    text: "text-sun-700",
    solid: "bg-sun-600",
    hex: "#d58c56",
  },
  {
    id: "routine",
    label: "Rutina diaria",
    short: "Rutina",
    description: "Línea de tiempo de hábitos del día",
    icon: CalendarCheck,
    soft: "bg-ink-50",
    text: "text-ink-700",
    solid: "bg-ink-600",
    hex: "#303f49",
  },
  {
    id: "community",
    label: "Comunidad",
    short: "Comunidad",
    description: "Foro y mensajes con otros pacientes en MiSalud",
    icon: MessagesSquare,
    soft: "bg-aqua-50",
    text: "text-aqua-700",
    solid: "bg-aqua-600",
    hex: "#329caf",
  },
];

export const sectionById = (id: SectionId): SectionDef =>
  SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
