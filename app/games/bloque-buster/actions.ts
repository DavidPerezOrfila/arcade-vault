'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'bloque-buster',
  gamePath: '/games/bloque-buster',
});

export const submitBloqueBusterScore = actions.submitScore;
export const getBloqueBusterLeaderboard = actions.getLeaderboard;
