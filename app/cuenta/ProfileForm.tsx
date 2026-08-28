'use client';

import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUsernameAction } from '@/app/auth/actions';
import { usernameSchema } from '@/app/data/schema';

interface ProfileFormProps {
  currentUsername: string;
}

const ERROR_TEXT: Record<string, string> = {
  INVALID_INPUT: 'El nombre debe tener 3-20 caracteres (letras, números o _).',
  USERNAME_TAKEN: 'Ese nombre de usuario ya está en uso.',
  UNAUTHENTICATED: 'Tu sesión ha expirado.',
  UNKNOWN: 'Algo salió mal. Inténtalo de nuevo.',
};

export default function ProfileForm({ currentUsername }: ProfileFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateUsernameAction, {
    ok: false,
    error: '',
  });

  // One-shot legacy: el auth simulado guardaba el nombre en 'av_user'.
  // Si existe y pasa el schema, migrarlo a profiles.username y borrar la
  // clave. La clave se elimina antes de disparar la acción, así un doble
  // mount de StrictMode no la migra dos veces.
  useEffect(() => {
    let raw = '';
    try {
      raw = window.localStorage.getItem('av_user') ?? '';
    } catch {
      return;
    }
    if (!raw) return;
    try {
      window.localStorage.removeItem('av_user');
    } catch {
      return;
    }
    const parsed = JSON.parse(raw) as { name?: unknown };
    if (typeof parsed.name !== 'string') return;
    const result = usernameSchema.safeParse(parsed.name);
    if (!result.success) return;
    const formData = new FormData();
    formData.set('username', result.data);
    updateUsernameAction({ ok: false, error: '' }, formData)
      .then(() => router.refresh())
      .catch(() => undefined);
  }, [router]);

  const error = state.ok ? null : (ERROR_TEXT[state.error] ?? null);

  return (
    <form action={action}>
      <div className='field'>
        <label>Nombre de usuario</label>
        <input
          name='username'
          defaultValue={currentUsername}
          autoComplete='username'
          required
          minLength={3}
          maxLength={20}
          pattern='[a-zA-Z0-9_]+'
        />
      </div>
      {error && (
        <div className='text-ink-faint mb-3 text-center text-[11px] tracking-[0.08em] text-[#ff6b6b]'>
          {error}
        </div>
      )}
      {state.ok && (
        <div className='mb-3 text-center text-[11px] tracking-[0.08em] text-[#7dff9b]'>
          NOMBRE ACTUALIZADO
        </div>
      )}
      <button
        className='btn lg'
        type='submit'
        disabled={pending}
        style={{ width: '100%' }}
      >
        GUARDAR CAMBIOS
      </button>
    </form>
  );
}
