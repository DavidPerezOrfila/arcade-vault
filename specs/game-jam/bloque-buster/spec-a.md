---
state: Draft
dependencies: ['04-supabase-scores-foundation', '06-games-catalog-salon']
date: 2026-08-13
---

# bloque-buster spec-a — Port del vanilla ref (single-canvas + sprites)

Portar el motor vanilla `resources/started-games/04-arkanoid/` (game.js + levels.js + spritesheet.js + assets) a `lib/games/bloque-buster/game.esm.js` y publicarlo como quinto juego jugable de Arcade Vault en `/games/bloque-buster`. Mantiene mecánica, 5 niveles y assets del ref 1:1; el único cambio de motor es RAF → setTimeout encadenado más el contrato del wrapper (`initGame`/`destroy`/`onGameOver`). Reutiliza la fila `bloque-buster` del catálogo (spec 06), la factory `createLeaderboardActions` (`lib/games/leaderboard.ts`) y la UI compartida `useArcadeGame`/`AuthPrompt`/`LeaderboardList`.

## Scope

**In scope:**

- Motor ES module `lib/games/bloque-buster/game.esm.js` — port 1:1 de `04-arkanoid/game.js` + `levels.js` + `spritesheet.js` (inline): paleta, pelota, colisiones AABB de bloques, explosiones de 4 frames, 3 vidas, +10 pts por bloque, multiplicador de velocidad de pelota por nivel (×1.0 → ×1.46), 5 niveles fijos, HUD en-canvas (score/nivel/vidas), overlays en-canvas (pausa / game over / win).
- Único cambio de motor: loop `setTimeout` encadenado en lugar de `requestAnimationFrame`, `dt` clamp 0.05s (guard tab-blur), y el contrato del wrapper (`initGame(refs, { onGameOver })`, `destroy()` idempotente, `attachInput`/`detachInput` pareados).
- Refs = `{ canvas }` único, canvas interno fijo 800×600; CSS escala. Cero `document.getElementById` top-level.
- Assets copiados: `assets/spritesheet-breakout.png` → `public/arkanoid-assets/spritesheet-breakout.png`; `assets/sounds/ball-bounce.mp3` + `break-sound.mp3` → `public/arkanoid-assets/sounds/`.
- Sonidos portados con guard `typeof Audio !== 'undefined'` (no rompen headless/CI si falla la carga).
- Componente React `BloqueBusterGame` (`components/games/bloque-buster/BloqueBusterGame.tsx` + `bloque-buster.css`), integrado con submit/leaderboard.
- Server Actions `submitBloqueBusterScore` / `getBloqueBusterLeaderboard` (fachada sobre `createLeaderboardActions`, no recipe inline).
- Página `/games/bloque-buster` (Server Component + Client Component interactivo) + API route `/api/leaderboard/bloque-buster`.
- Tipos TypeScript `lib/games/bloque-buster/types.ts` (`LeaderboardEntry` re-export, `BloqueBusterRefs`, `BloqueBusterGameProps`).
- Reutiliza la fila de catálogo existente (`bloque-buster`, ARCADE, cyan, cover `cover-bricks` ya en `app/globals.css`) — no crea nueva migration ni edita `globals.css`.
- Responsive: canvas interno 800×600, CSS escala con `aspect-ratio: 4/3`.
- Terminal: `onGameOver(score)` fire **una vez** (guard `gameOverFired`) tanto en `gameover` (vidas 0) como en `win` (nivel 5 completado).
- `?e2e=1` → `window.__forceGameOver(score)` (proveído por `useArcadeGame`). Auth no autenticado en game over → `/auth?redirect=/games/bloque-buster`.
- Botón "Jugar de nuevo" / overlay reinicia partida sin recargar.
- SEO metadata: title, description, Open Graph.

**Out of scope:**

