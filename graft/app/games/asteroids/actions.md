# app/games/asteroids/actions.ts

- SubmitScoreResult · type · L8-L8 — type SubmitScoreResult = { ok: true } | { ok: false; error: string };
- submitAsteroidsScore · function · L10-L35 — async function submitAsteroidsScore(score: number): Promise<SubmitScoreResult>
- mapToLeaderboardEntry · function · L37-L49 — function mapToLeaderboardEntry( entry: ScoreEntry, index: number, currentUserId: string | null ): LeaderboardEntry
- getAsteroidsLeaderboard · function · L51-L60 — async function getAsteroidsLeaderboard(): Promise<LeaderboardEntry[]>
