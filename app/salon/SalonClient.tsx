'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSalonLeaderboard, getUserBestScore } from '@/app/data/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Game {
  id: string;
  title: string;
}

interface LeaderboardRow {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface SalonClientProps {
  initialGames: Game[];
}

export default function SalonClient({ initialGames }: SalonClientProps) {
  const firstGameId = initialGames[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState(firstGameId);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [userBest, setUserBest] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, name: data.user.email?.split('@')[0] ?? 'Jugador' });
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSalonLeaderboard(activeTab).then((data) => {
      if (mounted) {
        setRows(data);
        setLoading(false);
      }
    });
    if (user) {
      getUserBestScore(activeTab, user.id).then((score) => {
        if (mounted) setUserBest(score);
      });
    }
    return () => { mounted = false; };
  }, [activeTab, user]);

  function formatDate(ts: number): string {
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  const activeGame = initialGames.find((g) => g.id === activeTab) ?? initialGames[0];

  return (
    <div className='av-hall fade-in'>
      <div className='hall-head'>
        <h1>SALÓN DE LA FAMA</h1>
        <p className='pixel' style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className='hall-tabs'>
        {initialGames.map((g) => (
          <button
            key={g.id}
            className={`chip${activeTab === g.id ? ' active' : ''}`}
            onClick={() => setActiveTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      {loading && (
        <div className='hall-empty pixel neon-cyan'>▸ CARGANDO...</div>
      )}

      {!loading && rows.length === 0 && (
        <div className='hall-empty pixel neon-cyan'>
          ▸ AÚN NO HAY PUNTUACIONES PARA {activeGame.title.toUpperCase()}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          <div className='podium'>
            {rows[1] && (
              <div className='podium-slot silver'>
                <div className='rank-num'>02</div>
                <div className='name'>{rows[1].name}</div>
                <div className='score'>{rows[1].score.toLocaleString('es-ES')}</div>
                <div className='date'>{formatDate(rows[1].at)}</div>
              </div>
            )}
            {rows[0] && (
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
                <div className='name'>{rows[0].name}</div>
                <div className='score' style={{ fontSize: 20 }}>
                  {rows[0].score.toLocaleString('es-ES')}
                </div>
                <div className='date'>{formatDate(rows[0].at)}</div>
              </div>
            )}
            {rows[2] && (
              <div className='podium-slot bronze'>
                <div className='rank-num'>03</div>
                <div className='name'>{rows[2].name}</div>
                <div className='score'>{rows[2].score.toLocaleString('es-ES')}</div>
                <div className='date'>{formatDate(rows[2].at)}</div>
              </div>
            )}
          </div>

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
                className={`tr${['top1', 'top2', 'top3'][i] ?? ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className='rk'>#{String(i + 1).padStart(2, '0')}</div>
                <div className='pl'>{r.name}</div>
                <div className='sc'>{r.score.toLocaleString('es-ES')}</div>
                <div className='dt'>{formatDate(r.at)}</div>
              </div>
            ))}
            {user && userBest !== null && (
              <>
                <div className='tr you-label'>▸ TU MEJOR MARCA EN {activeGame.title}</div>
                <div className='tr you' style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
                  <div className='rk' style={{ color: 'var(--yellow)' }}>
                    #{String(rows.findIndex((r) => r.score <= userBest) + 1).padStart(2, '0')}
                  </div>
                  <div className='pl' style={{ color: 'var(--yellow)' }}>
                    {user.name}
                  </div>
                  <div
                    className='sc'
                    style={{
                      color: 'var(--yellow)',
                      textShadow: '0 0 6px rgba(245,255,0,0.5)'
                    }}
                  >
                    {userBest.toLocaleString('es-ES')}
                  </div>
                  <div className='dt'>{formatDate(Date.now())}</div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href='/' className='btn lg'>
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}