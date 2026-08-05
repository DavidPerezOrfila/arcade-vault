// Types para integración Asteroids + Arcade Vault

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
  isCurrentUser: boolean;
}

export interface AsteroidsGameProps {
  // Leaderboard inicial servido por el Server Component; el componente
  // refresca tras cada envío vía la ruta de API canónica.
  initialLeaderboard?: LeaderboardEntry[];
}
