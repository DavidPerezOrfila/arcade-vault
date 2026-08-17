import { NextResponse } from 'next/server';
import { getBloqueBusterLeaderboard } from '@/app/games/bloque-buster/actions';

export async function GET() {
  try {
    const leaderboard = await getBloqueBusterLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
