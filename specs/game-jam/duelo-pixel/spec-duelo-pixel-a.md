---
state: Implemented
dependencies: ['04-supabase-scores-foundation', '06-games-catalog-salon']
date: 2026-08-29
---

# duelo-pixel spec-a — Racha contra CPU (single-canvas) + partido 2P de exhibición

Motor Pong desde cero en `lib/games/duelo-pixel/game.esm.js` que publica `duelo-pixel` como primer juego VERSUS de Arcade Vault en `/games/duelo-pixel`. Eje de diferencia vs spec-b: **el leaderboard puntúa el modo solitario contra CPU** — el marcador es el **número de rondas ganadas** usando solo una paleta (`W`/`S`/flechas) sobre un único canvas 800×600 con HUD y overlays dibujados dentro. El modo local a dos jugadores (requisito del copy del catálogo) existe como **exhibición sin puntuación**: al mejor de 7, sin envío al leaderboard. Reutiliza la fila `duelo-pixel` del catálogo (VERSUS, cyan, cover `cover-duelo` ya en `app/globals.css`), la factory `createLeaderboardActions` y la UI compartida `useArcadeGame`/`AuthPrompt`/`LeaderboardList`.

## Scope

**In scope:**

- Motor ES module `lib/games/duelo-pixel/game.esm.js` escrito **desde cero** (no hay vanilla ref en `resources/started-games/` — la entrada de catálogo dice "no localizado"). Render geométrico con `fillRect`/`roundRect`; **cero assets**.
- **Dos modos**, seleccionables en el wrapper y pasados al motor vía `initGame({ canvas }, { skin, mode })`:
  - `cpu-endurance` (**puntuado**): partida infinita vs CPU. Cada **ronda** (duelo) es primera a 5 puntos. Ganar una ronda → **+1 al marcador (rondas ganadas)** y sube un nivel de dificultad de la CPU; perder una ronda → **−1 vida** (3 vidas). Terminal cuando vidas = 0 → `onGameOver(rondasGanadas)`.
  - `local-exhibition` (**sin puntuación**): 2 jugadores locales, al mejor de 7 rondas (primero a 4), cada ronda primera a 5. Overlay en-canvas con el vencedor y `R` de revancha. **Nunca** llama a `onGameOver` (no hay envío al leaderboard).
- **Rebote clásico de 3 zonas en la paleta**: según el tercio de la paleta golpeado, la pelota sale con 3 ángulos discretos (estilo Pong arcade); la velocidad se conserva.
- **CPU con escalado por dificultad**: ráfaga (tracking) acota su velocidad y error según `tier` (rondas ganadas); sirve la pelota con velocidad creciente por ronda (con tope). Beatable por diseño.
- Refs = `{ canvas }` único, canvas interno fijo 800×600; CSS escala con `aspect-ratio: 4/3`. Cero `document.getElementById` top-level.
- HUD en-canvas (marcador, rondas ganadas, vidas) y overlays en-canvas (pausa / fin de partida) con tokens de `PALETTES`; el motor resuelve `PALETTES[isSkinId(skin) ? skin : DEFAULT_SKIN]` (`@/lib/games/skins`).
- Controles: `W`/`S` **y** `ArrowUp`/`ArrowDown` mueven la paleta en `cpu-endurance`; en `local-exhibition` `W`/`S` = J1 (izquierda) y `ArrowUp`/`ArrowDown` = J2 (derecha). `P`/`Escape` pausa. `R`/`Espacio` reinicia desde el overlay.
- Loop por `setTimeout` encadenado (nunca `requestAnimationFrame` — se estrangula en WebKit headless/CI), `dt = Math.min(dt, 0.05)` (guard tab-blur).
- `attachInput`/`detachInput` pareados en `window` (`keydown`/`keyup`); `destroy()` idempotente cancela el timer y desadjunta listeners; `onGameOver(score)` fire **una vez** (guard `gameOverFired`).
- Exports: `initGame({ canvas }, { skin, mode })`, `destroy()`, `setOnGameOver(cb)` — `setOnGameOver` se cablea ANTES de `initGame` (patrón bloque-buster).
- Componente React `DueloPixelGame` (`components/games/duelo-pixel/DueloPixelGame.tsx` + `duelo-pixel.css`), integrado con `useArcadeGame`; selector de modo (2 botones) en el wrapper.
- Server Actions `submitDueloPixelScore` / `getDueloPixelLeaderboard` (fachada sobre `createLeaderboardActions({ gameId: 'duelo-pixel', gamePath: '/games/duelo-pixel' })`, no recipe inline).
- Página `/games/duelo-pixel` (Server Component + Client Component interactivo) + API route `/api/leaderboard/duelo-pixel` (`GET`).
- Tipos TypeScript `lib/games/duelo-pixel/types.ts` (`DueloPixelRefs`, `DueloPixelMode`, `DueloPixelGameProps`).
- **Reutiliza la fila de catálogo** spec 06 (`duelo-pixel`, VERSUS, cyan, best 24, cover `cover-duelo` ya en `app/globals.css:648`). **No se crea migration** ni se edita `globals.css`.
- `?e2e=1` → `window.__forceGameOver(score)` (proveído por `useArcadeGame`). Auth no autenticado en game over → `/auth?redirect=/games/duelo-pixel`.
- Editar union `classPrefix`: añadir `'duelo-pixel'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8`.
- Cobertura de skins en `resources/skins-todo.md` y mover `duelo-pixel` a Implementado en `resources/implemented-games.md` (en el mismo cambio).
- SEO metadata: title, description, Open Graph.

