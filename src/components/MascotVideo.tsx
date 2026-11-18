"use client";

import Mascot from "@/components/Mascot";
import { useReducedMotion } from "@/components/ui";
import { cn } from "@/lib/utils";

export type MascotPose = "escucha" | "pregunta" | "iconos" | "celebracion";

const SRC: Record<MascotPose, string> = {
  escucha: "/videos/mascot/escucha.mp4",
  pregunta: "/videos/mascot/pregunta.mp4",
  iconos: "/videos/mascot/iconos.mp4",
  celebracion: "/videos/mascot/celebracion.mp4",
};

// Misma proporción que Mascot.tsx: sirve de ancho intrínseco mientras el
// video carga su metadata, para no saltar el layout.
const RATIO = 434 / 600;

/**
 * Personaje Panela animado. Sin `pose` (o con "reducir movimiento"
 * activado) cae al `Mascot` estático, igual que el resto de animaciones
 * decorativas de la app (ver @media prefers-reduced-motion en globals.css).
 */
export default function MascotVideo({
  pose,
  size = 48,
  className,
  loop = true,
}: {
  pose?: MascotPose;
  size?: number;
  className?: string;
  loop?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  if (!pose || reducedMotion) {
    return <Mascot size={size} className={className} />;
  }

  return (
    <video
      src={SRC[pose]}
      autoPlay
      muted
      loop={loop}
      playsInline
      preload="metadata"
      poster="/panela.png"
      width={Math.round(size * RATIO)}
      height={size}
      className={cn("block h-auto select-none", className)}
      style={{ height: size, width: "auto" }}
    />
  );
}
