import type { LeaderboardEntry } from '@/lib/games/types';

// Refs del juego — elementos inyectados desde React al wrapper (sin
// document.getElementById top-level).
export interface SerpentinaRefs {
  board: HTMLCanvasElement;
  scoreEl: HTMLSpanElement;
  overlay: HTMLDivElement;
  overlayTitle: HTMLHeadingElement;
  overlayScore: HTMLParagraphElement;
}

export interface SerpentinaGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
