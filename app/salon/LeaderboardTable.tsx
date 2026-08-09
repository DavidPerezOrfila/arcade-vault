import { formatDate, formatScore, topRankClass } from '@/lib/format';

interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface LeaderboardTableProps {
  rows: readonly LeaderboardRow[];
}

const ROW_STAGGER_MS = 50;

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
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
    </div>
  );
}
