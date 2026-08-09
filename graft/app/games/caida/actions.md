# app/games/caida/actions.ts

- SubmitScoreResult · type · L8-L8 — type SubmitScoreResult = { ok: true } | { ok: false; error: string };
- submitCaidaScore · function · L10-L42 — async function submitCaidaScore( score: number ): Promise<SubmitScoreResult>
- mapToLeaderboardEntry · function · L44-L56 — function mapToLeaderboardEntry( entry: ScoreEntry, index: number, currentUserId: string | null ): LeaderboardEntry
- getCaidaLeaderboard · function · L58-L71 — async function getCaidaLeaderboard(): Promise<LeaderboardEntry[]>
