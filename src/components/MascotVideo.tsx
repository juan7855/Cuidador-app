"use client";

import { useEffect, useRef, useState } from "react";
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

// Proporción de Mascot.tsx: placeholder razonable mientras se conoce la
// proporción real del video (llega casi al instante con loadedmetadata).
const DEFAULT_RATIO = 434 / 600;

// Los clips traen un fondo negro sólido "horneado" (son H.264 normal, sin
// canal alfa). Para quitarlo sin arriesgarnos a perforar los ojos del
// personaje (también negros) no hacemos un recorte por color a ciegas:
// solo se vuelven transparentes los píxeles oscuros conectados al BORDE del
// cuadro (inundación desde el marco). Como el personaje siempre queda con
// margen dentro del encuadre, sus propios detalles oscuros nunca tocan el
// borde y quedan intactos pase lo que pase con el umbral de color.
const HARD_MAX = 28; // canal máximo para considerar un píxel "fondo seguro"
const SOFT_MAX = 85; // banda de suavizado del borde del recorte

function keyOutBackground(data: Uint8ClampedArray, w: number, h: number) {
  const n = w * h;
  const bg = new Uint8Array(n); // 1 = fondo, conectado al borde del cuadro
  const stack: number[] = [];

  const isHardBg = (i: number) => {
    const o = i * 4;
    return data[o] <= HARD_MAX && data[o + 1] <= HARD_MAX && data[o + 2] <= HARD_MAX;
  };

  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = y * w + x;
      if (!bg[i] && isHardBg(i)) {
        bg[i] = 1;
        stack.push(i);
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = y * w + x;
      if (!bg[i] && isHardBg(i)) {
        bg[i] = 1;
        stack.push(i);
      }
    }
  }

  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0 && !bg[i - 1] && isHardBg(i - 1)) {
      bg[i - 1] = 1;
      stack.push(i - 1);
    }
    if (x < w - 1 && !bg[i + 1] && isHardBg(i + 1)) {
      bg[i + 1] = 1;
      stack.push(i + 1);
    }
    if (y > 0 && !bg[i - w] && isHardBg(i - w)) {
      bg[i - w] = 1;
      stack.push(i - w);
    }
    if (y < h - 1 && !bg[i + w] && isHardBg(i + w)) {
      bg[i + w] = 1;
      stack.push(i + w);
    }
  }

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (bg[i]) {
      data[o + 3] = 0;
      continue;
    }
    // Un píxel que no es "fondo duro" pero sí oscuro y linda con uno que sí
    // lo es se vuelve parcialmente transparente, para no dejar un borde
    // serrado en el recorte.
    const x = i % w;
    const y = (i / w) | 0;
    const maxCh = Math.max(data[o], data[o + 1], data[o + 2]);
    if (maxCh > SOFT_MAX) continue;
    const touchesBg =
      (x > 0 && bg[i - 1]) ||
      (x < w - 1 && bg[i + 1]) ||
      (y > 0 && bg[i - w]) ||
      (y < h - 1 && bg[i + w]);
    if (touchesBg) {
      const t = Math.max(0, Math.min(1, (maxCh - HARD_MAX) / (SOFT_MAX - HARD_MAX)));
      data[o + 3] = Math.round(255 * t);
    }
  }
}

/**
 * Personaje Panela animado. Sin `pose` (o con "reducir movimiento"
 * activado) cae al `Mascot` estático, igual que el resto de animaciones
 * decorativas de la app. Pinta el video en un <canvas> para poder quitarle
 * el fondo negro con una inundación desde el borde (ver keyOutBackground).
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
  const active = Boolean(pose) && !reducedMotion;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        setRatio(video.videoWidth / video.videoHeight);
      }
    };
    const onCanPlay = () => setReady(true);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("canplay", onCanPlay);

    let raf = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w && h && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        keyOutBackground(frame.data, w, h);
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [active]);

  if (!pose || reducedMotion) {
    return <Mascot size={size} className={className} />;
  }

  const height = Math.round(size);
  const width = Math.round(size * ratio);

  return (
    <span
      className={cn("relative inline-block select-none", className)}
      style={{ height, width }}
    >
      {!ready && <Mascot size={size} className="absolute inset-0" />}
      <video
        ref={videoRef}
        src={SRC[pose]}
        autoPlay
        muted
        loop={loop}
        playsInline
        preload="auto"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn(
          "block h-full w-full transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
  );
}
