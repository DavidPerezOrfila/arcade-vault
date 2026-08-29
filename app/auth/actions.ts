'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  usernameSchema,
} from '@/app/data/schema';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeRedirect } from './redirect';

export type AuthActionResult = { ok: true } | { ok: false; error: string };

function invalid(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

export async function signInAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) return invalid('INVALID_INPUT');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return error.code === 'invalid_credentials'
      ? invalid('INVALID_CREDENTIALS')
      : invalid('UNKNOWN');
  }

  return redirect(sanitizeRedirect(formData.get('redirect')?.toString()));
}

export async function signUpAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    username: String(formData.get('username') ?? ''),
  });
  if (!parsed.success) return invalid('INVALID_INPUT');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { username: parsed.data.username } },
  });
  if (error) {
    return error.code === 'email_exists' || error.code === 'user_already_exists'
      ? invalid('EMAIL_TAKEN')
      : invalid('UNKNOWN');
  }

  return redirect(sanitizeRedirect(formData.get('redirect')?.toString()));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

// Edición de username desde /cuenta. El trigger de auth.users garantizó un
// username válido al registrar; aquí solo se valida el nuevo contra el schema.
export async function updateUsernameAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = usernameSchema.safeParse(
    String(formData.get('username') ?? '')
  );
  if (!parsed.success) return invalid('INVALID_INPUT');

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return invalid('UNAUTHENTICATED');

  const { error } = await supabase
    .from('profiles')
    .update({ username: parsed.data })
    .eq('id', user.id);
  if (error) {
    // 23505 = unique violation del constraint de username.
    return (error as { code?: string }).code === '23505'
      ? invalid('USERNAME_TAKEN')
      : invalid('UNKNOWN');
  }

  return { ok: true };
}

export async function resetPasswordAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '');
  if (!signInSchema.shape.email.safeParse(email).success) {
    return invalid('INVALID_INPUT');
  }

  const supabase = await createSupabaseServerClient();
  const hostHeader = (await headers()).get('host') ?? 'localhost:3000';
  const origin = hostHeader.startsWith('localhost')
    ? `http://${hostHeader}`
    : `https://${hostHeader}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset`,
  });
  if (error) return invalid('UNKNOWN');

  return { ok: true };
}

export async function updatePasswordAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) return invalid('INVALID_INPUT');

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return invalid('UNAUTHENTICATED');

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return invalid('UNKNOWN');

  return redirect('/auth');
}
