'use client';

import { useEffect, useRef } from 'react';
import { submitAsteroidsScore } from '@/app/games/asteroids/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { useSkin } from '@/components/skin/SkinProvider';
import { SKIN_IDS, SKIN_LABELS, type SkinId } from '@/lib/games/skins';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type { AsteroidsGameProps } from '@/lib/games/asteroids/types';
import './asteroids.css';

const CANVAS_W = 800;
const CANVAS_H = 600;
const API_URL = '/api/leaderboard/asteroids';

export function AsteroidsGame({ initialLeaderboard = [] }: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { skin, setSkin } = useSkin();
  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver
  } = useArcadeGame({
    loadModule: () => import('@/lib/games/asteroids/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitAsteroidsScore,
    initialLeaderboard
  });

  // Aplica tamaño lógico del canvas, bindea game-over y arranca el módulo.
  // setOnGameOver antes de initGame — orden importante: el módulo dispara
  // game over al iniciar, ese callback debe estar bindeado.
  useEffect(() => {
    if (isLoading) return undefined;
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return undefined;

    const applyCanvasSize = () => {
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
    };
    applyCanvasSize();
    window.addEventListener('resize', applyCanvasSize);

    game.setOnGameOver(handleGameOver);
    game.initGame(canvas, { skin });

    return () => {
      window.removeEventListener('resize', applyCanvasSize);
      game.destroy();
    };
  }, [isLoading, gameRef, handleGameOver, skin]);

  if (isLoading) {
    return (
      <div className='asteroids-game-container'>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
        <div className='asteroids-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='asteroids-game-layout'>
      <div className='asteroids-game-wrapper'>
        <div className='asteroids-game-shell'>
          <div className='asteroids-skin-bar'>
            <label className='asteroids-skin-select'>
              <span>SKIN</span>
              <select
                value={skin}
                onChange={(event) => setSkin(event.target.value as SkinId)}
                aria-label='Seleccionar skin'
              >
                {SKIN_IDS.map((id) => (
                  <option key={id} value={id}>
                    {SKIN_LABELS[id]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className='asteroids-game-container'>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              aria-label='Juego Asteroids'
            />

            {showAuthPrompt && (
              <AuthPrompt
                classPrefix='asteroids'
                gamePath='/games/asteroids'
                title='¡Partida terminada!'
                message='Inicia sesión para guardar tu puntuación en el ranking global.'
                onDismiss={() => setShowAuthPrompt(false)}
              />
            )}
          </div>
        </div>
      </div>

      <aside className='asteroids-game-sidebar'>
        <div className='asteroids-leaderboard-card'>
          <div className='asteroids-leaderboard-title'>TOP {LEADERBOARD_TOP_N}</div>
          <LeaderboardList
            classPrefix='asteroids'
            entries={leaderboard}
            maxRows={LEADERBOARD_TOP_N}
            emptyText='Sin puntuaciones aún'
          />
        </div>

        <div className='asteroids-sidebar-card'>
          <h2 className='asteroids-sidebar-title asteroids-sidebar-title--controls'>
            CONTROLES
          </h2>
          <dl className='asteroids-controls-list'>
            <div className='asteroids-control-item'>
              <dt>↑</dt>
              <dd>Impulsar</dd>
            </div>
            <div className='asteroids-control-item'>
              <dt>← →</dt>
              <dd>Rotar</dd>
            </div>
            <div className='asteroids-control-item'>
              <dt><span className='asteroids-control-key'>ESPACIO</span></dt>
              <dd>Disparar</dd>
            </div>
          </dl>
        </div>

        <div className='asteroids-sidebar-card'>
          <h2 className='asteroids-sidebar-title asteroids-sidebar-title--powerup'>
            POWER-UP
          </h2>
          <p className='asteroids-powerup-info'>
            Destruye asteroides para conseguir el power-up{' '}
            <span className='asteroids-powerup-highlight'>3x</span> (triple
            disparo). Duración: 5s.
          </p>
        </div>

        <div className='asteroids-sidebar-card'>
          <h2 className='asteroids-sidebar-title asteroids-sidebar-title--scoring'>
            PUNTUACIÓN
          </h2>
          <dl className='asteroids-scoring-list'>
            <div className='asteroids-scoring-item'>
              <dt>Asteroide grande</dt>
              <dd className='asteroids-scoring-value'>20 pts</dd>
            </div>
            <div className='asteroids-scoring-item'>
              <dt>Asteroide mediano</dt>
              <dd className='asteroids-scoring-value'>50 pts</dd>
            </div>
            <div className='asteroids-scoring-item'>
              <dt>Asteroide pequeño</dt>
              <dd className='asteroids-scoring-value'>100 pts</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
