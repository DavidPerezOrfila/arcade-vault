# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Arcade Vault is a retro arcade gaming platform where users play online and compete for high scores. Games are vanilla-JS engines wrapped as React canvas components; scores persist to Supabase (Postgres). Reference UI prototypes live in `resources/templates/`.

## Tech stack

- **Framework:** Next.js 16.3.0 (App Router)
- **Runtime:** React 19.2.4
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with CSS-based configuration
- **Linting:** ESLint 9 with `eslint-config-next` flat config
- **Package manager:** npm (lockfile present)

## Common commands

```bash
# Start the development server
npm run dev

# Create a production build
npm run build

# Start the production server (after building)
npm run start

# Run ESLint across the project
npm run lint

# Run E2E tests with Playwright
npm run test:e2e

# Run a single E2E test (file or by name)
npx playwright test e2e/<file>.spec.ts
npx playwright test -g "test name fragment"

# Local Supabase stack — OPCIONAL (dev aislado; el app corre contra Supabase remoto por defecto)
npm run db:start    # docker up + apply migrations (primera vez tarda ~2 min)
npm run db:status   # imprime URL, anon key, service_role key → .env.local
npm run db:reset    # drop+recreate DB y reaplica migrations
npm run db:stop     # apaga el stack
npm run db:types    # regenera lib/supabase/types.ts desde el esquema actual
npm run db:migrate  # aplica migrations nuevas sin reset
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values. These variables are read only on the server (Server Actions / Node.js runtime):

| Variable                               | Description                                                     | Source                                                                                                |
| -------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL pública de la API de Supabase                               | Proyecto remoto `fqiiurfqabfbwwnmoizy` (default); local `http://127.0.0.1:54321` si se usa `db:start` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave anónima — cliente y Server Components                     | Panel de Supabase → API Keys / `db:status`                                                            |
| `SUPABASE_SERVICE_ROLE_KEY`            | Clave con permisos totales (server-side ONLY, nunca en cliente) | Panel de Supabase → API Keys / `db:status`                                                            |
| `RESEND_API_KEY`                       | API key de Resend (formulario de contacto)                      | Cuenta Resend                                                                                         |
| `RESEND_FROM_EMAIL`                    | Remitente verificado en Resend                                  | `hola@arcade-vault.gg`                                                                                |
| `CONTACT_EMAIL`                        | Destinatario del mensaje                                        | `tu-email@example.com`                                                                                |

Las tres primeras (`NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`) son
obligatorias: sin ellas, Home, `/salon`, `/detalle/[id]`, `/games` y
`/games/asteroids` fallan al consultar `getScores`/`getGames`.

> **Configuración (2026-08-06):** el app NO depende de Docker para ejecutar los
> juegos. `.env.local` apunta al Supabase **remoto**; el stack local
> (`npm run db:start`) queda solo como opción de desarrollo aislada.

## Project structure

- `app/` — Next.js App Router pages and global layout.
- `app/data/` — Data access layer (`scores.ts`, `games.ts`, `players.ts`, `actions.ts`, `schema.ts`, `types.ts`). All reads/writes to Supabase go through here.
- `app/games/<slug>/` — Per-game pages (`page.tsx`, `actions.ts`).
- `app/api/leaderboard/<slug>/route.ts` — Public `GET` endpoint per game.
- `app/salon/`, `app/about/`, `app/player/[id]/`, `app/auth/` — Feature route segments.
- `components/games/<slug>/` — `'use client'` canvas component + CSS per game.
- `components/games/` — Shared hooks (`useArcadeGame.ts`) and UI (`LeaderboardList.tsx`, `AuthPrompt.tsx`).
- `lib/games/<slug>/` — Vanilla JS game engine (`game.esm.js`) + engine types.
- `lib/games/leaderboard.ts` — `createLeaderboardActions()` factory.
- `lib/supabase/` — `server.ts`, `client.ts`, `admin.ts`, generated `types.ts`.
- `public/` — Static assets served from the root path.
- `e2e/` — Playwright specs.
- `resources/templates/` — Reference HTML/JSX prototypes (`Arcade Vault.html`, `app.jsx`, `data.jsx`, `nav.jsx`, `biblioteca.jsx`, `detalle.jsx`, `reproductor.jsx`, `auth.jsx`, `salon.jsx`, `styles.css`). These define the intended screens, game catalog data, and visual style for the Arcade Vault product. Treat them as the design source of truth until formal specs exist.
- `resources/implemented-games.md` — Source of truth of game status: which slugs are implemented (playable) vs catalogued (no engine yet), with per-game summary, `best` score, category/color, and engine file paths. Consult it before adding or claiming a game is playable.