- Power-ups, física angular del rebote, multi-bola (eso es spec-b).
- HUD/overlay como elementos DOM separados (se mantiene HUD en-canvas como el vanilla).
- Niveles generados por patrón / más de 5 niveles.
- Render geométrico sin spritesheet (se mantienen los sprites del ref).
- Selector de salto de nivel en el overlay de pausa (feature de debug del vanilla — se elimina en el port).
- Mobile touch controls (solo teclado + ratón).
- Sonidos nuevos (solo se portan los 2 del vanilla).
- Tema claro/oscuro propio (la plataforma ownea el tema).
- Guardado de partida en curso / keybindings personalizables.

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (fila `bloque-buster` ya seedeada con cover `cover-bricks`). **No tocar el catálogo ni `globals.css`.**

**Nuevos tipos TypeScript (`lib/games/bloque-buster/types.ts`):**

```typescript
import type { LeaderboardEntry } from '@/lib/games/types';

interface BloqueBusterRefs {
  canvas: HTMLCanvasElement;
}

interface BloqueBusterGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
```

**Refs del juego (inyectados desde React al wrapper):**

| Refs     | Elemento             |
| -------- | -------------------- |
| `canvas` | canvas 800×600 playfield (HUD y overlays se dibujan dentro) |

**Estado interno del motor (module-scoped en `game.esm.js`, port del vanilla):**

```typescript
interface BloqueBusterBlock {
  x: number; y: number; w: number; h: number;
  color: 'gray' | 'red' | 'yellow' | 'cyan' | 'magenta' | 'hotpink' | 'green';
  alive: boolean;
}

interface BloqueBusterBall { x: number; y: number; w: number; h: number; vx: number; vy: number; }
interface BloqueBusterPaddle { x: number; y: number; w: number; h: number; }
// gameState: 'playing' | 'paused' | 'gameover' | 'win'
```

## Implementation Plan

1. **Assets** — Copiar `resources/started-games/04-arkanoid/assets/spritesheet-breakout.png` → `public/arkanoid-assets/spritesheet-breakout.png`, y `assets/sounds/ball-bounce.mp3` + `assets/sounds/break-sound.mp3` → `public/arkanoid-assets/sounds/`. (Sin cambios de catálogo: la fila y el cover `cover-bricks` ya existen.)

2. **Wrapper ES module** — Crear `lib/games/bloque-buster/game.esm.js` portando 1:1 `game.js` + `levels.js` (los 5 `LEVELS` como constantes) + helpers de `spritesheet.js` (constantes `SPRITES`, `EXPLOSION_FRAMES`, `EXPLOSION_DURATION`, `loadSpritesheet` con `imgReady`). Cambios respecto al vanilla:
   - Loop `setTimeout` encadenado, nunca `requestAnimationFrame`; `dt = min(dt, 0.05)`.
   - `initGame(refs, { onGameOver })` recibe `{ canvas }` ya montado; `ctx` se obtiene dentro de `initGame`.
   - `attachInput`/`detachInput` pareados: `keydown`/`keyup` de `ArrowLeft`/`ArrowRight` + `P`/`Escape` (pausa) en `window`; `mousemove` sobre el canvas (escala client rect → coordenadas internas 800×600). Todo desadjuntado en `destroy()`.
   - `onGameOver(score)` fire una vez (guard `gameOverFired`) en `gameover` y en `win` (nivel 5 limpiado).
   - Spritesheet `src` → `/arkanoid-assets/spritesheet-breakout.png`; `drawSprite`/`drawFrame` no-op si `!imgReady`.
   - Sonidos: `new Audio('/arkanoid-assets/sounds/...')` dentro de guard `typeof Audio !== 'undefined'`; `.play()` con try/catch silencioso.
   - Se elimina el salto de nivel del overlay de pausa (queda solo toggle pausa/reanudar).
   - Exports: `initGame`, `destroy`, `setOnGameOver`.

3. **Tipos TypeScript** — `lib/games/bloque-buster/types.ts` con `BloqueBusterRefs`, `BloqueBusterGameProps` (re-export `LeaderboardEntry`).

