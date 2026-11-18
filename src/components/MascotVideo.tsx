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

// Proporción de Mascot.tsx, usada solo mientras se calcula el recorte.
const DEFAULT_RATIO = 434 / 600;

// Los clips traen un fondo negro sólido "horneado" (H.264 sin canal alfa).
// Solo se vuelven transparentes los píxeles oscuros conectados al BORDE del
// cuadro: los ojos y demás detalles negros del personaje no tocan el borde,
// así que nunca se perforan.
const HARD_MAX = 28; // canal máximo para considerar un píxel "fondo seguro"
const SOFT_MAX = 85; // banda de suavizado del borde del recorte

// Análisis de recorte: se hace a poca resolución y en 4 instantes del clip,
// para que el contorno del personaje sea el de todo el movimiento y no el
// de un solo fotograma.
const ANALYSIS_MAX_W = 480;
const ANALYSIS_TIMES = [0, 0.25, 0.5, 0.75];
const SUPERSAMPLE = 2; // resolución interna del canvas respecto al tamaño en pantalla

interface Crop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

function keyOutBackground(data: Uint8ClampedArray, w: number, h: number) {
  const n = w * h;
  const bg = new Uint8Array(n);
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

function waitForData(video: HTMLVideoElement) {
  if (video.readyState >= 2) return Promise.resolve();
  return new Promise<void>((resolve) =>
    video.addEventListener("loadeddata", () => resolve(), { once: true })
  );
}

function seekTo(video: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    if (Math.abs(video.currentTime - t) < 0.02) return resolve();
    const done = () => {
      clearTimeout(timer);
      video.removeEventListener("seeked", done);
      resolve();
    };
    const timer = setTimeout(done, 1500);
    video.addEventListener("seeked", done);
    video.currentTime = t;
  });
}

const cropCache = new Map<string, Promise<Crop>>();

// Calcula una sola vez por clip el rectángulo que contiene al personaje en
// todos los instantes muestreados, para que los 4 videos tengan el mismo
// tratamiento de encuadre y no queden con márgenes distintos.
function analyzeClip(src: string, video: HTMLVideoElement): Promise<Crop> {
  const cached = cropCache.get(src);
  if (cached) return cached;

  const job = (async (): Promise<Crop> => {
    await waitForData(video);
    const W = video.videoWidth;
    const H = video.videoHeight;
    const full: Crop = { sx: 0, sy: 0, sw: W, sh: H };
    try {
      const scale = Math.min(1, ANALYSIS_MAX_W / W);
      const w = Math.round(W * scale);
      const h = Math.round(H * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return full;

      video.pause();
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;
      for (const f of ANALYSIS_TIMES) {
        await seekTo(video, f * duration);
        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        keyOutBackground(img.data, w, h);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (img.data[(y * w + x) * 4 + 3] > 16) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      }
      video.currentTime = 0;
      video.play().catch(() => {});

      if (maxX < 0) return full;
      const pad = Math.round(0.03 * Math.max(maxX - minX, maxY - minY));
      const x0 = Math.max(0, Math.floor((minX - pad) / scale));
      const y0 = Math.max(0, Math.floor((minY - pad) / scale));
      const x1 = Math.min(W, Math.ceil((maxX + 1 + pad) / scale));
      const y1 = Math.min(H, Math.ceil((maxY + 1 + pad) / scale));
      return { sx: x0, sy: y0, sw: x1 - x0, sh: y1 - y0 };
    } catch {
      return full;
    }
  })();

  cropCache.set(src, job);
  return job;
}

/**
 * Personaje Panela animado, recortado al contorno del personaje para que
 * `size` sea su altura real en pantalla. Sin `pose` (o con "reducir
 * movimiento" activado) cae al `Mascot` estático.
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
  const src = pose ? SRC[pose] : null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<{ src: string; crop: Crop } | null>(null);
  const [ready, setReady] = useState(false);

  const crop = analysis && analysis.src === src ? analysis.crop : null;

  useEffect(() => {
    if (!src || !active) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    analyzeClip(src, video).then((c) => {
      if (!cancelled) setAnalysis({ src, crop: c });
    });
    return () => {
      cancelled = true;
    };
  }, [src, active]);

  useEffect(() => {
    if (!crop || !active) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let warned = false;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w && h && video.readyState >= 2) {
        ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
        try {
          const frame = ctx.getImageData(0, 0, w, h);
          keyOutBackground(frame.data, w, h);
          ctx.putImageData(frame, 0, 0);
        } catch (err) {
          if (!warned) {
            warned = true;
            console.error("MascotVideo: no se pudo leer el frame del canvas", err);
          }
        }
        setReady(true);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [crop, active]);

  if (!pose || reducedMotion) {
    return <Mascot size={size} className={className} />;
  }

  const aspect = crop ? crop.sw / crop.sh : DEFAULT_RATIO;
  const height = Math.round(size);
  const width = Math.round(size * aspect);

  return (
    <span
      className={cn("relative inline-block select-none", className)}
      style={{ height, width }}
    >
      {!ready && <Mascot size={size} className="absolute inset-0" />}
      {/*
        No se usa display:none: varios navegadores dejan de decodificar
        frames de un <video> oculto así, y el canvas se queda en blanco.
      */}
      <video
        ref={videoRef}
        src={SRC[pose]}
        autoPlay
        muted
        loop={loop}
        playsInline
        preload="auto"
        aria-hidden
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />
      <canvas
        ref={canvasRef}
        width={Math.round(width * SUPERSAMPLE)}
        height={Math.round(height * SUPERSAMPLE)}
        className={cn(
          "block h-full w-full transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
  );
}
