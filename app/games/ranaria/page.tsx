import { Metadata } from 'next';
import { Suspense } from 'react';
import { getRanariaLeaderboard } from './actions';
import { RanariaGame } from '@/components/games/ranaria/RanariaGame';

export const metadata: Metadata = {
  title: 'RANARIA | Arcade Vault',
  description:
    'Cruza la autopista de píxeles. Salta entre coches y troncos a la deriva para llegar a los nenúfares antes de que se acabe el tiempo.',
  openGraph: {
    title: 'RANARIA | Arcade Vault',
    description:
      'Cruza la autopista de píxeles. Salta entre coches y troncos a la deriva para llegar a los nenúfares antes de que se acabe el tiempo.',
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getRanariaLeaderboard();
  return <RanariaGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function RanariaPage() {
  return (
    <main className='ranaria-page min-h-screen bg-black text-white'>
      <div className='game-viewport mx-auto max-w-5xl px-4 py-8'>
        <header className='ranaria-page-header mb-8'>
          <h1 className='ranaria-page-title'>RANARIA</h1>
          <p className='ranaria-page-description'>
            Guía a tu rana a través de una carretera repleta de coches y un río
            de troncos y tortugas flotantes. Llena las cinco bocas del otro
            lado para completar la ronda; cada nivel acelera el tráfico y
            acorta el tiempo.
          </p>
        </header>

        <div className='ranaria-page-grid'>
          <div className='ranaria-game-wrapper'>
            <Suspense
              fallback={
                <div className='ranaria-game-container items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-8'>
                  <p className='font-mono text-gray-500'>Cargando juego...</p>
                </div>
              }
            >
              <LeaderboardServer />
            </Suspense>
          </div>

          <aside className='ranaria-sidebar space-y-4'>
            <div className='ranaria-sidebar-card'>
              <h2 className='ranaria-sidebar-title ranaria-sidebar-title--controls'>
                CONTROLES
              </h2>
              <dl className='ranaria-controls-list font-mono text-sm text-gray-300'>
                <div className='ranaria-control-item flex justify-between'>
                  <dt>↑ ↓ ← →</dt>
                  <dd>Saltar</dd>
                </div>
                <div className='ranaria-control-item flex justify-between'>
                  <dt>
                    <span className='ranaria-control-key'>W A S D</span>
                  </dt>
                  <dd>Saltar</dd>
                </div>
                <div className='ranaria-control-item flex justify-between'>
                  <dt>P / Esc</dt>
                  <dd>Pausa</dd>
                </div>
              </dl>
            </div>

            <div className='ranaria-sidebar-card'>
              <h2 className='ranaria-sidebar-title ranaria-sidebar-title--scoring'>
                OBJETIVO
              </h2>
              <dl className='ranaria-scoring-list space-y-1 font-mono text-sm text-gray-300'>
                <div className='ranaria-scoring-item flex justify-between'>
                  <dt>Celda nueva</dt>
                  <dd className='ranaria-scoring-value'>+10</dd>
                </div>
                <div className='ranaria-scoring-item flex justify-between'>
                  <dt>Nenúfar</dt>
                  <dd className='ranaria-scoring-value'>+50 + tiempo</dd>
                </div>
                <div className='ranaria-scoring-item flex justify-between'>
                  <dt>Ronda completa (5)</dt>
                  <dd className='ranaria-scoring-value'>+200</dd>
                </div>
                <div className='ranaria-scoring-item flex justify-between'>
                  <dt>Coche / agua / tiempo</dt>
                  <dd className='ranaria-scoring-value'>−1 vida</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
