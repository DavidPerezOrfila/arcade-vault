---
type: community
members: 23
---

# Game Data Layer

**Members:** 23 nodes

## Members
- [[CreateLeaderboardActionsParams]] - code - lib/games/leaderboard.ts
- [[LeaderboardRow]] - code - app/data/actions.ts
- [[SalonClient()]] - code - app/salon/SalonClient.tsx
- [[SaveScoreResult]] - code - app/data/actions.ts
- [[ScoreEntry]] - code - app/data/types.ts
- [[ScoreEntryInputParsed]] - code - app/data/schema.ts
- [[ScoreRowDb]] - code - app/data/types.ts
- [[ScoreRowSelected]] - code - app/data/scores.ts
- [[actions.ts_1]] - code - app/data/actions.ts
- [[createSupabaseServerClient()]] - code - lib/supabase/server.ts
- [[fetchScores()]] - code - app/data/scores.ts
- [[getSalonLeaderboard()]] - code - app/data/actions.ts
- [[getScoresByGame()]] - code - app/data/scores.ts
- [[getUserBestScore()]] - code - app/data/actions.ts
- [[leaderboard.ts]] - code - lib/games/leaderboard.ts
- [[mapToLeaderboardEntry()]] - code - lib/games/leaderboard.ts
- [[parseFormData()]] - code - app/data/actions.ts
- [[rowToEntry()]] - code - app/data/scores.ts
- [[saveScore()]] - code - app/data/scores.ts
- [[saveScoreAction()]] - code - app/data/actions.ts
- [[schema.ts_1]] - code - app/data/schema.ts
- [[scoreEntrySchema]] - code - app/data/schema.ts
- [[scores.ts]] - code - app/data/scores.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Game_Data_Layer
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_actions.ts]]
- 7 edges to [[_COMMUNITY_Cookie Management]]
- 6 edges to [[_COMMUNITY_._game.js]]
- 4 edges to [[_COMMUNITY_Session Storage]]
- 4 edges to [[_COMMUNITY_Storage State]]
- 3 edges to [[_COMMUNITY_RecentActivity.tsx]]
- 3 edges to [[_COMMUNITY_Test Generation]]

## Top bridge nodes
- [[scores.ts]] - degree 17, connects to 4 communities
- [[leaderboard.ts]] - degree 18, connects to 3 communities
- [[actions.ts_1]] - degree 15, connects to 3 communities
- [[createSupabaseServerClient()]] - degree 13, connects to 2 communities
- [[SalonClient()]] - degree 4, connects to 2 communities