"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { clearUser, getUser } from "@/app/data/storage";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSkin } from "@/components/skin/SkinProvider";
import { SKIN_IDS, type SkinId } from "@/lib/games/skins";
import type { User } from "@/app/data/types";

// Fuente única de links del nav: desktop (mayúsculas) y panel mobile comparten
// el mismo href; isActive cubre el prefijo /games y /player.
const NAV_LINKS = [
  { href: "/", desktopLabel: "INICIO", mobileLabel: "Inicio" },
  { href: "/games", desktopLabel: "BIBLIOTECA", mobileLabel: "Biblioteca" },
  { href: "/salon", desktopLabel: "SALÓN", mobileLabel: "Salón de la Fama" },
  { href: "/about", desktopLabel: "ACERCA DE", mobileLabel: "Acerca de" },
] as const;

const SKIN_LABELS: Record<SkinId, string> = {
  clasico: "CLÁSICO",
  neon: "NEÓN",
  retro: "RETRO",
};

export default function Nav() {
  const pathname = usePathname();
  const { skin, setSkin } = useSkin();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/games") {
      return (
        pathname === "/games" ||
        pathname.startsWith("/games/") ||
        pathname.startsWith("/player")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = () => {
    // La sesión real de Supabase Auth llega con el flujo de auth; hoy signOut
    // es idempotente (sin sesión no-op) y clearUser limpia localStorage.
    void createSupabaseBrowserClient().auth.signOut();
    clearUser();
    setUser(null);
  };

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden />
          <span className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </span>
        </Link>
        <div className="links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
            >
              {link.desktopLabel}
            </Link>
          ))}
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" aria-hidden />
          <span>CRÉDITOS · 03</span>
        </div>
        <div className="skin-switcher" role="group" aria-label="Skin">
          {SKIN_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`skin-switcher-btn${skin === id ? "active" : ""}`}
              onClick={() => setSkin(id)}
              aria-pressed={skin === id}
            >
              {SKIN_LABELS[id]}
            </button>
          ))}
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={handleSignOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button
          className="btn ghost hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={`av-mobile-backdrop${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`av-mobile-panel${mobileOpen ? "open" : ""}`}>
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? "active" : ""}
            onClick={() => setMobileOpen(false)}
          >
            {link.mobileLabel}
          </Link>
        ))}
        <Link
          href="/auth"
          className={isActive("/auth") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div className="skin-switcher" role="group" aria-label="Skin">
          {SKIN_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`skin-switcher-btn${skin === id ? "active" : ""}`}
              onClick={() => setSkin(id)}
              aria-pressed={skin === id}
            >
              {SKIN_LABELS[id]}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="pixel text-ink-faint text-[9px] tracking-[0.16em]">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
