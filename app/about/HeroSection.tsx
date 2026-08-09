import { HighlightIcon } from './highlight-icon';

const HIGHLIGHTS = [
  {
    kind: 'HEART' as const,
    title: 'HECHO CON ❤️ PARA JUGADORES',
    color: 'magenta'
  },
  {
    kind: 'BROWSER' as const,
    title: 'JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR',
    color: 'cyan'
  },
  {
    kind: 'PLANT' as const,
    title: 'PROYECTO EN CONSTANTE CRECIMIENTO',
    color: 'green'
  }
] as const;

const STAGGER_MS = 80;

export function HeroSection() {
  return (
    <section className='about-hero'>
      <div className='kicker pixel neon-yellow'>▸ ACERCA DE</div>
      <h1 className='about-title'>ACERCA DE ARCADE VAULT</h1>
      <p className='about-mission'>
        Creamos una sala de juegos retro en la web: partidas rápidas, tablas de
        clasificación y esa estética arcade que nunca pasa de moda.
      </p>

      <div className='highlight-row'>
        {HIGHLIGHTS.map((highlight, index) => (
          <div
            key={highlight.kind}
            className={`highlight ${highlight.color}`}
            style={{ transitionDelay: `${index * STAGGER_MS}ms` }}
          >
            <HighlightIcon kind={highlight.kind} />
            <div className='hl-text pixel'>{highlight.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
