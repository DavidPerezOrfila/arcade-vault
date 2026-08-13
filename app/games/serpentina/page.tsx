import { Metadata } from 'next';
import { Suspense } from 'react';
import { getSerpentinaLeaderboard } from './actions';
import { SerpentinaGame } from '@/components/games/serpentina/SerpentinaGame';

export const metadata: Metadata = {
  title: 'SERPENTINA | Arcade Vault',
  description:
    'Clásico Snake. Come frutas, crece sin morderte la propia cola y aguanta la velocidad creciente para batir el récord.',
  openGraph: {
    title: 'SERPENTINA | Arcade Vault',
    description:
      'Clásico Snake. Come frutas, crece sin morderte la propia cola y aguanta la velocidad creciente para batir el récord.',
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getSerpentinaLeaderboard();
  return <SerpentinaGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function SerpentinaPage() {
  return (
    <main className='serpentina-page min-h-screen bg-black text-white'>
      <div className='mx-auto max-w-5xl px-4 py-8'>
        <header className='serpentina-page-header mb-8'>
          <h1 className='serpentina-page-title'>SERPENTINA</h1>
          <p className='serpentina-page-description'>
            La serpiente de luz recorre la grilla buscando núcleos. Cada bocado
            la alarga y la hace más veloz: un movimiento en falso y se devora a
            sí misma.
          </p>
        </header>

        <div className='serpentina-page-grid'>
          <div className='serpentina-game-wrapper'>
            <Suspense
              fallback={
                <div className='serpentina-game-container items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-8'>
                  <p className='font-mono text-gray-500'>Cargando juego...</p>
                </div>
              }
            >
              <LeaderboardServer />
            </Suspense>
          </div>

          <aside className='serpentina-sidebar space-y-4'>
            <div className='serpentina-sidebar-card'>
              <h2 className='serpentina-sidebar-title serpentina-sidebar-title--controls'>
                CONTROLES
              </h2>
              <dl className='serpentina-controls-list font-mono text-sm text-gray-300'>
                <div className='serpentina-control-item flex justify-between'>
                  <dt>↑ ↓ ← →</dt>
                  <dd>Mover</dd>
                </div>
                <div className='serpentina-control-item flex justify-between'>
                  <dt>
                    <span className='serpentina-control-key'>W A S D</span>
                  </dt>
                  <dd>Mover</dd>
                </div>
              </dl>
            </div>

            <div className='serpentina-sidebar-card'>
              <h2 className='serpentina-sidebar-title serpentina-sidebar-title--scoring'>
                OBJETIVO
              </h2>
              <dl className='serpentina-scoring-list space-y-1 font-mono text-sm text-gray-300'>
                <div className='serpentina-scoring-item flex justify-between'>
                  <dt>Fruta</dt>
                  <dd className='serpentina-scoring-value'>+10</dd>
                </div>
                <div className='serpentina-scoring-item flex justify-between'>
                  <dt>Velocidad</dt>
                  <dd className='serpentina-scoring-value'>Sube</dd>
                </div>
                <div className='serpentina-scoring-item flex justify-between'>
                  <dt>Pared / cola</dt>
                  <dd className='serpentina-scoring-value'>Game over</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
