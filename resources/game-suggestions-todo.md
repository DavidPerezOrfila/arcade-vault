# Game Suggestions TODO

Memory of the game-planner agent. Updated each run.

## Status legend

- `suggested` — recommended, awaiting user decision
- `building` — spec approved / implementation in progress
- `shipped` — playable, in catalog
- `rejected` — user vetoed; only re-raise if rejection reason changed

## Implemented (do not re-recommend)

- [x] asteroids — SHOOTER / yellow — shipped
- [x] caida — PUZZLE / magenta — shipped
- [x] serpentina — ARCADE / green — shipped
- [x] ranaria — ARCADE / green — shipped 2026-08-25 (spec `specs/game-jam/frogger/01-frogger-core.md`, slug catálogo `ranaria`)
- [x] bloque-buster — ARCADE / cyan — shipped 2026-08-17 (spec `specs/game-jam/bloque-buster/spec-a.md`, PR #53)

## Catalogued, pending engine

- [ ] duelo-pixel — VERSUS / cyan — suggested 2026-08-12 — no vanilla ref, only VERSUS title, 2-player input + AI adds complexity. Fit 4/6. Ranking: #1.
- [ ] invasores — SHOOTER / green — suggested 2026-08-12 — no vanilla ref, green already shipped. Fit 3/6. Ranking: #2.
- [ ] gloton — ARCADE / yellow — suggested 2026-08-12 — no vanilla ref, high complexity (AI/pathfinding 4 ghosts + maze).

## Run log

### 2026-08-28 — Ranking de Pool A (tras 2 nuevos shipped)

Pool A reducido de 5 a 3: `bloque-buster` y `ranaria` pasaron a shipped. Ninguno de los
3 restantes tiene vanilla ref — los 4 refs de `resources/started-games/` ya están portados.

Estado catálogo: ARCADE 3 (serpentina, ranaria, bloque-buster) · SHOOTER 1 (asteroids) ·
PUZZLE 1 (caida) · **VERSUS 0**. Colores: yellow 1 · magenta 1 · green 2 · cyan 1.

Winner: **duelo-pixel** (fit 4/6). Runner-up: invasores (3/6), gloton (2/6).
Rationale: VERSUS es la única categoría sin ningún juego shipped; abrirla compensa la
saturación de ARCADE (3). Pong es el motor más simple de los tres — un canvas, una
pelota, mínima colisión; el único delta real sobre el patrón probado (setTimeout
encadenado + attach/detach pareados) es input 2P + CPU trivial. Cyan 1→2 equilibra
colores (y/m/g/c = 1/1/2/2). Slug ya en catálogo, sin colisión. Invasores pesa menos:
verde sería el 3º de ese color y SHOOTER ya tiene asteroids. Glotón descartado: ARCADE
saturado + AI/pathfinding de 4 fantasmas (anti-patrón). Recomendación pendiente de
confirmación del usuario — no pasar a implementación sin su OK.

### 2026-08-12 — Ranking de Pool A

Winner: **bloque-buster** (fit 5/6). Runner-up: duelo-pixel (4/6), invasores (3/6).
Rationale: único candidato con vanilla ref completo (`game.js` 320 líneas + `levels.js` + assets), single-canvas 800×600, mecánica AABB probada, loop terminal `gameover`/`win` fire-once. Port RAF→setTimeout encadenado es el único cambio de motor (patrón ya probado 3x). Cyan sería el primer color cyan shipped. Coste de implementación estimado: wrapper port, no engine-from-scratch.

## New proposals (Pool B)

### 2026-08-12 — Pool B: 19 propuestas (4 agentes paralelos; 20 brutas, 1 duplicado descartado)

`simon-dice` descartado — mismo Simon que `memoria` (duplicado conceptual).

Ranking por coste de port (más barato primero):

### Port 1/5

- [ ] memoria — PUZZLE / magenta — Simon, secuencia de luces creciente
- [ ] vuelo-rapido — ARCADE / magenta — Flappy Bird
- [ ] sprint-100 — ARCADE / yellow — 100 m button-mash (score inverso a tiempo)

### Port 1.5/5

- [ ] topo-locura — ARCADE / magenta — Whack-a-Mole
- [ ] golpe-fuerza — ARCADE / cyan — High Striker, timing en el pico
- [ ] duelo-reflejo — VERSUS / magenta — duelo de reflejos 2P local

### Port 2/5

- [ ] cajas — PUZZLE / yellow — Sokoban, turn-based
- [ ] canicas — PUZZLE / yellow — Peg Solitaire, turn-based
- [ ] defensa-orbital — SHOOTER / magenta — Missile Command (input click)
- [ ] tiro-al-plato — SHOOTER / yellow — Duck Hunt (input click)
- [ ] escalera-pixel — ARCADE / cyan — Doodle Jump
- [ ] esquivador — ARCADE / yellow — survival dodge

### Port 3/5

- [ ] gemas — PUZZLE / cyan — Match-3 Columns
- [ ] tuberias — PUZZLE / green — Pipe Mania
- [ ] ala-estelar — SHOOTER / cyan — Galaga-like, picadas senoidales
- [ ] milen-patas — SHOOTER / cyan — Centipede, segmentación
- [ ] ping-furia — VERSUS / magenta — Air hockey vs CPU
- [ ] plataforma-ruina — ARCADE / cyan — platformer single-screen

### Port 4/5

- [ ] patrulla-estelar — SHOOTER / green — Defender, scroll + rescate

Nota: los 3 slugs catalogados sin motor (duelo-pixel, invasores, gloton) tienen prioridad sobre Pool B. Pool B es backlog cuando Pool A se agote o el usuario lo elija.
