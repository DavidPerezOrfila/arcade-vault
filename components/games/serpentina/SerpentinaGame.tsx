'use client';

import { useCallback, useEffect, useRef } from 'react';
import { submitSerpentinaScore } from '@/app/games/serpentina/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { TouchControls, dispatchKey } from '@/components/games/TouchControls';
import type { TouchControlsProps } from '@/components/games/TouchControls';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { useSkin } from '@/components/skin/SkinProvider';
import { SkinSelect } from '@/components/skin/SkinSelect';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type {
  SerpentinaGameProps,
  SerpentinaRefs,
} from '@/lib/games/serpentina/types';
import './serpentina.css';

const BOARD_SIZE = 600;
const API_URL = '/api/leaderboard/serpentina';

// Mando NES: cruceta para cambiar de dirección (tap); A/B sin uso (atenuados).
const D_PAD = {
  up: { action: 'up', mode: 'tap' },
  down: { action: 'down', mode: 'tap' },
  left: { action: 'left', mode: 'tap' },
  right: { action: 'right', mode: 'tap' },
} satisfies TouchControlsProps['dPad'];

const BUTTONS = [
  { label: 'B', disabled: true },
  { label: 'A', disabled: true },
] satisfies TouchControlsProps['buttons'];

export function SerpentinaGame({
  initialLeaderboard = [],
}: SerpentinaGameProps) {
  const boardRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayScoreRef = useRef<HTMLParagraphElement>(null);
  const { skin } = useSkin();

  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
  } = useArcadeGame({
    loadModule: () => import('@/lib/games/serpentina/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitSerpentinaScore,
    initialLeaderboard,
  });

  // Recoge refs y arranca el módulo. setOnGameOver antes de initGame — el
  // módulo dispara game over al iniciar, ese callback debe estar bindeado.
  // skin en deps: cambiar de skin reinicia la partida (igual que Asteroids).
  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const refs: SerpentinaRefs | null =
      boardRef.current &&
      scoreRef.current &&
      overlayRef.current &&
      overlayTitleRef.current &&
      overlayScoreRef.current
        ? {
            board: boardRef.current,
            scoreEl: scoreRef.current,
            overlay: overlayRef.current,
            overlayTitle: overlayTitleRef.current,
            overlayScore: overlayScoreRef.current,
          }
        : null;
    if (!refs) return;

    setShowAuthPrompt(false);
    game.setOnGameOver(handleGameOver);
    game.initGame(refs, { onGameOver: handleGameOver, skin });
  }, [gameRef, handleGameOver, setShowAuthPrompt, skin]);

  useEffect(() => {
    if (isLoading) return undefined;
    startGame();
    return () => {
      gameRef.current?.destroy();
    };
  }, [isLoading, startGame, gameRef]);

  const handleDown = useCallback((action: string) => {
    if (action === 'pause') {
      dispatchKey('KeyP', 'keydown', 'p');
      return;
    }
    const key: Record<string, string> = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };
    dispatchKey(key[action] ?? action, 'keydown');
  }, []);

  const handleUp = useCallback(() => undefined, []);

  if (isLoading) {
    return (
      <div className='serpentina-game-container'>
        <div className='serpentina-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='serpentina-game-layout'>
      <div className='serpentina-game-container'>
        <div className='serpentina-board-wrap'>
          <canvas
            ref={boardRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            aria-label='Juego SERPENTINA'
          />

          {/* Overlay compartido: GAME OVER. El wrapper togglea la clase 'hidden'. */}
          <div className='serpentina-overlay hidden' ref={overlayRef}>
            <h3 className='serpentina-overlay-title' ref={overlayTitleRef}>
              GAME OVER
            </h3>
            <p className='serpentina-overlay-score' ref={overlayScoreRef}></p>
            <button onClick={startGame} className='serpentina-overlay-button'>
              Jugar de nuevo
            </button>
          </div>

          {showAuthPrompt && (
            <AuthPrompt
              classPrefix='serpentina'
              gamePath='/games/serpentina'
              title='¡Partida terminada!'
              message='Inicia sesión para guardar tu puntuación en el ranking global.'
              onDismiss={() => setShowAuthPrompt(false)}
            />
          )}
        </div>

        <div className='serpentina-panel'>
          <SkinSelect classPrefix='serpentina' />

          <div className='serpentina-hud'>
            <div className='serpentina-hud-item'>
              <span>PUNTOS</span>
              <span ref={scoreRef}>0</span>
            </div>
          </div>

          <div className='serpentina-leaderboard'>
            <div className='serpentina-leaderboard-title'>
              TOP {LEADERBOARD_TOP_N}
            </div>
            <LeaderboardList
              classPrefix='serpentina'
              entries={leaderboard}
              maxRows={LEADERBOARD_TOP_N}
              emptyText='Sin puntuaciones aún'
            />
          </div>
        </div>
      </div>

      <TouchControls
        dPad={D_PAD}
        buttons={BUTTONS}
        pause={{ label: 'PAUSA', action: 'pause' }}
        gameAreaRef={boardRef}
        onDown={handleDown}
        onUp={handleUp}
      />
    </div>
  );
}
