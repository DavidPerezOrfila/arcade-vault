import { NextResponse } from 'next/server';
import { getDueloPixelLeaderboard } from '@/app/games/duelo-pixel/actions';

export async function GET() {
  try {
    const leaderboard = await getDueloPixelLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
