import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ScoreEntry } from "./types";
import type { ScoreEntryInputParsed } from "./schema";

const SELECT_COLUMNS = "game, score, name, at";
const TOP_LIMIT = 100;

function rowToEntry(row: { game: string; score: number; name: string; at: string }): ScoreEntry {
  return {
    game: row.game,
    score: row.score,
    name: row.name,
    at: new Date(row.at).getTime(),
  };
}

export async function getScores(): Promise<ScoreEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("scores")
      .select(SELECT_COLUMNS)
      .order("score", { ascending: false })
      .limit(TOP_LIMIT);
    if (error) throw error;
    return (data ?? []).map(rowToEntry);
  } catch {
    return [];
  }
}

export async function getScoresByGame(game: string): Promise<ScoreEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("scores")
      .select(SELECT_COLUMNS)
      .eq("game", game)
      .order("score", { ascending: false })
      .order("at", { ascending: false })
      .limit(TOP_LIMIT);
    if (error) throw error;
    return (data ?? []).map(rowToEntry);
  } catch {
    return [];
  }
}

export async function saveScore(
  input: ScoreEntryInputParsed,
): Promise<ScoreEntry> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scores")
    .insert({
      game: input.game,
      score: input.score,
      name: input.name,
      at: new Date(input.at).toISOString(),
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return rowToEntry(data);
}
