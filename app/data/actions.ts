'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { scoreEntrySchema } from './schema';
import { saveScore } from './scores';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SaveScoreResult = { ok: true } | { ok: false; error: string };

function parseFormData(formData: FormData) {
  const raw = {
    game: String(formData.get('game') ?? ''),
    score: Number(formData.get('score') ?? 0),
    name: String(formData.get('name') ?? ''),
    at: Number(formData.get('at') ?? 0)
  };
  return scoreEntrySchema.safeParse(raw);
}

export async function saveScoreAction(
  _prev: SaveScoreResult | null,
  formData: FormData
): Promise<SaveScoreResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' };

  try {
    await saveScore(parsed.data);
  } catch {
    return { ok: false, error: 'DB_ERROR' };
  }

  revalidatePath('/salon');
  revalidatePath('/games');
  revalidatePath('/games/[slug]', 'page');
  revalidateTag('leaderboard');

  return { ok: true };
}

export interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

export async function getSalonLeaderboard(gameId: string): Promise<LeaderboardRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('scores')
      .select('game, score, name, at')
      .eq('game', gameId)
      .order('score', { ascending: false })
      .order('at', { ascending: false })
      .limit(12);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      game: row.game,
      score: row.score,
      name: row.name,
      at: new Date(row.at).getTime()
    }));
  } catch {
    return [];
  }
}

export async function getUserBestScore(gameId: string, userId: string): Promise<number | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('scores')
      .select('score')
      .eq('game', gameId)
      .eq('name', userId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.score ?? null;
  } catch {
    return null;
  }
}
