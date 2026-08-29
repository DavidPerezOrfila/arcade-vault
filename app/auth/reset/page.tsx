'use client';

import { Suspense, useEffect, useState, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { resetPasswordAction, updatePasswordAction } from '../actions';

const ERROR_TEXT: Record<string, string> = {
  INVALID_INPUT: 'Revisa los campos del formulario.',
  UNAUTHENTICATED: 'Tu sesión ha expirado.',
  UNKNOWN: 'Algo salió mal. Inténtalo de nuevo.',
};

export default function ResetPage() {
  // useSearchParams exige Suspense en prerender estático (CSR bailout).
  return (
    <Suspense fallback={<LoadingCard />}>
      <ResetContent />
    </Suspense>
  );
}

function LoadingCard() {
  return (
    <div className='av-auth-wrap fade-in'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='mark' />
          <h2 className='neon-cyan'>ARCADE VAULT</h2>
        </div>
        <div className='text-ink-faint text-center text-[11px] tracking-[0.1em]'>
          ESTABLECIENDO SESIÓN SEGURA…
        </div>
      </div>
    </div>
  );
}

function ResetContent() {
  // El parámetro `code` llega cuando Supabase redirige desde el correo de
  // reset; hay que intercambiarlo por sesión antes de poder cambiar password
  // con updatePasswordAction (que usa la cookie de sesión del server).
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [ready, setReady] = useState(!code);

  useEffect(() => {
    if (!code) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .exchangeCodeForSession(code)
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, [code]);

  const [updateState, updateAction, updatePending] = useActionState(
    updatePasswordAction,
    { ok: false, error: '' }
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordAction,
    { ok: false, error: '' }
  );

  if (!ready) {
    return <LoadingCard />;
  }

  if (code) {
    const error = updateState.ok
      ? null
      : (ERROR_TEXT[updateState.error] ?? null);
    return (
      <div className='av-auth-wrap fade-in'>
        <div className='auth-card'>
          <div className='auth-header'>
            <div className='mark' />
            <h2 className='neon-cyan'>NUEVA CONTRASEÑA</h2>
          </div>
          <form action={updateAction}>
            <div className='field'>
              <label htmlFor='reset-password'>Contraseña nueva</label>
              <input
                id='reset-password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                minLength={8}
                maxLength={72}
                placeholder='••••••••'
              />
            </div>
            {error && (
              <div className='text-ink-faint mb-3 text-center text-[11px] tracking-[0.08em] text-[#ff6b6b]'>
                {error}
              </div>
            )}
            <button
              className='btn lg'
              type='submit'
              disabled={updatePending}
              style={{ width: '100%', marginTop: 8 }}
            >
              GUARDAR CONTRASEÑA
            </button>
          </form>
        </div>
      </div>
    );
  }

  const error = resetState.ok ? null : (ERROR_TEXT[resetState.error] ?? null);
  return (
    <div className='av-auth-wrap fade-in'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='mark' />
          <h2 className='neon-cyan'>RECUPERAR ACCESO</h2>
          <div className='mono text-ink-faint mt-1.5 text-[11px] tracking-[0.16em]'>
            TE MANDAMOS UN ENLACE AL CORREO
          </div>
        </div>
        <form action={resetAction}>
          <div className='field'>
            <label htmlFor='reset-email'>Correo electrónico</label>
            <input
              id='reset-email'
              name='email'
              type='email'
              autoComplete='email'
              required
              placeholder='jugador@vault.gg'
            />
          </div>
          {error && (
            <div className='text-ink-faint mb-3 text-center text-[11px] tracking-[0.08em] text-[#ff6b6b]'>
              {error}
            </div>
          )}
          {resetState.ok && (
            <div className='mb-3 text-center text-[11px] tracking-[0.08em] text-[#7dff9b]'>
              REVISA TU CORREO PARA CONTINUAR
            </div>
          )}
          <button
            className='btn lg'
            type='submit'
            disabled={resetPending}
            style={{ width: '100%', marginTop: 8 }}
          >
            SOLICITAR NUEVA CONTRASEÑA
          </button>
        </form>
      </div>
    </div>
  );
}
