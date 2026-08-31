'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'ranaria',
  gamePath: '/games/ranaria',
});

export const submitRanariaScore = actions.submitScore;
export const getRanariaLeaderboard = actions.getLeaderboard;
