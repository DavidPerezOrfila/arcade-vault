# app/data/games.ts

- Game · interface · L4-L14 — interface Game
- GameFilter · type · L16-L16 — type GameFilter = 'TODOS' | 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';
- getGames · function · L18-L31 — async function getGames(): Promise<Game[]>
- getGameById · function · L33-L47 — async function getGameById(id: string): Promise<Game | null>
- getGameBySlug · function · L49-L52 — async function getGameBySlug(slug: string): Promise<Game | null>
- getGamesByCategory · function · L54-L70 — async function getGamesByCategory(cat: GameFilter): Promise<Game[]>
