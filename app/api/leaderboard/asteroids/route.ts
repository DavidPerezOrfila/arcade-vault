import { NextResponse } from 'next/server';
import { getScoresByGame } from '@/app/data/scores';
import type { ScoreEntry } from '@/app/data/types';

export async function GET() {
  try {
    const scores = await getScoresByGame('asteroids');
    const leaderboard: ScoreEntry[] = scores.slice(0, 10).map((score, index) => ({
      ...score,
      rank: index + 1
    }));
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}