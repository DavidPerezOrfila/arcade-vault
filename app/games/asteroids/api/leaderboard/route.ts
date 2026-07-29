import { getAsteroidsLeaderboard } from '../../actions';

export async function GET() {
  const leaderboard = await getAsteroidsLeaderboard();
  return Response.json(leaderboard.slice(0, 10));
}