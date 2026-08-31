'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSalonLeaderboard } from '@/app/data/actions';
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
  const [loading, setLoading] = useState(true);

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
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  // ponytail: "tu mejor marca" queda fuera hasta que Supabase Auth real asigne
  // user_id; el User de storage no lo tiene y getUserBestScore era dead path.
  const activeGame =
    initialGames.find((g) => g.id === activeTab) ?? initialGames[0];

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
            className={`chip${activeTab === g.id ? 'active' : ''}`}
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
          <LeaderboardTable rows={rows} />
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
