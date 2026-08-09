import { NextResponse } from 'next/server';
import { getCaidaLeaderboard } from '@/app/games/caida/actions';

export async function GET() {
  try {
    const leaderboard = await getCaidaLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
