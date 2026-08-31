'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './touch-controls.css';

// Dispara un KeyboardEvent sintetizado sobre window. Los engines escuchan
// keydown/keyup en window y leen e.code (bloque-buster tambien e.key para las
// flechas de la paleta). key === code para flechas/espacio; KeyP necesita key: 'p'.
export function dispatchKey(
  code: string,
  type: 'keydown' | 'keyup',
  key?: string
): void {
  window.dispatchEvent(
    new KeyboardEvent(type, { code, key: key ?? code, bubbles: true })
  );
}

export type Direction = 'up' | 'down' | 'left' | 'right';
type TriggerMode = 'tap' | 'hold' | 'repeat';

export interface PadDirection {
  action: string;
  mode: TriggerMode;
}

export interface TouchButton {
  label: string;
  action?: string;
  mode?: TriggerMode; // default 'tap'
  disabled?: boolean;
}

export interface TouchControlsProps {
  dPad: Partial<Record<Direction, PadDirection>>;
  buttons: TouchButton[];
  pause?: TouchButton;
  // Área de juego que mantiene visible el overlay: al salir del viewport
  // (scroll hacia el leaderboard) se oculta para no tapar contenido.
  gameAreaRef?: { readonly current: HTMLElement | null };
  // La regla base no-unused-vars marca el param de los callbacks de función;
  // los handlers reciben action y lo mapean a tecla.
  // eslint-disable-next-line no-unused-vars
  onDown: (action: string) => void;
  // eslint-disable-next-line no-unused-vars
  onUp: (action: string) => void;
}

const REPEAT_MS = 90;

