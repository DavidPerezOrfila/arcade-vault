'use client';

import type { LeaderboardEntry } from '@/lib/games/types';

interface LeaderboardListProps {
  // Prefijo CSS por juego (caida/asteroids) — el componente solo compone
  // clases; el styling vive en el CSS por juego.
  classPrefix:
    | 'caida'
    | 'asteroids'
    | 'serpentina'
    | 'bloque-buster'
    | 'ranaria'
    | 'duelo-pixel';
  entries: LeaderboardEntry[];
  maxRows: number;
  emptyText: string;
}

export function LeaderboardList({
  classPrefix,
  entries,
  maxRows,
  emptyText,
}: LeaderboardListProps) {
  const visible = entries.slice(0, maxRows);
  return (
    <ol className={`${classPrefix}-leaderboard-list`}>
      {visible.map((entry) => (
        <li
          key={`${entry.playerName}-${entry.score}`}
          className={`${classPrefix}-leaderboard-item ${entry.isCurrentUser ? `${classPrefix}-leaderboard-item--current-user` : ''}`}
        >
          <span className={`${classPrefix}-leaderboard-rank-player`}>
            #{entry.rank} {entry.playerName}
          </span>
          <span>{entry.score.toLocaleString()}</span>
        </li>
      ))}
      {visible.length === 0 && (
        <li className={`${classPrefix}-leaderboard-empty`}>{emptyText}</li>
      )}
    </ol>
  );
}
