// === Tipos compartidos de Arcade Vault ===

export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
// Filtro de biblioteca: una categoría real o "TODOS" (chip que anula el filtro).
export type GameFilter = GameCategory | "TODOS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;
  color: GameColor;
  best: number;
  plays: string;
}

// Puntuación persistida por el jugador (clave `av_scores` en localStorage).
export interface ScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number; // epoch ms
}

// Fila de leaderboard sintética generada por seededScores() para Detalle/Salón.
// Observación: el spec solo tipa ScoreEntry (persistencia); seededScores produce
// filas de display con rank/date, que es justamente lo que consumen los prototipos.
export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // dd/mm/aaaa
}

export interface User {
  name: string;
}
