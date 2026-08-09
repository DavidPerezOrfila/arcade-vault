'use server';

import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: 'asteroids',
  gamePath: '/games/asteroids'
});

export const submitAsteroidsScore = actions.submitScore;
export const getAsteroidsLeaderboard = actions.getLeaderboard;