## Skills

Usa siempre /frontend-design para diseñar la interfaz de usuario.

## Agents

- **`game-planner`** (`.claude/agents/game-planner.md`) — decide qué juego encaja con la plataforma como siguiente a implementar. Prioriza los 5 slugs catalogados sin motor (bloque-buster, gloton, invasores, ranaria, duelo-pixel); si ninguno encaja o se agotan, propone juegos retro nuevos. Mantiene memoria persistente en `resources/game-suggestions-todo.md`. Solo recomienda — nunca lanza `/spec` ni escribe código. Usar cuando se pregunte "what game next", "qué juego construimos", "plan next game", o para roadmap del catálogo.

## Architecture notes

- This is a **Next.js App Router** application. Server Components are the default; add `"use client"` only when a component uses state, effects, refs, browser APIs, or event handlers.
- The project uses **Tailwind CSS v4**, which is configured through CSS (`@import "tailwindcss"` and `@theme inline` in `app/globals.css`) rather than a `tailwind.config.js` file.
- The TypeScript path alias `@/*` maps to the repository root.
- `eslint.config.mjs` uses the ESLint 9 flat config format with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

### Data layer & Supabase

Three clients in `lib/supabase/`:

- `server.ts` — `createSupabaseServerClient()` (cookie-based, user-scoped). Default for Server Components and Server Actions.
- `client.ts` — browser client.
- `admin.ts` — service-role, server-only, bypasses RLS. Never expose to the client.

All DB access funnels through `app/data/`:

- `scores.ts` — `saveScore(input)` insert primitive, `getScoresByGame(game)` per-game read. The `scores` table has **no FK** to `games.id`; linkage is by-convention (matching string slug).
- `games.ts` — `getGames()`, `getGameById(id)`, `getGamesByCategory(cat)`. Reads the `games` catalog table.
- `schema.ts` — `scoreEntrySchema` (Zod). Single source of truth for the score contract; never redeclare or loosen.
- `types.ts` — `Game`, `GameCategory`, `GameFilter`, `ScoreEntry`, `GameColor`.

### Games — leaderboard factory (use this, not the template in the skill)

Each game's `actions.ts` does **not** hand-roll submit/get. It calls the shared factory in `lib/games/leaderboard.ts`:

```ts
import { createLeaderboardActions } from '@/lib/games/leaderboard';
const actions = createLeaderboardActions({ gameId: '<slug>', gamePath: '/games/<slug>' });
export const submit<Game>Score = actions.submitScore;
export const get<Game>Leaderboard = actions.getLeaderboard;
```

The factory handles auth check, score validation against `scoreEntrySchema`, `revalidatePath`/`revalidateTag`, and top-N slicing. When adding a game, copy `app/games/asteroids/actions.ts` (the shortest real example), **not** the inline `submitScore` template in the `integrate-arcade-game` skill — that template predates the factory and will produce an outdated standalone implementation.

### Game engines — loop contract

Engines live in `lib/games/<slug>/game.esm.js` as vanilla ES modules exporting `initGame(refs, { onGameOver })` and `destroy()`. Key conventions (load-bearing, do not regress):

- **Loop via chained `setTimeout`, not `requestAnimationFrame`.** RAF throttles/freeze in headless WebKit and CI; the chained-timer pattern keeps `dt` real per frame and survives `destroy()` cancellation.
- `initGame` receives the canvas (or object of elements) from React; never read `document.getElementById` at module top level.
- Pair `window.addEventListener`/`detachInput` so `destroy()` removes them; cancel the timer handle there too.
- `destroy()` must be idempotent (guard against null `ctx` after teardown).
- `onGameOver(score)` fires **once** at terminal state.
- React loads the engine via dynamic `import()` inside `useEffect` (engine touches `window` — SSR-unsafe).

## Spec driven design

This repo follows the Spec Driven Design workflow from `Klerith/fernando-skills`. The skills are installed under `.agents/skills/`:

