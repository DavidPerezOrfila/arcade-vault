import { NextResponse } from "next/server";
import { getAsteroidsLeaderboard } from "@/app/games/asteroids/actions";

export async function GET() {
  try {
    const leaderboard = await getAsteroidsLeaderboard();
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
