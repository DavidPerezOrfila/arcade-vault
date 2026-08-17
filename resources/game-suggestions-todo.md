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

## Catalogued, pending engine

- [ ] bloque-buster — ARCADE / cyan — **recommended 2026-08-12** — vanilla ref available (`04-arkanoid/`), single-canvas, proven loop pattern, first cyan shipped. Fit 5/6. Ranking: #1.
- [ ] duelo-pixel — VERSUS / cyan — suggested 2026-08-12 — no vanilla ref, only VERSUS title, 2-player input + AI adds complexity. Fit 4/6. Ranking: #2.
- [ ] invasores — SHOOTER / green — suggested 2026-08-12 — no vanilla ref, green already shipped. Fit 3/6. Ranking: #3.
- [ ] gloton — ARCADE / yellow — suggested 2026-08-12 — no vanilla ref, high complexity (AI/pathfinding 4 ghosts + maze).
- [ ] ranaria — ARCADE / green — suggested 2026-08-12 — no vanilla ref.

## Run log

### 2026-08-12 — Ranking de Pool A
Winner: **bloque-buster** (fit 5/6). Runner-up: duelo-pixel (4/6), invasores (3/6).
Rationale: único candidato con vanilla ref completo (`game.js` 320 líneas + `levels.js` + assets), single-canvas 800×600, mecánica AABB probada, loop terminal `gameover`/`win` fire-once. Port RAF→setTimeout encadenado es el único cambio de motor (patrón ya probado 3x). Cyan sería el primer color cyan shipped. Coste de implementación estimado: wrapper port, no engine-from-scratch.

## New proposals (Pool B)

### 2026-08-12 — Pool B: 19 propuestas (4 agentes paralelos; 20 brutas, 1 duplicado descartado)

`simon-dice` descartado — mismo Simon que `memoria` (duplicado conceptual).

Ranking por coste de port (más barato primero):

**Port 1/5**
- [ ] memoria — PUZZLE / magenta — Simon, secuencia de luces creciente
- [ ] vuelo-rapido — ARCADE / magenta — Flappy Bird
- [ ] sprint-100 — ARCADE / yellow — 100 m button-mash (score inverso a tiempo)

**Port 1.5/5**
- [ ] topo-locura — ARCADE / magenta — Whack-a-Mole
- [ ] golpe-fuerza — ARCADE / cyan — High Striker, timing en el pico
- [ ] duelo-reflejo — VERSUS / magenta — duelo de reflejos 2P local

**Port 2/5**
- [ ] cajas — PUZZLE / yellow — Sokoban, turn-based
- [ ] canicas — PUZZLE / yellow — Peg Solitaire, turn-based
- [ ] defensa-orbital — SHOOTER / magenta — Missile Command (input click)
- [ ] tiro-al-plato — SHOOTER / yellow — Duck Hunt (input click)
- [ ] escalera-pixel — ARCADE / cyan — Doodle Jump
- [ ] esquivador — ARCADE / yellow — survival dodge

**Port 3/5**
- [ ] gemas — PUZZLE / cyan — Match-3 Columns
- [ ] tuberias — PUZZLE / green — Pipe Mania
- [ ] ala-estelar — SHOOTER / cyan — Galaga-like, picadas senoidales
- [ ] milen-patas — SHOOTER / cyan — Centipede, segmentación
- [ ] ping-furia — VERSUS / magenta — Air hockey vs CPU
- [ ] plataforma-ruina — ARCADE / cyan — platformer single-screen

**Port 4/5**
- [ ] patrulla-estelar — SHOOTER / green — Defender, scroll + rescate

Nota: los 5 slugs catalogados sin motor (bloque-buster, duelo-pixel, invasores, gloton, ranaria) tienen prioridad sobre Pool B. Pool B es backlog cuando Pool A se agote o el usuario lo elija.
