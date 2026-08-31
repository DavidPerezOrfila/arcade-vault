'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  // Acceso estático: Turbopack solo inlinea process.env.NEXT_PUBLIC_X
  // literal; el acceso dinámico (requireEnv) queda vacío en el navegador.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  return createBrowserClient(url, anonKey);
}
