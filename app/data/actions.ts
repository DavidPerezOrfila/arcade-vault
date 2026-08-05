'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { scoreEntrySchema } from './schema';
import { saveScore, getScoresByGame } from './scores';
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
  revalidateTag('leaderboard', 'max');

  return { ok: true };
}

export interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

export async function getSalonLeaderboard(
  gameId: string
): Promise<LeaderboardRow[]> {
  try {
    const entries = await getScoresByGame(gameId);
    return entries.slice(0, 12).map((entry) => ({
      game: entry.game,
      score: entry.score,
      name: entry.name,
      at: entry.at
    }));
  } catch {
    return [];
  }
}

export async function getUserBestScore(
  gameId: string,
  userId: string
): Promise<number | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('scores')
      .select('score')
      .eq('game', gameId)
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.score ?? null;
  } catch {
    return null;
  }
}
