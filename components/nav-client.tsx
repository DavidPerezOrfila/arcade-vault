'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { useSkin } from '@/components/skin/SkinProvider';
import {
  PALETTES,
  SKIN_IDS,
  SKIN_LABELS,
  type SkinId,
} from '@/lib/games/skins';
import { signOutAction } from '@/app/auth/actions';

interface NavClientProps {
  user: {
    name: string;
    avatarUrl?: string;
    fallback: string;
  } | null;
}

// Fuente única de links del nav: desktop (mayúsculas) y panel mobile comparten
// el mismo href; isActive cubre el prefijo /games y /player.
const NAV_LINKS = [
  { href: '/', desktopLabel: 'INICIO', mobileLabel: 'Inicio' },
  { href: '/games', desktopLabel: 'BIBLIOTECA', mobileLabel: 'Biblioteca' },
  { href: '/salon', desktopLabel: 'SALÓN', mobileLabel: 'Salón de la Fama' },
  { href: '/about', desktopLabel: 'ACERCA DE', mobileLabel: 'Acerca de' },
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

export default function NavClient({ user }: NavClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Bloquea el scroll del body mientras el panel móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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
    startTransition(async() => {
      await signOutAction();
    });
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
          <>
            <Link href='/cuenta' className='btn ghost auth-btn'>
              <span className='auth-avatar' aria-hidden>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt='' />
                ) : (
                  <span>{user.fallback}</span>
                )}
              </span>
              {user.name} ▾
            </Link>
            <button
              className='btn ghost'
              onClick={() => handleSignOut()}
              disabled={isPending}
            >
              SALIR
            </button>
          </>
        ) : (
          <Link href='/auth' className='btn auth-btn'>
            Iniciar Sesión
          </Link>
        )}
        <button
          className='btn ghost hamburger'
          onClick={() => setMobileOpen(true)}
          aria-label='Menú'
          aria-expanded={mobileOpen}
        >
          ≡
        </button>
      </nav>

      <div
        className={`av-mobile-backdrop${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`av-mobile-panel${mobileOpen ? 'open' : ''}`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
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
          href={user ? '/cuenta' : '/auth'}
          className={isActive(user ? '/cuenta' : '/auth') ? 'active' : ''}
          onClick={() => setMobileOpen(false)}
        >
          {user ? 'Cuenta' : 'Iniciar Sesión'}
        </Link>
        {!isGamePage && <SkinSwitcher />}
        {user && (
          <button
            className='btn ghost'
            onClick={() => {
              setMobileOpen(false);
              handleSignOut();
            }}
            disabled={isPending}
          >
            Cerrar Sesión
          </button>
        )}
        <div className='flex-1' />
        <div className='pixel text-ink-faint text-[9px] tracking-[0.16em]'>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
