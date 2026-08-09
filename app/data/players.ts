import type { ScoreRow } from './types';

export const PLAYERS: readonly string[] = [
  'PX_KAI', 'NEONFOX', 'Z3R0COOL', 'M00NRYU', 'VAULT_07', 'GLITCHA',
  'ATARI_KID', 'CYBER_LU', 'MAGENTA88', 'SCANLINE', 'BIT_LORD', 'ARKADYA',
  'DROID_X', 'RGB_QUEEN', 'PIXEL_DAD', 'RETROVIRA', 'VECTORX', 'JOY_STK'
];

// LCG (Numerical Recipes). Constantes con valores fijos — no datos aleatorios
// criptográficos, solo ruido determinista para el mock.
const LCG_A = 9301;
const LCG_C = 49297;
const LCG_M = 233280;
// Rangos del score sintético.
const SCORE_BASE_MIN = 50000;
const SCORE_BASE_RANGE = 250000;
const STEP_MIN = 2000;
const STEP_RANGE = 4000;
const MIN_SCORE = 1000;
// Fechas sintéticas — año fijo para que la salida sea estable entre renders.
const MAX_DAY = 28;
const MAX_MONTH = 12;
const MOCK_YEAR = 2026;

// Generador determinista de leaderboards sintéticos (LCG pseudoaleatorio con seed).
// Se conserva el algoritmo del prototipo para que las puntuaciones sean estables
// entre renders y sean idénticas a las del diseño original.
export function seededScores(seed: number, count = 12): ScoreRow[] {
  let s = seed;
  const rand = () => (s = (s * LCG_A + LCG_C) % LCG_M) / LCG_M;
  const used = new Set<string>();
  const rows: ScoreRow[] = [];
  for (let i = 0; i < count; i++) {
    let name = PLAYERS[0];
    do {
      name = PLAYERS[Math.floor(rand() * PLAYERS.length)];
    } while (used.has(name) && used.size < PLAYERS.length);
    used.add(name);
    const base = Math.floor(SCORE_BASE_MIN + rand() * SCORE_BASE_RANGE);
    const score = base - i * Math.floor(STEP_MIN + rand() * STEP_RANGE);
    const day = String(1 + Math.floor(rand() * MAX_DAY)).padStart(2, '0');
    const mon = String(1 + Math.floor(rand() * MAX_MONTH)).padStart(2, '0');
    rows.push({ rank: i + 1, name, score: Math.max(score, MIN_SCORE), date: `${day}/${mon}/${MOCK_YEAR}` });
  }
  return rows
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
