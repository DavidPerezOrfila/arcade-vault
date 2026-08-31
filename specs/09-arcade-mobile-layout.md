---
state: Implemented
dependencies: ['05-asteroids-game', '07-tetris-caida', '08-serpentina-game']
date: 2026-08-19
---

# 09-arcade-mobile-layout

Layout estilo arcade en móvil: canvas arriba, controles táctiles debajo en flujo del documento, sin solapamiento. Rama `feat/arcade-mobile-layout`. Plan aprobado por el usuario — pendiente de implementar.

## Problema

En móvil, los controles táctiles (`TouchControls`) usan `position: fixed; bottom: 0` (`components/games/touch-controls.css:7`), lo que los sitúa encima del canvas sin ningún espacio reservado. El resultado: el D-pad (120×120px), botón de pausa y A/B (52×52px cada uno) tapan la parte inferior del juego.

**Objetivo:** Layout arcade en retrato — canvas arriba, controles (pad, pausa, botones) justo debajo en flujo del documento. Sidebar (leaderboard) scrollea debajo del "pantalla arcade".

## Alcance

**In scope:**

- Convertir `TouchControls` de `position: fixed` a flujo-relative (`touch-controls.css`)
- Nueva clase `.game-viewport` aplicada al contenedor de las 4 páginas de juego (canvas arriba + controles debajo, `height: 100dvh`, `overflow: hidden` en móvil)
- Reglas mobile por juego para el game-layout + canvas container (altura disponible + `aspect-ratio` preservado)
- E2E: aserción de bounding box (controles no solapan canvas) en `tests/e2e/mobile-touch.spec.ts`
- Comportamiento desktop intacto (`TouchControls` ya se oculta con `@media (hover: hover) and (pointer: fine)`)

**Out of scope:**

- Cambios en motores (`lib/games/*/game.esm.js`), skins, paleta ni `useArcadeGame`
- Paisaje (landscape) — enfoque retrato-primero
- Caida (1:2) en viewports muy pequeños (< 500px altura): puede necesitar scroll

## Decisiones clave

- **Scope B:** canvas + controles llenan el viewport; sidebar scrollea debajo del fold
- `touch-controls.css`: `position: fixed` → `relative`, `pointer-events: none` → `auto`
- Nueva `.game-viewport`: `height: 100dvh; overflow: hidden` en móvil
- Canvas containers: `height: 100%; max-height: calc(100dvh - 200px); aspect-ratio` preservado
- Mismo patrón en los 4 juegos (asteroids, bloque-buster, caida, serpentina)

## Paso 1 — TouchControls de fixed a flow-relative

**Archivo:** `components/games/touch-controls.css`

```css
/* ANTES (línea 5-18) */
.touch-controls {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 40;
  pointer-events: none;
  ...
}

/* DESPUÉS */
.touch-controls {
  position: relative;          /* de fixed a relative */
  z-index: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px calc(14px + env(safe-area-inset-bottom, 0px));
  pointer-events: auto;        /* ya no necesita restore por hijo */
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%);
  flex-shrink: 0;              /* no encogerse en flex */
}
```

Quitar `pointer-events: none` del padre y `pointer-events: auto` de `.touch-dpad`, `.touch-pause`, `.touch-btn` (ya no son necesarios — el padre ya no bloquea eventos). Posible limpieza en `components/games/TouchControls.tsx`.

**Verificación:** desktop: sigue oculto vía media query. Mobile: controles aparecen debajo del canvas en flujo del documento.

## Paso 2 — Wrapper viewport mobile en cada page.tsx

**Archivos (4):**

- `app/games/asteroids/page.tsx`
- `app/games/bloque-buster/page.tsx`
- `app/games/caida/page.tsx`
- `app/games/serpentina/page.tsx`

```tsx
// ANTES
<div className='mx-auto max-w-5xl px-4 py-8'>

// DESPUÉS
<div className='game-viewport mx-auto max-w-5xl px-4 py-8'>
```

**CSS del viewport** (añadir al final de `touch-controls.css` o en el nuevo `components/games/game-viewport.css` — ya existe `game-viewport.css` sin trackear):

```css
.game-viewport {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh; /* modern browsers */
}

@media (max-width: 640px) {
  .game-viewport {
    height: 100vh;
    height: 100dvh;
    overflow: hidden; /* bloquear scroll del viewport */
    padding-top: 0;
    padding-bottom: 0;
  }
  .game-viewport > header {
    flex-shrink: 0; /* header no encoge */
  }
}
```