**Out of scope:**

- Marcador de 2P local publicado en el leaderboard — eso es spec-b (racha del jugador acreditado).
- HUD/overlay como elementos DOM separados / `initGame` multi-ref — ese es el ejede spec-b.
- Rebote angular continuo ∝ offset (se usa rebote discreto de 3 zonas clásico); el continuo es spec-b.
- CPU "casual" como modo puntuado (en spec-b el modo casual es el de CPU y el puntuado es el local).
- Power-ups, hipervelocidad, límites móviles, efectos de sonido.
- Multijugador online / remoto (fuera del modelo de Arcade Vault: scores por slug y por usuario).
- Mobile touch controls (solo teclado).
- Bindings de teclas personalizables / guardado de partida en curso.
- Tema claro/oscuro propio (la plataforma ownea el tema).

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (fila `duelo-pixel` seedeada con cover `cover-duelo`). **No tocar el catálogo ni `globals.css`.**

**Nuevos tipos TypeScript (`lib/games/duelo-pixel/types.ts`):**

```typescript
import type { LeaderboardEntry } from '@/lib/games/types';

type DueloPixelMode = 'cpu-endurance' | 'local-exhibition';

interface DueloPixelRefs {
  canvas: HTMLCanvasElement;
}

interface DueloPixelGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
```

**Refs del juego (inyectados desde React al wrapper):**

| Refs     | Elemento                                                    |
| -------- | ----------------------------------------------------------- |
| `canvas` | canvas 800×600 playfield (HUD y overlays se dibujan dentro) |

**Estado interno del motor (module-scoped en `game.esm.js`, documentado para el wrapper):**

```typescript
interface DueloPixelPaddle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
}
interface DueloPixelBall {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  speed: number;
}
interface DueloPixelCpu {
  targetY: number;
  maxSpeed: number;
  error: number;
}

// gameState: 'serve' | 'playing' | 'paused' | 'gameover'
// mode: 'cpu-endurance' | 'local-exhibition'
// lives: 3 · duelsWon (score) · tier = duelsWon · gameOverFired: boolean
const DUEL_POINTS = 5; // puntos para ganar una ronda
const STARTING_LIVES = 3; // vidas en cpu-endurance
const BEST_OF = 7; // rondas del 2P exhibition (primero a 4)
```

## Implementation Plan

