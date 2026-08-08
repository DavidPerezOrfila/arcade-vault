'use client';

import { useEffect, useRef } from 'react';
import { submitAsteroidsScore } from '@/app/games/asteroids/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type { AsteroidsGameProps } from '@/lib/games/asteroids/types';
import './asteroids.css';

const CANVAS_W = 800;
const CANVAS_H = 600;
const MODULE_PATH = '../../../lib/games/asteroids/game.esm.js';
const API_URL = '/api/leaderboard/asteroids';

export function AsteroidsGame({
  initialLeaderboard = []
}: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameRef, isLoading, leaderboard, showAuthPrompt, setShowAuthPrompt, handleGameOver } =
    useArcadeGame({
      modulePath: MODULE_PATH,
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
    game.initGame(canvas);

    return () => {
      window.removeEventListener('resize', applyCanvasSize);
      game.destroy();
    };
  }, [isLoading, gameRef, handleGameOver]);

  if (isLoading) {
    return (
      <div className='asteroids-game-container'>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} />
        <div className='asteroids-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='asteroids-game-container'>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        aria-label='Juego Asteroids'
      />

      <div className='asteroids-leaderboard-hud'>
        <div className='asteroids-leaderboard-title'>TOP {LEADERBOARD_TOP_N}</div>
        <LeaderboardList
          classPrefix='asteroids'
          entries={leaderboard}
          maxRows={LEADERBOARD_TOP_N}
          emptyText='Sin puntuaciones aún'
        />
      </div>

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
  );
}
