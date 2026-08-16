'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clearUser, getUser } from '@/app/data/storage';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSkin } from '@/components/skin/SkinProvider';
import {
  PALETTES,
  SKIN_IDS,
  SKIN_LABELS,
  type SkinId
} from '@/lib/games/skins';
import type { User } from '@/app/data/types';

// Fuente única de links del nav: desktop (mayúsculas) y panel mobile comparten
// el mismo href; isActive cubre el prefijo /games y /player.
const NAV_LINKS = [
  { href: '/', desktopLabel: 'INICIO', mobileLabel: 'Inicio' },
  { href: '/games', desktopLabel: 'BIBLIOTECA', mobileLabel: 'Biblioteca' },
  { href: '/salon', desktopLabel: 'SALÓN', mobileLabel: 'Salón de la Fama' },
  { href: '/about', desktopLabel: 'ACERCA DE', mobileLabel: 'Acerca de' }
] as const;

// Selector global de skin: dropdown con swatch del color del jugador activo.
function SkinSwitcher() {
  const { skin, setSkin } = useSkin();
  return (
    <div className='skin-switcher'>
      <span
        className='skin-swatch'
        style={{ backgroundColor: PALETTES[skin].player }}
        aria-hidden
      />
      <select
        value={skin}
        onChange={(event) => setSkin(event.target.value as SkinId)}
        aria-label='Seleccionar skin'
      >
        {SKIN_IDS.map((id) => (
          <option key={id} value={id}>
            {SKIN_LABELS[id]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/games') {
      return (
        pathname === '/games' ||
        pathname.startsWith('/games/') ||
        pathname.startsWith('/player')
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // En páginas de juego el selector vive dentro del propio juego; ocultar el global.
  const isGamePage = pathname.startsWith('/games/');

  const handleSignOut = () => {
    // La sesión real de Supabase Auth llega con el flujo de auth; hoy signOut
    // es idempotente (sin sesión no-op) y clearUser limpia localStorage.
    void createSupabaseBrowserClient().auth.signOut();
    clearUser();
    setUser(null);
  };

  return (
    <>
      <nav className='av-nav'>
        <Link href='/' className='logo'>
          <span className='logo-mark' aria-hidden />
          <span className='logo-text neon-cyan'>
            ARCADE <span className='neon-magenta'>VAULT</span>
          </span>
        </Link>
        <div className='links'>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'active' : ''}
            >
              {link.desktopLabel}
            </Link>
          ))}
        </div>
        <div className='spacer' />
        <div className='coin-counter'>
          <span className='coin' aria-hidden />
          <span>CRÉDITOS · 03</span>
        </div>
        {!isGamePage && <SkinSwitcher />}
        {user ? (
          <button className='btn ghost auth-btn' onClick={handleSignOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href='/auth' className='btn auth-btn'>
            Iniciar Sesión
          </Link>
        )}
        <button
          className='btn ghost hamburger'
          onClick={() => setMobileOpen(true)}
          aria-label='Menú'
        >
          ≡
        </button>
      </nav>

      <div
        className={`av-mobile-backdrop${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`av-mobile-panel${mobileOpen ? 'open' : ''}`}>
        <div className='pixel neon-cyan mb-4 text-[11px]'>MENÚ</div>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {link.mobileLabel}
          </Link>
        ))}
        <Link
          href='/auth'
          className={isActive('/auth') ? 'active' : ''}
          onClick={() => setMobileOpen(false)}
        >
          {user ? 'Cuenta' : 'Iniciar Sesión'}
        </Link>
        {!isGamePage && <SkinSwitcher />}
        <div className='flex-1' />
        <div className='pixel text-ink-faint text-[9px] tracking-[0.16em]'>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
