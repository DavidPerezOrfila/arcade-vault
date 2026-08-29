---
state: Draft
dependencies: ['04-supabase-scores-foundation', '06-games-catalog-salon']
date: 2026-08-29
---

# duelo-pixel spec-b — Duelo local hotseat con racha (multi-ref + HUD DOM)

Motor Pong desde cero en `lib/games/duelo-pixel/game.esm.js` que publica `duelo-pixel` como primer juego VERSUS de Arcade Vault en `/games/duelo-pixel`. Eje de diferencia vs spec-a: **el leaderboard puntúa el modo 2P local hotseat** — dos jugadores comparten el teclado (`W`/`S` vs flechas), cada duelo es primera a 5 y el marcador publicado es la **racha de duelos consecutivos ganados por el lado que el jugador acreditado marca como propio** ("este eres tú"). El modo solitario contra CPU (requisito del copy del catálogo) existe como **casual sin puntuación** (al mejor de 5, sin envío). Arquitectura **multi-ref** (canvas + HUD DOM + overlay DOM) con rebote **angular continuo ∝ offset** de impacto. Reutiliza la fila `duelo-pixel` del catálogo (VERSUS, cyan, cover `cover-duelo` ya en `app/globals.css`), la factory `createLeaderboardActions` y la UI compartida `useArcadeGame`/`AuthPrompt`/`LeaderboardList`.

## Scope

**In scope:**

- Motor ES module `lib/games/duelo-pixel/game.esm.js` escrito **desde cero** (no hay vanilla ref en `resources/started-games/`). Render geométrico con `fillRect`/`roundRect`; **cero assets**.
- **Dos modos**, seleccionables en el wrapper y pasados al motor vía `initGame(refs, { skin, mode, markedPlayer })`:
  - `local-duel` (**puntuado**): cadena de duelos en hotseat, cada duelo primera a 5. El wrapper marca qué lado es del jugador acreditado (`markedPlayer: 'p1' | 'p2'`, default `'p1'`). Cada duelo que gana ese lado → **racha +1** y sigue; el primer duelo que pierde ese lado → terminal → `onGameOver(racha)` (racha = duelos ganados consecutivos). El oponente local juega para romper la racha.
  - `cpu-casual` (**sin puntuación**): solitario contra CPU, al mejor de 5 duelos (primero a 3). Overlay DOM con el resultado y "Jugar de nuevo". **Nunca** llama a `onGameOver` (no hay envío al leaderboard).
