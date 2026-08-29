import type { LeaderboardEntry } from '@/lib/games/types';

// Modo de juego: el escalado de dificultad y el terminal cambian.
// 'cpu-endurance': puntuado (rondas ganadas contra la CPU, 3 vidas).
// 'local-exhibition': partido 2P al mejor de 7, sin puntuación.
export type DueloPixelMode = 'cpu-endurance' | 'local-exhibition';

// Refs del juego — elementos inyectados desde React al wrapper (sin
// document.getElementById top-level).
export interface DueloPixelRefs {
  canvas: HTMLCanvasElement;
}

export interface DueloPixelGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
