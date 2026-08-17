'use client';

import { useCallback, useEffect, useRef } from 'react';
import { submitBloqueBusterScore } from '@/app/games/bloque-buster/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { TouchControls, dispatchKey } from '@/components/games/TouchControls';
import type { TouchButton } from '@/components/games/TouchControls';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { useSkin } from '@/components/skin/SkinProvider';
import { SkinSelect } from '@/components/skin/SkinSelect';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type { BloqueBusterGameProps } from '@/lib/games/bloque-buster/types';
import './bloque-buster.css';

const CANVAS_W = 800;
const CANVAS_H = 600;
const API_URL = '/api/leaderboard/bloque-buster';

// La pelota arranca sola; solo paleta (hold) + pausa (tap).
const TOUCH_BUTTONS: TouchButton[] = [
  { action: 'left', label: '◀', mode: 'hold' },
  { action: 'right', label: '▶', mode: 'hold' },
  { action: 'pause', label: 'PAUSA' },
];

export function BloqueBusterGame({
  initialLeaderboard = [],
}: BloqueBusterGameProps) {
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
    loadModule: () => import('@/lib/games/bloque-buster/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitBloqueBusterScore,
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

  // Paleta lee e.key (ArrowLeft/ArrowRight) y pausa e.code KeyP con key 'p'.
  const handleDown = useCallback((action: string) => {
    switch (action) {
      case 'left':
        dispatchKey('ArrowLeft', 'keydown');
        break;
      case 'right':
        dispatchKey('ArrowRight', 'keydown');
        break;
      case 'pause':
        dispatchKey('KeyP', 'keydown', 'p');
        break;
    }
  }, []);

  const handleUp = useCallback((action: string) => {
    if (action === 'left') dispatchKey('ArrowLeft', 'keyup');
    if (action === 'right') dispatchKey('ArrowRight', 'keyup');
  }, []);

  if (isLoading) {
    return (
      <div className='bloque-buster-game-container'>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
        <div className='bloque-buster-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='bloque-buster-game-layout'>
      <div className='bloque-buster-game-wrapper'>
        <div className='bloque-buster-game-shell'>
          <SkinSelect classPrefix='bloque-buster' />

          <div className='bloque-buster-game-container'>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              aria-label='Juego Bloque Buster'
            />

            {showAuthPrompt && (
              <AuthPrompt
                classPrefix='bloque-buster'
                gamePath='/games/bloque-buster'
                title='¡Partida terminada!'
                message='Inicia sesión para guardar tu puntuación en el ranking global.'
                onDismiss={() => setShowAuthPrompt(false)}
              />
            )}
          </div>

          <TouchControls
            classPrefix='bloque-buster'
            buttons={TOUCH_BUTTONS}
            onDown={handleDown}
            onUp={handleUp}
          />
        </div>
      </div>

      <aside className='bloque-buster-game-sidebar'>
        <div className='bloque-buster-leaderboard-card'>
          <div className='bloque-buster-leaderboard-title'>
            TOP {LEADERBOARD_TOP_N}
          </div>
          <LeaderboardList
            classPrefix='bloque-buster'
            entries={leaderboard}
            maxRows={LEADERBOARD_TOP_N}
            emptyText='Sin puntuaciones aún'
          />
        </div>

        <div className='bloque-buster-sidebar-card'>
          <h2 className='bloque-buster-sidebar-title bloque-buster-sidebar-title--controls'>
            CONTROLES
          </h2>
          <dl className='bloque-buster-controls-list'>
            <div className='bloque-buster-control-item'>
              <dt>← →</dt>
              <dd>Mover paleta (teclado)</dd>
            </div>
            <div className='bloque-buster-control-item'>
              <dt>Ratón</dt>
              <dd>Mover paleta</dd>
            </div>
            <div className='bloque-buster-control-item'>
              <dt>
                <span className='bloque-buster-control-key'>P</span>
              </dt>
              <dd>Pausar</dd>
            </div>
            <div className='bloque-buster-control-item'>
              <dt>
                <span className='bloque-buster-control-key'>ESPACIO</span>
              </dt>
              <dd>Reiniciar tras game over</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