1. **Wrapper ES module** — Crear `lib/games/duelo-pixel/game.esm.js` desde cero:
   - Constantes: canvas interno `W=800`, `H=600`, `PADDLE_W=14`, `PADDLE_H=96`, `BALL_SIZE=14`, `PLAYER_PADDLE_SPEED=420`, `BASE_BALL_SPEED=300`, `MAX_BALL_SPEED=560`, `DUEL_POINTS=5`, `STARTING_LIVES=3`, `BEST_OF=7`, `SERVE_DELAY=1.2` (s), `PADDLE_X_LEFT=24`, `PADDLE_X_RIGHT=W-24-PADDLE_W`.
   - Paleta: `PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN]`; tokens — fondo `background`, paleta J1 `player`, paleta CPU/J2 `enemy`, pelota `bullet`, línea central `accent`, texto HUD `hudText`, partículas de punto `particle`.
   - Modos: `resetRun(mode)` inicializa estado por modo; `cpu-endurance` con `lives=3`, `duelsWon=0`, `tier=0`, estado `'serve'`; `local-exhibition` con contadores de rondas 0–0 y marcador de ronda.
   - Física: rebote en paredes superior/inferior invierte `vy`; rebote en paleta con **3 zonas discretas** (tercio alto → `vy` pronunciado hacia arriba, medio → ángulo suave, bajo → `vy` pronunciado hacia abajo), conservando `speed`; `speed` sube +8 por toque de paleta con tope `MAX_BALL_SPEED`. Gol de un jugador → reset a `'serve'`, saque hacia el lado que recibió el punto.
   - CPU (`cpu-endurance`): solo persigue cuando `ball.vx > 0`; `targetY = ball.y - error/2` con `error = max(90 - tier*8, 10)` y `maxSpeed = 240 + tier*18` (tope 520); `SERVE_SPEED = 300 + tier*10` (tope 420). CPU sí desvía el rebote con las 3 zonas.
   - Ronda: al llegar a `DUEL_POINTS` de un lado → `cpu-endurance`: J1 marca → `duelsWon++`, `tier=duelsWon`, reset de ronda; CPU marca → `lives--`, reset; si `lives===0` → `gameOver()` fire-once. `local-exhibition`: se suma la ronda al contador del ganador; al llegar a 4 → overlay vencedor en-canvas, `R` reinicia el set (sin `onGameOver`).
   - Loop `setTimeout` encadenado, handle `timerId` module-scoped, `dt = Math.min(dt, 0.05)`.
   - `initGame({ canvas }, { skin, mode })` obtiene `ctx` dentro, arranca `attachInput()` y el loop; `setOnGameOver(cb)` almacena `onGameOverCallback`; `gameOver()` llama `onGameOverCallback(duelsWon)` una vez (guard `gameOverFired`).
   - Input pareado: `keydown`/`keyup` en `window` — en `cpu-endurance` `W`/`S` y `ArrowUp`/`ArrowDown` mueven la paleta J1; en `local-exhibition` `W`/`S` = J1 y `ArrowUp`/`ArrowDown` = J2; `KeyP`/`Escape` pausa; `KeyR`/`Space` reinicia desde overlays. `detachInput()` los desadjunta.
   - `destroy()` idempotente: cancelar `timerId`, `detachInput()`, null-guard de `ctx`.

2. **Tipos TypeScript** — `lib/games/duelo-pixel/types.ts` con `DueloPixelRefs`, `DueloPixelMode`, `DueloPixelGameProps` (re-export `LeaderboardEntry`).

