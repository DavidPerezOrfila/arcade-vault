import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameBySlug } from '@/app/data/games';
import { getScoresByGame } from '@/app/data/scores';
import { formatDate, formatScore, topRankClass } from '@/lib/format';
import { LEADERBOARD_TOP_N } from '@/lib/games/constants';

export const dynamic = 'force-dynamic';

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return notFound();

  const rows = (await getScoresByGame(slug)).slice(0, LEADERBOARD_TOP_N);

  return (
    <div className='av-detail fade-in'>
      <div>
        <div className='detail-cover'>
          <div className={`cover-bg ${game.cover}`} />
        </div>
        <div className='detail-info' style={{ marginTop: 20 }}>
          <div className='detail-tags'>
            <span>{game.cat}</span>
            <span>1 JUGADOR</span>
            <span>TECLADO / TÁCTIL</span>
          </div>
          <h2 className='neon-cyan'>{game.title}</h2>
          <p>{game.long}</p>
          <div className='stat-strip'>
            <div>
              <div className='l'>Partidas</div>
              <div className='v'>{game.plays}</div>
            </div>
            <div>
              <div className='l'>Mejor global</div>
              <div className='v neon-magenta'>{formatScore(game.best)}</div>
            </div>
          </div>
          <div className='detail-actions'>
            <Link href={`/player/${game.id}`} className='btn xl pulse'>
              ▶ JUGAR AHORA
            </Link>
            <Link href='/' className='btn ghost lg'>
              VOLVER AL VAULT
            </Link>
          </div>
        </div>
      </div>

      <aside>
        <div className='leaderboard'>
          <h3>MEJORES PUNTUACIONES</h3>
          {rows.length === 0 ? (
            <div className='lb-empty pixel neon-cyan'>
              ▸ AÚN NO HAY PUNTUACIONES
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={`${r.name}-${r.at}-${i}`}
                className={`lb-row${topRankClass(i)}`}
              >
                <div className='rk'>#{String(i + 1).padStart(2, '0')}</div>
                <div className='pl'>
                  {r.name}
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--ink-faint)',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {formatDate(r.at)}
                  </div>
                </div>
                <div className='sc'>{formatScore(r.score)}</div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}