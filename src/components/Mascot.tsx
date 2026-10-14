import Image from "next/image";
import { cn } from "@/lib/utils";

// Proporción del personaje recortado (434 × 600).
const RATIO = 434 / 600;

/** Personaje de la identidad visual Panela. `size` es el alto en píxeles. */
export default function Mascot({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/panela.png"
      alt="Panela"
      width={Math.round(size * RATIO)}
      height={size}
      priority
      className={cn("block h-auto select-none", className)}
      style={{ height: size, width: "auto" }}
    />
  );
}
