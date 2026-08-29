import { Metadata } from 'next';
import { Suspense } from 'react';
import { getDueloPixelLeaderboard } from './actions';
import { DueloPixelGame } from '@/components/games/duelo-pixel/DueloPixelGame';

export const metadata: Metadata = {
  title: 'DUELO PIXEL | Arcade Vault',
  description:
    'Dos paletas. Una pelota. Reflejos máximos. Racha de duelos contra la CPU o partida local a dos jugadores.',
  openGraph: {
    title: 'DUELO PIXEL | Arcade Vault',
    description:
      'Dos paletas. Una pelota. Reflejos máximos. Racha de duelos contra la CPU o partida local a dos jugadores.',
    type: 'website',
  },
};

async function LeaderboardServer() {
  const leaderboard = await getDueloPixelLeaderboard();
  return <DueloPixelGame initialLeaderboard={leaderboard.slice(0, 10)} />;
}

export default function DueloPixelPage() {
  return (
    <main className='duelo-pixel-page min-h-screen bg-black text-white'>
      <div className='game-viewport mx-auto max-w-5xl px-4 py-8'>
        <header className='duelo-pixel-page-header mb-8'>
          <h1 className='duelo-pixel-page-title'>DUELO PIXEL</h1>
          <p className='duelo-pixel-page-description'>
            El duelo más puro: dos paletas verticales se enfrentan por rebotar
            una pelota luminosa. En Racha CPU sobrevive todo lo que puedas —cada
            ronda endiabliza la máquina y suma una ronda a tu marca— o invita a
            alguien a un partido local al mejor de siete.
          </p>
        </header>

        <div className='duelo-pixel-page-grid'>
          <div className='duelo-pixel-game-wrapper'>
            <Suspense
              fallback={
                <div className='duelo-pixel-game-container items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-8'>
                  <p className='font-mono text-gray-500'>Cargando juego...</p>
                </div>
              }
            >
              <LeaderboardServer />
            </Suspense>
          </div>

          <aside className='duelo-pixel-sidebar space-y-4'>
            <div className='duelo-pixel-sidebar-card'>
              <h2 className='duelo-pixel-sidebar-title duelo-pixel-sidebar-title--controls'>
                CONTROLES
              </h2>
              <dl className='duelo-pixel-controls-list font-mono text-sm text-gray-300'>
                <div className='duelo-pixel-control-item flex justify-between'>
                  <dt>
                    <span className='duelo-pixel-control-key'>W / S</span>
                  </dt>
                  <dd>Mover (Racha CPU)</dd>
                </div>
                <div className='duelo-pixel-control-item flex justify-between'>
                  <dt>↑ ↓ · W S</dt>
                  <dd>Jugador 1 · 2 (Local)</dd>
                </div>
                <div className='duelo-pixel-control-item flex justify-between'>
                  <dt>P / Esc</dt>
                  <dd>Pausa</dd>
                </div>
                <div className='duelo-pixel-control-item flex justify-between'>
                  <dt>R / Espacio</dt>
                  <dd>Revancha</dd>
                </div>
              </dl>
            </div>

            <div className='duelo-pixel-sidebar-card'>
              <h2 className='duelo-pixel-sidebar-title duelo-pixel-sidebar-title--scoring'>
                OBJETIVO
              </h2>
              <dl className='duelo-pixel-scoring-list space-y-1 font-mono text-sm text-gray-300'>
                <div className='duelo-pixel-scoring-item flex justify-between'>
                  <dt>Racha CPU</dt>
                  <dd className='duelo-pixel-scoring-value'>1ª a 5 puntos</dd>
                </div>
                <div className='duelo-pixel-scoring-item flex justify-between'>
                  <dt>Ronda perdida</dt>
                  <dd className='duelo-pixel-scoring-value'>−1 vida</dd>
                </div>
                <div className='duelo-pixel-scoring-item flex justify-between'>
                  <dt>Ronda ganada</dt>
                  <dd className='duelo-pixel-scoring-value'>+1 + tier CPU</dd>
                </div>
                <div className='duelo-pixel-scoring-item flex justify-between'>
                  <dt>Partida local</dt>
                  <dd className='duelo-pixel-scoring-value'>4 de 7 rondas</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
