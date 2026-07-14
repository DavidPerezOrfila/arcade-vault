"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearUser, getUser } from "@/app/data/storage";
import type { User } from "@/app/data/types";

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" ||
        pathname.startsWith("/detalle") ||
        pathname.startsWith("/player")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = () => {
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
          <Link href="/" className={isActive("/") ? "active" : ""}>
            BIBLIOTECA
          </Link>
          <Link href="/reproductor" className={isActive("/reproductor") ? "active" : ""}>
            REPRODUCTOR
          </Link>
          <Link href="/salon" className={isActive("/salon") ? "active" : ""}>
            SALÓN
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" aria-hidden />
          <span>CRÉDITOS · 03</span>
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
        className={`av-mobile-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`av-mobile-panel${mobileOpen ? " open" : ""}`}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link
          href="/"
          className={isActive("/") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          Biblioteca
        </Link>
        <Link
          href="/reproductor"
          className={isActive("/reproductor") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          Reproductor
        </Link>
        <Link
          href="/salon"
          className={isActive("/salon") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          Salón de la Fama
        </Link>
        <Link
          href="/auth"
          className={isActive("/auth") ? "active" : ""}
          onClick={() => setMobileOpen(false)}
        >
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }} />
        <div
          className="pixel"
          style={{
            fontSize: 9,
            color: "var(--ink-faint)",
            letterSpacing: "0.16em",
          }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
