'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { submitCaidaScore } from '@/app/games/caida/actions';
import type {
  CaidaGameProps,
  CaidaRefs,
  LeaderboardEntry
} from '@/lib/games/caida/types';
import './caida.css';

interface GameModule {
   
  // eslint-disable-next-line no-unused-vars -- shape declared for the game module impl
  initGame: (
    refs: CaidaRefs,
    _options?: { onGameOver?: (_score: number) => void },
  ) => void;
  destroy: () => void;
  // eslint-disable-next-line no-unused-vars
  setOnGameOver: (_callback: (_finalScore: number) => void) => void;
}

export function CaidaGame({ initialLeaderboard = [] }: CaidaGameProps) {
  const boardRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<HTMLSpanElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayScoreRef = useRef<HTMLParagraphElement>(null);

  const gameRef = useRef<GameModule | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(initialLeaderboard);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load game module dynamically (client-side only)
  useEffect(() => {
    import('../../../lib/games/caida/game.esm.js').then((mod) => {
      gameRef.current = {
        initGame: mod.initGame,
        destroy: mod.destroy,
        setOnGameOver: mod.setOnGameOver
      };
      setIsLoading(false);
    });
  }, []);

  // Refresh leaderboard from the canonical API route
  const refreshLeaderboard = useCallback(async() => {
    const response = await fetch('/api/leaderboard/caida');
    if (response.ok) {
      const data = (await response.json()) as LeaderboardEntry[];
      setLeaderboard(data);
    }
  }, []);

  // Handle game over - submit score once, then refresh or prompt
  const handleGameOver = useCallback(
    async(score: number) => {
      const result = await submitCaidaScore(score);
      if (!result.ok) {
        setShowAuthPrompt(true);
        return;
      }
      await refreshLeaderboard();
    },
    [refreshLeaderboard]
  );

  // Start (or restart) the game wiring all refs into the wrapper.
  // setOnGameOver BEFORE initGame — ordering is load-bearing.
  const startGame = useCallback(() => {
    const game = gameRef.current;
    const board = boardRef.current;
    const nextCanvas = nextRef.current;
    const scoreEl = scoreRef.current;
    const linesEl = linesRef.current;
    const levelEl = levelRef.current;
    const overlay = overlayRef.current;
    const overlayTitle = overlayTitleRef.current;
    const overlayScore = overlayScoreRef.current;
    if (
      !game ||
      !board ||
      !nextCanvas ||
      !scoreEl ||
      !linesEl ||
      !levelEl ||
      !overlay ||
      !overlayTitle ||
      !overlayScore
    ) {return;}

    setShowAuthPrompt(false);
    game.setOnGameOver(handleGameOver);
    game.initGame(
      {
        board,
        nextCanvas,
        scoreEl,
        linesEl,
        levelEl,
        overlay,
        overlayTitle,
        overlayScore
      },
      { onGameOver: handleGameOver }
    );
  }, [handleGameOver]);

  // Initialize once the module is loaded and the elements are mounted
  useEffect(() => {
    if (isLoading) return undefined;
    startGame();
    return () => {
      gameRef.current?.destroy();
    };
  }, [isLoading, startGame]);

  // Test hook (solo con ?e2e=1): permite forzar el game over de forma
  // determinista desde los tests E2E de Playwright.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const isE2E =
      new URLSearchParams(window.location.search).get('e2e') === '1';
    if (!isE2E) return undefined;

    const win = window as unknown as {
      // eslint-disable-next-line no-unused-vars
      __forceGameOver?: (_score?: number) => void;
    };
    win.__forceGameOver = (_score = 1000) => handleGameOver(_score);

    return () => {
      delete win.__forceGameOver;
    };
  }, [handleGameOver]);

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
          width={300}
          height={600}
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

        {/* Auth prompt overlay */}
        {showAuthPrompt && (
          <div className='caida-auth-overlay'>
            <div className='caida-auth-prompt'>
              <h3 className='caida-auth-title'>¡Partida terminada!</h3>
              <p className='caida-auth-message'>
                Inicia sesión para guardar tu puntuación en el ranking global.
              </p>
              <a
                href='/auth?redirect=/games/caida'
                className='caida-auth-button'
              >
                Iniciar sesión
              </a>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className='caida-auth-dismiss'
              >
                Ahora no
              </button>
            </div>
          </div>
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
          <canvas ref={nextRef} width={120} height={120} aria-hidden='true' />
        </div>

        {/* External HUD / Leaderboard */}
        <div className='caida-leaderboard'>
          <div className='caida-leaderboard-title'>TOP 10</div>
          <ol className='caida-leaderboard-list'>
            {leaderboard.slice(0, 10).map((entry) => (
              <li
                key={`${entry.playerName}-${entry.score}`}
                className={`caida-leaderboard-item ${entry.isCurrentUser ? 'caida-leaderboard-item--current-user' : ''}`}
              >
                <span className='caida-leaderboard-rank-player'>
                  #{entry.rank} {entry.playerName}
                </span>
                <span>{entry.score.toLocaleString()}</span>
              </li>
            ))}
            {leaderboard.length === 0 && (
              <li className='caida-leaderboard-empty'>Sin puntuaciones aún</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
