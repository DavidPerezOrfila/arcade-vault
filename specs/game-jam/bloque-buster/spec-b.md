---
state: Approved
dependencies: ['04-supabase-scores-foundation', '06-games-catalog-salon']
date: 2026-08-13
---

# bloque-buster spec-b — Engine from scratch: física angular + power-ups + HUD DOM

Reimplementar Arkanoid desde cero (sin copiar `04-arkanoid/`) como quinto juego jugable de Arcade Vault en `/games/bloque-buster`. Eje de diferencia vs spec-a: **render geométrico sin assets** (fillRect/roundRect, cero spritesheet), **HUD y overlay como elementos DOM separados** (patrón multi-ref de caida), **rebote con física angular** en la paleta y resolución AABB por eje en bloques, **power-ups** que caen de los bloques, **8 niveles generados por patrón** y **scoring progresivo** (valor de bloque = 10 × nivel). Reutiliza la fila `bloque-buster` del catálogo (spec 06), la factory `createLeaderboardActions` y la UI compartida `useArcadeGame`/`AuthPrompt`/`LeaderboardList`.

## Scope

**In scope:**

- Motor ES module `lib/games/bloque-buster/game.esm.js` escrito **desde cero** (NO hay port de game.js): paleta, pelota(s), bloques, power-ups, niveles por patrón.
- Render geométrico con `fillRect`/`roundRect` y colores del tema retro; **cero dependencia de assets** (no se copia spritesheet ni sonidos).
- **Física angular de rebote en la paleta**: ángulo de salida proporcional al offset de impacto respecto al centro de la paleta (`offset ∈ [-0.5, 0.5]` → ángulo `[120°, 60°]` en versores), en vez del flip vertical ciego del vanilla.
- **Resolución AABB por eje de menor penetración** en bloques: se ajusta la posición y se invierte solo el eje con menor solape (evita rebotes dobles/atraviesos).
- **Power-ups**: los bloques liberan cápsulas con probabilidad fija que caen y se recogen con la paleta. Tres tipos: `W` (paleta ancha, 6s), `M` (multi-bola: +1 bola, tope 3), `L` (+1 vida). Timer de efecto para `W`.
- **HUD DOM separado** (score/vidas/nivel en `<span>`) + **overlay DOM** de GAME OVER / WIN con botón "Jugar de nuevo". Refs object multi-elemento.
- **8 niveles generados por patrón** (builder data-driven: grilla, pirámide, ajedrez, filas con hueco, marco+cruz, doble marco, zigzag, asalto) — sin copiar `levels.js`.
- **Scoring progresivo**: `+10 × nivel actual` por bloque, `+25` por power-up recogido, `+50 × nivel` por nivel completado (magnitud del orden de miles, coherente con el best sembrado del catálogo).
- Componente React `BloqueBusterGame` (`components/games/bloque-buster/BloqueBusterGame.tsx` + `bloque-buster.css`).
- Server Actions `submitBloqueBusterScore` / `getBloqueBusterLeaderboard` (fachada sobre `createLeaderboardActions`, no recipe inline).
- Página `/games/bloque-buster` + API route `/api/leaderboard/bloque-buster`.
- Tipos TypeScript `lib/games/bloque-buster/types.ts` (`BloqueBusterRefs`, `BloqueBusterGameProps`, tipos de power-up y patrón).
- Reutiliza la fila de catálogo existente (`bloque-buster`, ARCADE, cyan, cover `cover-bricks` ya en `app/globals.css`) — no crea nueva migration ni edita `globals.css`.
- Responsive: canvas interno 800×600, CSS escala con `aspect-ratio: 4/3`.
- Terminal: `onGameOver(score)` fire **una vez** (guard `gameOverFired`) en `gameover` (vidas 0) y en `win` (nivel 8 completado).
- `?e2e=1` → `window.__forceGameOver(score)` (proveído por `useArcadeGame`). Auth no autenticado en game over → `/auth?redirect=/games/bloque-buster`.
- SEO metadata: title, description, Open Graph.

**Out of scope:**

- Port de la mecánica del vanilla (sprites, 5 niveles, flip vertical, explosiones de spritesheet) — eso es spec-a.
- Sonidos / música (render geométrico y motor sin assets).
- Power-ups adicionales (láser, expand, slow) — solo `W`/`M`/`L`.
- Mobile touch controls (solo teclado + ratón).
- Editor de niveles / niveles definidos a mano.
- Dos jugadores / modo CPU.
- Guardado de partida en curso / keybindings personalizables.
- Tema claro/oscuro propio (la plataforma ownea el tema).

## Data Model

