import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panela · Plataforma de salud",
  description:
    "Seguimiento integral de la salud: medicación, alimentación, ejercicio, estimulación cognitiva y rutina diaria.",
};

export const viewport: Viewport = {
  themeColor: "#009a74",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
