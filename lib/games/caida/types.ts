// Types para integración CAÍDA (Tetris) + Arcade Vault

import type { LeaderboardEntry } from '@/lib/games/types';

export interface CaidaGameProps {
  // Leaderboard inicial servido por el Server Component; el componente
  // refresca tras cada envío vía la ruta de API canónica.
  initialLeaderboard?: LeaderboardEntry[];
}

// Refs multi-elemento inyectados desde React al wrapper del juego (spec 07).
export interface CaidaRefs {
  board: HTMLCanvasElement; // 300×600 playfield
  nextCanvas: HTMLCanvasElement; // 120×120 preview
  scoreEl: HTMLElement; // HUD
  linesEl: HTMLElement; // HUD
  levelEl: HTMLElement; // HUD
  overlay: HTMLElement; // PAUSE / GAME OVER
  overlayTitle: HTMLElement;
  overlayScore: HTMLElement;
}
