# app/data/types.ts

- GameCategory · type · L5-L5 — type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';
- GameFilter · type · L7-L7 — type GameFilter = GameCategory | 'TODOS';
- GameColor · type · L8-L8 — type GameColor = 'cyan' | 'magenta' | 'yellow' | 'green';
- Game · interface · L18-L28 — interface Game
- ScoreEntry · interface · L35-L41 — interface ScoreEntry
- ScoreRowDb · type · L44-L44 — type ScoreRowDb = Database['public']['Tables']['scores']['Row'];
- ScoreRow · interface · L48-L53 — interface ScoreRow
- User · interface · L55-L57 — interface User
