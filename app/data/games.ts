import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Game, GameFilter } from './types';
export { CATS } from './types';

export async function getGames(): Promise<Game[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching games:', error);
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
    console.error(`Error fetching game ${id}:`, error);
    return null;
  }

  return data as Game | null;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  // id === slug in our schema
  return getGameById(slug);
}

export async function getGamesByCategory(cat: GameFilter): Promise<Game[]> {
  if (cat === 'TODOS') return getGames();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('cat', cat)
    .order('title');

  if (error) {
    console.error(`Error fetching games for category ${cat}:`, error);
    return [];
  }

  return (data ?? []) as Game[];
}