- **Marcador de lado** en el wrapper: selector DOM "Juegas tú como: [J1 W/S] [J2 Flechas]" (default J1) que se pasa como `options.markedPlayer`; cambio de marcado = teardown + restart. En terminal, `submitScore` envía la racha del lado marcado; si no hay sesión, AuthPrompt permite identificarse y reclamar la racha.
- **Rebote angular continuo**: ángulo de salida proporcional al offset de impacto respecto al centro de la paleta (`offset ∈ [-1, 1]` → ángulo `[−72°, +72°]` desde el eje), velocidad conservada, clamp del versor para evitar salidas casi horizontales. (Spec-a usa rebote discreto de 3 zonas.)
- **Renuncia desde pausa**: en `local-duel`, `P`/`Escape` abre el overlay de pausa con "Rendirse y guardar racha" — terminal manual → `onGameOver(racha)`. Da salida limpia a la racha potencialmente infinita.
- HUD **DOM separado**: `hudP1` (puntos del duelo en curso de J1), `hudP2`, `hudStreak` (racha del lado marcado), `overlay` DOM para pausa/terminar/resultado. Refs object multi-elemento; el motor nunca dibuja HUD/overlay en-canvas.
- Refs = `{ canvas, hudP1, hudP2, hudStreak, overlay, overlayTitle, overlayScore }`; canvas interno fijo 800×600; CSS escala con `aspect-ratio: 4/3`. Cero `document.getElementById` top-level.
- Tokens de `PALETTES` para fondo, paletas, pelota y línea central; el motor resuelve `PALETTES[isSkinId(skin) ? skin : DEFAULT_SKIN]` (`@/lib/games/skins`). El HUD DOM y el overlay usan variables CSS del sistema de skins (el CSS por juego compone `--cyan`/`--magenta`/superficies, no hex sueltos).
- Controles: `W`/`S` = J1 (izquierda), `ArrowUp`/`ArrowDown` = J2/CPU (derecha) en ambos modos. `P`/`Escape` pausa. `R`/`Espacio`/botón reinician.
- Loop por `setTimeout` encadenado (nunca `requestAnimationFrame`), `dt = Math.min(dt, 0.05)`.
- `attachInput`/`detachInput` pareados en `window` (`keydown`/`keyup`); `destroy()` idempotente cancela el timer y desadjunta listeners; `onGameOver(score)` fire **una vez** (guard `gameOverFired`).
- Exports: `initGame(refs, { skin, mode, markedPlayer })`, `destroy()`, `setOnGameOver(cb)` — `setOnGameOver` se cablea ANTES de `initGame` (patrón bloque-buster/ranaria).
- Componente React `DueloPixelGame` (`components/games/duelo-pixel/DueloPixelGame.tsx` + `duelo-pixel.css`), integrado con `useArcadeGame`; selector de modo (2 botones) + selector de lado (2 botones).
- Server Actions `submitDueloPixelScore` / `getDueloPixelLeaderboard` (fachada sobre `createLeaderboardActions({ gameId: 'duelo-pixel', gamePath: '/games/duelo-pixel' })`, no recipe inline).
- Página `/games/duelo-pixel` (Server Component + Client Component interactivo) + API route `/api/leaderboard/duelo-pixel` (`GET`).
- Tipos TypeScript `lib/games/duelo-pixel/types.ts` (`DueloPixelRefs`, `DueloPixelMode`, `DueloPixelMarkedPlayer`, `DueloPixelGameProps`).
- **Reutiliza la fila de catálogo** spec 06 (`duelo-pixel`, VERSUS, cyan, best 24, cover `cover-duelo` ya en `app/globals.css:648`). **No se crea migration** ni se edita `globals.css`.
- `?e2e=1` → `window.__forceGameOver(score)` (proveído por `useArcadeGame`). Auth no autenticado en game over → `/auth?redirect=/games/duelo-pixel`.
- Editar union `classPrefix`: añadir `'duelo-pixel'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8`.
- Cobertura de skins en `resources/skins-todo.md` y mover `duelo-pixel` a Implementado en `resources/implemented-games.md` (en el mismo cambio).
- SEO metadata: title, description, Open Graph.

**Out of scope:**

- Leaderboard puntuando el modo solitario (rondas ganadas vs CPU) — eso es spec-a.
- Single-canvas con HUD/overlays dibujados en-canvas — ese es el ejede spec-a.
- Rebote discreto de 3 zonas (se usa angular continuo; el discreto es spec-a).
- Power-ups, hipervelocidad, límites móviles, efectos de sonido.
- Marcador compartido entre dos cuentas (ambos jugadores con sesión simultánea) — fuera del modelo de Arcade Vault (scores por slug y por usuario; el lado contrario es anónimo local).
- Multijugador online / remoto / emparejamiento.
- Mobile touch controls (solo teclado).
- Bindings de teclas personalizables / guardado de partida en curso.
- Tema claro/oscuro propio (la plataforma ownea el tema).

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (fila `duelo-pixel` seedeada con cover `cover-duelo`). **No tocar el catálogo ni `globals.css`.**

**Nuevos tipos TypeScript (`lib/games/duelo-pixel/types.ts`):**

```typescript
import type { LeaderboardEntry } from '@/lib/games/types';

type DueloPixelMode = 'local-duel' | 'cpu-casual';
type DueloPixelMarkedPlayer = 'p1' | 'p2';

interface DueloPixelRefs {
  canvas: HTMLCanvasElement;
  hudP1: HTMLSpanElement;
  hudP2: HTMLSpanElement;
  hudStreak: HTMLSpanElement;
  overlay: HTMLDivElement;
  overlayTitle: HTMLHeadingElement;
  overlayScore: HTMLParagraphElement;
}

interface DueloPixelGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
```

**Refs del juego (inyectados desde React al wrapper):**

| Refs          | Elemento                       |
| ------------- | ------------------------------ |
| `canvas`      | canvas 800×600 playfield       |
| `hudP1`       | HUD DOM puntos del duelo (J1)  |
| `hudP2`       | HUD DOM puntos del duelo (J2)  |
| `hudStreak`   | HUD DOM racha del lado marcado |
| `overlay`     | overlay DOM pausa / terminal   |
| `overlayTitle`| título del overlay             |
| `overlayScore`| texto del overlay              |