3. **Componente React `DueloPixelGame`** (`components/games/duelo-pixel/DueloPixelGame.tsx`): `useRef` del canvas, `useState` de `mode` (default `'cpu-endurance'`), dynamic `import('@/lib/games/duelo-pixel/game.esm.js')` en `useEffect`, `game.setOnGameOver(handleGameOver)` ANTES de `game.initGame({ canvas }, { skin, mode })`, cleanup `game.destroy()`. Deps del `useEffect`: `[isLoading, gameRef, handleGameOver, skin, mode]` (cambio de modo o skin = teardown + restart). `useArcadeGame({ loadModule, apiUrl: '/api/leaderboard/duelo-pixel', submitScore: submitDueloPixelScore, initialLeaderboard })`. Selector de modo (J1 vs CPU / 2J local) como dos botones en el wrapper; solo `cpu-endurance` dispara submit. Si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/duelo-pixel`.

4. **Estilos** — `components/games/duelo-pixel/duelo-pixel.css` (prefijo `duelo-pixel-`): canvas `aspect-ratio: 4/3`, `max-width: 640px`, `image-rendering: pixelated`, selector de modo, estilos del panel/leaderboard/auth prefijados, `@media (prefers-reduced-motion)`.

5. **Server Actions** (`app/games/duelo-pixel/actions.ts`): fachada sobre `createLeaderboardActions({ gameId: 'duelo-pixel', gamePath: '/games/duelo-pixel' })` → `submitDueloPixelScore` / `getDueloPixelLeaderboard` (mismo patrón que `app/games/asteroids/actions.ts`).

6. **API route** (`app/api/leaderboard/duelo-pixel/route.ts`): `GET` → `getDueloPixelLeaderboard()`, catch → 500.

7. **Página `/games/duelo-pixel/page.tsx`** (ruta estática que eclipsa `app/games/[slug]/page.tsx`): Server Component con `Metadata` (title/description/OG), `LeaderboardServer` en `<Suspense>`, `<DueloPixelGame initialLeaderboard>`; sidebar de controles (W/S + flechas, P pausa) + objetivo y reglas de scoring (ronda = primera a 5; +1 al marcador por ronda ganada; vidas 0 = fin).

8. **Editar union `classPrefix`** — añadir `'duelo-pixel'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8` (`'caida' | 'asteroids' | 'serpentina' | 'bloque-buster' | 'ranaria' | 'duelo-pixel'`).

9. **Tests E2E** — `tests/e2e/duelo-pixel.spec.ts`: carga `/games/duelo-pixel?e2e=1`, canvas visible, `window.__forceGameOver(1000)` → submit → leaderboard actualiza; AuthPrompt con enlace `/auth?redirect=/games/duelo-pixel`; navegación fuera de la página sin timers colgados (check del adversario del e2e de caida).

10. **Docs** — añadir fila `duelo-pixel` a `resources/skins-todo.md` (Completo) y mover `duelo-pixel` a Implementado en `resources/implemented-games.md` (juegos jugables: 6).

## Acceptance Criteria

- [ ] `npm run dev` → `/games/duelo-pixel` carga sin errores JS/TS en consola
- [ ] Canvas interno 800×600 renderiza dos paletas, pelota y línea central; CSS escala manteniendo 4:3
- [ ] Modo `cpu-endurance`: `W`/`S` y flechas mueven la paleta; la CPU persigue con error decreciente por ronda
- [ ] Ronda primera a 5: ganarla suma +1 al marcador (rondas ganadas) y `tier` sube; perderla resta 1 vida
- [ ] Vidas 0 → estado `gameover`; `onGameOver(rondasGanadas)` fire exactamente una vez
- [ ] Modo `local-exhibition`: J1 `W`/`S`, J2 flechas; al mejor de 7 (primero a 4) muestra vencedor en-canvas; `R` reinicia el set; **no** dispara `onGameOver` ni submit
- [ ] Rebote de 3 zonas: golpear el tercio alto/bajo de la paleta cambia la salida vertical; velocidad se conserva
- [ ] Usuario autenticado: score se envía a Supabase (`game: 'duelo-pixel'`), leaderboard actualiza
- [ ] Usuario no autenticado: overlay de auth → `/auth?redirect=/games/duelo-pixel`
- [ ] `fetch('/api/leaderboard/duelo-pixel')` devuelve top 10 ranked
- [ ] `/salon` muestra la categoría VERSUS con `duelo-pixel` y su leaderboard (reusa fila del catálogo)
- [ ] `destroy()` idempotente: navegar fuera de la página no deja timers ni listeners colgados
- [ ] Skins: switch `clasico`/`neon`/`retro` recoloriza fondo, paletas, pelota y HUD vía `PALETTES`
- [ ] SEO: `<title>DUELO PIXEL | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                                           | Justificación                                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`duelo-pixel` abre VERSUS puntuando el modo solitario (spec-a)** | El leaderboard de Arcade Vault modela un score por usuario y slug; el modo 1P vs CPU tiene un único dueño del score. El modo 2P local no tiene un vencedor con identidad en la sesión → se mantiene como exhibición sin submit. |
| **Score = rondas ganadas en racha (no puntos anotados)**           | Legible en el leaderboard ("rondas ganadas") y coherente con el `best` sembrado del catálogo (24 = 24 rondas en una racha). El marcador de la ronda (5) queda como detalle interno.                                             |
| **Ronda primera a 5, 3 vidas, terminal por vidas**                 | Forma de duelo corta (rápida de jugar) con terminal garantizado por vidas; evita partidas infinitas y da granularidad de racha.                                                                                                 |
| **Rebote discreto de 3 zonas (estilo arcade)**                     | Mecánica fiel del Pong original y simple de implementar; la diferencia de física de rebote (continuo ∝ offset) queda como eje de spec-b.                                                                                        |
| **Rebote rápido de CPU limitado por `error`/`maxSpeed`**           | `tier = rondas ganadas` sube la dificultad de forma medible y beatable; el jugador controla el ritmo al ganar rondas.                                                                                                           |
| **Refs = `{ canvas }`, HUD y overlays en-canvas**                  | Coherente con el eajede spec-a: wrapper y motor mínimos, un único elemento; el HUD DOM multi-ref es el ejede spec-b.                                                                                                            |
| **`local-exhibition` best-of-7 sin `onGameOver`**                  | El contrato del wrapper sube el score del modo puntuado; un envío del 2P local no tendría dueño legible en el leaderboard (¿cuál de los dos jugadores es `userId`?). Overlay en-canvas resuelve la revancha.                    |
| **`setOnGameOver` antes de `initGame`**                            | Patrón moderno de bloque-buster/ranaria: el wrapper cablea el callback antes de arrancar el motor; evita que un game over temprano (0 rondas) se pierda.                                                                        |
| **`setTimeout` encadenado, `dt` clamp 0.05s**                      | CLAUDE.md es autoritativo: RAF se congela en WebKit headless/CI; `dt` clamp evita que un tab-blur atraviese la paleta.                                                                                                          |
| **Fachada `createLeaderboardActions`**                             | La factoría compartida en `lib/games/leaderboard.ts` ya hace `mapToLeaderboardEntry`, revalidate y validación Zod (bounds: `int().nonnegative().max(1e9)`, acepta 0). Recipe inline quedó obsoleta.                             |
| **Sin nueva migration ni edición de `globals.css`**                | Fila `duelo-pixel` y cover `cover-duelo` ya existen (spec 06). `id` == string `game` de `saveScore` (sin FK).                                                                                                                   |

