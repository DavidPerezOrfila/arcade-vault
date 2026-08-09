'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'caida',
  gamePath: '/games/caida'
});

export const submitCaidaScore = actions.submitScore;
export const getCaidaLeaderboard = actions.getLeaderboard;