4. **Componente React `BloqueBusterGame`** (`components/games/bloque-buster/BloqueBusterGame.tsx`): `useRef` del canvas único, dynamic `import('@/lib/games/bloque-buster/game.esm.js')` en `useEffect`, `setOnGameOver` ANTES de `initGame(refs, { onGameOver })`, cleanup `destroy()` en el unmount. `useArcadeGame({ loadModule, apiUrl: '/api/leaderboard/bloque-buster', submitScore: submitBloqueBusterScore, initialLeaderboard })`. Overlay GAME OVER / WIN reutiliza un overlay DOM para el botón "Jugar de nuevo" (el propio motor dibuja el mensaje en-canvas). AuthPrompt + LeaderboardList con `classPrefix='bloque-buster'`. Si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/bloque-buster`.

5. **Estilos** — `components/games/bloque-buster/bloque-buster.css` (prefijo `bloque-buster-`): canvas `aspect-ratio: 4/3`, `max-width: 640px`, `image-rendering: pixelated` para el spritesheet, overlay `.hidden` toggle, estilos del panel/leaderboard/auth prefijados, `@media (prefers-reduced-motion)`.

6. **Server Actions** (`app/games/bloque-buster/actions.ts`): fachada sobre `createLeaderboardActions({ gameId: 'bloque-buster', gamePath: '/games/bloque-buster' })` → `submitBloqueBusterScore` / `getBloqueBusterLeaderboard` (mismo patrón que `app/games/asteroids/actions.ts`).

7. **API route** (`app/api/leaderboard/bloque-buster/route.ts`): `GET` → `getBloqueBusterLeaderboard()`, catch → 500.

8. **Página `/games/bloque-buster/page.tsx`**: Server Component con `Metadata` (title/description/OG), `LeaderboardServer` en `<Suspense>`, `<BloqueBusterGame initialLeaderboard>`; sidebar de controles (← → / ratón, P pausa) + objetivo.

9. **Editar union `classPrefix`** — Añadir `'bloque-buster'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8` (`'caida' | 'asteroids' | 'serpentina' | 'bloque-buster'`).

10. **Tests E2E** — Extender Playwright: carga `/games/bloque-buster`, `?e2e=1` fuerza game over, verifica submit y leaderboard update.

## Acceptance Criteria

- [ ] `npm run dev` → `/games/bloque-buster` carga sin errores JS/TS en consola
- [ ] Canvas interno 800×600 renderiza spritesheet (paddle, ball, bloques de los 7 colores); CSS escala manteniendo 4:3
- [ ] Controles: ← → y ratón mueven la paleta (escala client rect correcta); P/Escape pausa/reanuda
- [ ] Pelota rebota en paredes (izq/der/arriba), en la paleta y rompe bloques con explosión de 4 frames; +10 pts por bloque
- [ ] Al limpiar un nivel pasa al siguiente (velocidad de pelota sube según multiplicador); al limpiar el nivel 5 → estado `win`
- [ ] Perder la pelota descuenta vida; vidas 0 → estado `gameover`; `onGameOver(score)` fire exactamente una vez en ambos terminales
- [ ] Usuario autenticado: score se envía a Supabase (`game: 'bloque-buster'`), leaderboard actualiza
- [ ] Usuario no autenticado: overlay de auth → `/auth?redirect=/games/bloque-buster`
- [ ] `fetch('/api/leaderboard/bloque-buster')` devuelve top 10 ranked
- [ ] `/salon` muestra la pestaña bloque-buster con su leaderboard (reusa fila del catálogo)
- [ ] `destroy()` idempotente: navegar fuera de la página no deja timers ni listeners colgados
- [ ] SEO: `<title>BLOQUE BUSTER | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                             | Justificación                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Port 1:1 del vanilla (spec-a)**                    | El ref `04-arkanoid/` ya tiene mecánica AABB probada, 5 niveles y spritesheet. Portar fiel = menor riesgo y máxima fidelidad al concepto del catálogo. El game-planner rankeó el port como fit 5/6.                                             |
| **Loop `setTimeout` encadenado (no RAF)**            | CLAUDE.md es autoritativo: RAF se congela en WebKit headless/CI. Patrón ya probado en asteroids/caida/serpentina. `dt` clamp 0.05s como guard de tab-blur.                                                                                     |
| **HUD y overlays en-canvas (como el vanilla)**       | Fidelidad al ref. El vanilla dibuja score/nivel/vidas y los overlays dentro del canvas de 800×600; portar ese layout no requiere DOM extra. La diferencia HUD-DOM es el eje de spec-b.                                                           |
| **Refs = `{ canvas }` único**                        | El port no necesita multi-elemento. Simplifica el componente y el wrapper. `initGame` sigue recibiendo el elemento ya montado (cero `getElementById` top-level).                                                                                |
| **Se elimina el salto de nivel en pausa**            | Feature de debug del vanilla (botones 1–5). Se descarta en el port para mantener el wrapper lean; no aporta valor de producto al leaderboard.                                                                                                   |
| **Sonidos portados con guard `Audio`**               | "Mantener assets" incluye los 2 sonidos del ref. Guard `typeof Audio !== 'undefined'` + try/catch para no romper CI/headless ni el SSR.                                                                                                         |
| **Scoring vanilla (+10/bloque) se mantiene**         | Fidelidad sobre magnitud. Tope teórico ≈ 2 040 pts por partida perfecta (204 bloques en 5 niveles) — el best sembrado 28 450 es ficción de catálogo, no objetivo alcanzable. Si se quiere magnitud mayor, es el eje de spec-b (scoring progresivo). |
| **`onGameOver` fire-once en `gameover` y `win`**     | Ambos son estados terminales del vanilla; el guard `gameOverFired` evita doble submit. `win` también cuenta como partida terminada con score.                                                                                                    |
| **Fachada `createLeaderboardActions`**               | La factoría compartida en `lib/games/leaderboard.ts` ya hace `mapToLeaderboardEntry`, revalidate y validación Zod. Recipe inline del skill quedó obsoleta (CLAUDE.md).                                                                          |
| **Sin nueva migration de catálogo**                  | `bloque-buster` ya existe (spec 06) con cover `cover-bricks` en `globals.css`. Solo se añade el juego jugable + assets. `id` == string `game` de `saveScore` (sin FK).                                                                          |

