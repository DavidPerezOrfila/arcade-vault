import { NextResponse } from 'next/server';
import { getRanariaLeaderboard } from '@/app/games/ranaria/actions';

export async function GET() {
  try {
    const leaderboard = await getRanariaLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}