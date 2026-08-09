# app/data/scores.ts

- rowToEntry · function · L8-L22 — function rowToEntry(row: { game: string; score: number; name: string; at: string; user_id: string | null; }): ScoreEntry
- getScores · function · L24-L37 — async function getScores(): Promise<ScoreEntry[]>
- getScoresByGame · function · L39-L54 — async function getScoresByGame(game: string): Promise<ScoreEntry[]>
- saveScore · function · L56-L73 — async function saveScore( input: ScoreEntryInputParsed ): Promise<ScoreEntry>
