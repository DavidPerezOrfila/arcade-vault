import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signOutAction } from '@/app/auth/actions';
import ProfileForm from './ProfileForm';

export const metadata = {
  title: 'Tu cuenta · Arcade Vault',
  description: 'Gestiona tu perfil de jugador.',
};

export default async function CuentaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?redirect=/cuenta');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  const username = profile?.username ?? '';

  return (
    <div className='av-auth-wrap fade-in'>
      <div className='auth-card'>
        <div className='auth-header'>
          <div className='mark' />
          <h2 className='neon-cyan'>TU CUENTA</h2>
        </div>

        <div className='text-ink-faint mb-4 text-center text-[11px] tracking-[0.16em]'>
          {username.toUpperCase()}
        </div>

        <div className='text-ink-faint mb-4 text-center text-[11px]'>
          {user.email}
        </div>

        <ProfileForm currentUsername={username} />

        <form action={signOutAction}>
          <button
            className='btn ghost'
            type='submit'
            style={{ width: '100%', marginTop: 12 }}
          >
            CERRAR SESIÓN
          </button>
        </form>
      </div>
    </div>
  );
}
