'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'duelo-pixel',
  gamePath: '/games/duelo-pixel',
});

export const submitDueloPixelScore = actions.submitScore;
export const getDueloPixelLeaderboard = actions.getLeaderboard;
