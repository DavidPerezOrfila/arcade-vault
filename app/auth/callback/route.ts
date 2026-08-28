import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRedirect } from '../redirect';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('auth/callback: exchangeCodeForSession failed', error);
    return NextResponse.redirect(new URL('/auth?error=callback', request.url));
  }

  const redirectTo = sanitizeRedirect(
    request.nextUrl.searchParams.get('redirect')
  );
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
