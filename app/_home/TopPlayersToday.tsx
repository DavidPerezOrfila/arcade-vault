import Link from 'next/link';
import { seededScores } from '@/app/data/players';
import { formatScore, topRankClass } from '@/lib/format';

// ponytail: seed fijo → mismos nombres y mismos números cada render, igual
// que el prototipo. Hasta que haya ≥5 jugadores reales sustituimos la lista
// por `getScores()`.
const SEED = 20260724;

export default function TopPlayersToday() {
  const rows = seededScores(SEED, 5);

  return (
    <div className='activity-card'>
      <div className='ac-head'>
        <div className='ac-title pixel neon-magenta'>▸ TOP JUGADORES · HOY</div>
        <Link href='/salon' className='lb-link'>
          VER SALÓN →
        </Link>
      </div>
      <div className='top-list'>
        {rows.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className={`top-row${topRankClass(i)}`}
          >
            <span className='tp-rk'>#{String(r.rank).padStart(2, '0')}</span>
            <span className='tp-bar'>
              <span className='tp-fill' style={{ width: `${100 - i * 16}%` }} />
            </span>
            <span className='tp-p'>{r.name}</span>
            <span className='tp-s'>{formatScore(r.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
