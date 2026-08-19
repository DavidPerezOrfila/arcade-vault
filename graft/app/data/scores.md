# app/data/scores.ts

- ScoreRowSelected · type · L10-L13 — type ScoreRowSelected = Pick< ScoreRowDb, 'game' | 'score' | 'name' | 'at' | 'user_id' >;
- rowToEntry · function · L15-L23 — function rowToEntry(row: ScoreRowSelected): ScoreEntry
- fetchScores · function · L27-L40 — async function fetchScores(game?: string): Promise<ScoreEntry[]>
- getScores · function · L42-L48 — async function getScores(): Promise<ScoreEntry[]>
- getScoresByGame · function · L50-L56 — async function getScoresByGame(game: string): Promise<ScoreEntry[]>
- saveScore · function · L58-L77 — async function saveScore( input: ScoreEntryInputParsed ): Promise<ScoreEntry>
