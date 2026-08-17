import Link from 'next/link';
import { getGames } from '@/app/data/games';
import { FeatureIcon } from '@/app/_home/FeatureIcon';
import { FloatingSilhouettes } from '@/app/_home/FloatingSilhouettes';
import {
  FEATURES,
  MiniCard,
  PREVIEW_GAMES_COUNT,
  STATS,
  STAGGER_FEATURE_MS,
  STAGGER_STAT_MS,
} from '@/app/_home/homeData';
import RecentActivity from '@/app/_home/RecentActivity';
import TopPlayersToday from '@/app/_home/TopPlayersToday';
import HomeEnhancer from '@/app/_home/HomeEnhancer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const games = await getGames();

  return (
    <div className='home fade-in'>
      <section className='home-hero'>
        <FloatingSilhouettes />
        <div className='home-hero-inner'>
          <div className='hero-eyebrow pixel neon-yellow'>
            ▸ INSERTA UNA MONEDA<span className='blink'>_</span>
          </div>
          <h1 className='home-title'>
            <span className='line-1'>EL ARCADE</span>
            <span className='line-2'>CLÁSICO ESTÁ</span>
            <span className='line-3'>DE VUELTA</span>
          </h1>
          <p className='home-sub'>
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className='home-ctas'>
            <Link href='/games' className='btn xl pulse'>
              ▶ EXPLORAR JUEGOS
            </Link>
            <Link href='/auth' className='btn xl magenta'>
              ✦ CREAR CUENTA
            </Link>
          </div>
          <div className='hero-scroll' aria-hidden='true'>
            <span>DESLIZA</span>
            <span className='arrow'>▼</span>
          </div>
        </div>
      </section>

      <section className='home-section reveal'>
        <div className='section-head'>
          <div className='kicker pixel neon-magenta'>{'// 01'}</div>
          <h2 className='section-title'>¿POR QUÉ ARCADE VAULT</h2>
          <div className='section-rule' />
        </div>
        <div className='feature-grid'>
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`feature-card ${f.color}`}
              style={{ transitionDelay: `${i * STAGGER_FEATURE_MS}ms` }}
            >
              <FeatureIcon kind={f.id} />
              <div className='ft-title pixel'>{f.title}</div>
              <div className='ft-desc'>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className='home-section reveal'>
        <div className='section-head'>
          <div className='kicker pixel neon-cyan'>{'// 02'}</div>
          <h2 className='section-title'>JUEGOS DISPONIBLES AHORA</h2>
          <div className='section-rule' />
        </div>
        <div className='mini-rail'>
          {games.slice(0, PREVIEW_GAMES_COUNT).map((g) => (
            <MiniCard key={g.id} game={g} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href='/games' className='btn lg'>
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </section>

      <section className='home-stats reveal'>
        <div className='stats-inner'>
          {STATS.map((st, i) => (
            <div
              key={st.value + st.unit}
              className='stat-block'
              style={{ transitionDelay: `${i * STAGGER_STAT_MS}ms` }}
            >
              <div className='stat-n neon-yellow'>{st.value}</div>
              <div className='stat-u pixel'>{st.unit}</div>
              <div className='stat-s'>{st.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className='home-section reveal'>
        <div className='section-head'>
          <div className='kicker pixel neon-yellow'>{'// 03'}</div>
          <h2 className='section-title'>ACTIVIDAD EN VIVO</h2>
          <div className='section-rule' />
        </div>
        <div className='activity-grid'>
          <RecentActivity />
          <TopPlayersToday />
        </div>
      </section>

      <section className='home-section reveal'>
        <div className='section-head'>
          <div className='kicker pixel neon-green'>{'// 04'}</div>
          <h2 className='section-title'>PRECIOS</h2>
          <div className='section-rule' />
        </div>
        <div className='pricing-grid'>
          <div className='price-card'>
            <div className='pc-label pixel'>PLAN ÚNICO</div>
            <div className='pc-name pixel'>JUGADOR VAULT</div>
            <div className='pc-amount'>
              <span className='pc-amount-n'>$0</span>
              <span className='pc-amount-u'>/ SIEMPRE</span>
            </div>
            <div className='pc-tag'>SIN TRUCOS · SIN LETRA PEQUEÑA</div>
            <ul className='pc-list'>
              <li>✔ Acceso a todos los juegos</li>
              <li>✔ Ranking global y salón de la fama</li>
              <li>✔ Sin anuncios entre partidas</li>
              <li>✔ Guarda tus puntuaciones</li>
              <li>✔ Nuevos juegos cada mes</li>
              <li>✔ Funciona en cualquier navegador</li>
            </ul>
            <Link
              href='/auth'
              className='btn xl pulse'
              style={{ width: '100%' }}
            >
              EMPEZAR GRATIS →
            </Link>
            <div className='pc-foot'>No pedimos tarjeta. Nunca lo haremos</div>
            <div className='pc-stamp pixel'>
              FREE
              <br />
              PLAY
            </div>
          </div>

          <div className='pricing-faq'>
            <div className='faq-item'>
              <div className='faq-q pixel'>¿REALMENTE ES GRATIS</div>
              <div className='faq-a'>
                Sí. Arcade Vault es un proyecto sin fines de lucro hecho por
                amor a los clásicos. No hay versión premium escondida.
              </div>
            </div>
            <div className='faq-item'>
              <div className='faq-q pixel'>¿NECESITO CREAR CUENTA</div>
              <div className='faq-a'>
                No. Puedes jugar como invitado. Si quieres guardar tu puntuación
                y aparecer en el ranking, regístrate en 10 segundos.
              </div>
            </div>
            <div className='faq-item'>
              <div className='faq-q pixel'>¿CÓMO SOBREVIVEN SIN COBRAR</div>
              <div className='faq-a'>
                Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda
                la moneda que aceptamos.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='home-final reveal'>
        <h2 className='final-title pixel'>¿LISTO PARA JUGAR</h2>
        <Link href='/games' className='btn xl pulse final-cta'>
          INSERTAR MONEDA →
        </Link>
        <div className='final-tag'>
          Gratis. Sin registro obligatorio. Empieza en segundos.
        </div>
      </section>

      <HomeEnhancer />
    </div>
  );
}
