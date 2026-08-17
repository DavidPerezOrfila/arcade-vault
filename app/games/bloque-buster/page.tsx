import { Metadata } from 'next';
import { Suspense } from 'react';
import { getBloqueBusterLeaderboard } from './actions';
import { BloqueBusterGame } from '@/components/games/bloque-buster/BloqueBusterGame';

export const metadata: Metadata = {
  title: 'Bloque Buster | Arcade Vault',
  description:
    'Rompe todos los bloques con la paleta y la pelota. Cinco niveles clásicos de arkanoid con dificultad creciente.',
  openGraph: {
    title: 'Bloque Buster | Arcade Vault',
    description:
      'Rompe todos los bloques con la paleta y la pelota. Cinco niveles clásicos de arkanoid con dificultad creciente.',
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getBloqueBusterLeaderboard();
  return <BloqueBusterGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function BloqueBusterPage() {
  return (
    <main className='bloque-buster-page min-h-screen'>
      <div className='mx-auto max-w-5xl px-4 py-8'>
        <header className='bloque-buster-page-header mb-8'>
          <h1 className='bloque-buster-page-title'>BLOQUE BUSTER</h1>
          <p className='bloque-buster-page-description'>
            El clásico arkanoid. Controla la paleta, mantén la pelota en juego y
            rompe todos los bloques para superar los cinco niveles.
          </p>
        </header>

        <Suspense
          fallback={
            <div className='bloque-buster-game-container flex aspect-[4/3] items-center justify-center rounded-lg border border-gray-800 bg-gray-900'>
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
