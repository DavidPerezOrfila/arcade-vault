# Juegos implementados en Arcade Vault

> Fuente de verdad de los juegos: tabla `public.games` en Supabase remoto
> (`fqiiurfqabfbwwnmoizy`). Consultada el 2026-08-11.

La plataforma distingue dos estados por juego:

- **Implementado** — existe motor (`lib/games/<slug>/game.esm.js`),
  componente canvas, página, Server Actions y route de API. Jugable.
- **Catalogado** — existe la fila en `public.games` (título, portada,
  descripción, best) pero **no** hay motor ni página jugable. Aparece
  en `/salon` y `/games` como ficha, y el enlace usa la ruta dinámica
  `app/games/[slug]/page.tsx`.

## Resumen

| #   | id (slug)       | Título        | Categoría | Color   | Resumen                                                                 | Best    | Estado          |
| --- | --------------- | ------------- | --------- | ------- | ----------------------------------------------------------------------- | ------- | --------------- |
| 1   | `asteroids`     | ASTEROIDS     | SHOOTER   | yellow  | Nave triangular dispara y rota para dividir rocas; OVNIs hostiles.      | 41 200  | ✅ Implementado |
| 2   | `bloque-buster` | BLOQUE BUSTER | ARCADE    | cyan    | Arkanoid: la paleta rebota el núcleo de plasma para pulverizar bloques. | 28 450  | ✅ Implementado |
| 3   | `caida`         | CAÍDA         | PUZZLE    | magenta | Tetris: encaja piezas; la velocidad escala cada 10 líneas.              | 184 220 | ✅ Implementado |
| 4   | `duelo-pixel`   | DUELO PIXEL   | VERSUS    | cyan    | Pong a dos paletas: contra CPU o dos jugadores locales.                 | 24      | 🗂 Catalogado    |
| 5   | `gloton`        | GLOTÓN        | ARCADE    | yellow  | Laberinto con puntos y 4 fantasmas; la píldora invierte la persecución. | 96 400  | 🗂 Catalogado    |
| 6   | `invasores`     | INVASORES     | SHOOTER   | green   | Canon horizontal contra filas alienígenas descendentes.                 | 54 190  | 🗂 Catalogado    |
| 7   | `ranaria`       | RANARIA       | ARCADE    | green   | Frogger: cruza autopista y río sobre troncos a la deriva.               | 18 900  | 🗂 Catalogado    |
| 8   | `serpentina`    | SERPENTINA    | ARCADE    | green   | Snake de luz en grilla; cada núcleo alarga la serpiente y acelera.      | 7 820   | ✅ Implementado |

8 juegos en catálogo, 4 jugables, 4 pendientes de implementar.

---

## Juegos implementados (jugables)

Estos cuatro siguen la receta de 8 archivos de la skill `integrate-arcade-game`
y usan la factory `createLeaderboardActions` (`lib/games/leaderboard.ts`).

### ASTEROIDS — `asteroids`

- **Motor:** `lib/games/asteroids/game.esm.js`
- **Componente:** `components/games/asteroids/AsteroidsGame.tsx` + `asteroids.css`
- **Página:** `app/games/asteroids/page.tsx`
- **Server Actions:** `app/games/asteroids/actions.ts`
- **API:** `app/api/leaderboard/asteroids/route.ts` (`GET`)
- **Especificación:** `specs/05-asteroids-game.md`
- **Refs motor vanilla:** `resources/started-games/02-asteroids/`
- **Categoría:** SHOOTER · **Color:** yellow

Nave triangular en gravedad cero. Dispara y rota para dividir rocas en
fragmentos menores; OVNIs hostiles en el horizonte. Loop por `setTimeout`
encadenado (no RAF — se estrangula en headless WebKit/CI), `attachInput`/
`detachInput` pareados, `destroy()` cancela el timer.

### CAÍDA — `caida`

- **Motor:** `lib/games/caida/game.esm.js`
- **Componente:** `components/games/caida/CaidaGame.tsx` + `caida.css`
- **Página:** `app/games/caida/page.tsx`
- **Server Actions:** `app/games/caida/actions.ts`
- **API:** `app/api/leaderboard/caida/route.ts` (`GET`)
- **Especificación:** `specs/07-tetris-caida.md`
- **Refs motor vanilla:** `resources/started-games/03-tetris/`
- **Categoría:** PUZZLE · **Color:** magenta

Tetris rebautizado. Motor multi-elemento: tablero + canvas de pieza
siguiente + HUD (score/líneas/nivel) + overlay. `initGame` recibe objeto de
refs, no un canvas único. Velocidad escala cada 10 líneas. Loop por
`setTimeout` encadenado, `keydown` attach/detach pareados, `destroy()`
desmonta.

