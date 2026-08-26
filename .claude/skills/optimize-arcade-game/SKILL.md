---
name: optimize-arcade-game
description: Use when optimizing performance or difficulty balance of an Arcade Vault game engine. Audits lib/games/<slug>/game.esm.js against the 7-pattern checklist (DOM writes per frame, linear scans in hot paths, canvas state churn, unbounded difficulty scaling, entity saturation, per-frame allocations, loop hygiene) and applies minimal fixes preserving the engine contract. Triggers on "optimize game", "game performance", "game too hard", "game too fast", "balance game difficulty", "juego lento", "juego difícil".
---

# Optimize an Arcade Vault game

Audits and fixes `lib/games/<slug>/game.esm.js` for runtime performance and
difficulty balance. Born from the RANARIA pass (2026-08-26): the perceived
"too many objects / too hard" complaint was unbounded speed scaling, and the
measurable perf issues were DOM writes per frame, per-frame linear scans, and
canvas state churn — not entity count.

**Measure before assuming.** 30-60 entities on a 2D canvas at 60fps is
trivial. The real killers are below, in priority order.

## Workflow

1. **Orient**: `graphify query "<slug> game loop entities"` (repo rule), then read the full engine.
2. **Audit** against checklist P1-P7 below; note exact line numbers.
3. **Classify difficulty**: find the progression formula. Capped → leave it. Uncapped → cap it (see Balance rules).
4. **Fix** only what the audit confirmed. Minimal diffs; no rewrites.
5. **Verify**: lint, build, Playwright smoke, `graphify:update`.

## Checklist P1-P7

### P1 — DOM writes per frame

HUD functions writing `textContent` every frame even when the displayed value
is unchanged (a seconds timer written 60x/s).

```js
// FIX: cache last written value (ranaria updateTimeHUD)
let lastTimeShown;
function updateTimeHUD() {
  const shown = Math.ceil(timeLeft);
  if (shown === lastTimeShown) return;
  lastTimeShown = shown;
  refs.timeEl.textContent = `${shown}s`;
}
```

Also covers per-event writes (e.g. `updateHUD()` after every keydown when the
values didn't change — caida). Write on change, not on tick/event.

### P2 — Linear scans in hot paths

`findIndex`/`find`/`some` over arrays called per-frame per-entity.

- Static mapping → precomputed lookup array (ranaria `MOUTH_AT_COL`).
- Membership test → `Set` (serpentina occupied cells for `spawnFood` +
  self-collision, replacing O(cells × snakeLength) scans).

### P3 — Canvas state churn

`ctx.font` / `textAlign` / constant `strokeStyle` / `lineWidth` re-assigned
per frame or per entity. Hoist constants to `initGame`; batch repeated
`beginPath…stroke` sequences into one path (serpentina grid: 46 strokes → 1).

### P4 — Unbounded difficulty scaling

`Math.pow(FACTOR, level - 1)` or `base + level` with no cap.

```js
// FIX: cap the level fed to the formula (ranaria)
const MAX_SPEED_LEVEL = 6;
const f = Math.pow(SPEED_LEVEL_FACTOR, Math.min(level, MAX_SPEED_LEVEL) - 1);
```

Pick the cap so the ceiling is ~2× base. Progression (score, timer, levels)
continues; speed/count stabilizes.

### P5 — Entity saturation

Fixed counts or spawn rates that overwhelm the player or the frame budget.
Reduce counts respecting the spec's minimums (e.g. ranaria 35→25 entities,
min 2 per lane). Cap spawn formulas (asteroids `Math.min(3 + level, 12)`)
and transient pools (particles).

### P6 — Per-frame allocations

- `arr = arr.filter(…)` builds a new array every frame → in-place compaction
  (write-index loop + `length = w`).
- `hexToRgb`/`hexToRgba` template strings built per entity per frame →
  precompute once when the skin/palette is set.
- `arr.slice(…)` copies per tick → iterate original with index bounds.

### P7 — Loop hygiene (verify, rarely fix)

- Chained `setTimeout`, **never RAF** (RAF throttles in headless WebKit/CI).
- `dt` clamped to 0.05s (tab-blur guard).
- `destroy()` cancels timer, detaches every listener, idempotent.
- `onGameOver` fires once (`gameOverFired` guard).

## Balance rules

- Cap uncapped scaling (P4) and uncapped counts (P5).
- Reduce entity counts only when the spec allows a minimum.
- **Never** touch round timer, lives, or scoring without asking the user.
- Difficulty already capped (caida 100ms floor, serpentina 60ms floor,
  bloque-buster 5-level table) → performance fixes only.

## Untouchable contract

- `initGame(refs, { onGameOver, skin })` / `destroy()` / `setOnGameOver` signatures.
- `setTimeout` loop (no RAF regression).
- Colors via `PALETTES` (`lib/games/skins.ts`) — no hardcoded entity colors.
- React wrapper (`components/games/<slug>/`) — already re-render-free (DOM
  refs, no per-tick state); don't touch unless the audit says otherwise.

## Verification

1. `npm run lint` — 0 errors/warnings in the touched engine.
2. `npm run build` — compiles.
3. Playwright smoke per game: canvas has content, HUD updates, zero
   `pageerror`.
4. `npm run graphify:update` — keep graph artifacts current.

## Reference case: RANARIA (2026-08-26)

| Fix | Pattern | Change |
| --- | --- | --- |
| `MAX_SPEED_LEVEL = 6` | P4 | Speed ceiling ×2.01 instead of ×1.15^n |
| Lane counts 35→25 | P5 | Min 2 entities per lane |
| `lastTimeShown` cache | P1 | Timer DOM write 60/s → 1/s |
| `MOUTH_AT_COL` lookup | P2 | `findIndex` ×16/frame → array index |
| `ctx.font` in `initGame` | P3 | No per-frame font re-set |
