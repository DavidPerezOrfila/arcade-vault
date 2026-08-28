---
state: Implemented
dependencies: ['04-supabase-scores-foundation', '06-games-catalog-salon']
date: 2026-08-11
---

# 08-serpentina-game

Integrar el juego Snake como cuarto juego jugable de Arcade Vault en `/games/serpentina`, con puntuaciones persistidas en Supabase y leaderboard, reutilizando la fila `serpentina` ya seedeada en el catálogo (spec 06) y la infraestructura de scores (spec 04).

La plantilla starter (`resources/started-games/06-snake/`) solo trae `fruits.png` (sprite sheet de 22 frutas, 3790×442px) y `sprites.js` (atlas `SPRITE_ATLAS` global). **No hay motor de juego** — el Snake se escribe desde cero.

## Scope

**In scope:**

- Motor Snake vanilla como wrapper ES module `lib/games/serpentina/game.esm.js` (escrito desde cero, NO hay `game.js` que portar)
- Render de comida con sprites de `fruits.png` (vía atlas de 22 frutas); cuerpo de serpiente = `fillRect` (no hay sprite snake en el atlas)
- Componente React `SerpentinaGame` (`components/games/serpentina/SerpentinaGame.tsx`) con canvas 600×600 + HUD + overlay, integrado con submit/leaderboard
- Server Actions `submitSerpentinaScore` / `getSerpentinaLeaderboard` (fachada sobre `createLeaderboardActions` compartida, no recipe inline)
- Página `/games/serpentina` (Server Component + Client Component interactivo)
- API route `/api/leaderboard/serpentina`
- CSS `components/games/serpentina/serpentina.css` con prefijo `serpentina-`
- Tipos TypeScript `lib/games/serpentina/types.ts` (`LeaderboardEntry`, `SerpentinaGameProps`, `SerpentinaRefs`)
- Copia de asset `resources/started-games/06-snake/fruits.png` → `public/snake-assets/fruits.png` (mismo path que `sprites.js sources.fruits`)
- Reutiliza fila de catálogo existente (`serpentina`, ARCADE, green, cover `cover-snake` ya en `app/globals.css`) — no crea nueva migration
- Responsive: canvas interno 600×600, CSS escala vía `aspect-ratio: 1/1`
- Pared = game over (chocar borde = terminal)
- Velocidad escala por comida: `TICK_START=130`, decrece `TICK_STEP=6` por fruta, tope `TICK_MIN=60`
- Botón "Jugar de nuevo" / overlay reinicia partida sin recargar
- SEO metadata: title, description, Open Graph

**Out of scope:**

- Mobile touch controls (solo teclado por ahora)
- Efectos de sonido / música
- Sprite de serpiente en atlas (solo fillRect geométrico)
- Multijugador / versión CPU
- Guardado de partida en curso (save/load mid-game)
- Configuración de controles / keybindings personalizables
- Tema claro/oscuro propio del juego
- Cualquier otro juego además de Snake

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (fila `serpentina` ya seedeada). **No tocar el catálogo.**

**Nuevos tipos TypeScript (`lib/games/serpentina/types.ts`):**

```typescript
import type { LeaderboardEntry } from '@/lib/games/types';

interface SerpentinaRefs {
  board: HTMLCanvasElement;
  scoreEl: HTMLSpanElement;
  overlay: HTMLDivElement;
  overlayTitle: HTMLHeadingElement;
  overlayScore: HTMLParagraphElement;
}

interface SerpentinaGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}
```

**Refs del juego (inyectados desde React al wrapper):**

| Refs           | Elemento                  |
| -------------- | ------------------------- |
| `board`        | canvas 600×600 playfield  |
| `scoreEl`      | HUD puntos                |
| `overlay`      | overlay PAUSA / GAME OVER |
| `overlayTitle` | título overlay            |
| `overlayScore` | texto overlay             |

## Implementation Plan

1. **Asset** — Copiar `resources/started-games/06-snake/fruits.png` → `public/snake-assets/fruits.png`.

