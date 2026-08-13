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
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getAsteroidsLeaderboard();
  return <AsteroidsGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function AsteroidsPage() {
  return (
    <main className='asteroids-page min-h-screen bg-black text-white'>
      <div className='mx-auto max-w-5xl px-4 py-8'>
        <header className='asteroids-page-header mb-8'>
          <h1 className='asteroids-page-title'>ASTEROIDS</h1>
          <p className='asteroids-page-description'>
            El clásico arcade de 1979. Destruye asteroides, evita colisiones y
            consigue la mayor puntuación.
          </p>
        </header>

        <div className='asteroids-page-grid'>
          <div className='asteroids-game-wrapper'>
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

          <aside className='asteroids-sidebar space-y-4'>
            <div className='asteroids-sidebar-card'>
              <h2 className='asteroids-sidebar-title asteroids-sidebar-title--controls'>
                CONTROLES
              </h2>
              <dl className='asteroids-controls-list font-mono text-sm text-gray-300'>
                <div className='asteroids-control-item flex justify-between'>
                  <dt>↑</dt>
                  <dd>Impulsar</dd>
                </div>
                <div className='asteroids-control-item flex justify-between'>
                  <dt>← →</dt>
                  <dd>Rotar</dd>
                </div>
                <div className='asteroids-control-item flex justify-between'>
                  <dt>
                    <span className='asteroids-control-key'>ESPACIO</span>
                  </dt>
                  <dd>Disparar</dd>
                </div>
              </dl>
            </div>

            <div className='asteroids-sidebar-card'>
              <h2 className='asteroids-sidebar-title asteroids-sidebar-title--powerup'>
                POWER-UP
              </h2>
              <p className='asteroids-powerup-info font-mono text-sm text-gray-300'>
                Destruye asteroides para conseguir el power-up{' '}
                <span className='asteroids-powerup-highlight'>3x</span> (triple
                disparo). Duración: 5s.
              </p>
            </div>

            <div className='asteroids-sidebar-card'>
              <h2 className='asteroids-sidebar-title asteroids-sidebar-title--scoring'>
                PUNTUACIÓN
              </h2>
              <dl className='asteroids-scoring-list space-y-1 font-mono text-sm text-gray-300'>
                <div className='asteroids-scoring-item flex justify-between'>
                  <dt>Asteroide grande</dt>
                  <dd className='asteroids-scoring-value'>20 pts</dd>
                </div>
                <div className='asteroids-scoring-item flex justify-between'>
                  <dt>Asteroide mediano</dt>
                  <dd className='asteroids-scoring-value'>50 pts</dd>
                </div>
                <div className='asteroids-scoring-item flex justify-between'>
                  <dt>Asteroide pequeño</dt>
                  <dd className='asteroids-scoring-value'>100 pts</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
