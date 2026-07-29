import { getGames } from '@/app/data/games';
import SalonClient from './SalonClient';

export const dynamic = 'force-dynamic';

export default async function SalonPage() {
  const games = await getGames();
  const gameList = games.map((g) => ({ id: g.id, title: g.title }));
  return <SalonClient initialGames={gameList} />;
}