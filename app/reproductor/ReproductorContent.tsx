'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { GAMES } from '@/app/data/games';
import styles from './page.module.css';

export default function ReproductorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get('game');

  useEffect(() => {
    if (gameId) {
      const game = GAMES.find((g) => g.id === gameId);
      if (game) {
        router.push(`/player/${gameId}`);
      } else {
        router.push('/biblioteca');
      }
    }
  }, [gameId, router]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>REPRODUCTOR</h1>
        <p className={styles.subtitle}>
          Selecciona un juego para empezar a jugar
        </p>
      </header>

      <div className={styles.grid} role="list" aria-label="Juegos disponibles">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/reproductor?game=${game.id}`}
            className={styles.card}
            role="listitem"
          >
            <div className={styles.cardImage} style={{ backgroundImage: `url(${game.cover})` }} />
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <span className={styles.cardCategory}>{game.cat}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}