**Estado interno del motor (module-scoped en `game.esm.js`, documentado para el wrapper):**

```typescript
interface DueloPixelPaddle { x: number; y: number; w: number; h: number; vy: number; }
interface DueloPixelBall { x: number; y: number; size: number; vx: number; vy: number; speed: number; }
interface DueloPixelCpu { targetY: number; maxSpeed: number; error: number; }

// gameState: 'serve' | 'playing' | 'paused' | 'gameover'
// mode: 'local-duel' | 'cpu-casual'
// markedPlayer: 'p1' | 'p2' (solo local-duel)
// streak (score) · duelPointsP1 · duelPointsP2 · duelsWonP1 · duelsWonP2 · gameOverFired: boolean
const DUEL_POINTS = 5;        // puntos para ganar un duelo
const CASUAL_BEST_OF = 5;     // duelos del CPU casual (primero a 3)
```

## Implementation Plan

1. **Wrapper ES module** — Crear `lib/games/duelo-pixel/game.esm.js` desde cero:
   - Constantes: canvas interno `W=800`, `H=600`, `PADDLE_W=14`, `PADDLE_H=96`, `BALL_SIZE=14`, `PADDLE_SPEED=420`, `BASE_BALL_SPEED=300`, `MAX_BALL_SPEED=560`, `DUEL_POINTS=5`, `CASUAL_BEST_OF=5`, `SERVE_DELAY=1.2` (s), `PADDLE_X_LEFT=24`, `PADDLE_X_RIGHT=W-24-PADDLE_W`.
   - Paleta: `PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN]`; tokens — fondo `background`, paleta J1 `player`, paleta J2/CPU `enemy`, pelota `bullet`, línea central `accent`. HUD DOM y overlay se pintan por CSS del juego (variables del sistema de skins).
   - Modos: `resetRun({ mode, markedPlayer })` inicializa estado y HUD DOM (los spans a cero); `local-duel` con `streak=0`, `markedPlayer`, `gameState='serve'`; `cpu-casual` con `duelsWonP1/P2` para el best-of-5.
   - Física: rebote en paredes superior/inferior invierte `vy`; **rebote angular continuo** en la paleta: `offset = (ballCenterY - paddleCenterY) / (paddle.h / 2)` → ángulo `[−72°, +72°]` desde el eje horizontal, manteniendo `speed`; clamp del versor (mínimo `|vx|` 30% de `speed`) para evitar salidas casi horizontales. `speed` sube +8 por toque con tope `MAX_BALL_SPEED`. Gol → `'serve'`, saque hacia el lado que recibió el punto.
   - `local-duel`: al llegar a `DUEL_POINTS` de un lado → si el lado ganador es `markedPlayer`: `streak++`, `hudStreak` actualiza, reset de duelo; si el lado perdedor es `markedPlayer`: `gameOver()` fire-once con `streak`. El lado contrario gana duelos sin efectos (solo reset de duelo) — su trabajo es romper la racha.
   - `cpu-casual`: duelo al mejor de 5; CPU con `targetY`, `maxSpeed` y `error` fijos (sin rampa); al llegar a 3 duelos → overlay DOM resultado + `overlayTitle`/`overlayScore` ("CPU GANA"/"J1 GANA" y marcador). **Sin** `onGameOver`.
   - Pausa/renuncia: `KeyP`/`Escape` alterna `'paused'` y muestra el overlay DOM; en `local-duel` el overlay ofrece "Reanudar" y "Rendirse y guardar racha" (botón → `gameOver()` fire-once con `streak` actual). El motor no interfiere con el overlay CSS (toggle clase `hidden` si lo gestiona React) — decisión implementación: el motor setea `overlayTitle`/`overlayScore` y el wrapper revela/oculta el contenedor.
   - Loop `setTimeout` encadenado, handle `timerId` module-scoped, `dt = Math.min(dt, 0.05)`.
   - `initGame(refs, { skin, mode, markedPlayer })` recibe el objeto ya montado, obtiene `ctx` dentro, actualiza HUD DOM, arranca `attachInput()` y el loop; `setOnGameOver(cb)` almacena `onGameOverCallback`; `gameOver()` llama `onGameOverCallback(streak)` una vez (guard `gameOverFired`).
   - Input pareado: `keydown`/`keyup` en `window` — `W`/`S` = J1, `ArrowUp`/`ArrowDown` = J2 (en `cpu-casual`, la CPU mueve sola; las flechas quedan inertes o ausentes); `KeyP`/`Escape` pausa; `KeyR`/`Space` reinicia desde overlays. `detachInput()` los desadjunta.
   - `destroy()` idempotente: cancelar `timerId`, `detachInput()`, null-guard de `ctx`.