No introduce nuevas tablas — reusa el esquema de **spec 04** (`scores`) y el catálogo de **spec 06** (fila `bloque-buster` ya seedeada con cover `cover-bricks`). **No tocar el catálogo ni `globals.css`.**

**Nuevos tipos TypeScript (`lib/games/bloque-buster/types.ts`):**

```typescript
import type { LeaderboardEntry } from '@/lib/games/types';

interface BloqueBusterRefs {
  canvas: HTMLCanvasElement;
  scoreEl: HTMLSpanElement;
  livesEl: HTMLSpanElement;
  levelEl: HTMLSpanElement;
  overlay: HTMLDivElement;
  overlayTitle: HTMLHeadingElement;
  overlayScore: HTMLParagraphElement;
}

interface BloqueBusterGameProps {
  initialLeaderboard?: LeaderboardEntry[];
}

// Tipos del motor (descritos; el engine es JS — se documentan aquí para el wrapper)
type PowerUpKind = 'W' | 'M' | 'L';
type BlockColor = 'red' | 'yellow' | 'cyan' | 'magenta' | 'hotpink' | 'green';
type PatternName =
  | 'grid' | 'pyramid' | 'checker' | 'gapped-rows'
  | 'frame-cross' | 'double-frame' | 'zigzag' | 'onslaught';

interface PatternSpec {
  name: PatternName;
  rows: number;
  cols: number;
  colors: BlockColor[];
}
```

**Refs del juego (inyectados desde React al wrapper):**

| Refs           | Elemento                       |
| -------------- | ------------------------------ |
| `canvas`       | canvas 800×600 playfield       |
| `scoreEl`      | HUD DOM puntos                 |
| `livesEl`      | HUD DOM vidas                  |
| `levelEl`      | HUD DOM nivel                  |
| `overlay`      | overlay DOM GAME OVER / WIN    |
| `overlayTitle` | título del overlay             |
| `overlayScore` | texto del overlay              |

## Implementation Plan

1. **(Sin paso de asset)** — Render geométrico con `fillRect`/`roundRect`; el motor no depende de ningún asset. No se copia spritesheet ni sonidos. Sin cambios de catálogo (fila y cover `cover-bricks` ya existen).

2. **Wrapper ES module** — Crear `lib/games/bloque-buster/game.esm.js` desde cero:
   - Constantes: canvas interno 800×600, `PADDLE_SPEED=420`, `PADDLE_W=120`, `PADDLE_H=14`, `BALL_W=16`, `BLOCK_W=64`, `BLOCK_H=24`, `BLOCKS_ORIGIN={x:80, y:80}`, `BASE_BALL_SPEED=340`, `POWERUP_FALL=140`, `POWERUP_DROP_CHANCE=0.18`.
   - `buildLevel(pattern: PatternName, level: number)` → array de bloques (builder data-driven por patrón, sin datos fijos por nivel).
   - Estado module-scoped: `balls[]`, `paddle`, `blocks[]`, `powerUps[]`, `lives=3`, `score`, `currentLevel`, `gameState` (`'playing'|'paused'|'gameover'|'win'`), `gameOverFired`, `paddleWideUntil`.
   - Física: rebote angular en paleta (`offset = (ballCenterX - paddleCenterX) / (paddle.w/2)` → ángulo `120°→60°`, manteniendo magnitud de velocidad); rebote en bloques resolviendo el eje de menor penetración (solo invierte ese eje); paredes como el vanilla.
   - Power-ups: al destruir un bloque, si `Math.random() < POWERUP_DROP_CHANCE` spawnea cápsula del tipo; caída, recogida con la paleta (`W`/`M`/`L`), timers (`paddleWideUntil`), tope de 3 bolas para `M`.
   - Loop `setTimeout` encadenado (nunca `requestAnimationFrame`), `dt = Math.min(dt, 0.05)`.
   - `initGame(refs, { onGameOver })` recibe objeto de refs ya montado; `attachInput`/`detachInput` pareados (`keydown`/`keyup` de `ArrowLeft`/`ArrowRight` + `P`/`Escape` en `window`; `mousemove` en canvas con escala client rect → 800×600).
   - `onGameOver(score)` fire una vez (guard `gameOverFired`) en `gameover` y en `win` (nivel 8 limpiado).
   - `destroy()` idempotente: cancela timer + desadjunta listeners + null-guard de `ctx`.
   - Exports: `initGame`, `destroy`, `setOnGameOver`.

3. **Tipos TypeScript** — `lib/games/bloque-buster/types.ts` con `BloqueBusterRefs`, `BloqueBusterGameProps`, `PowerUpKind`, `PatternName` (re-export `LeaderboardEntry`).