## Identified Risks

| Riesgo                                                             | Impacto                       | Mitigación                                                                                                                       |
| ------------------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Spritesheet no carga a tiempo**                                  | Render vacío / bloques invis. | `loadSpritesheet` con `imgReady`; `drawSprite`/`drawFrame` no-op si `!imgReady`; re-draw al onload. Fallback geométrico mínimo si falla la imagen. |
| **Sonidos en headless/CI**                                         | Excepciones de Audio          | Guard `typeof Audio !== 'undefined'` + try/catch silencioso en `.play()`. No bloquean el loop.                                    |
| **Mapeo mousemove client rect → 800×600**                          | Paddle desincronizado         | Misma escala `canvas.width / rect.width` que el vanilla; reutilizar ese cálculo exacto.                                          |
| **Game over spam en `win`/`gameover`**                             | Score duplicado               | Guard `gameOverFired` module-scoped; `onGameOver` fire una vez.                                                                   |
| **Tab blur → dt gigante**                                          | Pelota atraviesa bloques      | `dt = Math.min(dt, 0.05)` en el loop.                                                                                            |
| **Loop timer colgado tras unmount**                                | Memory leak                   | Handle del `setTimeout` module-scoped; `destroy()` idempotente lo cancela + desadjunta keydown/keyup/mousemove.                  |
| **Scoring bajo vs best sembrado del catálogo (28 450)**            | Leaderboard desangelado       | Aceptado en spec-a (fidelidad). Si el usuario quiere magnitud mayor, elegir spec-b (scoring 10×nivel + bonus).                    |
| **Catálogo `id` ≠ score `game` string**                            | Leaderboard devuelve vacío    | `saveScore` con `game: 'bloque-buster'` literal, idéntico al id del catálogo.                                                    |

## What is **not** in this spec

- Power-ups, física angular del rebote, multi-bola → spec-b.
- HUD/overlay como elementos DOM separados → spec-b.
- Niveles procedurales / más de 5 niveles / scoring progresivo → spec-b.
- Mobile touch controls (spec futura si llega).
- Sonidos nuevos (se portan solo los 2 del ref).
- Selector de salto de nivel en el overlay de pausa (eliminado en el port).
- Guardado de partida en curso / keybindings personalizables.
- Modo dos jugadores / CPU.

Cada uno de esos, si llega, va en su propia spec.
