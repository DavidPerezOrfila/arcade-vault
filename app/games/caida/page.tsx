import { Metadata } from 'next';
import { Suspense } from 'react';
import { getCaidaLeaderboard } from './actions';
import { CaidaGame } from '@/components/games/caida/CaidaGame';

export const metadata: Metadata = {
  title: 'CAÍDA | Arcade Vault',
  description:
    'Juega al clásico Tetris. Encaja las piezas, completa líneas y aguanta el descenso para conseguir la máxima puntuación.',
  openGraph: {
    title: 'CAÍDA | Arcade Vault',
    description:
      'Juega al clásico Tetris. Encaja las piezas, completa líneas y aguanta el descenso para conseguir la máxima puntuación.',
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getCaidaLeaderboard();
  return <CaidaGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function CaidaPage() {
  return (
    <main className='caida-page min-h-screen bg-black text-white'>
      <div className='mx-auto max-w-5xl px-4 py-8'>
        <header className='caida-page-header mb-8'>
          <h1 className='caida-page-title'>CAÍDA</h1>
          <p className='caida-page-description'>
            El clásico de bloques. Encaja las piezas, completa líneas y aguanta
            el descenso antes de que el techo te aplaste.
          </p>
        </header>

        <div className='caida-page-grid'>
          <div className='caida-game-wrapper'>
            <Suspense
              fallback={
                <div className='caida-game-container items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-8'>
                  <p className='font-mono text-gray-500'>Cargando juego...</p>
                </div>
              }
            >
              <LeaderboardServer />
            </Suspense>
          </div>

          <aside className='caida-sidebar space-y-4'>
            <div className='caida-sidebar-card'>
              <h2 className='caida-sidebar-title caida-sidebar-title--controls'>
                CONTROLES
              </h2>
              <dl className='caida-controls-list font-mono text-sm text-gray-300'>
                <div className='caida-control-item flex justify-between'>
                  <dt>← →</dt>
                  <dd>Mover</dd>
                </div>
                <div className='caida-control-item flex justify-between'>
                  <dt>↑ / X</dt>
                  <dd>Rotar</dd>
                </div>
                <div className='caida-control-item flex justify-between'>
                  <dt>↓</dt>
                  <dd>Soft drop</dd>
                </div>
                <div className='caida-control-item flex justify-between'>
                  <dt>
                    <span className='caida-control-key'>ESPACIO</span>
                  </dt>
                  <dd>Hard drop</dd>
                </div>
                <div className='caida-control-item flex justify-between'>
                  <dt>P</dt>
                  <dd>Pausa</dd>
                </div>
              </dl>
            </div>

            <div className='caida-sidebar-card'>
              <h2 className='caida-sidebar-title caida-sidebar-title--scoring'>
                PUNTUACIÓN
              </h2>
              <dl className='caida-scoring-list space-y-1 font-mono text-sm text-gray-300'>
                <div className='caida-scoring-item flex justify-between'>
                  <dt>1 línea</dt>
                  <dd className='caida-scoring-value'>100 × nivel</dd>
                </div>
                <div className='caida-scoring-item flex justify-between'>
                  <dt>2 líneas</dt>
                  <dd className='caida-scoring-value'>300 × nivel</dd>
                </div>
                <div className='caida-scoring-item flex justify-between'>
                  <dt>3 líneas</dt>
                  <dd className='caida-scoring-value'>500 × nivel</dd>
                </div>
                <div className='caida-scoring-item flex justify-between'>
                  <dt>4 líneas</dt>
                  <dd className='caida-scoring-value'>800 × nivel</dd>
                </div>
                <div className='caida-scoring-item flex justify-between'>
                  <dt>Hard drop</dt>
                  <dd className='caida-scoring-value'>+2/celda</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
