// Tipos compartidos por todos los juegos (leaderboard y props de página).

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
  isCurrentUser: boolean;
}
