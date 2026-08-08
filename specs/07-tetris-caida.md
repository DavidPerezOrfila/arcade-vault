---
state: Implemented
dependencies: ["04-supabase-scores-foundation", "06-games-catalog-salon"]
date: 2026-08-08
---
# 07-tetris-caida

Integrar Tetris como segundo juego jugable de Arcade Vault en `/games/caida`, con puntuaciones persistidas en Supabase y leaderboard, reutilizando el catálogo existente (`caida`) y la infraestructura de scores.

## Scope

**In scope:**

- Wrapper ES module `lib/games/caida/game.esm.js` que adapta `resources/started-games/03-tetris/game.js` (mínima refactor, sin port a TS)
- Componente React `CaidaGame` (`components/games/caida/CaidaGame.tsx`) con canvas board + canvas next + HUD + overlay, integrado con submit/leaderboard
- Server Actions `submitCaidaScore` / `getCaidaLeaderboard` (reusando infra de spec 04)
- Página `/games/caida` (Server Component + Client Component interactivo)
- API route `/api/leaderboard/caida`
- CSS `components/games/caida/caida.css` con prefijo `caida-`
- Tipos TypeScript `lib/games/caida/types.ts` (`LeaderboardEntry`, `CaidaGameProps`)
- Reutiliza el seed de catálogo existente (`caida`, PUZZLE, magenta, cover `cover-tetro` ya en `app/globals.css`) — no crea nueva migration
- Responsive: board escala manteniendo 1:2 (300×600 interno)
- Botón "Jugar de nuevo" / overlay reinicia partida sin recargar
- SEO metadata: title, description, Open Graph

**Out of scope:**

- Mobile touch controls (solo teclado por ahora)
- Efectos de sonido / música (el vanilla no los tiene)
- Multijugador / versión CPU
- Guardado de partida en curso (save/load mid-game)
- Configuración de controles / keybindings personalizables
- Tema claro/oscuro propio del juego (theme-toggle/localStorage se descarta: la plataforma ownse el theming)
- Cualquier otro juego además de Tetris

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (`games`, fila `caida` ya seedeada).

**Nuevos tipos TypeScript (`lib/games/caida/types.ts`):**

```typescript
interface LeaderboardEntry {
  rank: number
  playerName: string
  score: number
  createdAt: string
  isCurrentUser: boolean
}

interface CaidaGameProps {
  initialLeaderboard?: LeaderboardEntry[]
}
```

**Refs del juego (multi-elemento, inyectados desde React al wrapper):**

```typescript
interface CaidaRefs {
  board: HTMLCanvasElement        // 300×600 playfield
  nextCanvas: HTMLCanvasElement   // 120×120 preview
  scoreEl: HTMLElement            // HUD
  linesEl: HTMLElement            // HUD
  levelEl: HTMLElement            // HUD
  overlay: HTMLElement            // PAUSE / GAME OVER
  overlayTitle: HTMLElement
  overlayScore: HTMLElement
}
```

## Implementation Plan

1. **Wrapper ES module** — Crear `lib/games/caida/game.esm.js`: copia de `resources/started-games/03-tetris/game.js` adaptada. Elimina `document.getElementById` top-level (recibe `refs` en `initGame(refs, { onGameOver })`), elimina theme-toggle/localStorage, `window.addEventListener('keydown')` con attach/detach, RAF module-scoped con `destroy()` que cancela, `dt` clamp 0.05s, `onGameOver(score)` fire una vez en `endGame()`, `getComputedStyle` de `--grid-line` con fallback. Exports: `initGame`, `destroy`, `setOnGameOver`.

2. **Tipos TypeScript** — `lib/games/caida/types.ts` con `LeaderboardEntry`, `CaidaGameProps`, `CaidaRefs`.

