# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Arcade Vault is a retro arcade gaming platform where users play online and compete for high scores. The project is currently a fresh Next.js 16 installation with reference UI prototypes stored in `resources/templates/`.

## Tech stack

- **Framework:** Next.js 16.2.10 (App Router)
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
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values. These variables are read only on the server (Server Actions / Node.js runtime):

| Variable            | Description                    | Example                |
| ------------------- | ------------------------------ | ---------------------- |
| `RESEND_API_KEY`    | API key de Resend              | `re_xxxxxxxx`          |
| `RESEND_FROM_EMAIL` | Remitente verificado en Resend | `hola@arcade-vault.gg` |
| `CONTACT_EMAIL`     | Destinatario del mensaje       | `tu-email@example.com` |

## Project structure

- `app/` — Next.js App Router pages and global layout.
- `public/` — Static assets served from the root path.
- `resources/templates/` — Reference HTML/JSX prototypes (`Arcade Vault.html`, `app.jsx`, `data.jsx`, `nav.jsx`, `biblioteca.jsx`, `detalle.jsx`, `reproductor.jsx`, `auth.jsx`, `salon.jsx`, `styles.css`). These define the intended screens, game catalog data, and visual style for the Arcade Vault product. Treat them as the design source of truth until formal specs exist.

## Skills

Usa siempre /frontend-design para diseñar la interfaz de usuario.

## Architecture notes

- This is a **Next.js App Router** application. Server Components are the default; add `"use client"` only when a component uses state, effects, refs, browser APIs, or event handlers.
- The project uses **Tailwind CSS v4**, which is configured through CSS (`@import "tailwindcss"` and `@theme inline` in `app/globals.css`) rather than a `tailwind.config.js` file.
- The TypeScript path alias `@/*` maps to the repository root.
- `eslint.config.mjs` uses the ESLint 9 flat config format with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

## Spec driven design

This repo follows the Spec Driven Design workflow from `Klerith/fernando-skills`. The skills are installed under `.agents/skills/`:

- `/spec` — designs a new spec section by section and saves it to `specs/NN-slug.md`.
- `/spec-impl <NN-slug>` — implements an approved spec, creating a git branch `spec-NN-slug` and working through the plan step by step.

Use `/spec` before starting any large feature. Do not write production code until the spec is marked `Approved` (or `Aprobado`) and `/spec-impl` is invoked.

## Important warnings

- `AGENTS.md` notes that this is **not the Next.js you may know from training data**: Next.js 16 has breaking changes, and APIs, conventions, and file structure may differ. Before writing Next.js-specific code, consult the relevant guide in `node_modules/next/dist/docs/` and heed any deprecation notices.

## Localization

The product is Spanish-language (`es`). The root layout currently sets `lang="en"`; update it to `lang="es"` when localizing the application to match the content in `resources/templates/`.

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
