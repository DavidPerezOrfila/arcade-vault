import { formatDate, formatScore } from '@/lib/format';

interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

export function Podium({ rows }: { rows: readonly LeaderboardRow[] }) {
  const first = rows[1];
  const champion = rows[0];
  const third = rows[2];

  return (
    <div className='podium'>
      {first && (
        <div className='podium-slot silver'>
          <div className='rank-num'>02</div>
          <div className='name'>{first.name}</div>
          <div className='score'>{formatScore(first.score)}</div>
          <div className='date'>{formatDate(first.at)}</div>
        </div>
      )}
      {champion && (
        <div className='podium-slot gold'>
          <div
            className='pixel'
            style={{
              fontSize: 9,
              color: 'var(--gold)',
              letterSpacing: '0.18em'
            }}
          >
            CAMPEÓN
          </div>
          <div className='rank-num' style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className='name'>{champion.name}</div>
          <div className='score' style={{ fontSize: 20 }}>
            {formatScore(champion.score)}
          </div>
          <div className='date'>{formatDate(champion.at)}</div>
        </div>
      )}
      {third && (
        <div className='podium-slot bronze'>
          <div className='rank-num'>03</div>
          <div className='name'>{third.name}</div>
          <div className='score'>{formatScore(third.score)}</div>
          <div className='date'>{formatDate(third.at)}</div>
        </div>
      )}
    </div>
  );
}