### SERPENTINA — `serpentina`

- **Motor:** `lib/games/serpentina/game.esm.js`
- **Componente:** `components/games/serpentina/SerpentinaGame.tsx` + `serpentina.css`
- **Página:** `app/games/serpentina/page.tsx`
- **Server Actions:** `app/games/serpentina/actions.ts`
- **API:** `app/api/leaderboard/serpentina/route.ts` (`GET`)
- **Especificación:** `specs/08-serpentina-game.md`
- **Refs motor vanilla:** `resources/started-games/06-snake/`
- **Categoría:** ARCADE · **Color:** green

Snake de luz en grilla. Cada núcleo magenta alarga la serpiente y acelera el
`tickInterval`. Guard contra `ctx` null post-`destroy()` al resolver imagen
de fondo. Loop por `setTimeout` encadenado, teclado attach/detach pareados.

### BLOQUE BUSTER — `bloque-buster`

- **Motor:** `lib/games/bloque-buster/game.esm.js`
- **Componente:** `components/games/bloque-buster/BloqueBusterGame.tsx` + `bloque-buster.css`
- **Página:** `app/games/bloque-buster/page.tsx`
- **Server Actions:** `app/games/bloque-buster/actions.ts`
- **API:** `app/api/leaderboard/bloque-buster/route.ts` (`GET`)
- **Especificación:** `specs/game-jam/bloque-buster/spec-a.md`
- **Refs motor vanilla:** `resources/started-games/04-arkanoid/`
- **Categoría:** ARCADE · **Color:** cyan

Arkanoid rebautizado. Port 1:1 del vanilla: spritesheet
`/arkanoid-assets/spritesheet-breakout.png`, 5 niveles fijos, 3 vidas,
+10 pts por bloque, multiplicador de velocidad por nivel. Loop por
`setTimeout` encadenado, `attachInput`/`detachInput` pareados (teclado +
mousemove sobre el canvas), `destroy()` cancela el timer.

---

## Juegos catalogados (no jugables todavía)

Fila en `public.games` con descripción y portada, pero **sin** motor ni
página propia. El navegador dinámico `app/games/[slug]/page.tsx` los
resuelve y muestra la ficha; el botón de jugar debe verificar que el slug
esté entre los implementados (`asteroids`, `caida`, `serpentina`,
`bloque-buster`) antes de ofrecer partida real.

### DUELO PIXEL — `duelo-pixel`

- **Refs motor vanilla:** no localizado en `resources/started-games/`
- **Categoría:** VERSUS · **Color:** cyan

Pong a dos paletas. Modo solitario contra CPU o local a dos jugadores. Sin
motor en el repositorio.

### GLOTÓN — `gloton`

- **Refs motor vanilla:** no localizado en `resources/started-games/`
- **Categoría:** ARCADE · **Color:** yellow

Laberinto con puntos y cuatro fantasmas; píldora invierte persecución. Sin
motor en el repositorio.

### INVASORES — `invasores`

- **Refs motor vanilla:** no localizado en `resources/started-games/`
- **Categoría:** SHOOTER · **Color:** green

Space Invaders. Canon horizontal contra filas alienígenas descendentes. Sin
motor en el repositorio.

### RANARIA — `ranaria`

- **Refs motor vanilla:** no localizado en `resources/started-games/`
- **Categoría:** ARCADE · **Color:** green

Frogger. Cruce de autopista y río con troncos a la deriva. Sin motor en el
repositorio.

---

## Notas técnicas

- **Puntuaciones:** la tabla `public.scores` **no tiene** FK a `games.id`.
  El enlace es por convención (slug string coincidente). Los Server Actions
  usan `gameId: '<slug>'` al insertar.
- **Leaderboard:** los cuatro juegos implementados delegan submit/get a
  `createLeaderboardActions({ gameId, gamePath })` en
  `lib/games/leaderboard.ts` — no hand-roll las acciones. Ver
  `app/games/asteroids/actions.ts` como ejemplo canónico.
- **Loop de motor:** los cuatro juegos implementados usan `setTimeout`
  encadenado en lugar de `requestAnimationFrame` (RAF se estrangula en
  WebKit headless/CI). No regredir a RAF.
- **Portadas:** la columna `cover` referencia assets en `public/`
  (p. ej. `cover-asteroids`). No son URLs externas.
- **`best`:** valor sembrado en la migración de catálogo, no calculado en
  tiempo real desde `scores`.
