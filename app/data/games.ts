import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Game } from './types';

export async function getGames(): Promise<Game[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('title');

  if (error) {
    return [];
  }

  return (data ?? []) as Game[];
}

export async function getGameById(id: string): Promise<Game | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data as Game | null;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  // id === slug in our schema
  return getGameById(slug);
}
