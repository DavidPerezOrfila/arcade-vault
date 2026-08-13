'use client';

import { useCallback, useEffect, useRef } from 'react';
import { submitCaidaScore } from '@/app/games/caida/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type { CaidaGameProps, CaidaRefs } from '@/lib/games/caida/types';
import './caida.css';

const BOARD_W = 300;
const BOARD_H = 600;
const NEXT_W = 120;
const NEXT_H = 120;
const API_URL = '/api/leaderboard/caida';

export function CaidaGame({ initialLeaderboard = [] }: CaidaGameProps) {
  const boardRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<HTMLSpanElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayScoreRef = useRef<HTMLParagraphElement>(null);

  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
  } = useArcadeGame({
    loadModule: () => import('@/lib/games/caida/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitCaidaScore,
    initialLeaderboard,
  });

  // Recoge refs y arranca el módulo. setOnGameOver antes de initGame — el
  // módulo dispara game over al iniciar, ese callback debe estar bindeado.
  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const refs: CaidaRefs | null =
      boardRef.current &&
      nextRef.current &&
      scoreRef.current &&
      linesRef.current &&
      levelRef.current &&
      overlayRef.current &&
      overlayTitleRef.current &&
      overlayScoreRef.current
        ? {
            board: boardRef.current,
            nextCanvas: nextRef.current,
            scoreEl: scoreRef.current,
            linesEl: linesRef.current,
            levelEl: levelRef.current,
            overlay: overlayRef.current,
            overlayTitle: overlayTitleRef.current,
            overlayScore: overlayScoreRef.current,
          }
        : null;
    if (!refs) return;

    setShowAuthPrompt(false);
    game.setOnGameOver(handleGameOver);
    game.initGame(refs, { onGameOver: handleGameOver });
  }, [gameRef, handleGameOver, setShowAuthPrompt]);

  useEffect(() => {
    if (isLoading) return undefined;
    startGame();
    return () => {
      gameRef.current?.destroy();
    };
  }, [isLoading, startGame, gameRef]);

  if (isLoading) {
    return (
      <div className='caida-game-container'>
        <div className='caida-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='caida-game-container'>
      <div className='caida-board-wrap'>
        <canvas
          ref={boardRef}
          width={BOARD_W}
          height={BOARD_H}
          aria-label='Juego CAÍDA'
        />

        {/* Overlay compartido: PAUSA / GAME OVER. El wrapper togglea la clase 'hidden'. */}
        <div className='caida-overlay hidden' ref={overlayRef}>
          <h3 className='caida-overlay-title' ref={overlayTitleRef}>
            PAUSA
          </h3>
          <p className='caida-overlay-score' ref={overlayScoreRef}></p>
          <button onClick={startGame} className='caida-overlay-button'>
            Jugar de nuevo
          </button>
        </div>

        {showAuthPrompt && (
          <AuthPrompt
            classPrefix='caida'
            gamePath='/games/caida'
            title='¡Partida terminada!'
            message='Inicia sesión para guardar tu puntuación en el ranking global.'
            onDismiss={() => setShowAuthPrompt(false)}
          />
        )}
      </div>

      <div className='caida-panel'>
        <div className='caida-hud'>
          <div className='caida-hud-item'>
            <span>PUNTOS</span>
            <span ref={scoreRef}>0</span>
          </div>
          <div className='caida-hud-item'>
            <span>LÍNEAS</span>
            <span ref={linesRef}>0</span>
          </div>
          <div className='caida-hud-item'>
            <span>NIVEL</span>
            <span ref={levelRef}>1</span>
          </div>
        </div>

        <div className='caida-next'>
          <div className='caida-next-label'>SIGUIENTE</div>
          <canvas
            ref={nextRef}
            width={NEXT_W}
            height={NEXT_H}
            aria-hidden='true'
          />
        </div>

        <div className='caida-leaderboard'>
          <div className='caida-leaderboard-title'>TOP {LEADERBOARD_TOP_N}</div>
          <LeaderboardList
            classPrefix='caida'
            entries={leaderboard}
            maxRows={LEADERBOARD_TOP_N}
            emptyText='Sin puntuaciones aún'
          />
        </div>
      </div>
    </div>
  );
}
