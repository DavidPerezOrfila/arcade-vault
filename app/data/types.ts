// === Tipos compartidos de Arcade Vault ===

import type { Database } from "@/lib/supabase/types";

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

// Puntuación persistida en `public.scores` (Postgres via Supabase).
// El dominio sigue siendo `at: number` (epoch ms) — la capa scores.ts
// mapea `timestamptz ↔ number` para que la UI nunca vea el string ISO.
export interface ScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number;
}

// Fila cruda tal cual la devuelve Supabase — no se exporta a la UI.
export type ScoreRowDb = Database["public"]["Tables"]["scores"]["Row"];

// Fila de leaderboard sintética generada por seededScores() para el top-5
// "Players del día" mientras no haya jugadores reales suficientes.
export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // dd/mm/aaaa
}

export interface User {
  name: string;
}
