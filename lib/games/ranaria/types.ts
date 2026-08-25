import type { LeaderboardEntry } from "@/lib/games/types";

// Refs del juego — elementos inyectados desde React al wrapper (sin
// document.getElementById top-level).
export interface RanariaRefs {
  board: HTMLCanvasElement;
  scoreEl: HTMLSpanElement;
  livesEl: HTMLSpanElement;
  levelEl: HTMLSpanElement;
  timeEl: HTMLSpanElement;
  overlay: HTMLDivElement;
  overlayTitle: HTMLHeadingElement;
  overlayScore: HTMLParagraphElement;
}

export interface RanariaGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
