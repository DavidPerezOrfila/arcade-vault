# app/data/types.ts

- GameCategory · type · L3-L3 — type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';
- GameFilter · type · L5-L5 — type GameFilter = GameCategory | 'TODOS';
- GameColor · type · L6-L6 — type GameColor = 'cyan' | 'magenta' | 'yellow' | 'green';
- Game · interface · L16-L26 — interface Game
- ScoreEntry · interface · L33-L39 — interface ScoreEntry
- ScoreRowDb · type · L42-L42 — type ScoreRowDb = Database['public']['Tables']['scores']['Row'];
- ScoreRow · interface · L48-L53 — interface ScoreRow
- User · interface · L55-L57 — interface User