## Identified Risks

| Riesgo                                            | Impacto                     | Mitigación                                                                                                        |
| ------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Partida `cpu-endurance` teóricamente infinita** | `onGameOver` no se dispara  | Aceptado (como en asteroids/caida: el jugador termina perdiendo). `?e2e=1` fuerza el terminal en tests.           |
| **Tuneling de pelota a velocidad alta**           | Atraviesa la paleta         | `dt` clamp 0.05s + `MAX_BALL_SPEED=560` + pelota de 14 px; suficiente para 60 fps nominales.                      |
| **CPU demasiado fácil o imposible**               | Leaderboard plano / frustr. | `error`/`maxSpeed` escalan por `tier` con clamps (error ≥ 10, speed ≤ 520); balance ajustable en spec futura.     |
| **3 zonas de rebote injustas en el borde**        | Rebotes impredecibles       | Zonas discretas con mapeo ángulo→versor y `speed` conservado; no hay ángulos casi horizontales.                   |
| **2P exhibition sin terminal claro**              | Overlay sin salida          | Best-of-7 finito → overlay vencedor + `R` reinicia; selector de modo en el wrapper cambia a `cpu-endurance`.      |
| **Game over spam en el terminal**                 | Score duplicado             | Guard `gameOverFired` module-scoped; `onGameOver` fire una vez.                                                   |
| **Loop timer colgado tras unmount**               | Memory leak                 | `timerId` module-scoped; `destroy()` idempotente cancela + desadjunta `keydown`/`keyup`.                          |
| **Mix-up de teclas entre modos**                  | Control cruzado             | `cpu-endurance` acepta W/S y flechas; `local-exhibition` reparto estricto por jugador; `detachInput` entre modos. |
| **Catálogo `id` ≠ score `game` string**           | Leaderboard devuelve vacío  | `saveScore` con `game: 'duelo-pixel'` literal, idéntico al id del catálogo.                                       |
| **`score=0` en terminal temprano**                | Racha de 0 subida           | Schema `nonnegative()` acepta 0; es un score legítimo ("perdí mi primer duelo"). No bloquea.                      |

## What is **not** in this spec

- Marcador de 2P local publicado en el leaderboard (racha del jugador acreditado) → spec-b.
- HUD/overlay como elementos DOM separados / `initGame` multi-ref → spec-b.
- Rebote angular continuo ∝ offset → spec-b.
- Power-ups, hipervelocidad, límites móviles, efectos de sonido.
- Multijugador online / remoto (spec futura si la plataforma lo permite).
- Mobile touch controls (spec futura).
- Bindings de teclas personalizables / guardado de partida en curso.

Cada uno de esos, si llega, va en su propia spec.
