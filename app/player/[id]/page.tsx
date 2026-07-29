import { notFound } from 'next/navigation';
import { getGameById } from '@/app/data/games';
import PlayerClient from './PlayerClient';

export const dynamic = 'force-dynamic';

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const game = await getGameById(id);
  if (!game) return notFound();

  return <PlayerClient game={{ id: game.id, title: game.title }} />;
}