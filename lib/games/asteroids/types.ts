// Types para integración Asteroids + Arcade Vault

export type { LeaderboardEntry } from '@/lib/games/types';
import type { LeaderboardEntry } from '@/lib/games/types';

export interface AsteroidsGameProps {
  // Leaderboard inicial servido por el Server Component; el componente
  // refresca tras cada envío vía la ruta de API canónica.
  initialLeaderboard?: LeaderboardEntry[];
}
