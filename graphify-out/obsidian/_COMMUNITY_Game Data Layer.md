---
type: community
cohesion: 0.10
members: 30
---

# Game Data Layer

**Cohesion:** 0.10 - loosely connected
**Members:** 30 nodes

## Members
- [[AuthPage()]] - code - app/auth/page.tsx
- [[CATS]] - code - app/data/games.ts
- [[DetailPage()]] - code - app/detalle/[id]/page.tsx
- [[DetailPageProps]] - code - app/detalle/[id]/page.tsx
- [[GAMES]] - code - app/data/games.ts
- [[Game]] - code - app/data/types.ts
- [[GameCategory]] - code - app/data/types.ts
- [[GameColor]] - code - app/data/types.ts
- [[GameFilter]] - code - app/data/types.ts
- [[PLAYERS]] - code - app/data/players.ts
- [[ReproductorContent()]] - code - app/reproductor/ReproductorContent.tsx
- [[ReproductorContent.tsx]] - code - app/reproductor/ReproductorContent.tsx
- [[ReproductorPage()]] - code - app/reproductor/page.tsx
- [[ScoreEntry]] - code - app/data/types.ts
- [[ScoreRow]] - code - app/data/types.ts
- [[User]] - code - app/data/types.ts
- [[clearUser()]] - code - app/data/storage.ts
- [[games.ts]] - code - app/data/games.ts
- [[generateStaticParams()]] - code - app/detalle/[id]/page.tsx
- [[getScores()]] - code - app/data/storage.ts
- [[getUser()]] - code - app/data/storage.ts
- [[page.tsx]] - code - app/auth/page.tsx
- [[page.tsx_1]] - code - app/detalle/[id]/page.tsx
- [[page.tsx_2]] - code - app/reproductor/page.tsx
- [[players.ts]] - code - app/data/players.ts
- [[saveScore()]] - code - app/data/storage.ts
- [[seededScores()]] - code - app/data/players.ts
- [[setUser()]] - code - app/data/storage.ts
- [[storage.ts]] - code - app/data/storage.ts
- [[types.ts]] - code - app/data/types.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Game_Data_Layer
SORT file.name ASC
```
