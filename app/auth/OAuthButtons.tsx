'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const PROVIDERS = [
  { id: 'google', label: 'GOOGLE' },
  { id: 'github', label: 'GITHUB' },
] as const;

export default function OAuthButtons() {
  const handleOAuth = async (provider: (typeof PROVIDERS)[number]['id']) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return;
    // router.push no navega a URLs externas (silencioso); el authorize del
    // provider siempre es otro origen.
    if (data.url) window.location.assign(data.url);
  };

  return (
    <div className='social'>
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type='button'
          className='btn ghost'
          onClick={() => handleOAuth(provider.id)}
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}
