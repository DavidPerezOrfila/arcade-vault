import { getGames } from '@/app/data/games';
import GamesClient from './GamesClient';

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await getGames();
  return <GamesClient initialGames={games} />;
}
