# app/data/actions.ts

- SaveScoreResult · type · L8-L8 — type SaveScoreResult = { ok: true } | { ok: false; error: string };
- parseFormData · function · L10-L18 — function parseFormData(formData: FormData)
- saveScoreAction · function · L20-L39 — async function saveScoreAction( _prev: SaveScoreResult | null, formData: FormData ): Promise<SaveScoreResult>
- LeaderboardRow · interface · L41-L46 — interface LeaderboardRow
- getSalonLeaderboard · function · L48-L62 — async function getSalonLeaderboard( gameId: string ): Promise<LeaderboardRow[]>
- getUserBestScore · function · L64-L84 — async function getUserBestScore( gameId: string, userId: string ): Promise<number | null>