- `/spec` — designs a new spec section by section and saves it to `specs/NN-slug.md`.
- `/spec-impl <NN-slug>` — implements an approved spec, creating a git branch `spec-NN-slug` and working through the plan step by step.

Use `/spec` before starting any large feature. Do not write production code until the spec is marked `Approved` (or `Aprobado`) and `/spec-impl` is invoked.

## Important warnings

- `AGENTS.md` notes that this is **not the Next.js you may know from training data**: Next.js 16 has breaking changes, and APIs, conventions, and file structure may differ. Before writing Next.js-specific code, consult the relevant guide in `node_modules/next/dist/docs/` and heed any deprecation notices.
- **Bug known:** `playwright.config.ts` sets `testDir: './tests/e2e'` but specs live in `./e2e/`. Plain `npm run test:e2e` finds **zero** tests. Use `npx playwright test e2e/<file>.spec.ts` explicitly, or fix the `testDir` to `'./e2e'` when touching the config.
- Line endings are LF, enforced by `npm run lint` (`linebreak-style`). `.gitattributes` sets `* text=auto eol=lf`; never commit CRLF. On Windows, `core.autocrlf=true` or OneDrive placeholders can leave CRLF in the working tree — the lint error is the source of truth, not a clean `git status`.

## Localization

The product is Spanish-language (`es`). The root layout currently sets `lang="en"`; update it to `lang="es"` when localizing the application to match the content in `resources/templates/`.

## Coding guidelines (source: `instructions.md`)

- Responde corto y conciso.
- Código en inglés — identificadores, funciones, clases, todo.
- Comentarios en español, solo cuando aporten valor.
- Prioriza simplicidad: código legible, funciones pequeñas, sin duplicación (DRY).
- Sigue principios SOLID donde aplique.
- Sin comentarios superfluos — código auto-documentado en lo posible.
- Sin magia: evita expresiones crípticas, prefiere claridad.
- Buenas prácticas de seguridad cuando corresponda.

## 3-Layer Context Rule (mandatory)

Every task MUST resolve context through these layers before opening any source file:

1. **Graph query** — `graphify query "<question>"` or `graphify path "<A>" "<B>"` or `graphify explain "<concept>"`. This returns a scoped subgraph with the exact nodes and edges relevant to the question. Start here for ANY codebase question.

2. **Obsidian vault** — `graphify-out/obsidian/` contains one `.md` per node with wikilinks, community tags, and cohesion scores. Use this for deep context on a specific concept, component, or spec. The vault index (`_COMMUNITY_*.md` files) maps communities to their members.

3. **Source files** — Only open individual source files AFTER layers 1-2 have narrowed the scope. Never open 10+ files in a single message to "get context" — that is exactly what burns tokens. If the graph and vault don't surface enough, say so and ask which specific file to read.

**Why this rule exists:** Opening dozens of source files per message is the primary token explosion vector. The graph and Obsidian vault are pre-extracted, deduplicated, and relationally linked — they answer most questions in <2000 tokens where raw file reads would cost 20,000+.

<!-- BEGIN:graphify-reminder -->

A dedicated `consult-graph` skill is installed at `.claude/skills/consult-graph/SKILL.md` to drive this 3-layer rule end-to-end: it opens `graphify-out/obsidian/index.md`, picks 1–3 community pages, and summarises findings with `[[wikilinks]]`. Prefer invoking it (or following its workflow directly above) before falling back to source files.
<!-- END:graphify-reminder -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

### Obsidian

El vault en `graphify-out/obsidian/` es el wiki del proyecto. Ábrelo en Obsidian como bóveda para navegar el grafo visualmente.

Siguiendo el patrón [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (Karpathy):

- **Obsidian es el IDE** — navegas las conexiones entre componentes, specs y docs.
- **El agente es el programador** — escribe y mantiene el grafo automáticamente.
- **La wiki es el codebase** — el grafo refleja la arquitectura real del proyecto.

```bash
# Reconstruir el grafo (AST‑only) y re‑exportar el vault
npm run graphify:update
npm run graphify:obsidian
```

### Git policy

- **Se commitea:** `graphify-out/graph.json`, `GRAPH_REPORT.md`, `graph.html`, `graphify-out/obsidian/`
- **No se commitea:** `graphify-out/cache/`
