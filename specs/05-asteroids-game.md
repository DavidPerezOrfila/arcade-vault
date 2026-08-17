---
state: Implemented
dependencies: ['04-scores-foundation']
date: 2026-07-27
---

# 05-asteroids-game

Implementar Asteroids como primer juego jugable en Arcade Vault: página completa en `/juegos/asteroids` (detail page del juego) y componente embebible reutilizable, con puntuaciones persistidas en Supabase y leaderboard integrado.

## Scope

**In scope:**

- Página Next.js en `app/juegos/asteroids/page.tsx` (Server Component + Client Component interactivo)
- Componente reusable `AsteroidsGame` (usa canvas, importa `game.js` como módulo ES)
- Integración con Supabase: `submitScore`, `getLeaderboard` (reusando infra de spec 04)
- High-score guardado tras Game Over (requiere auth)
- Leaderboard visible en página (top 10 + score del usuario si autenticado)
- Responsive: canvas escala manteniendo aspect ratio 4:3, max 800×600
- Botón "Jugar de nuevo" reinicia partida sin recargar
- SEO metadata: title, description, Open Graph

**Out of scope:**

- Multijugador / tiempo real
- Guardado de partida en curso (save/load mid-game)
- Configuración de controles / keybindings personalizables
- Efectos de sonido / música (el vanilla no los tiene)
- Mobile touch controls (solo teclado por ahora)
- Cualquier otro juego además de Asteroids

## Data Model

No introduce nuevas tablas — reusa esquema de **spec 04** (`scores`, `profiles`).

**Nuevos tipos TypeScript (en `lib/games/asteroids/types.ts`):**

```typescript
interface AsteroidsGameState {
  score: number;
  lives: number;
  level: number;
  state: 'playing' | 'dead' | 'gameover';
}

interface AsteroidsConfig {
  canvasWidth: number; // 800
  canvasHeight: number; // 600
  maxWidth: number; // responsive cap
  maxHeight: number;
}

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
  isCurrentUser: boolean;
}
```

**Props del componente `AsteroidsGame`:**

```typescript
interface AsteroidsGameProps {
  onScoreSubmit?: (score: number) => Promise<void>;
  onGameOver?: (finalScore: number) => void;
  initialConfig?: Partial<AsteroidsConfig>;
  embedMode?: boolean; // oculta HUD externo si true
}
```

## Implementation Plan

1. **Wrapper ES module** — Crear `lib/games/asteroids/game.esm.js` que exporte `initGame(canvas)`, `destroy()` y exponga `onGameOver(score)` callback. Adaptar `game.js` original a módulo (sin `window` globals, `canvas` inyectado).

2. **Tipos TypeScript** — `lib/games/asteroids/types.ts` con interfaces arriba.

3. **Componente React `AsteroidsGame`** (`components/games/asteroids/AsteroidsGame.tsx`):
   - `useRef<HTMLCanvasElement>`
   - `useEffect` monta canvas, llama `initGame`, cleanup llama `destroy()`
   - Expone callback `onGameOver` → dispara `onScoreSubmit` si autenticado
   - Responsive: `resizeObserver` escala canvas manteniendo 4:3

4. **Server Actions** (`app/juegos/asteroids/actions.ts`):
   - `submitAsteroidsScore(score: number)` — usa `submitScore` de spec 04 con `game_id='asteroids'`
   - `getAsteroidsLeaderboard(limit=10)` — usa `getLeaderboard` de spec 04

5. **Página `/juegos/asteroids/page.tsx`**:
   - Server Component: `metadata`, `getAsteroidsLeaderboard()`
   - Client Component hijo: `<AsteroidsGameClient initialLeaderboard={...} />`
   - Cliente maneja auth, submit score, actualiza leaderboard optimista

6. **Estilos** — `components/games/asteroids/asteroids.css` (Tailwind + CSS vars para canvas centrado, max-w, aspect-ratio)

7. **Tests E2E** — Playwright: carga página, simula partida corta, verifica score submit y leaderboard update.

## Acceptance Criteria

- [ ] `npm run dev` → `/juegos/asteroids` carga sin errores JS/TS
- [ ] Canvas se renderiza, juego inicia, nave controlable (flechas + espacio)
- [ ] Colisiones funcionan: asteroides se dividen, nave pierde vidas, Game Over
- [ ] Partida (Game Over) → botón "Jugar de nuevo" reinicia sin recargar página
- [ ] Usuario autenticado: score se envía a Supabase, leaderboard actualiza
- [ ] Usuario no autenticado: score solo local, botón "Iniciar sesión para guardar"
- [ ] Leaderboard muestra top 10 + fila usuario actual (si autenticado) destacada
- [ ] Responsive: canvas escala ≤800×600, mantiene 4:3, centrado en móvil/desktop
- [ ] SEO: `<title>Asteroids \| Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` pasa sin errores
- [ ] `npm run test:e2e` pasa (test smoke: carga → juega → gameover → leaderboard)

## Decisions Taken & Discarded

| Decisión                                   | Justificación                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Wrapper ES module + `game.js` intacto**  | Mínima refactor, cero riesgo de romper lógica probada. Puerto a TS sería semanas de trabajo para mismo resultado jugable. |
| **Componente reutilizable (`embedMode`)**  | Permite usar mismo juego en página detail, widget homepage, futuro torneo, etc.                                           |
| **Supabase scores (spec 04)**              | Infra ya existe, auth integrado, leaderboard global gratis. localStorage solo como fallback offline.                      |
| **Canvas responsive con aspect-ratio 4:3** | Juego diseñado para 800×600. Escalar preserva hitboxes y feel original.                                                   |
| **Sin sonidos / touch controls v1**        | MVP jugable primero. Sonidos y mobile son specs separadas (06, 07).                                                       |
| **`onGameOver` callback en wrapper**       | Desacopla juego de UI/React. Wrapper no sabe de Supabase, auth, ni leaderboard.                                           |

## Identified Risks

| Riesgo                                                      | Impacto                          | Mitigación                                                                                                                        |
| ----------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **`game.js` usa `window`, `document`, `performance.now()`** | Wrapper ES module falla en SSR   | `initGame(canvas)` recibe canvas ya montado; código solo corre en `useEffect` cliente. `performance.now()` disponible en browser. |
| **Game loop usa `requestAnimationFrame` global**            | Memory leak si cleanup falla     | `destroy()` cancela rAF, limpia arrays, null refs. `useEffect` cleanup obligatorio.                                               |
| **Hitbox fudge factor `* 0.82` hardcoded**                  | Feel distinto en canvas escalado | Escalado CSS no afecta coordenadas lógicas (canvas interno 800×600). Solo dibuja escalado.                                        |
| **Supabase auth state en Client Component**                 | Race condition submit score      | `onGameOver` dispara action; action verifica `getUser()` server-side. Optimistic UI + rollback si falla.                          |
| **Leaderboard SSR + Client hydration mismatch**             | Hydration warning                | Server render initial leaderboard; Client actualiza via SWR/mutation tras submit.                                                 |
