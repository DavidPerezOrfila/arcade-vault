import Link from 'next/link';
import { getGames } from '@/app/data/games';

export type FeatureItem = {
  id: 'GAMEPAD' | 'FREE' | 'TROPHY' | 'ROCKET';
  title: string;
  desc: string;
  color: 'cyan' | 'yellow' | 'magenta' | 'green';
};

export type StatItem = { value: string; unit: string; sub: string };

export const STAGGER_FEATURE_MS = 80;
export const STAGGER_STAT_MS = 90;
export const PREVIEW_GAMES_COUNT = 6;

export const FEATURES: readonly FeatureItem[] = [
  {
    id: 'GAMEPAD',
    title: 'JUEGOS CLÁSICOS',
    desc: 'Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.',
    color: 'cyan',
  },
  {
    id: 'FREE',
    title: '100% GRATIS',
    desc: 'Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.',
    color: 'yellow',
  },
  {
    id: 'TROPHY',
    title: 'LADDER BOARDS',
    desc: 'Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.',
    color: 'magenta',
  },
  {
    id: 'ROCKET',
    title: 'SIEMPRE CRECIENDO',
    desc: 'Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.',
    color: 'green',
  },
] as const;

export const STATS: readonly StatItem[] = [
  { value: '12+', unit: 'JUEGOS', sub: 'Y CONTANDO' },
  { value: 'MILES', unit: 'DE PARTIDAS', sub: 'JUGADAS CADA DÍA' },
  { value: 'GLOBAL', unit: 'RANKING', sub: 'COMPITE CON EL MUNDO' },
] as const;

export function MiniCard({
  game,
}: {
  game: Awaited<ReturnType<typeof getGames>>[0];
}) {
  return (
    <Link href={`/games/${game.id}`} className='mini-card'>
      <div className='mini-cover'>
        <div className={`cover-bg ${game.cover}`} />
      </div>
      <div className='mini-meta'>
        <div className='mini-title'>{game.title}</div>
        <div className='mini-cat'>{game.cat}</div>
      </div>
    </Link>
  );
}
