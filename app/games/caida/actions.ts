'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getScoresByGame, saveScore } from '@/app/data/scores';
import { scoreEntrySchema } from '@/app/data/schema';
import type { ScoreEntry } from '@/app/data/types';
import type { LeaderboardEntry } from '@/lib/games/types';

export type SubmitScoreResult = { ok: true } | { ok: false; error: string };

export async function submitCaidaScore(
  score: number
): Promise<SubmitScoreResult> {
  // Validación de bounds antes de escribir — anti-cheat proporcional.
  if (!scoreEntrySchema.shape.score.safeParse(score).success) {
    return { ok: false, error: 'INVALID_SCORE' };
  }

  const supabase = await (
    await import('@/lib/supabase/server')
  ).createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'UNAUTHENTICATED' };
  }

  try {
    await saveScore({
      game: 'caida',
      score,
      name:
        user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Jugador',
      at: Date.now(),
      userId: user.id
    });
  } catch {
    return { ok: false, error: 'DB_ERROR' };
  }

  revalidatePath('/games/caida');
  revalidatePath('/salon');
  revalidateTag('leaderboard', 'max');

  return { ok: true };
}

function mapToLeaderboardEntry(
  entry: ScoreEntry,
  index: number,
  currentUserId: string | null
): LeaderboardEntry {
  return {
    rank: index + 1,
    playerName: entry.name,
    score: entry.score,
    createdAt: new Date(entry.at).toISOString(),
    isCurrentUser: entry.userId !== null && entry.userId === currentUserId
  };
}

export async function getCaidaLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await (
    await import('@/lib/supabase/server')
  ).createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const scores = await getScoresByGame('caida');
  return scores
    .slice(0, 10)
    .map((entry, index) => mapToLeaderboardEntry(entry, index, currentUserId));
}
