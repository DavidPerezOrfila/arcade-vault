// Types para integración Bloque Buster + Arcade Vault

import type { LeaderboardEntry } from '@/lib/games/types';

export interface BloqueBusterGameProps {
  // Leaderboard inicial servido por el Server Component; el componente
  // refresca tras cada envío vía la ruta de API canónica.
  initialLeaderboard?: LeaderboardEntry[];
}