4. **Componente React `BloqueBusterGame`** (`components/games/bloque-buster/BloqueBusterGame.tsx`): `useRef` por cada elemento (canvas + 3 spans HUD + overlay + título + score overlay), dynamic `import('@/lib/games/bloque-buster/game.esm.js')` en `useEffect`, `setOnGameOver` ANTES de `initGame(refs, { onGameOver })`, cleanup `destroy()`. `useArcadeGame({ loadModule, apiUrl: '/api/leaderboard/bloque-buster', submitScore: submitBloqueBusterScore, initialLeaderboard })`. Overlay DOM toggle clase `hidden` (el motor no dibuja overlays en-canvas). AuthPrompt + LeaderboardList con `classPrefix='bloque-buster'`. Si submit devuelve `UNAUTHENTICATED` → `/auth?redirect=/games/bloque-buster`.

5. **Estilos** — `components/games/bloque-buster/bloque-buster.css` (prefijo `bloque-buster-`): canvas `aspect-ratio: 4/3`, `max-width: 640px`, grilla HUD (score/vidas/nivel), overlay `.hidden` toggle, estilos del panel/leaderboard/auth prefijados, `@media (prefers-reduced-motion)`.

6. **Server Actions** (`app/games/bloque-buster/actions.ts`): fachada sobre `createLeaderboardActions({ gameId: 'bloque-buster', gamePath: '/games/bloque-buster' })` → `submitBloqueBusterScore` / `getBloqueBusterLeaderboard` (mismo patrón que `app/games/asteroids/actions.ts`).

7. **API route** (`app/api/leaderboard/bloque-buster/route.ts`): `GET` → `getBloqueBusterLeaderboard()`, catch → 500.

8. **Página `/games/bloque-buster/page.tsx`**: Server Component con `Metadata` (title/description/OG), `LeaderboardServer` en `<Suspense>`, `<BloqueBusterGame initialLeaderboard>`; sidebar de controles (← → / ratón, P pausa) + objetivo y tabla de scoring.

9. **Editar union `classPrefix`** — Añadir `'bloque-buster'` en `components/games/AuthPrompt.tsx:8` y `components/games/LeaderboardList.tsx:8` (`'caida' | 'asteroids' | 'serpentina' | 'bloque-buster'`).

10. **Tests E2E** — Extender Playwright: carga `/games/bloque-buster`, `?e2e=1` fuerza game over, verifica submit y leaderboard update.

## Acceptance Criteria

- [ ] `npm run dev` → `/games/bloque-buster` carga sin errores JS/TS en consola
- [ ] Canvas interno 800×600 renderiza bloques geométricos de colores, paleta y pelota(s); CSS escala manteniendo 4:3
- [ ] HUD DOM muestra score/vidas/nivel y se actualiza en tiempo real; overlay DOM aparece en GAME OVER / WIN
- [ ] Controles: ← → y ratón mueven la paleta; P/Escape pausa/reanuda
- [ ] Rebote en paleta es angular: golpear con el borde de la paleta cambia la trayectoria (no solo flip vertical)
- [ ] Rebote en bloques resuelve el eje de menor penetración (sin rebotes dobles ni atraviesos)
- [ ] Romper un bloque suma `10 × nivel`; limpiar nivel suma `50 × nivel` y avanza; limpiar el nivel 8 → estado `win`
- [ ] Power-ups caen y se recogen: `W` ensancha la paleta 6s, `M` añade una bola (tope 3), `L` suma vida; `+25` al recoger
- [ ] Perder la última bola descuenta vida; vidas 0 → estado `gameover`; `onGameOver(score)` fire exactamente una vez en ambos terminales
- [ ] Usuario autenticado: score se envía a Supabase (`game: 'bloque-buster'`), leaderboard actualiza
- [ ] Usuario no autenticado: overlay de auth → `/auth?redirect=/games/bloque-buster`
- [ ] `fetch('/api/leaderboard/bloque-buster')` devuelve top 10 ranked
- [ ] `/salon` muestra la pestaña bloque-buster con su leaderboard (reusa fila del catálogo)
- [ ] `destroy()` idempotente: navegar fuera de la página no deja timers ni listeners colgados
- [ ] SEO: `<title>BLOQUE BUSTER | Arcade Vault</title>`, OG tags, description
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] `npm run test:e2e` pasa (smoke: carga → fuerza game over → submit → leaderboard)

## Decisions Taken & Discarded

