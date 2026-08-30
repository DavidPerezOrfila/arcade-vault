'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useActionState } from 'react';
import { signInAction, signUpAction } from './actions';
import OAuthButtons from './OAuthButtons';

interface AuthFormProps {
  redirect: string;
}

const ERROR_TEXT: Record<string, string> = {
  INVALID_INPUT: 'Revisa los campos del formulario.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  EMAIL_TAKEN: 'Ese correo ya tiene una cuenta.',
  USERNAME_TAKEN: 'Ese nombre de usuario ya está en uso.',
  UNAUTHENTICATED: 'Tu sesión ha expirado.',
  UNKNOWN: 'Algo salió mal. Inténtalo de nuevo.',
};

export default function AuthForm({ redirect }: AuthFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'in' | 'up'>('in');
  const [loginState, loginAction, loginPending] = useActionState(signInAction, {
    ok: false,
    error: '',
  });
  const [signUpState, signUpActionState, signUpPending] = useActionState(
    signUpAction,
    { ok: false, error: '' }
  );

  const state = tab === 'in' ? loginState : signUpState;
  const pending = tab === 'in' ? loginPending : signUpPending;
  const error = state.ok ? null : (ERROR_TEXT[state.error] ?? null);

  return (
    <div className='av-auth-wrap fade-in'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='mark' />
          <h2 className='neon-cyan'>ARCADE VAULT</h2>
          <div className='mono text-ink-faint mt-1.5 text-[11px] tracking-[0.16em]'>
            ACCESO AL SISTEMA
          </div>
        </div>

        <div className='auth-tabs'>
          <button
            type='button'
            className={tab === 'in' ? 'on' : ''}
            onClick={() => setTab('in')}
          >
            INICIAR SESIÓN
          </button>
          <button
            type='button'
            className={tab === 'up' ? 'on' : ''}
            onClick={() => setTab('up')}
          >
            CREAR CUENTA
          </button>
        </div>

        <form action={tab === 'in' ? loginAction : signUpActionState}>
          <input type='hidden' name='redirect' value={redirect} />
          {tab === 'up' && (
            <div className='field slide-in'>
              <label htmlFor='auth-username'>Nombre de usuario</label>
              <input
                id='auth-username'
                name='username'
                placeholder='px_kai'
                autoComplete='username'
                required
                minLength={3}
                maxLength={20}
                pattern='[a-zA-Z0-9_]+'
              />
            </div>
          )}
          <div className='field'>
            <label htmlFor='auth-email'>Correo electrónico</label>
            <input
              id='auth-email'
              name='email'
              type='email'
              placeholder='jugador@vault.gg'
              autoComplete='email'
              required
            />
          </div>
          <div className='field'>
            <label htmlFor='auth-password'>Contraseña</label>
            <input
              id='auth-password'
              name='password'
              type='password'
              placeholder='••••••••'
              autoComplete={tab === 'in' ? 'current-password' : 'new-password'}
              required
              minLength={tab === 'in' ? 1 : 8}
            />
          </div>

          {tab === 'in' && (
            <div className='text-ink-faint mb-3 text-center text-[10px] tracking-[0.1em]'>
              <Link href='/auth/reset' className='hover:text-cyan'>
                ¿OLVIDASTE TU CONTRASEÑA?
              </Link>
            </div>
          )}

          {error && (
            <div className='text-ink-faint mb-3 text-center text-[11px] tracking-[0.08em] text-[#ff6b6b]'>
              {error}
            </div>
          )}

          <button
            className='btn lg'
            type='submit'
            disabled={pending}
            style={{ width: '100%', marginTop: 8 }}
          >
            {tab === 'in' ? 'ENTRAR AL VAULT' : 'CREAR Y JUGAR'}
          </button>
        </form>

        <div className='auth-divider'>O CONTINÚA CON</div>
        <OAuthButtons />

        <button
          className='btn ghost'
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => router.push('/')}
        >
          SEGUIR COMO INVITADO
        </button>

        <div className='text-ink-faint mt-[18px] text-center text-[11px] tracking-[0.1em]'>
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
