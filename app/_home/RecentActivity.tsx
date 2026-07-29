import { getScores } from '@/app/data/scores';
import { getGameById } from '@/app/data/games';

function relativeTime(at: number): string {
  const diff = Date.now() - at;
  if (diff < 60_000) return 'hace instantes';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

// ponytail: tono del marcador (alternancia magenta/cyan/yellow/green)
// elegida por hash determinista sobre `at` — estable entre renders.
const PALETTE = ['magenta', 'yellow', 'green', 'cyan'] as const;

function tone(at: number): (typeof PALETTE)[number] {
  return PALETTE[Math.abs(at) % PALETTE.length];
}

async function gameLabel(id: string): Promise<string> {
  const game = await getGameById(id);
  return game?.title ?? id;
}

export default async function RecentActivity() {
  const scores = (await getScores()).slice(0, 10);

  if (scores.length === 0) {
    return (
      <div className='activity-card'>
        <div className='ac-head'>
          <div className='ac-title pixel'>▸ ÚLTIMAS PUNTUACIONES</div>
        </div>
        <div className='ticker ticker-empty pixel neon-cyan'>
          ▸ AÚN NO HAY ACTIVIDAD RECIENTE
        </div>
      </div>
    );
  }

  // Resolve game labels in parallel
  const rowsWithLabels = await Promise.all(
    scores.map(async(r) => ({
      ...r,
      gameLabel: await gameLabel(r.game)
    }))
  );

  return (
    <div className='activity-card'>
      <div className='ac-head'>
        <div className='ac-title pixel'>▸ ÚLTIMAS PUNTUACIONES</div>
      </div>
      <div className='ticker'>
        {rowsWithLabels.map((r, i) => (
          <div
            key={`${r.name}-${r.at}-${i}`}
            className='tick-row'
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className={`tk-p neon-${tone(r.at)}`}>{r.name}</span>
            <span className='tk-mid'>▸ {r.gameLabel}</span>
            <span className='tk-s'>+{r.score.toLocaleString('es-ES')}</span>
            <span className='tk-t'>{relativeTime(r.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}