| Decisión                                            | Justificación                                                                                                                                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Engine desde cero, sin port (spec-b)**            | Eje de diferencia real vs spec-a: reimplementación con decisiones de diseño propias en física, niveles y HUD. Riesgo mayor (lógica nueva) a cambio de un juego con más profundidad y scoring coherente con el catálogo. |
| **Física angular en la paleta**                     | Rebote con ángulo ∝ offset de impacto da control al jugador (mismo patrón que Breakout clásico). Reemplaza el flip vertical ciego del vanilla.                                                                  |
| **Resolución AABB por eje de menor penetración**    | Evita rebotes dobles y atraviesos a velocidad alta; corrección de posición + inversión solo del eje con menor solape.                                                                                            |
| **HUD DOM separado (multi-ref)**                    | Ejerce el patrón multi-elemento ya probado en caida/serpentina (`initGame` con objeto de refs). El DOM escalea el texto mejor que el canvas a distintas resoluciones.                                            |
| **Render geométrico sin assets**                    | Cero copias de spritesheet/sonidos → motor autocontenido, sin riesgo de asset-load. Diferenciador claro frente al port con sprites de spec-a.                                                                    |
| **Power-ups `W`/`M`/`L`**                           | Subconjunto mínimo que añade profundidad sin explotar scope: paleta ancha (timer), multi-bola (tope 3), vida extra. Láser/expand/slow quedan fuera (spec futura).                                                |
| **Niveles generados por patrón (8)**                | Builder data-driven de 8 patrones en vez de copiar `levels.js` (5 niveles fijos). Permite alargar la partida sin datos manuales y sin assets.                                                                    |
| **Scoring progresivo `10 × nivel` + bonus**         | Valora bloques según el nivel → una partida perfecta ≈ 16k + bonus, en el rango del best sembrado del catálogo (28 450). Diferente del tope ~2k del vanilla (spec-a).                                            |
| **`onGameOver` fire-once en `gameover` y `win`**    | Guard `gameOverFired` evita doble submit; `win` (nivel 8) también es terminal con score.                                                                                                                         |
| **Sin sonidos**                                     | Motor sin assets por diseño; el audio se añadiría en spec propia si llega. La plataforma no requiere sonido en los juegos existentes.                                                                            |
| **Fachada `createLeaderboardActions`**              | La factoría compartida en `lib/games/leaderboard.ts` ya hace `mapToLeaderboardEntry`, revalidate y validación Zod. Recipe inline del skill quedó obsoleta (CLAUDE.md).                                           |
| **Sin nueva migration de catálogo**                 | `bloque-buster` ya existe (spec 06) con cover `cover-bricks` en `globals.css`. `id` == string `game` de `saveScore` (sin FK).                                                                                   |

## Identified Risks

| Riesgo                                              | Impacto                        | Mitigación                                                                                                             |
| --------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Lógica nueva sin ref probado**                    | Bugs en física/power-ups       | Mantener el motor mínimo y legible; dt clamp 0.05s; resolver AABB por eje; tope de 3 bolas; constantes nombradas.       |
| **Tuneling de pelota a velocidad alta**             | Pelota atraviesa bloques       | `dt` clamp 0.05s + resolución por eje de menor penetración; `BASE_BALL_SPEED` moderada (340).                            |
| **Rebote angular en los bordes de la paleta**       | Ángulos extremos (bola casi horizontal) | Clamp del ángulo de salida a `[60°, 120°]` desde el versor; nunca invertir vx por debajo de un mínimo.          |
| **Power-up `M` multi-bola desbalanceado**           | Partida infinita / fps issues  | Tope de 3 bolas activas; las bolas extra son más lentas (×0.9) y comparten vidas.                                       |
| **Refs multi-elemento null en el primer render**    | Crash en `initGame`            | Mismo guard que serpentina: recolectar refs y no llamar `initGame` si alguno es null.                                   |
| **Game over spam en `win`/`gameover`**              | Score duplicado                | Guard `gameOverFired` module-scoped; `onGameOver` fire una vez.                                                         |
| **Loop timer colgado tras unmount**                 | Memory leak                    | Handle del `setTimeout` module-scoped; `destroy()` idempotente cancela + desadjunta listeners.                          |
| **Balance de scoring (perfect run ~16k vs best 28k)** | Best sembrado difícil de superar | Aceptado; el best del catálogo es ficción de catálogo. Si se quiere, ajustar constantes en spec futura.                |
| **Catálogo `id` ≠ score `game` string**             | Leaderboard devuelve vacío     | `saveScore` con `game: 'bloque-buster'` literal, idéntico al id del catálogo.                                           |

## What is **not** in this spec

- Port del vanilla (sprites, 5 niveles, flip vertical) → spec-a.
- Sonidos / música.
- Power-ups adicionales (láser, expand, slow, multicolor).
- Mobile touch controls (spec futura si llega).
- Editor de niveles / niveles definidos a mano.
- Modo dos jugadores / CPU.
- Guardado de partida en curso / keybindings personalizables.

Cada uno de esos, si llega, va en su propia spec.
