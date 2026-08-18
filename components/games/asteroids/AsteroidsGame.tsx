'use client';

import { useCallback, useEffect, useRef } from 'react';
import { submitAsteroidsScore } from '@/app/games/asteroids/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { TouchControls, dispatchKey } from '@/components/games/TouchControls';
import type { TouchButton } from '@/components/games/TouchControls';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { useSkin } from '@/components/skin/SkinProvider';
import { SkinSelect } from '@/components/skin/SkinSelect';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type { AsteroidsGameProps } from '@/lib/games/asteroids/types';
import './asteroids.css';

const CANVAS_W = 800;
const CANVAS_H = 600;
const API_URL = '/api/leaderboard/asteroids';

const TOUCH_BUTTONS: TouchButton[] = [
  { action: 'left', label: '◀', mode: 'hold' },
  { action: 'right', label: '▶', mode: 'hold' },
  { action: 'thrust', label: '▲', mode: 'hold' },
  { action: 'fire', label: 'FIRE' },
];

export function AsteroidsGame({ initialLeaderboard = [] }: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { skin } = useSkin();
  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
  } = useArcadeGame({
    loadModule: () => import('@/lib/games/asteroids/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitAsteroidsScore,
    initialLeaderboard,
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

  // Un solo mapa compartido: evita que keyup omita un action (bug: fire
  // quedaba pegado en keys['Space'] y solo disparaba una vez).
  const KEY_MAP: Record<string, string> = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    thrust: 'ArrowUp',
    fire: 'Space',
  };

  const handleDown = useCallback((action: string) => {
    dispatchKey(KEY_MAP[action] ?? action, 'keydown');
  }, []);

  const handleUp = useCallback((action: string) => {
    dispatchKey(KEY_MAP[action] ?? action, 'keyup');
  }, []);

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
          <SkinSelect classPrefix='asteroids' />

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

          <TouchControls
            classPrefix='asteroids'
            buttons={TOUCH_BUTTONS}
            onDown={handleDown}
            onUp={handleUp}
          />
        </div>
      </div>

      <aside className='asteroids-game-sidebar'>
        <div className='asteroids-leaderboard-card'>
          <div className='asteroids-leaderboard-title'>
            TOP {LEADERBOARD_TOP_N}
          </div>
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
