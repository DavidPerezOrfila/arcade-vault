import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ScoreEntry, ScoreRowDb } from './types';
import type { ScoreEntryInputParsed } from './schema';

const TABLE = 'scores';
const SELECT_COLUMNS = 'game, score, name, at, user_id';
const TOP_LIMIT = 100;

// Fila como la devuelve el `.select(SELECT_COLUMNS)` — subset de ScoreRowDb.
type ScoreRowSelected = Pick<
  ScoreRowDb,
  'game' | 'score' | 'name' | 'at' | 'user_id'
>;

function rowToEntry(row: ScoreRowSelected): ScoreEntry {
  return {
    game: row.game,
    score: row.score,
    name: row.name,
    at: new Date(row.at).getTime(),
    userId: row.user_id
  };
}

// Privado: sin `game` devuelve top global; con `game` filtra y desempata por
// `at desc` (mismo score gana el más reciente).
async function fetchScores(game?: string): Promise<ScoreEntry[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order('score', { ascending: false })
    .limit(TOP_LIMIT);
  if (game) {
    query = query.eq('game', game).order('at', { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToEntry);
}

export async function getScores(): Promise<ScoreEntry[]> {
  try {
    return await fetchScores();
  } catch {
    return [];
  }
}

export async function getScoresByGame(game: string): Promise<ScoreEntry[]> {
  try {
    return await fetchScores(game);
  } catch {
    return [];
  }
}

export async function saveScore(
  input: ScoreEntryInputParsed
): Promise<ScoreEntry> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      game: input.game,
      score: input.score,
      name: input.name,
      at: new Date(input.at).toISOString(),
      user_id: input.userId ?? null
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return rowToEntry(data);
}
