import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/nav";
import MigrateLocalStorage from "@/components/migrate-local-storage";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Arcade Vault — Biblioteca de Videojuegos Retro",
  description:
    "Juega a los clásicos del arcade online, compite por la puntuación más alta y demuestra quién es el mejor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${pixelFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <MigrateLocalStorage />
        {/* fondo: grid en perspectiva + scanlines + noise — fixed, no interactivo */}
        <div className="av-bg" aria-hidden />
        <div className="av-noise" aria-hidden />
        {/* contenido por encima de las capas de fondo (rol de #root en el prototipo) */}
        <div className="relative z-[2] flex min-h-full flex-col">
          <Nav />
          <main className="av-main flex-1">{children}</main>
          <footer className="border-line text-ink-faint border-t px-8 py-5 text-center font-mono text-[11px] tracking-[0.16em]">
            © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
          </footer>
        </div>
      </body>
    </html>
  );
}
