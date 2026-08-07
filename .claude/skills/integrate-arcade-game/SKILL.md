---
name: integrate-arcade-game
description: Use when adding a new game to Arcade Vault — wrapping a vanilla JS canvas game into a leaderboard-backed Next.js page, or registering a game in the Supabase catalog. Triggers on "add game", "integrate game", "new arcade game", "leaderboard for game", "register game in catalog", "port game from resources/started-games".
---

# Integrate an Arcade Vault game

Recipe proven by Asteroids (spec 05) and the games catalog (spec 06): vanilla JS engine → ES module → React canvas component → Server Actions → page → API route → catalog seed. **Reuse scores + catalog infra; never rewrite it.**

## When to use

- Adding/integrating a canvas game into the platform with persisted scores + catalog entry.
- Not: designing a game (use `/spec`), auto-implementing an approved spec (use `/spec-impl`).

## The 8 files

Real paths from `app/games/asteroids/` — copy that shape. `<slug>` = catalog id (kebab-case), NOT the English/display name. If the game is already seeded in the catalog (e.g. tetris → `caida`), the slug is that id.

| # | File | Role |
|---|------|------|
| 1 | `lib/games/<slug>/game.esm.js` | Vanilla engine → ES module |
| 2 | `lib/games/<slug>/types.ts` | `LeaderboardEntry` + `<Game>GameProps` |
| 3 | `components/games/<slug>/<Game>Game.tsx` | `'use client'` canvas component |
| 4 | `components/games/<slug>/<slug>.css` | Styles, prefix `<slug>-`, `aspect-ratio`, `@media (prefers-reduced-motion)` |
| 5 | `app/games/<slug>/page.tsx` | Server Component: `Metadata`, `LeaderboardServer` in `<Suspense>` |
| 6 | `app/games/<slug>/actions.ts` | `submit<Game>Score` + `get<Game>Leaderboard` |
| 7 | `app/api/leaderboard/<slug>/route.ts` | `GET` → `get<Game>Leaderboard()` |
| 8 | catalog seed | `INSERT` row into `public.games` migration |

## REUSE, do not modify

- `saveScore(input)` — `app/data/scores.ts:56`. Insert primitive.
- `getScoresByGame(game)` — `app/data/scores.ts:39`. Per-game read.
- `scoreEntrySchema` / `ScoreEntryInputParsed` — `app/data/schema.ts`. Zod contract. **Never redeclare or loosen.**
- `createSupabaseServerClient()` — `lib/supabase/server.ts`. Cookie auth.
- `Game` / `GameFilter` / `GameColor` — `app/data/types.ts`.
- `mapToLeaderboardEntry` — copy the 1:1 adapter from `app/games/asteroids/actions.ts:37` (fills `rank`, `isCurrentUser`, ISO `createdAt`).

Scores table has **no FK** to `games.id` — linkage is by-convention (matching string). Honor it.

## WRAP, do not port

Vanilla engines from `resources/started-games/<NN>-<name>/game.js` use `document.getElementById`, `window.addEventListener`, module-level state. Adapt, don't rewrite as TS:

- Remove top-level `document.getElementById` reads — receive the DOM via `initGame(refs, { onGameOver })`. For a single-canvas game, `refs` is the canvas; for multi-element games (e.g. tetris: `board` + `next-canvas` + HUD `score/lines/level` + overlay), `refs` is an object of the needed elements passed from React.
- Drop vanilla theming/theme-toggle/localStorage blocks — the platform owns theming (dark retro `app/globals.css`).
- Pair `window.addEventListener` attach/detach (asteroids `attachInput`/`detachInput`) so `destroy()` removes them.
- Store `requestAnimationFrame` handle module-scoped; `destroy()` cancels it.
- Clamp `dt` to `0.05s` (tab-blur guard).
- Fixed internal resolution; CSS scales visually. Engine never reads CSS dims.
- `onGameOverCallback(score)` fires **once** at terminal state.

Why: spec 05 decision — "Mínima refactor, cero riesgo de romper lógica probada."

## Submit Server Action recipe

`actions.ts` — dynamic-import the supabase server client, shape verbatim:

```ts
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getScoresByGame, saveScore } from '@/app/data/scores';
import type { ScoreEntry } from '@/app/data/types';
import type { LeaderboardEntry } from '@/lib/games/<slug>/types';

export type SubmitScoreResult = { ok: true } | { ok: false; error: string };

export async function submit<Game>Score(score: number): Promise<SubmitScoreResult> {
  const supabase = await (await import('@/lib/supabase/server')).createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'UNAUTHENTICATED' };
  try {
    await saveScore({
      game: '<slug>',
      score,
      name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Jugador',
      at: Date.now(),
      userId: user.id
    });
  } catch {
    return { ok: false, error: 'DB_ERROR' };
  }
  revalidatePath('/games/<slug>');
  revalidatePath('/salon');
  revalidateTag('leaderboard', 'max');
  return { ok: true };
}
```

## React component lifecycle

`game.esm.js` touches `window` → **dynamic** `import()` in useEffect (SSR-safe). Ordering is load-bearing:

```ts
// 'use client'
useEffect(() => {
  let game: GameModule | null = null;
  import('../../../lib/games/<slug>/game.esm.js').then((m) => {
    game = m;
    m.setOnGameOver(handleGameOver);   // wire BEFORE init
    m.initGame(canvasRef.current!, options);
  });
  return () => game?.destroy();        // cleanup REQUIRED: cancels RAF + detaches listeners
}, []);
```

- `gameRef` holds `{ initGame, destroy, setOnGameOver }`.
- `?e2e=1` → expose `window.__forceGameOver(score)` for Playwright.
- Canvas internal size fixed; container `aspect-ratio` + `max-width` does scaling.
- Unauthenticated submit → `{ ok:false, error:'UNAUTHENTICATED' }` → auth overlay → `/auth?redirect=/games/<slug>`.

## Catalog seed

- `id` (text PK = slug) **MUST equal** the `game` string passed to `saveScore`.
- **Check existing seeds first** — a matching game may already exist (tetris is seeded as `caida`). Reuse that `id` rather than inventing a duplicate.
- `cat` ∈ `'ARCADE'|'PUZZLE'|'SHOOTER'|'VERSUS'`; `color` ∈ `'cyan'|'magenta'|'green'|'yellow'` (DB CHECKs).
- `best` int default 0; `plays` text display string (`"12.4K"`).
- Only `service_role` writes; public reads. Seed via migration `INSERT ... ON CONFLICT (id) DO NOTHING`.
- Cover key (e.g. `cover-rocas`) is a **CSS class** in `app/globals.css` — NOT a file asset. If `cover-<x>` class doesn't exist, add it there.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `/juegos/<slug>` (spec 05 text) | Real routing is `/games/<slug>` |
| Sync `import` of engine | Dynamic `import()` in useEffect (SSR-safe) |
| No `destroy()` in cleanup | RAF + listeners leak across navigations |
| `onGameOver` wired after `initGame` | Wire BEFORE init |
| Rewriting `scores.ts`/`schema.ts` | Game-agnostic already; reuse, don't touch |
| Catalog `id` ≠ score `game` string | Leaderboard returns nothing (no FK, silent) |
| Loosening `scoreEntrySchema` | Never |

## Verification

- `npm run dev` → `/games/<slug>` loads, no console errors.
- Play → game over → submit; authed → leaderboard updates; unauthed → auth overlay.
- `fetch('/api/leaderboard/<slug>')` returns ranked top 10.
- `/salon` shows the new game tab with its leaderboard.
- `npm run build` + `npm run lint` green.
