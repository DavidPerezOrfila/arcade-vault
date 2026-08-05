'use client';

import { useState, useCallback } from 'react';
import { AsteroidsGame } from '@/components/games/asteroids/AsteroidsGame';
import { submitAsteroidsScore } from './actions';
import type { LeaderboardEntry } from '@/lib/games/asteroids/types';

interface AsteroidsGameClientProps {
  initialLeaderboard: LeaderboardEntry[];
}

export function AsteroidsGameClient({ initialLeaderboard }: AsteroidsGameClientProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);

  const handleScoreSubmit = useCallback(async(score: number) => {
    const result = await submitAsteroidsScore(score);
    if (result.ok) {
      // Refresh leaderboard by fetching from server
      const response = await fetch('/api/leaderboard/asteroids');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    }
  }, []);

  return (
    <AsteroidsGame
      onScoreSubmit={handleScoreSubmit}
      initialLeaderboard={leaderboard}
    />
  );
}