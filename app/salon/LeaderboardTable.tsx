import { formatDate, formatScore, topRankClass } from '@/lib/format';

interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface UserBadge {
  name: string;
  bestScore: number;
}

interface LeaderboardTableProps {
  rows: readonly LeaderboardRow[];
  user: UserBadge | null;
  activeGameTitle: string;
}

const ROW_STAGGER_MS = 50;

export function LeaderboardTable({
  rows,
  user,
  activeGameTitle
}: LeaderboardTableProps) {
  return (
    <div className='hall-table'>
      <div className='th'>
        <div>RANGO</div>
        <div>JUGADOR</div>
        <div>PUNTUACIÓN</div>
        <div>FECHA</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={`${r.name}-${r.at}-${i}`}
          className={`tr${topRankClass(i)}`}
          style={{ animationDelay: `${i * ROW_STAGGER_MS}ms` }}
        >
          <div className='rk'>#{String(i + 1).padStart(2, '0')}</div>
          <div className='pl'>{r.name}</div>
          <div className='sc'>{formatScore(r.score)}</div>
          <div className='dt'>{formatDate(r.at)}</div>
        </div>
      ))}
      {user && (
        <>
          <div className='tr you-label'>
            ▸ TU MEJOR MARCA EN {activeGameTitle}
          </div>
          <div
            className='tr you'
            style={{
              animationDelay: `${rows.length * ROW_STAGGER_MS + ROW_STAGGER_MS}ms`
            }}
          >
            <div className='rk neon-yellow'>
              #{String(rows.findIndex((r) => r.score <= user.bestScore) + 1).padStart(2, '0')}
            </div>
            <div className='pl neon-yellow'>{user.name}</div>
            <div className='sc neon-yellow'>{formatScore(user.bestScore)}</div>
            <div className='dt'>{formatDate(Date.now())}</div>
          </div>
        </>
      )}
    </div>
  );
}
