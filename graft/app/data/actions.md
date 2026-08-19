# app/data/actions.ts

- SaveScoreResult · type · L8-L8 — type SaveScoreResult = { ok: true } | { ok: false; error: string };
- parseFormData · function · L10-L18 — function parseFormData(formData: FormData)
- saveScoreAction · function · L20-L46 — async function saveScoreAction( _prev: SaveScoreResult | null, formData: FormData ): Promise<SaveScoreResult>
- LeaderboardRow · interface · L48-L53 — interface LeaderboardRow
- getSalonLeaderboard · function · L55-L69 — async function getSalonLeaderboard( gameId: string ): Promise<LeaderboardRow[]>
