'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getScoresByGame, saveScore } from '@/app/data/scores';
import type { ScoreEntry } from '@/app/data/types';
import type { LeaderboardEntry } from '@/lib/games/asteroids/types';

export type SubmitScoreResult = { ok: true } | { ok: false; error: string };

export async function submitAsteroidsScore(score: number): Promise<SubmitScoreResult> {
  const supabase = await (await import('@/lib/supabase/server')).createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }

  try {
    await saveScore({
      game: 'asteroids',
      score,
      name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Jugador',
      at: Date.now(),
      userId: user.id
    });
  } catch {
    return { ok: false, error: 'DB_ERROR' };
  }

  revalidatePath('/games/asteroids');
  revalidatePath('/salon');
  revalidateTag('leaderboard');

  return { ok: true };
}

function mapToLeaderboardEntry(entry: ScoreEntry, index: number): LeaderboardEntry {
  return {
    rank: index + 1,
    playerName: entry.name,
    score: entry.score,
    createdAt: new Date(entry.at).toISOString(),
    isCurrentUser: false
  };
}

export async function getAsteroidsLeaderboard(): Promise<LeaderboardEntry[]> {
  const scores = await getScoresByGame('asteroids');
  return scores.slice(0, 10).map(mapToLeaderboardEntry);
}