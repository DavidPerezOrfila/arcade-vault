'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { submitDueloPixelScore } from '@/app/games/duelo-pixel/actions';
import { AuthPrompt } from '@/components/games/AuthPrompt';
import { LeaderboardList } from '@/components/games/LeaderboardList';
import { useArcadeGame } from '@/components/games/useArcadeGame';
import { useSkin } from '@/components/skin/SkinProvider';
import { SkinSelect } from '@/components/skin/SkinSelect';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';
import type {
  DueloPixelGameProps,
  DueloPixelMode,
  DueloPixelRefs,
} from '@/lib/games/duelo-pixel/types';
import './duelo-pixel.css';

const CANVAS_W = 800;
const CANVAS_H = 600;
const API_URL = '/api/leaderboard/duelo-pixel';

const MODES: { id: DueloPixelMode; label: string; hint: string }[] = [
  { id: 'cpu-endurance', label: 'RACHA CPU', hint: 'vs CPU' },
  { id: 'local-exhibition', label: '2 JUGADORES', hint: 'local' },
];

export function DueloPixelGame({
  initialLeaderboard = [],
}: DueloPixelGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<DueloPixelMode>('cpu-endurance');
  const { skin } = useSkin();

  const {
    gameRef,
    isLoading,
    leaderboard,
    showAuthPrompt,
    setShowAuthPrompt,
    handleGameOver,
  } = useArcadeGame({
    loadModule: () => import('@/lib/games/duelo-pixel/game.esm.js'),
    apiUrl: API_URL,
    submitScore: submitDueloPixelScore,
    initialLeaderboard,
  });

  // setOnGameOver antes de initGame — el motor dispara game over al iniciar,
  // ese callback debe estar bindeado. skin y mode reinician la partida.
  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game || !canvasRef.current) return;

    setShowAuthPrompt(false);
    const refs: DueloPixelRefs = { canvas: canvasRef.current };
    game.setOnGameOver(handleGameOver);
    game.initGame(refs, { onGameOver: handleGameOver, skin, mode });
  }, [gameRef, handleGameOver, setShowAuthPrompt, skin, mode]);

  useEffect(() => {
    if (isLoading) return undefined;
    startGame();
    return () => {
      gameRef.current?.destroy();
    };
  }, [isLoading, startGame, gameRef]);

  if (isLoading) {
    return (
      <div className='duelo-pixel-game-container'>
        <div className='duelo-pixel-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='duelo-pixel-game-layout'>
      <div className='duelo-pixel-game-container'>
        <div className='duelo-pixel-board-wrap'>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label='Juego DUELO PIXEL'
          />

          {showAuthPrompt && (
            <AuthPrompt
              classPrefix='duelo-pixel'
              gamePath='/games/duelo-pixel'
              title='¡Partida terminada!'
              message='Inicia sesión para guardar tus rondas en el ranking global.'
              onDismiss={() => setShowAuthPrompt(false)}
            />
          )}
        </div>

        <div className='duelo-pixel-panel'>
          {/* Selector de modo: solo cpu-endurance puntúa (dispara onGameOver). */}
          <div className='duelo-pixel-mode-bar'>
            {MODES.map((m) => (
              <button
                key={m.id}
                type='button'
                className={`duelo-pixel-mode-button${
                  mode === m.id ? ' is-active' : ''
                }`}
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                {m.label}
                <span className='duelo-pixel-mode-hint'>{m.hint}</span>
              </button>
            ))}
          </div>

          <SkinSelect classPrefix='duelo-pixel' />

          <div className='duelo-pixel-leaderboard'>
            <div className='duelo-pixel-leaderboard-title'>
              TOP {LEADERBOARD_TOP_N}
            </div>
            <LeaderboardList
              classPrefix='duelo-pixel'
              entries={leaderboard}
              maxRows={LEADERBOARD_TOP_N}
              emptyText='Sin puntuaciones aún'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
