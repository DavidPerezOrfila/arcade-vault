'use client';

import type { ReactNode } from 'react';

interface AuthPromptProps {
  // Prefijo CSS por juego (caida/asteroids) — el componente solo compone
  // clases; el styling vive en el CSS por juego.
  classPrefix: 'caida' | 'asteroids' | 'serpentina';
  gamePath: string;
  title: string;
  message: ReactNode;
  onDismiss: () => void;
  signInLabel?: string;
  dismissLabel?: string;
}

export function AuthPrompt({
  classPrefix,
  gamePath,
  title,
  message,
  onDismiss,
  signInLabel = 'Iniciar sesión',
  dismissLabel = 'Ahora no',
}: AuthPromptProps) {
  return (
    <div className={`${classPrefix}-auth-overlay`}>
      <div className={`${classPrefix}-auth-prompt`}>
        <h3 className={`${classPrefix}-auth-title`}>{title}</h3>
        <p className={`${classPrefix}-auth-message`}>{message}</p>
        <a
          href={`/auth?redirect=${gamePath}`}
          className={`${classPrefix}-auth-button`}
        >
          {signInLabel}
        </a>
        <button onClick={onDismiss} className={`${classPrefix}-auth-dismiss`}>
          {dismissLabel}
        </button>
      </div>
    </div>
  );
}