// Overlay de mando táctil estilo NES, reutilizable por los 4 juegos. Se monta
// solo en dispositivos de puntero no fino: matchMedia(pointer: coarse) o primer
// touchstart (one-shot, para arrancar tarde en hybrids).
export function TouchControls({
  dPad,
  buttons,
  pause,
  gameAreaRef,
  onDown,
  onUp,
}: TouchControlsProps) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pointedDir, setPointedDir] = useState<Direction | null>(null);

  const dPadRef = useRef<HTMLDivElement>(null);
  const dPadPointerId = useRef<number | null>(null);
  const pointedDirRef = useRef<Direction | null>(null);
  const heldDir = useRef<Direction | null>(null);
  const repeatTimer = useRef<number | null>(null);
  const buttonIntervals = useRef<Map<number, number>>(new Map());
  const buttonActions = useRef<Map<number, string>>(new Map());

  const onDownRef = useRef(onDown);
  const onUpRef = useRef(onUp);
  onDownRef.current = onDown;
  onUpRef.current = onUp;

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setEnabled(true);
      return undefined;
    }
    const onFirstTouch = () => setEnabled(true);
    window.addEventListener('touchstart', onFirstTouch, { once: true });
    return () => window.removeEventListener('touchstart', onFirstTouch);
  }, []);

  // Oculta el overlay cuando el área de juego sale del viewport (al hacer
  // scroll hacia el leaderboard) para no tapar contenido.
  useEffect(() => {
    const target = gameAreaRef?.current ?? null;
    if (!enabled || !target) return undefined;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, gameAreaRef]);

  const clearRepeat = useCallback(() => {
    if (repeatTimer.current !== null) {
      window.clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  }, []);

  const pressDirection = useCallback(
    (dir: Direction) => {
      const cfg = dPad[dir];
      if (!cfg) return;
      if (cfg.mode === 'tap') {
        onDownRef.current(cfg.action);
        onUpRef.current(cfg.action);
        return;
      }
      heldDir.current = dir;
      onDownRef.current(cfg.action);
      if (cfg.mode === 'repeat') {
        clearRepeat();
        repeatTimer.current = window.setInterval(
          () => onDownRef.current(cfg.action),
          REPEAT_MS
        );
      }
    },
    [dPad, clearRepeat]
  );

  const releaseDirection = useCallback(
    (dir: Direction) => {
      const cfg = dPad[dir];
      if (!cfg || cfg.mode === 'tap') return;
      clearRepeat();
      if (heldDir.current === dir) heldDir.current = null;
      onUpRef.current(cfg.action);
    },
    [dPad, clearRepeat]
  );

  const directionFromPoint = useCallback(
    (x: number, y: number): Direction | null => {
      const el = dPadRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const deadZone = Math.min(rect.width, rect.height) * 0.18;
      if (Math.hypot(dx, dy) < deadZone) return null;
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
      return dy > 0 ? 'down' : 'up';
    },
    []
  );

  const updateDirection = useCallback(
    (x: number, y: number) => {
      const dir = directionFromPoint(x, y);
      if (dir === pointedDirRef.current) return;
      const prev = pointedDirRef.current;
      pointedDirRef.current = dir;
      setPointedDir(dir);
      if (prev) releaseDirection(prev);
      if (dir) pressDirection(dir);
    },
    [directionFromPoint, releaseDirection, pressDirection]
  );

  const handleDPadDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dPadPointerId.current !== null) return;
      e.preventDefault();
      dPadPointerId.current = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateDirection(e.clientX, e.clientY);
    },
    [updateDirection]
  );

  const handleDPadMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dPadPointerId.current !== e.pointerId) return;
      updateDirection(e.clientX, e.clientY);
    },
    [updateDirection]
  );

  const handleDPadEnd = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dPadPointerId.current !== e.pointerId) return;
      dPadPointerId.current = null;
      const prev = pointedDirRef.current;
      pointedDirRef.current = null;
      setPointedDir(null);
      if (prev) releaseDirection(prev);
    },
    [releaseDirection]
  );

  const releaseButton = useCallback((pointerId: number) => {
    const interval = buttonIntervals.current.get(pointerId);
    if (interval !== undefined) {
      window.clearInterval(interval);
      buttonIntervals.current.delete(pointerId);
    }
    const action = buttonActions.current.get(pointerId);
    if (action !== undefined) {
      buttonActions.current.delete(pointerId);
      onUpRef.current(action);
    }
  }, []);

  const handleButtonDown = useCallback(
    (button: TouchButton) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const action = button.action;
      if (!action || button.disabled) return;
      const pointerId = e.pointerId;
      releaseButton(pointerId);
      buttonActions.current.set(pointerId, action);
      const mode = button.mode ?? 'tap';
      onDownRef.current(action);
      if (mode === 'hold') return;
      if (mode === 'repeat') {
        buttonIntervals.current.set(
          pointerId,
          window.setInterval(() => onDownRef.current(action), REPEAT_MS)
        );
        return;
      }
      onUpRef.current(action);
      buttonActions.current.delete(pointerId);
    },
    [releaseButton]
  );

  // Limpieza al desmontar: suelta acciones activas y cancela repeats.
  useEffect(
    () => () => {
      clearRepeat();
      for (const interval of buttonIntervals.current.values()) {
        window.clearInterval(interval);
      }
      buttonIntervals.current.clear();
      for (const action of buttonActions.current.values()) {
        onUpRef.current(action);
      }
      buttonActions.current.clear();
      if (heldDir.current) releaseDirection(heldDir.current);
      heldDir.current = null;
    },
    [clearRepeat, releaseDirection]
  );

  if (!enabled) return null;

  return (
    <div
      className={`touch-controls${visible ? '' : 'touch-controls--hidden'}`}
      aria-label='Controles táctiles'
    >
      <div
        ref={dPadRef}
        className='touch-dpad'
        data-active={pointedDir ?? 'none'}
        role='group'
        aria-label='Cruceta'
        onPointerDown={handleDPadDown}
        onPointerMove={handleDPadMove}
        onPointerUp={handleDPadEnd}
        onPointerCancel={handleDPadEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className='touch-dpad__arrow touch-dpad__up'>▲</span>
        <span className='touch-dpad__arrow touch-dpad__down'>▼</span>
        <span className='touch-dpad__arrow touch-dpad__left'>◀</span>
        <span className='touch-dpad__arrow touch-dpad__right'>▶</span>
      </div>

      {pause ? (
        <button
          type='button'
          className='touch-pause'
          onPointerDown={handleButtonDown(pause)}
          onPointerUp={(e) => releaseButton(e.pointerId)}
          onPointerCancel={(e) => releaseButton(e.pointerId)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {pause.label}
        </button>
      ) : null}

      <div
        className='touch-actions'
        role='group'
        aria-label='Botones de acción'
      >
        {buttons.map((button) => (
          <button
            key={button.label}
            type='button'
            className='touch-btn'
            disabled={button.disabled}
            onPointerDown={handleButtonDown(button)}
            onPointerUp={(e) => releaseButton(e.pointerId)}
            onPointerCancel={(e) => releaseButton(e.pointerId)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