2. **Tipos TypeScript** — `lib/games/duelo-pixel/types.ts` con `DueloPixelRefs`, `DueloPixelMode`, `DueloPixelMarkedPlayer`, `DueloPixelGameProps` (re-export `LeaderboardEntry`).

3. **Componente React `DueloPixelGame`** (`components/games/duelo-pixel/DueloPixelGame.tsx`): `useRef` por cada elemento (canvas + 3 spans HUD + overlay + título + score overlay), `useState` de `mode` (default `'local-duel'`) y `markedPlayer` (default `'p1'`), dynamic `import('@/lib/games/duelo-pixel/game.esm.js')` en `useEffect`, `game.setOnGameOver(handleGameOver)` ANTES de `game.initGame(refs, { skin, mode, markedPlayer })`, cleanup `game.destroy()`. Deps del `useEffect`: `[isLoading, gameRef, handleGameOver, skin, mode, markedPlayer]` (cambio de modo/marcado/skin = teardown + restart). `useArcadeGame({ loadModule, apiUrl: '/api/leaderboard/duelo-pixel', submitScore: submitDueloPixelScore, initialLeaderboard })`. Selector de modo (Duelo local / vs CPU) y selector de lado ("Juegas tú como J1/J2", visible solo en `local-duel`); el overlay tiene botones "Jugar de nuevo" y "Rendirse y guardar racha". Si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/duelo-pixel`.

4. **Estilos** — `components/games/duelo-pixel/duelo-pixel.css` (prefijo `duelo-pixel-`): canvas `aspect-ratio: 4/3`, `max-width: 640px`, `image-rendering: pixelated`, grilla HUD (puntos J1/J2 + racha), overlay `.hidden` toggle, selectores de modo/lado, estilos del panel/leaderboard/auth prefijados con variables del sistema de skins, `@media (prefers-reduced-motion)`.

5. **Server Actions** (`app/games/duelo-pixel/actions.ts`): fachada sobre `createLeaderboardActions({ gameId: 'duelo-pixel', gamePath: '/games/duelo-pixel' })` → `submitDueloPixelScore` / `getDueloPixelLeaderboard` (mismo patrón que `app/games/asteroids/actions.ts`).

6. **API route** (`app/api/leaderboard/duelo-pixel/route.ts`): `GET` → `getDueloPixelLeaderboard()`, catch → 500.

7. **Página `/games/duelo-pixel/page.tsx`** (ruta estática que eclipsa `app/games/[slug]/page.tsx`): Server Component con `Metadata` (title/description/OG), `LeaderboardServer` en `<Suspense>`, `<DueloPixelGame initialLeaderboard>`; sidebar de controles (J1 W/S, J2 flechas, P pausa) + objetivo y reglas de scoring (duelo = primera a 5; tu racha = duelos seguidos ganados por tu lado; un duelo perdido por tu lado termina la racha).

8. **Editar union `classPrefix`** — añadir `'duelo-pixel'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8` (`'caida' | 'asteroids' | 'serpentina' | 'bloque-buster' | 'ranaria' | 'duelo-pixel'`).

9. **Tests E2E** — `tests/e2e/duelo-pixel.spec.ts`: carga `/games/duelo-pixel?e2e=1`, canvas visible, `window.__forceGameOver(1000)` → submit → leaderboard actualiza; AuthPrompt con enlace `/auth?redirect=/games/duelo-pixel`; test de `local-duel`: J1 marca puntos y el marcador HUD actualiza; navegación fuera de la página sin timers colgados.

10. **Docs** — añadir fila `duelo-pixel` a `resources/skins-todo.md` (Completo) y mover `duelo-pixel` a Implementado en `resources/implemented-games.md` (juegos jugables: 6).

## Acceptance Criteria

- [ ] `npm run dev` → `/games/duelo-pixel` carga sin errores JS/TS en consola
- [ ] Canvas interno 800×600 renderiza dos paletas, pelota y línea central; CSS escala manteniendo 4:3
- [ ] HUD DOM muestra los puntos del duelo (J1/J2) y la racha del lado marcado, actualizándose en tiempo real
- [ ] Modo `local-duel`: J1 `W`/`S`, J2 flechas; duelo primera a 5; el lado marcado que gana aumenta `hudStreak`; el lado marcado que pierde → `onGameOver(racha)` fire una vez
- [ ] Pausa: `P`/`Escape` abre el overlay con "Reanudar" y (en `local-duel`) "Rendirse y guardar racha"; rendirse → terminal con la racha actual
- [ ] Modo `cpu-casual`: al mejor de 5 (primero a 3) muestra resultado en overlay DOM; **no** dispara `onGameOver` ni submit
- [ ] Rebote angular continuo: el offset de impacto cambia el ángulo de salida en `[−72°, +72°]`; clamp previene salidas casi horizontales
- [ ] Cambio de `markedPlayer` reinicia el motor y el HUD refleja el nuevo lado marcado
- [ ] Usuario autenticado: la racha se envía a Supabase (`game: 'duelo-pixel'`), leaderboard actualiza
- [ ] Usuario no autenticado: en terminal, overlay de auth → `/auth?redirect=/games/duelo-pixel`
- [ ] `fetch('/api/leaderboard/duelo-pixel')` devuelve top 10 ranked
- [ ] `/salon` muestra la categoría VERSUS con `duelo-pixel` y su leaderboard (reusa fila del catálogo)
- [ ] `destroy()` idempotente: navegar fuera de la página no deja timers ni listeners colgados
- [ ] Skins: switch `clasico`/`neon`/`retro` recoloriza canvas vía `PALETTES` y HUD/overlay vía variables CSS del sistema
- [ ] SEO: `<title>DUELO PIXEL | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                                                       | Justificación                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`duelo-pixel` abre VERSUS puntuando el modo 2P local (spec-b)**              | El modelo de Arcade Vault pide un score por usuario y slug; en un hotseat local solo uno de los dos jugadores es la sesión. **Marcar tu lado** ("este eres tú") convierte el duelo local en un score legible del jugador acreditado; el oponente local es anónimo por diseño.                  |
| **Score = racha de duelos ganados por tu lado (no best-of-N fijo)**           | El ejemplo "best-of-N y el ganador registra victorias" degenera el leaderboard: en un best-of-7 el ganador siempre registra 4. Encadenar duelos primera-a-5 hace que el marcador sea **cuántos duelos seguidos sobrevives ganando** (0…N), comparable y con spread real. Non-degenerate.      |
| **Terminal = primer duelo perdido por tu lado (o rendición)**                 | Condición terminal bien definida y una sola vez (`gameOverFired`). La rendición desde pausa da salida limpia a la racha teóricamente infinita sin romper el contrato `onGameOver` fire-once.                                                                                                 |
| **`markedPlayer` vive en el wrapper, no en el motor global**                  | El wrapper (que conoce la sesión y el `classPrefix`) decide qué lado es del usuario y lo pasa como `options.markedPlayer`; cambio de marcado = teardown + restart (mismo patrón que `skin` en los deps). El motor solo rastrea quién gana.                                                     |
| **Mode: `cpu-casual` sin submit**                                              | Cumple el copy del catálogo ("modo solitario contra la CPU") sin contaminar el leaderboard: el motor no llama `onGameOver` en casual; el overlay DOM resuelve el resultado. El modo puntuado por CPU es el ejede spec-a.                                                                      |
| **Rebote angular continuo ∝ offset**                                           | Mecánica de control fino en Pong (el jugador dirige el ángulo de salida). Diferencia real de jugabilidad vs el rebote discreto de 3 zonas de spec-a. Clamp del versor para evitar salidas casi horizontales.                                                                                   |
| **HUD y overlay como elementos DOM separados (multi-ref)**                     | Ejerce el patrón multi-elemento de caida/ranaria: el texto DOM escalea mejor que el canvas y permite el botón "Rendirse y guardar racha" que el terminal por racha necesita. Diferencia de arquitectura real vs el single-canvas de spec-a.                                                    |
| **Overlay DOM gestionado por el motor → texto + wrapper → visibilidad**       | El motor setea `overlayTitle`/`overlayScore` y el wrapper revela/oculta el contenedor (toggle `.hidden`), reutilizando el patrón caida. El engine no pinta overlays en-canvas.                                                                                                                |
| **`cpu-casual` con CPU fija (sin rampa por `tier`)**                           | Como el modo no es puntuado, no necesita curva de dificultad; mínimo de lógica. La rampa queda en spec-a donde el CPU es el adversario puntuado.                                                                                                                                            |
| **`setOnGameOver` antes de `initGame`**                                        | Patrón moderno de bloque-buster/ranaria: evita que un terminal temprano (racha 0) se pierda si el wrapper aún no cableó el callback.                                                                                                                                                         |
| **`setTimeout` encadenado, `dt` clamp 0.05s**                                  | CLAUDE.md es autoritativo: RAF se congela en WebKit headless/CI; `dt` clamp evita atravesar la paleta en tab-blur.                                                                                                                                                                           |
| **Fachada `createLeaderboardActions`**                                         | La factoría compartida en `lib/games/leaderboard.ts` ya hace `mapToLeaderboardEntry`, revalidate y validación Zod (bounds: `int().nonnegative().max(1e9)`, acepta 0 — una racha de 0 es legítima: "perdí mi primer duelo"). Recipe inline quedó obsoleta.                                      |
| **Sin migration ni edición de `globals.css`**                                  | Fila `duelo-pixel` y cover `cover-duelo` ya existen (spec 06). `id` == string `game` de `saveScore` (sin FK).                                                                                                                                                                               |