## Paso 3 — Canvas container: altura disponible + aspect-ratio

**Archivos CSS (4 juegos):**

- `components/games/asteroids/asteroids.css`
- `components/games/bloque-buster/bloque-buster.css`
- `components/games/caida/caida.css`
- `components/games/serpentina/serpentina.css`

Añadir al game-layout (el grid/flex padre del canvas + sidebar):

```css
@media (max-width: 640px) {
  .{slug}-game-layout {
    flex: 1;
    min-height: 0;              /* permitir shrink en flex */
    overflow: hidden;
  }
}
```

Añadir al canvas container (el div con `aspect-ratio`):

```css
@media (max-width: 640px) {
  .{slug}-game-container,       /* asteroids, bloque-buster */
  .{slug}-board-wrap {          /* caida, serpentina */
    width: 100%;
    height: 100%;
    max-height: calc(100dvh - 200px);  /* ~controles(168) + margen */
    margin: 0 auto;
  }
}
```

**Sizing por juego:**

- **Asteroids/Bloque Buster (4:3):** height=100% del game-layout (~550px en 844dvh). `aspect-ratio: 4/3` → width ~733px, limitado por max-width 800px → 733×550. Viewport 390px: width=100% domina → 390×293. ✓
- **Serpentina (1:1):** height=100% → 550×550. Viewport 390px → 390×390. ✓
- **Caida (1:2):** height=100% → 550px. `aspect-ratio: 1/2` → width=1100px, limitado por max-width 300px → 300×600. max-height 644px permite 600px. ✓

## Paso 4 — Sidebar bajo el fold

En la media query `@media (max-width: 640px)` de cada juego, el sidebar ya tiene `order: 2` (asteroids/bloque-buster) o `flex-direction: column` (caida/serpentina). Con el `overflow: hidden` en `.game-viewport`, el sidebar queda "below the fold" — accesible scrolleando. Sin cambio extra en CSS de sidebar.

## Paso 5 — Branch + E2E tests

**Branch:** `feat/arcade-mobile-layout` desde `main`

**Tests a actualizar (`tests/e2e/mobile-touch.spec.ts`):**

- Añadir aserción: controles no se solapan con canvas (bounding box: `controls.top >= canvas.bottom`)
- Verificar `.game-viewport` existe en mobile
- Añadir test de paisaje (375×667 landscape) — controles al lado del canvas

**Tests que no deben romperse:**

- Layout de skins (`*skin*.spec.ts`)
- Touch (`mobile-touch.spec.ts` — adaptar, no eliminar)
- Leaderboard

## Paso 6 — Revisión y merge

1. `npm run lint` + `npm run build`
2. `npx playwright test tests/e2e/mobile-touch.spec.ts`
3. `npm run test:e2e` completo
4. Revisión visual en Chrome DevTools (emular iPhone 14, 390×844 portrait)
5. PR con descripción del cambio de layout

## Archivos críticos

| Archivo                                            | Cambio                                                      |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `components/games/touch-controls.css`              | `position: fixed` → `relative`, añadir `.game-viewport` CSS |
| `components/games/TouchControls.tsx`               | Quitar `pointer-events: auto` de hijos si se simplifica     |
| `components/games/game-viewport.css`               | Nueva clase `.game-viewport` (móvil)                        |
| `app/games/*/page.tsx` (×4)                        | Añadir clase `game-viewport` al div contenedor              |
| `components/games/asteroids/asteroids.css`         | Mobile rules para game-layout + game-container              |
| `components/games/bloque-buster/bloque-buster.css` | Idem                                                        |
| `components/games/caida/caida.css`                 | Idem (board-wrap)                                           |
| `components/games/serpentina/serpentina.css`       | Idem (board-wrap)                                           |
| `tests/e2e/mobile-touch.spec.ts`                   | Aserción de no-solapamiento                                 |

## Verificación

1. **E2E mobile-touch:** `npx playwright test tests/e2e/mobile-touch.spec.ts` — todos pasan + nueva aserción de bounding box
2. **E2E completo:** `npm run test:e2e` — 0 regressions
3. **Build:** `npm run build` — sin errores
4. **Lint:** `npm run lint` — sin warnings
5. **Visual check:** Chrome DevTools emulator → iPhone 14 (390×844) → cada juego → controles debajo del canvas, sin solapamiento
