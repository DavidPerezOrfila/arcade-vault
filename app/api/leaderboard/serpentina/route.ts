import { NextResponse } from 'next/server';
import { getSerpentinaLeaderboard } from '@/app/games/serpentina/actions';

export async function GET() {
  try {
    const leaderboard = await getSerpentinaLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
