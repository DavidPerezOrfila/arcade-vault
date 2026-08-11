'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'serpentina',
  gamePath: '/games/serpentina'
});

export const submitSerpentinaScore = actions.submitScore;
export const getSerpentinaLeaderboard = actions.getLeaderboard;
