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
```

There is no test runner configured yet. If you add one, update this file with the test command.

## Project structure

- `app/` — Next.js App Router pages and global layout.
- `public/` — Static assets served from the root path.
- `resources/templates/` — Reference HTML/JSX prototypes (`Arcade Vault.html`, `app.jsx`, `data.jsx`, `nav.jsx`, `biblioteca.jsx`, `detalle.jsx`, `reproductor.jsx`, `auth.jsx`, `salon.jsx`, `styles.css`). These define the intended screens, game catalog data, and visual style for the Arcade Vault product. Treat them as the design source of truth until formal specs exist.

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
