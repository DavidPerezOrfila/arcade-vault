'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TouchEvent as ReactTouchEvent } from 'react';
import { submitSerpentinaScore } from '@/app/games/serpentina/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { TouchControls, dispatchKey } from '@/components/games/TouchControls';
import type { TouchButton } from '@/components/games/TouchControls';
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
const SWIPE_THRESHOLD = 24;

const TOUCH_BUTTONS: TouchButton[] = [{ action: 'pause', label: 'PAUSA' }];

// Eje dominante del swipe: horizontal si |dx| > |dy|, luego dirección del signo.
function arrowFromSwipe(dx: number, dy: number): string {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'ArrowRight' : 'ArrowLeft';
  }
  return dy > 0 ? 'ArrowDown' : 'ArrowUp';
}

export function SerpentinaGame({
  initialLeaderboard = [],
}: SerpentinaGameProps) {
  const boardRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayScoreRef = useRef<HTMLParagraphElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
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
    }
  }, []);

  const handleUp = useCallback(() => undefined, []);

  // Swipe sobre el board: cada trayectoria supera ~24px en un eje, emite la
  // flecha correspondiente y reinicia el origen para swipes encadenados.
  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchMove = useCallback((e: ReactTouchEvent) => {
    const start = swipeStartRef.current;
    const t = e.touches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      return;
    }
    e.preventDefault();
    dispatchKey(arrowFromSwipe(dx, dy), 'keydown');
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback(() => {
    swipeStartRef.current = null;
  }, []);

  if (isLoading) {
    return (
      <div className='serpentina-game-container'>
        <div className='serpentina-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='serpentina-game-layout'>
      <SkinSelect classPrefix='serpentina' />

      <div className='serpentina-game-container'>
        <div className='serpentina-board-wrap'>
          <canvas
            ref={boardRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            aria-label='Juego SERPENTINA'
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
        classPrefix='serpentina'
        buttons={TOUCH_BUTTONS}
        onDown={handleDown}
        onUp={handleUp}
      />
    </div>
  );
}