## Identified Risks

| Riesgo                                                               | Impacto                      | Mitigación                                                                                                        |
| -------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Racha teóricamente infinita**                                      | `onGameOver` no se dispara   | Terminal por pérdida del lado marcado + **rendición desde pausa** como salida manual; `?e2e=1` fuerza en tests.      |
| **Ambigüedad de identidad en hotseat**                               | Score atribuido al lado erróneo | Selector `markedPlayer` default J1 y visible; el texto de scoring explica "tu racha = duelos ganados por TU lado". |
| **Ambos jugadores quieren publicar**                                 | Solo un score por sesión     | Fuera de scope (nota en "Out of scope"): el modelo de Arcade Vault es un score por usuario; el lado contrario es anónimo local. Spec futura si cambia. |
| **Tuneling de pelota a velocidad alta**                              | Atraviesa la paleta          | `dt` clamp 0.05s + `MAX_BALL_SPEED=560` + pelota de 14 px.                                                         |
| **Ángulos extremos en rebote continuo**                              | Salidas casi horizontales    | Clamp del versor: mínimo `|vx|` = 30% de `speed`; `[−72°, +72°]` acotado.                                           |
| **Refs multi-elemento null en el primer render**                     | Crash en `initGame`          | Guard de serpentina: recolectar refs y no llamar `initGame` si alguno es null.                                      |
| **Rendición accidental (toque de `Escape`) destrozando la racha**    | Pérdida de progreso          | La rendición es un botón dentro del overlay de pausa (dos pasos), nunca una tecla directa.                          |
| **Game over spam en el terminal**                                    | Score duplicado              | Guard `gameOverFired` module-scoped; `onGameOver` fire una vez.                                                     |
| **Loop timer colgado tras unmount**                                  | Memory leak                  | `timerId` module-scoped; `destroy()` idempotente cancela + desadjunta `keydown`/`keyup`.                            |
| **CPU casual sin rampa → trivial**                                   | Aburrido pero no puntuado    | Aceptado: el modo puntuado de spec-b es el local; el reto de la CPU es cobertura del copy, no leaderboard.           |
| **Catálogo `id` ≠ score `game` string**                              | Leaderboard devuelve vacío   | `saveScore` con `game: 'duelo-pixel'` literal, idéntico al id del catálogo.                                          |
| **`score=0` en terminal temprano**                                   | Racha de 0 subida            | Schema `nonnegative()` acepta 0; score legítimo. No bloquea.                                                        |

## What is **not** in this spec

- Leaderboard puntuando el modo solitario (rondas ganadas vs CPU) → spec-a.
- Single-canvas con HUD/overlays en-canvas → spec-a.
- Rebote discreto de 3 zonas → spec-a.
- Ambos jugadores con cuentas simultáneas (marcador compartido por dos `userId`) → spec futura, depende del modelo de Arcade Vault.
- Multijugador online / remoto / emparejamiento.
- Power-ups, hipervelocidad, límites móviles, efectos de sonido.
- Mobile touch controls (spec futura).
- Bindings de teclas personalizables / guardado de partida en curso.

Cada uno de esos, si llega, va en su propia spec.