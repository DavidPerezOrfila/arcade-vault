'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setUser, clearUser } from '@/app/data/storage';

// ponytail: auth simulada — pass/email no se validan; setUser guarda solo el
// nombre en localStorage hasta el flujo real de Supabase Auth.
const APP_VERSION = 'v2.6';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'in' | 'up'>('in');
  const [user, setUserVal] = useState('');
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (user || 'PLAYER1').toUpperCase().slice(0, 10);
    setUser({ name });
    router.push('/');
  };

  const playAsGuest = () => {
    clearUser();
    router.push('/');
  };

  return (
    <div className='av-auth-wrap fade-in'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='mark' />
          <h2 className='neon-cyan'>ARCADE VAULT</h2>
          <div className='mono text-[11px] tracking-[0.16em] text-ink-faint mt-1.5'>
            ACCESO AL SISTEMA · {APP_VERSION}
          </div>
        </div>

        <div className='auth-tabs'>
          <button
            className={tab === 'in' ? 'on' : ''}
            onClick={() => setTab('in')}
          >
            INICIAR SESIÓN
          </button>
          <button
            className={tab === 'up' ? 'on' : ''}
            onClick={() => setTab('up')}
          >
            CREAR CUENTA
          </button>
        </div>

        <form onSubmit={submit}>
          <div className='field'>
            <label>Usuario</label>
            <input
              value={user}
              onChange={(e) => setUserVal(e.target.value)}
              placeholder='px_kai'
            />
          </div>
          {tab === 'up' && (
            <div className='field slide-in'>
              <label>Correo electrónico</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='jugador@vault.gg'
              />
            </div>
          )}
          <div className='field'>
            <label>Contraseña</label>
            <input
              type='password'
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          <button
            className='btn lg'
            type='submit'
            style={{ width: '100%', marginTop: 8 }}
          >
            {tab === 'in' ? 'ENTRAR AL VAULT' : 'CREAR Y JUGAR'}
          </button>
        </form>

        <button
          className='btn ghost'
          style={{ width: '100%', marginTop: 10 }}
          onClick={playAsGuest}
        >
          JUGAR COMO INVITADO
        </button>

        <div className='mt-[18px] text-center text-[11px] tracking-[0.1em] text-ink-faint'>
          AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
        </div>
      </div>
    </div>
  );
}
