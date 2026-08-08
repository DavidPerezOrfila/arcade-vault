'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSalonLeaderboard, getUserBestScore } from '@/app/data/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LeaderboardTable } from './LeaderboardTable';
import { Podium } from './Podium';

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
    getSalonLeaderboard(activeTab)
      .then((data) => {
        if (mounted) {
          setRows(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    if (user) {
      getUserBestScore(activeTab, user.id)
        .then((score) => {
          if (mounted) setUserBest(score);
        })
        .catch(() => {
          // ponytail: best score no es critico; si falla, userBest se queda
          // en null y la fila "tu mejor marca" simplemente no aparece.
        });
    }
    return () => {
      mounted = false;
    };
  }, [activeTab, user]);

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
          <Podium rows={rows} />
          <LeaderboardTable
            rows={rows}
            activeGameTitle={activeGame.title}
            user={user && userBest !== null ? { name: user.name, bestScore: userBest } : null}
          />
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
