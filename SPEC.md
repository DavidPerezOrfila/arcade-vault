# Spec: Arcade Vault — Responsive y jugable en móvil

## Objective

Arcade Vault debe poderse **jugar desde un teléfono móvil o tablet** tan bien como desde
desktop. Hoy la app ya tiene shell responsive parcial (nav hamburguesa <840px, grids que
colapsan, canvas que escala con `aspect-ratio` y `touch-action: none`), pero **no existe
ningún control táctil**: los juegos solo aceptan teclado. El objetivo es:

1. Garantizar que **todas las pantallas** (home, salon/detalle, auth, about, juegos) se
   usan sin overflow horizontal ni elementos partidos en 320px–1440px.
2. Añadir **controles táctiles** a cada juego jugable sin cambiar reglas ni puntuación.
3. Conservar teclado/ratón en desktop sin regresiones (incluidos skins y leaderboard).

Usuarios: teléfonos táctiles (retrato), tablets (pantalla táctil, puede ser horizontal),
desktop (teclado/ratón). Un mismo layout debe validarse en los tres.

## Capability Map (aprobado 2026-08-17)

| ID | Responsabilidad | Depende de |
|---|---|---|
| `responsive-ui` | Adaptar shell, navegación y todas las pantallas a viewport móvil/tablet/desktop | — |
| `mobile-game-input` | Controles táctiles, orientación adaptativa y targets accesibles en cada juego | `responsive-ui` |

Build order: `responsive-ui` → `mobile-game-input`.

## Tech Stack

- Next.js 16.3.0 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS v4 (CSS-based).
- Motores vanilla JS (`lib/games/<slug>/game.esm.js`): loop `setTimeout`, `initGame(refs, { onGameOver, skin })`, `destroy()` idempotente, `attachInput`/`detachInput` con `window.addEventListener`.
- **Sin dependencias nuevas.** Solo APIs web: Pointer Events, `matchMedia('(pointer: coarse)')`, CSS media queries y `aspect-ratio`.

## Commands

```bash
npm run dev               # desarrollo
npm run build             # build de producción
npm run lint              # eslint (linebreak-style LF obligatorio)
npx playwright test e2e/<file>.spec.ts   # E2E (el script test:e2e no encuentra specs; ver CLAUDE.md)
npm run graphify:update   # mantener grafo al día tras cambios
```

## Project Structure (existente)

```
app/                       → rutas App Router (home, salon, detalle/[id], games/*, about, auth)
components/                → UI compartida: nav.tsx, footer, AuthPrompt, LeaderboardList
components/games/<slug>/   → componente canvas + CSS por juego ('use client')
components/games/          → hooks compartidos (useArcadeGame.ts)
components/skin/           → SkinProvider, SkinSelect
lib/games/<slug>/game.esm.js → motor vanilla JS
lib/games/skins.ts         → paletas por skin (fuente única de color)
lib/games/leaderboard.ts   → factory createLeaderboardActions
app/globals.css            → tokens de color por skin + CSS global + media queries
```

## Code Style

Código en inglés, comentarios en español solo si aportan. Componentes pequeños, tipados
explícitos en apis públicas, sin `any`. Inputs de motor expuestos a través de `.attachInput`/
`.detachInput`; los controllers táctiles llaman a una API limpia y siempre liberan estado.
Los estilos usan tokens del skin (`var(--bg-2)`, `var(--ink)`, `var(--cyan)`), nunca hex
hardcodeado.

```ts
// components/games/TouchControls.tsx — overlay de botones táctiles
interface TouchControlsProps {
  classPrefix: string;          // convención {prefix}-skin-select, igual que AuthPrompt
  onDown(action: string): void;
  onUp(action: string): void;
}
```

El nodo se monta solo si `matchMedia('(pointer: coarse)')` o se detecta el primer
`touchstart`; `pointerup`/`pointercancel`/`pointerleave` siempre liberan el estado (un
botón nunca queda "pulsado" para siempre).

## Testing Strategy

- Playwright (E2E) en `e2e/`. Ejecutar con `npx playwright test e2e/<file>.spec.ts` (no usar `npm run test:e2e`; bug de testDir, ver CLAUDE.md).
- E2E debe cubrir: 1) navegación móvil (viewport 390×844) sin overflow horizontal; 2) un juego con controles táctiles dispara la acción correcta; 3) teclado sigue funcionando en viewport desktop.
- Verificación manual por juego en móvil y desktop (dev server + Chrome DevTools MCP con viewport móvil).
- No hay suite unitaria para los motores JS actualmente; para lógica táctil nueva, añadir asserts mínimos si aplica.

## Boundaries

