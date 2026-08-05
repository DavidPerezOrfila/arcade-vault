// Types para integracción Asteroids + Arcade Vault

export interface AsteroidsGameState {
  score: number;
  lives: number;
  level: number;
  state: 'playing' | 'dead' | 'gameover';
}

export interface AsteroidsConfig {
  canvasWidth: number; // 800
  canvasHeight: number; // 600
  maxWidth: number; // responsive cap
  maxHeight: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
  isCurrentUser: boolean;
}

export interface AsteroidsGameProps {
  // eslint-disable-next-line no-unused-vars
  onScoreSubmit?: (_score: number) => Promise<void>;
  initialConfig?: Partial<AsteroidsConfig>;
  embedMode?: boolean;
  initialLeaderboard?: LeaderboardEntry[];
}