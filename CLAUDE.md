# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault is a Spanish-language retro arcade platform. Users play browser games and submit high scores to Supabase. The UI is a Next.js App Router application; each game uses a vanilla JavaScript canvas engine wrapped by a React client component.

Reference prototypes in `resources/templates/` define the intended catalog, screens, and visual style. `resources/implemented-games.md` is the source of truth for playable versus catalog-only games; update it in the same change that ships a game.

## Stack

- Next.js 16.3 App Router, React 19, TypeScript 5
- Tailwind CSS v4 configured in `app/globals.css`
- Supabase (Postgres/Auth) via `@supabase/ssr` and `@supabase/supabase-js`
- ESLint flat config, Prettier, Playwright
- npm (`package-lock.json` is committed)

## Commands

```bash
npm run dev                 # development server
npm run build               # production build
npm run start               # serve a production build
npm run lint                # ESLint: app, components, e2e
npm run lint:fix            # ESLint with fixes
npm run format              # Prettier write
npm run format:check        # Prettier check

# E2E
npm run test:e2e
npx playwright test tests/e2e/<file>.spec.ts
npx playwright test tests/e2e/<file>.spec.ts -g "test name fragment"
npx playwright show-report .playwright-report

# Knowledge graph
npm run graphify:update
npm run graphify:obsidian

# Optional isolated local Supabase stack
npm run db:start
npm run db:status
npm run db:migrate
npm run db:reset
npm run db:types
npm run db:stop
```

Playwright specs live in `tests/e2e/` and match `testDir` in `playwright.config.ts`. (`e2e/about.spec.ts` is orphaned outside `testDir` and is not run by the default config.) Playwright starts `npm run start`, so build first and provide required Supabase environment variables.

The real GitHub login in `tests/e2e/oauth.spec.ts` requires `GH_E2E_USERNAME` + `GH_E2E_PASSWORD` (dedicated test account, no 2FA; the visible username is the GitHub login); without them the test is skipped, and it only runs on chromium.

## Environment

Copy `.env.template` to `.env.local`. The application normally uses the configured remote Supabase project; Docker is only needed for isolated local database work.

Required for pages and games that read or write data:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Contact email flow also uses `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_EMAIL`.

## Architecture

### App and data

- `app/` contains route segments, layouts, Server Components, Server Actions, and public leaderboard routes.
- `app/data/` is the only application data-access layer for Supabase. Use its schemas and types rather than querying from components.
- `lib/supabase/server.ts` creates the cookie-aware user client for Server Components and Server Actions; `client.ts` is browser-scoped; `admin.ts` is server-only and bypasses RLS.
- `lib/supabase/types.ts` is generated from the database schema (plus the hand-added `profiles` entry).
- `app/api/leaderboard/<slug>/route.ts` exposes public read endpoints.
- `app/auth/` holds the login/register UI and Server Actions (`actions.ts`); the shared `redirect.ts` sanitizer keeps `?redirect=` to internal paths. OAuth bounces through `app/auth/callback/route.ts`.
- `proxy.ts` at the repo root is the Next.js 16 session Proxy (the old `middleware`), refreshing the Supabase session cookie and protecting `/cuenta` and `/auth/reset`.
- `public.profiles` (see `supabase/migrations/*_auth_profiles.sql`) is the trigger-driven source of the visible player name: `app/auth/actions.ts` handles auth, `components/nav.tsx` (Server Component) reads `profiles.username` into `NavClient`, and `lib/games/leaderboard.ts` uses it as `scores.name` when saving.

Scores link to games by matching string slug; `scores` has no foreign key to `games.id`. Validate score payloads with `app/data/schema.ts` and reuse `lib/games/leaderboard.ts` for game actions:

```ts
import { createLeaderboardActions } from '@/lib/games/leaderboard';

const actions = createLeaderboardActions({
  gameId: '<slug>',
  gamePath: '/games/<slug>',
});

export const submitGameScore = actions.submitScore;
export const getGameLeaderboard = actions.getLeaderboard;
```

Copy `app/games/asteroids/actions.ts` for a new game's actions. Do not use older inline action templates.

### Game integration

New games follow the 8-file recipe documented in `resources/implemented-games.md`: engine, React wrapper, game CSS, page, Server Actions, API route, e2e spec, and catalog entry.

- `lib/games/<slug>/game.esm.js` is a browser-only vanilla engine.
- `components/games/<slug>/` contains the `'use client'` React wrapper and game CSS.
- React dynamically imports engines inside `useEffect`; engines must not touch browser globals at module scope.
- Engines export `initGame(refs, options)` and `destroy()`.
- Use chained `setTimeout`, not `requestAnimationFrame`: RAF throttles in headless WebKit/CI. Cancel the timer in `destroy()`.
- Pair every input listener (keyboard and pointer/touch) with cleanup. Make `destroy()` idempotent. Fire `onGameOver(score)` once.
- Shared game UI and hooks live in `components/games/`.

### Skins

`lib/games/skins.ts` is the single source of truth. There are exactly three IDs: `clasico` (default), `neon`, and `retro`. It owns palette tokens, labels, and the `localStorage` key.

`components/skin/SkinProvider.tsx` stores the active skin on `<html data-skin="...">`; `app/layout.tsx` bootstraps that attribute before paint. Use global `SkinSwitcher` outside game routes and per-game `SkinSelect` inside each game layout. Engines receive `{ skin }` and resolve palettes through `PALETTES`; do not hardcode entity colors in engines. Add coverage to `resources/skins-todo.md`.

## Spec workflow

Large features follow Spec Driven Design:

1. `/spec` creates `specs/NN-slug.md`.
2. Do not write production code until spec state is `Approved` or `Aprobado`.
3. `/spec-impl <NN-slug>` implements the approved spec on its `spec-NN-slug` branch.

Game-jam drafts live under `specs/game-jam/<slug>/` as two alternative specs of the same game (`spec-<slug>-a.md` / `spec-<slug>-b.md`).

## Project agents

- `game-planner` — decides the next game; reads/updates `resources/game-suggestions-todo.md`. Recommendation only, never writes code.
- `game-jam` — drafts two alternative specs for a themed game. Specs only, no implementation.
- `skin-designer` — skin-layer work only; coverage tracked in `resources/skins-todo.md`.
- `mobile-porter` — responsive/mobile audits and CSS fixes at 320/375/414px; reports to `resources/mobile-audit.md`.
- `optimize-arcade-game` — engine performance and difficulty balance against the P1-P7 checklist.

## Repository-specific constraints

- Before exploring unfamiliar code, run `graphify query`, `graphify path`, or `graphify explain`; then consult relevant files under `graphify-out/obsidian/` before opening source.
- After code changes, run `graphify update .` (or `npm run graphify:update`) so committed graph artifacts stay current.
- Before writing Next.js-specific code, read the relevant guide under `node_modules/next/dist/docs/`; this repository uses Next.js 16 and its APIs differ from older versions.
- Keep source identifiers in English. Product copy is Spanish. The root layout already sets `lang="es"`.
- Files must use LF line endings; `npm run lint` enforces this on Windows.
- Tailwind v4 has no `tailwind.config.js`; theme configuration belongs in CSS.
- TypeScript path alias `@/*` maps to the repository root.

## Repository guidance

`AGENTS.md` carries the cross-harness rules (engineering principles, engine contract, clean code, line endings, Next.js 16 and graphify reminders). `.github/copilot-instructions.md` only adds Mermaid instructions: when editing or creating diagrams, follow `.github/instructions/mermaid.instructions.md`.