- **Always:** conservar teclado/ratón; conservar skins/paletas; `touch-action: none` en superficies táctiles de juego; limpiar listeners en `destroy()`/unmount; targets táctiles ≥ 44×44px; sin overflow horizontal; probar cada cambio en desktop y móvil.
- **Ask first:** añadir dependencias; cambios de gameplay o puntuación; cambios de esquema Supabase; cambios de `engine` contract (`initGame`/`destroy`).
- **Never:** romper guard rails de skins (`lib/games/skins.ts` es fuente única), meter `console.log`, dejar CRLF (lint bloquea), regresiones en leaderboard/scores/auth.

## Capability 1: responsive-ui

### Objective

Todas las pantallas navegables se usan correctamente en 320px–1440px: sin scroll
horizontal, sin contenido cortado/oculto por el panel móvil, targets táctiles cómodos.

### Estado actual (verificado 2026-08-17)

- `app/globals.css`: `.av-nav` colapsa a hamburguesa <840px; `.av-mobile-panel` lateral fijo; grids de página colapsan a 1 columna <1024px; `body { overflow-x: hidden }` ya ayuda. Boards de juego ya escalan por `aspect-ratio` con `max-width`.
- Falta auditar: páginas no-juego (home, salon, detalle, auth, about) a 320px, altura del hero, tablas/cards que puedan desbordar, panel móvil que tape el footer, y targets <44px en nav/link.

### Cambios

1. **Barrido responsive**: revisar `app/page.tsx`, `app/salon/*`, `app/detalle/[id]/*`, `app/about/*`, `app/auth/*`, `app/games/*/page.tsx`, `components/nav.tsx`, `components/footer` en viewport 320/390/768/1024/1440. Corregir con `clamp()` y colapsos de grid donde desborde (manchas, tablas de ranking, cards de detalle).
2. **Targets táctiles**: subir botones/línks interactivos a ≥44px de altura mínima en táctil (`min-height: 44px` vía media query `(pointer: coarse)` o utilities), sin romper apariencia desktop.
3. **Panel móvil**: asegurar `aria-expanded`, cerrar al navegar, y que `body` no scrollee en fondo abierto; verificar footer accesible al cerrar.
4. **Regresión desktop**: ningún cambio altera layout ≥1024px (skins, leaderboard y auth intactos).

### Success criteria

- 320–1440px: `document.documentElement.scrollWidth <= innerWidth` en Home, /salon, /detalle/[id], /about, /auth y cada /games/<slug>.
- Elementos interactivos ≥44px tocables (tap objetivo) en `(pointer: coarse)`.
- Desktop ≥1024px sin cambios visuales (comparación antes/después por juego y por ruta clave).

## Capability 2: mobile-game-input

### Objective

Cada juego jugable (**asteroids**, **caida**, **serpentina**) se juega completo con los
pulgares en retrato; orientación de canvas y overlay no tapan el juego; teclado sigue
funcionando.

### Cambios por juego

1. **Overlay táctil reutilizable** `components/games/TouchControls.tsx` (nuevo):
   - Detecta input táctil real (`(pointer: coarse)` o primer `touchstart`) y solo entonces se muestra.
   - Botones ≥44px, estilo skin (`{prefix}-touch-controls` en CSS propio de cada juego, tokens `var(--*)`).
   - Propaga acciones a través de `onDown(action)/onUp(action)`; libera estado en `pointerup`/`pointercancel`/`pointerleave`.
   - No intercepta eventos del canvas salvo los botones; `touch-action: none` ya en canvas.
2. **asteroids** (`AsteroidsGame.tsx`, `game.esm.js`):
   - Botones: ◀ rotar izq, ▶ rotar der (pulsar = rotación continua), ▲ impulso, FIRE.
   - El motor expone `attachInput`/`detachInput`, que acepten acciones táctiles análogas a las teclas (autorizar si expandimos el contract; de lo contrario se engancha vía refs ya existentes).
   - Resize del canvas re-aplica 800×600 (también en móvil); verificar que overlay no cubra canvas al escalar.
3. **caida** (`CaidaGame.tsx`, `game.esm.js`):
   - Botones: ◀ ▶ mover, ⟳ rotar, ⤓ drop. En retrato, panel debajo del board (verificar colapso actual).
4. **serpentina** (`SerpentinaGame.tsx`, `game.esm.js`):
   - Swipe en el board (arriba/abajo/izq/der) para cambiar dirección + botón PAUSA. Mantener teclas de flecha.
5. **Orientación adaptativa**: cada layout de juego corrige orden/stacking en retrato vs paisaje vía media queries (`orientation: portrait/landscape`) en su CSS; boards ya escalan con `aspect-ratio`.

### Success criteria

- En viewport 390×844 y orientación retrato, cada juego: (a) board visible al menos un 80% del viewport con controles accesibles; (b) dispara la acción correcta en tap; (c) tras `destroy()` no quedan listeners ni estado pulsado (idempotencia).
- Desktop: teclado y mouse sin cambios; `onGameOver(score)` se sigue disparando una vez y llega al leaderboard.
- Sin dependencias nuevas.