2. **Wrapper ES module** — Crear `lib/games/serpentina/game.esm.js` (desde cero): estado module-scoped (`snake`, `dir`, `nextDir`, `food`, `fruitIndex`, `score`, `gameOver`, `gameOverFired`, `tickAccum`, `tickInterval`, `animId`, `lastTime`), constantes `COLS=24`, `ROWS=24`, `CELL=25` (canvas 600×600), `TICK_MIN=60`, `TICK_STEP=6`, `TICK_START=130`, atlas de 22 frutas inline (de `sprites.js`), `IMG_URL='/snake-assets/fruits.png'`. `initGame(refs, { onGameOver })` recibe elementos ya montados, carga `Image` con `onload` → `imgReady=true`, `attachInput`/`detachInput` pareados en `window` (Arrow/WASD + anti-reverse vía buffer `nextDir`), RAF module-scoped con `destroy()` que lo cancela, `dt` clamp 0.05s, `onGameOver(score)` fire una vez (`gameOverFired`). Exports: `initGame`, `destroy`, `setOnGameOver`.

3. **Tipos TypeScript** — `lib/games/serpentina/types.ts` con `SerpentinaRefs`, `SerpentinaGameProps` (re-export `LeaderboardEntry`).

4. **Componente React `SerpentinaGame`** (`components/games/serpentina/SerpentinaGame.tsx`): `useRef` por cada elemento, dynamic `import()` en useEffect, `setOnGameOver` ANTES de `initGame(refs, { onGameOver })`, cleanup `destroy()`, `?e2e=1` → `window.__forceGameOver(score)`, overlay auth en game over si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/serpentina`. `useArcadeGame({ loadModule, apiUrl: '/api/leaderboard/serpentina', submitScore: submitSerpentinaScore, initialLeaderboard })`. AuthPrompt + LeaderboardList con `classPrefix='serpentina'`.

5. **Estilos** — `components/games/serpentina/serpentina.css` (prefijo `serpentina-`, canvas `aspect-ratio: 1/1`, `max-width: 600px`, overlay `.hidden` toggle, `@media (prefers-reduced-motion)`).

6. **Server Actions** (`app/games/serpentina/actions.ts`): fachada 12 líneas sobre `createLeaderboardActions({ gameId: 'serpentina', gamePath: '/games/serpentina' })` → `submitSerpentinaScore` / `getSerpentinaLeaderboard`.

7. **API route** (`app/api/leaderboard/serpentina/route.ts`): `GET` → `getSerpentinaLeaderboard()`, catch → 500.

8. **Página `/games/serpentina/page.tsx`**: Server Component con `Metadata`, `LeaderboardServer` en `<Suspense>`, `<SerpentinaGame initialLeaderboard>`; sidebar de controles (↑ → ↓ ← / WASD) + objetivo.

9. **Editar union `classPrefix`** — Añadir `'serpentina'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8` (`'caida' | 'asteroids' | 'serpentina'`).

10. **Tests E2E** — Extender Playwright: carga `/games/serpentina`, `?e2e=1` fuerza game over, verifica submit y leaderboard update.

## Acceptance Criteria

- [ ] `npm run dev` → `/games/serpentina` carga sin errores JS/TS en consola
- [ ] Canvas 600×600 renderiza; comida aparece como sprite de `fruits.png`; serpiente se dibuja
- [ ] Controles funcionan: ↑ → ↓ ← / WASD mueven; no se puede invertir dirección (anti-reverse)
- [ ] Comer fruta → crece (score +10), spawn de fruta nueva aleatoria, velocidad sube (tick decrece, tope 60)
- [ ] Chocar pared o morder la propia cola → GAME OVER → overlay muestra puntuación; botón reinicia sin recargar
- [ ] Usuario autenticado: score se envía a Supabase (`game: 'serpentina'`), leaderboard actualiza
- [ ] Usuario no autenticado: overlay de auth → `/auth?redirect=/games/serpentina`
- [ ] `fetch('/api/leaderboard/serpentina')` devuelve top 10 ranked
- [ ] `/salon` muestra la pestaña serpentina con su leaderboard (reusa fila existente del catálogo)
- [ ] Responsive: canvas escala manteniendo 1:1, centrado
- [ ] SEO: `<title>SERPENTINA | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                    | Justificación                                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Motor escrito desde cero como ES module** | La plantilla solo trae assets (fruits.png + sprites.js), no hay `game.js`. El wrapper sigue el patrón de caida/asteroids (initGame(refs), RAF module-scoped, destroy, onGameOver una vez). |
| **Slug = `serpentina`**                     | Fila ya seedeada en catálogo (spec 06) con cover `cover-snake`. `id` del catálogo DEBE igualar el string `game` de `saveScore` (sin FK, por convención). No crear duplicado `snake`.       |
| **Render comida = sprites `fruits.png`**    | Decisión explícita de usuario. El atlas trae 22 frutas; el sprite se dibuja con `drawImage` (solo si `imgReady`), fallback fillRect si la imagen no carga.                                 |
| **Cuerpo serpiente = fillRect**             | No hay sprite snake en el atlas. Geométrico verde con highlight, cabeza más brillante.                                                                                                     |
| **Pared = game over clásico**               | Decisión explícita de usuario (recomendada). Coincide con descripción del catálogo.                                                                                                        |
| **Velocidad escala por comida**             | Decisión explícita de usuario (recomendada). Encaja con «la hace más veloz» del catálogo.                                                                                                  |
| **Fachada `createLeaderboardActions`**      | La factoría compartida en `lib/games/leaderboard.ts` ya hace `mapToLeaderboardEntry`, revalidate y validación Zod. Recipe inline del skill quedó obsoleta.                                 |
| **Refs multi-elemento inyectados**          | Canvas + HUD + overlay. El wrapper recibe objeto de elementos desde React, elimina `document.getElementById` top-level.                                                                    |
| **`onGameOver` callback en wrapper**        | Desacopla juego de UI/React. Wrapper no sabe de Supabase, auth ni leaderboard.                                                                                                             |
| **No nueva migration de catálogo**          | `serpentina` ya existe con cover `cover-snake` en `globals.css`. Solo se añade el juego jugable + asset `fruits.png`.                                                                      |