3. **Componente React `CaidaGame`** (`components/games/caida/CaidaGame.tsx`):
   - `useRef` por cada elemento (board canvas, nextCanvas, HUD spans, overlay)
   - Dynamic `import()` en useEffect, `setOnGameOver` ANTES de `initGame(refs)`, cleanup `destroy()`
   - `?e2e=1` → `window.__forceGameOver(score)` para Playwright
   - Auth overlay en game over si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/caida`

4. **Server Actions** (`app/games/caida/actions.ts`): `submitCaidaScore(score)` con `game: 'caida'`, `getCaidaLeaderboard(limit=10)` + `mapToLeaderboardEntry` (copia 1:1 de `app/games/asteroids/actions.ts:37`).

5. **API route** (`app/api/leaderboard/caida/route.ts`): `GET` → `getCaidaLeaderboard()`.

6. **Página `/games/caida/page.tsx`**: Server Component con `Metadata`, `LeaderboardServer` en `<Suspense>`, `<CaidaGame initialLeaderboard>`; sidebar de controles (← → ↓ ↑, espacio, P).

7. **Estilos** — `components/games/caida/caida.css` (prefijo `caida-`, board `aspect-ratio: 1/2`, layout board + sidebar next/HUD, `@media (prefers-reduced-motion)`).

8. **Tests E2E** — Extender Playwright: carga `/games/caida`, `?e2e=1` fuerza game over, verifica submit y leaderboard update.

## Acceptance Criteria

- [ ] `npm run dev` → `/games/caida` carga sin errores JS/TS en consola
- [ ] Board (300×600) y next canvas (120×120) se renderizan; HUD muestra score/lines/level
- [ ] Controles funcionan: ← → mueven, ↑ rota, ↓ soft drop, espacio hard drop, P pausa
- [ ] Líneas completas se limpian; score (LINE_SCORES × level), lines y level actualizan
- [ ] Game Over → overlay muestra puntuación; botón de reinicio funciona sin recargar
- [ ] Usuario autenticado: score se envía a Supabase (`game: 'caida'`), leaderboard actualiza
- [ ] Usuario no autenticado: overlay de auth → `/auth?redirect=/games/caida`
- [ ] `fetch('/api/leaderboard/caida')` devuelve top 10 ranked
- [ ] `/salon` muestra la pestaña caida con su leaderboard (reusa fila existente del catálogo)
- [ ] Responsive: board escala manteniendo 1:2, centrado
- [ ] SEO: `<title>CAÍDA | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                   | Justificación                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Wrapper ES module + `game.js` adaptado** | Mínima refactor, cero riesgo de romper lógica probada. Port a TS sería semanas para el mismo resultado jugable.             |
| **Slug = `caida`**                         | Fila ya seedeada en catálogo (spec 06). `id` del catálogo DEBE igualar el string `game` de `saveScore` (sin FK, por convención). |
| **Refs multi-elemento inyectados**         | Tetris usa board + next + HUD + overlay. El wrapper recibe objeto de elementos desde React, elimina `document.getElementById` top-level. |
| **Sin theme-toggle / localStorage**        | La plataforma ownse el theming (dark retro `app/globals.css`). Vanilla theme-toggle se descarta.                              |
| **No nueva migration de catálogo**         | `caida` ya existe con cover `cover-tetro` en `globals.css`. Solo se añade el juego jugable.                                  |
| **`onGameOver` callback en wrapper**       | Desacopla juego de UI/React. Wrapper no sabe de Supabase, auth ni leaderboard.                                               |
| **Hard drop +2/celda, soft drop +1/fila**  | Scoring del vanilla preservado tal cual.                                                                                    |

## Identified Risks

| Riesgo                                                                  | Impacto                         | Mitigación                                                                                                          |
| ----------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **`game.js` usa `document.getElementById` top-level y `window`**         | Falla en SSR                    | `initGame(refs)` recibe elementos ya montados; código solo corre en `useEffect` cliente.                            |
| **`getComputedStyle(document.body)` para `--grid-line`**                 | Dibuja grid con color vacío     | Leer CSS var en `init` con fallback (hex de grid-line o gris por defecto).                                          |
| **Game loop `requestAnimationFrame` global**                             | Memory leak si cleanup falla    | Handle RAF module-scoped; `destroy()` lo cancela + desadjunta keydown. `useEffect` cleanup obligatorio.            |
| **Game over spam al hacer submit**                                       | Score duplicado                 | `onGameOver` fire una vez (guard en `endGame`).                                                                      |
| **Leaderboard SSR + Client hydration mismatch**                          | Hydration warning               | Server render initial leaderboard; Client actualiza tras submit.                                                    |
| **Catálogo `id` ≠ score `game` string**                                  | Leaderboard devuelve vacío      | `saveScore` con `game: 'caida'` literal, idéntico al id del catálogo.                                               |

## What is **not** in this spec

- Mobile touch controls (spec futura si llega).
- Sonidos / música.
- Modo CPU / dos jugadores.
- Guardado de partida en curso.

Cada uno de esos, si llega, va en su propia spec.
