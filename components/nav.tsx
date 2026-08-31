import { createSupabaseServerClient } from '@/lib/supabase/server';
import NavClient from './nav-client';

// ponytail: si la sesión falla (sin cookie o sin envs configurados) el nav
// se renderiza como deslogueado; nunca rompe la página.
export default async function Nav() {
  let user: {
    name: string;
    avatarUrl?: string;
    fallback: string;
  } | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authUser.id)
        .maybeSingle();

      const username =
        profile?.username ??
        (typeof authUser.user_metadata?.full_name === 'string'
          ? authUser.user_metadata.full_name
          : authUser.email?.split('@')[0]);
      if (username) {
        const avatarUrl =
          typeof authUser.user_metadata?.avatar_url === 'string'
            ? authUser.user_metadata.avatar_url
            : undefined;
        user = {
          name: username,
          avatarUrl,
          fallback: username.slice(0, 2).toUpperCase(),
        };
      }
    }
  } catch {
    user = null;
  }

  return <NavClient user={user} />;
}
