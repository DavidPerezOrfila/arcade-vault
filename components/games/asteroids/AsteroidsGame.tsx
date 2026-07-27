import { useEffect, useRef, useState, useCallback } from 'react';
import type { AsteroidsGameProps, LeaderboardEntry } from '@/lib/games/asteroids/types';
import './asteroids.css';

// eslint-disable-next-line no-unused-vars
interface GameModule {
  // eslint-disable-next-line no-unused-vars
  initGame: (canvas: HTMLCanvasElement, _options?: { onGameOver?: (_score: number) => void }) => void;
  destroy: () => void;
  // eslint-disable-next-line no-unused-vars
  setOnGameOver: (_callback: (_finalScore: number) => void) => void;
}

export function AsteroidsGame({
  onScoreSubmit,
  onGameOver,
  embedMode = false,
  initialLeaderboard = []
}: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameModule | null>(null);
  const [leaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load game module dynamically (client-side only)
  useEffect(() => {
    import('../../../lib/games/asteroids/game.esm.js').then((mod) => {
      gameRef.current = {
        initGame: mod.initGame,
        destroy: mod.destroy,
        setOnGameOver: mod.setOnGameOver
      };
      setIsLoading(false);
    });
  }, []);

  // Handle game over - submit score if authenticated
  const handleGameOver = useCallback(
    async(score: number) => {
      onGameOver?.(score);

      if (onScoreSubmit) {
        try {
          await onScoreSubmit(score);
        } catch (error) {
          console.error('Failed to submit score:', error);
          setShowAuthPrompt(true);
        }
      } else {
        setShowAuthPrompt(true);
      }
    },
    [onScoreSubmit, onGameOver]
  );

  // Initialize game when canvas is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return undefined;

    const handleResize = () => {
      // Canvas logical size stays 800x600; CSS handles scaling
      canvas.width = 800;
      canvas.height = 600;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    game.setOnGameOver(handleGameOver);
    game.initGame(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy();
    };
  }, [handleGameOver]);

  if (isLoading) {
    return (
      <div className='asteroids-game-container'>
        <canvas ref={canvasRef} width={800} height={600} />
        <div className='asteroids-loading-overlay'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className='asteroids-game-container'>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        aria-label='Juego Asteroids'
      />

      {/* External HUD / Leaderboard - hidden in embed mode */}
      {!embedMode && (
        <div className='asteroids-leaderboard-hud'>
          <div className='asteroids-leaderboard-title'>TOP 10</div>
          <ol className='asteroids-leaderboard-list'>
            {leaderboard.slice(0, 10).map((entry) => (
              <li
                key={`${entry.playerName}-${entry.score}`}
                className={`asteroids-leaderboard-item ${entry.isCurrentUser ? 'asteroids-leaderboard-item--current-user' : ''}`}
              >
                <span className='asteroids-leaderboard-rank-player'>#{entry.rank} {entry.playerName}</span>
                <span>{entry.score.toLocaleString()}</span>
              </li>
            ))}
            {leaderboard.length === 0 && (
              <li className='asteroids-leaderboard-empty'>Sin puntuaciones aún</li>
            )}
          </ol>
        </div>
      )}

      {/* Auth prompt overlay */}
      {showAuthPrompt && !embedMode && (
        <div className='asteroids-auth-overlay'>
          <div className='asteroids-auth-prompt'>
            <h3 className='asteroids-auth-title'>¡Partida terminada!</h3>
            <p className='asteroids-auth-message'>Inicia sesión para guardar tu puntuación en el ranking global.</p>
            <a
              href='/auth?redirect=/juegos/asteroids'
              className='asteroids-auth-button'
            >
              Iniciar sesión
            </a>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className='asteroids-auth-dismiss'
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {/* Restart hint when gameover - handled by game internally via SPACE */}
    </div>
  );
}