## Identified Risks

| Riesgo                                                  | Impacto                      | Mitigación                                                                                                            |
| ------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Snake escrito desde cero (sin motor probado)**        | Bugs de lógica nueva         | Mantener el motor mínimo y legible; dt clamp 0.05s; anti-reverse con buffer `nextDir`; colisión pared/cola explícita. |
| **Imagen `fruits.png` no carga a tiempo**               | Comida invisible             | `Image.onload` → `imgReady`; solo `drawImage` si `imgReady`, re-draw al cargar; fallback fillRect.                    |
| **Atlas inline (22 entradas) derivado de `sprites.js`** | Coordenadas desincronizadas  | Copiar coordenadas 1:1 de `sprites.js` con comentario de origen; single source of truth documentado.                  |
| **Game loop `requestAnimationFrame` global**            | Memory leak si cleanup falla | Handle RAF module-scoped; `destroy()` lo cancela + desadjunta keydown. `useEffect` cleanup obligatorio.               |
| **Game over spam al hacer submit**                      | Score duplicado              | `onGameOver` fire una vez (guard `gameOverFired`).                                                                    |
| **Leaderboard SSR + Client hydration mismatch**         | Hydration warning            | Server render initial leaderboard; Client actualiza tras submit.                                                      |
| **Catálogo `id` ≠ score `game` string**                 | Leaderboard devuelve vacío   | `saveScore` con `game: 'serpentina'` literal, idéntico al id del catálogo.                                            |

## What is **not** in this spec

- Mobile touch controls (spec futura si llega).
- Sonidos / música.
- Sprite de serpiente / animaciones.
- Modo CPU / dos jugadores.
- Guardado de partida en curso.
- Obstáculos / niveles por mapa.

Cada uno de esos, si llega, va en su propia spec.
