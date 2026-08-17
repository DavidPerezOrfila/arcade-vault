import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAsteroidsLeaderboard } from './actions';
import { AsteroidsGame } from '@/components/games/asteroids/AsteroidsGame';

export const metadata: Metadata = {
  title: 'Asteroids | Arcade Vault',
  description:
    'Juega al clásico Asteroids. Dispara, esquiva y destruye asteroides para conseguir la máxima puntuación.',
  openGraph: {
    title: 'Asteroids | Arcade Vault',
    description:
      'Juega al clásico Asteroids. Dispara, esquiva y destruye asteroides para conseguir la máxima puntuación.',
    type: 'website'
  }
};

async function LeaderboardServer() {
  const leaderboard = await getAsteroidsLeaderboard();
  return <AsteroidsGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function AsteroidsPage() {
  return (
    <main className='asteroids-page min-h-screen'>
      <div className='mx-auto max-w-5xl px-4 py-8'>
        <header className='asteroids-page-header mb-8'>
          <h1 className='asteroids-page-title'>ASTEROIDS</h1>
          <p className='asteroids-page-description'>
            El clásico arcade de 1979. Destruye asteroides, evita colisiones y
            consigue la mayor puntuación.
          </p>
        </header>

        <Suspense
          fallback={
            <div className='asteroids-game-container flex aspect-[4/3] items-center justify-center rounded-lg border border-gray-800 bg-gray-900'>
              <p className='font-mono text-gray-500'>Cargando juego...</p>
            </div>
          }
        >
          <LeaderboardServer />
        </Suspense>
      </div>
    </main>
  );
}
