'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

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

type TouchMode = 'tap' | 'hold' | 'repeat';

export interface TouchButton {
  action: string;
  label: string;
  mode?: TouchMode; // default 'tap'
}

export interface TouchControlsProps {
  classPrefix: string;
  buttons: TouchButton[];
  // La regla base no-unused-vars (sin argsIgnorePattern) marca el param de los
  // callbacks de función; los handlers reciben action y lo mapean a tecla.
  // eslint-disable-next-line no-unused-vars
  onDown: (action: string) => void;
  // eslint-disable-next-line no-unused-vars
  onUp: (action: string) => void;
}

const REPEAT_MS = 90;

// Overlay de botones tactiles, reutilizable por los 4 juegos. Se monta solo en
// dispositivos de puntero no fino: matchMedia(pointer: coarse) o primer
// touchstart (one-shot, para arrancar tarde en hybrids).
export function TouchControls({
  classPrefix,
  buttons,
  onDown,
  onUp,
}: TouchControlsProps) {
  const [enabled, setEnabled] = useState(false);
  // Estado multi-touch por pointerId: permite mantener un botón (hold/repeat)
  // mientras se toca otro (tap), sin cruzar releases ni intervalos.
  const activeAction = useRef<Map<number, string>>(new Map());
  const activeInterval = useRef<Map<number, number>>(new Map());
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

  const releasePointer = (pointerId: number) => {
    const interval = activeInterval.current.get(pointerId);
    if (interval !== undefined) {
      clearInterval(interval);
      activeInterval.current.delete(pointerId);
    }
    const action = activeAction.current.get(pointerId);
    if (action !== undefined) {
      activeAction.current.delete(pointerId);
      onUpRef.current(action);
    }
  };

  // Limpieza al navegar — nunca queda un repeat colgado ni un press activo.
  useEffect(
    () => () => {
      for (const interval of activeInterval.current.values()) {
        clearInterval(interval);
      }
      activeInterval.current.clear();
      for (const action of activeAction.current.values()) {
        onUpRef.current(action);
      }
      activeAction.current.clear();
    },
    [onUpRef]
  );

  const handlePointerDown = (button: TouchButton) => (e: ReactPointerEvent) => {
    e.preventDefault(); // evita focus/scroll al mantener pulsado
    const pointerId = e.pointerId;
    releasePointer(pointerId); // re-press del mismo pointer: nunca deja fantasma
    activeAction.current.set(pointerId, button.action);
    onDownRef.current(button.action);
    if (button.mode === 'hold') return;
    if (button.mode === 'repeat') {
      activeInterval.current.set(
        pointerId,
        window.setInterval(() => onDownRef.current(button.action), REPEAT_MS)
      );
      return;
    }
    // tap: onDown + onUp inmediatos (edge-triggered, como el teclado).
    onUpRef.current(button.action);
    activeAction.current.delete(pointerId);
  };

  if (!enabled) return null;

  return (
    <div
      className={`${classPrefix}-touch-controls`}
      aria-label='Controles tactiles'
    >
      {buttons.map((button) => (
        <button
          key={button.action}
          type='button'
          className={`${classPrefix}-touch-button`}
          onPointerDown={handlePointerDown(button)}
          onPointerUp={(e) => releasePointer(e.pointerId)}
          onPointerCancel={(e) => releasePointer(e.pointerId)}
          onPointerLeave={(e) => releasePointer(e.pointerId)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
