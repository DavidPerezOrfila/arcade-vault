# Graph Report - 05-arcade-vault  (2026-07-17)

## Corpus Check
- 113 files · ~73,897 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 705 nodes · 770 edges · 75 communities (66 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2b9c5ca`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Playwright CLI Reference
- Playwright CLI Reference
- Browser Sessions
- Project Architecture
- Game Data Layer
- TypeScript Config
- Home Page UI
- Package Dependencies
- Playwright Automation
- Playwright Automation
- Test Generation
- Test Generation
- Dev Tooling
- About Page & Contact
- Playwright Tracing
- Playwright Tracing
- Spec Template
- Spec Template
- localStorage Ops
- Playwright CLI Skill
- localStorage Ops
- Playwright CLI Skill
- Playwright Summaries
- MVP Spec
- Cookie Management
- Spec-Impl Skill
- Cookie Management
- Spec-Impl Skill
- Storage State
- Root Layout
- Spec-Driven Dev
- Storage State API
- Storage State API
- Spec Skills Config
- IndexedDB Ops
- Games Page
- Auth State Patterns
- IndexedDB Ops
- App Shell
- Game Data Model
- Next.js 16 Warning
- ESLint Config
- Next Config
- PostCSS Config
- Custom Bundler
- levels.js

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Browser Automation with playwright-cli` - 15 edges
3. `About Page with Resend Spec (03)` - 14 edges
4. `Home Page Spec (02)` - 13 edges
5. `update()` - 11 edges
6. `Template for a useful spec` - 11 edges
7. `Commands` - 10 edges
8. `Browser Session Management` - 10 edges
9. `Tetris` - 10 edges
10. `scripts` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Playwright CLI Browser Automation Skill (.claude copy)` --conceptually_related_to--> `Browser Automation via CLI`  [INFERRED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/SKILL.md
- `Arcade Vault Platform Description` --references--> `Arcade Vault Project Overview`  [INFERRED]
  README.md → CLAUDE.md
- `Home Page Spec (02)` --references--> `Tailwind CSS v4 Theme Configuration`  [INFERRED]
  specs/02-home-page.md → CLAUDE.md
- `About Page with Resend Spec (03)` --references--> `Arcade Vault Standalone Bundled Prototype`  [INFERRED]
  specs/03-about-page-resend.md → resources/templates/home-about/arcade-vault-standalone.html
- `Storage Management` --references--> `Run Code`  [EXTRACTED]
  .agents/skills/playwright-cli/references/storage-state.md → .claude/skills/playwright-cli/references/running-code.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spec Driven Design Workflow (Klerith/fernando-skills)** — claude_specdrivendesign, readme_fernandoskillsreference, specs_02_home_page_homepagespec, specs_03_about_page_resend_aboutpageresendspec [INFERRED 0.90]
- **About Page Contact Form Flow** — specs_03_about_page_resend_aboutpageresendspec, specs_03_about_page_resend_contactforminput, specs_03_about_page_resend_contactzodschema, specs_03_about_page_resend_resendserveraction, specs_03_about_page_resend_resendemailprovider, specs_03_about_page_resend_playwright_e2e [EXTRACTED 1.00]
- **Home Page Implementation Components** — specs_02_home_page_homepagespec, specs_02_home_page_sevensections, specs_02_home_page_usereveal, specs_02_home_page_floatingsilhouettes, specs_02_home_page_featureicon, specs_02_home_page_minicard [EXTRACTED 1.00]
- **Spec-Driven Development Workflow** — _agents_skills_spec_skill_document, _agents_skills_spec_impl_skill_document, _agents_skills_spec_template_document, spec_driven_development_concept [INFERRED 0.95]

## Communities (75 total, 9 thin omitted)

### Community 0 - "Playwright CLI Reference"
Cohesion: 0.07
Nodes (28): Asteroid, Bullet, canvas, ctx, dist(), draw(), drawHUD(), drawLifeIcon() (+20 more)

### Community 1 - "Playwright CLI Reference"
Cohesion: 0.22
Nodes (8): Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response, Modify Real Response, Request Mocking, Simulate Network Failures, URL Patterns

### Community 2 - "Browser Sessions"
Cohesion: 0.09
Nodes (20): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+12 more)

### Community 3 - "Project Architecture"
Cohesion: 0.09
Nodes (32): Playwright Test Report, Arcade Vault Project Overview, Graphify Knowledge Graph System, Server Components Default Pattern, Spec Driven Design Workflow, Tailwind CSS v4 Theme Configuration, Tech Stack (Next.js 16, React 19, TypeScript 5, Tailwind v4, ESLint 9), Arcade Vault Platform Description (+24 more)

### Community 4 - "Game Data Layer"
Cohesion: 0.07
Nodes (28): AuthPage(), CATS, GAMES, PLAYERS, seededScores(), clearUser(), getScores(), getUser() (+20 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "Package Dependencies"
Cohesion: 0.06
Nodes (30): @dietrichgebert/ponytail, ecc-universal, next, dependencies, @dietrichgebert/ponytail, ecc-universal, next, react (+22 more)

### Community 8 - "Playwright Automation"
Cohesion: 0.14
Nodes (14): Browser Automation with playwright-cli, Browser Sessions, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session, Example: Multi-tab workflow, Installation, Open parameters (+6 more)

### Community 9 - "Playwright Automation"
Cohesion: 0.08
Nodes (39): canvas, clearLines(), collide(), COLORS, createBoard(), ctx, draw(), drawBlock() (+31 more)

### Community 10 - "Test Generation"
Cohesion: 0.14
Nodes (18): ball, BLOCK_COLORS, blocks, bounceSound, breakSound, canvas, collideAABB(), ctx (+10 more)

### Community 11 - "Test Generation"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 12 - "Dev Tooling"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, prettier, prettier-plugin-tailwindcss (+15 more)

### Community 13 - "About Page & Contact"
Cohesion: 0.18
Nodes (11): sendContactEmail(), HighlightIcon(), HighlightIconKind, HighlightIconProps, AboutPage(), HIGHLIGHTS, initialState, ContactFormData (+3 more)

### Community 14 - "Playwright Tracing"
Cohesion: 0.12
Nodes (16): 1. `index.html`, 2. `style.css`, 3. `game.js`, Controles, Cómo ejecutar el juego, Cómo funciona, Estructura del proyecto, Flujo del juego (+8 more)

### Community 15 - "Playwright Tracing"
Cohesion: 0.08
Nodes (24): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+16 more)

### Community 16 - "Spec Template"
Cohesion: 0.13
Nodes (13): API de `spritesheet.js`, Archivos principales, Arquitectura, Assets, Ciclo de vida de una spec, Comandos, Desarrollo, Estado del juego (en `game.js`) (+5 more)

### Community 17 - "Spec Template"
Cohesion: 0.15
Nodes (12): 01 — MVP jugable de Arkanoid, Alcance, Bloques, Criterios de aceptación, Decisiones tomadas y descartadas, Dentro del MVP, Estado del juego, Fuera del MVP (dejado para specs posteriores) (+4 more)

### Community 18 - "localStorage Ops"
Cohesion: 0.06
Nodes (36): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+28 more)

### Community 19 - "Playwright CLI Skill"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 20 - "localStorage Ops"
Cohesion: 0.06
Nodes (35): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+27 more)

### Community 21 - "Playwright CLI Skill"
Cohesion: 0.17
Nodes (11): 03 — Sonidos y niveles, Alcance, Criterios de aceptación, Decisiones tomadas y descartadas, Definición de niveles, Dentro del spec, Estado de pausa, Fuera del alcance (+3 more)

### Community 22 - "Playwright Summaries"
Cohesion: 0.27
Nodes (10): Running Custom Playwright Code Reference, Browser Session Management Reference, Test Generation Reference (Plan/Generate/Heal), Tracing Reference, Element Attributes Reference (.claude copy), Playwright Tests Reference (.claude copy), Request Mocking Reference (.claude copy), Playwright CLI Browser Automation Skill (.claude copy) (+2 more)

### Community 23 - "MVP Spec"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 24 - "Cookie Management"
Cohesion: 0.20
Nodes (10): Commands, Core, DevTools, Keyboard, Mouse, Navigation, Network, Save as (+2 more)

### Community 25 - "Spec-Impl Skill"
Cohesion: 0.22
Nodes (8): Asteroids, Características, Controles, Cómo correr, Demo:, Descripción, Puntuación, Tecnologías

### Community 26 - "Cookie Management"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 27 - "Spec-Impl Skill"
Cohesion: 0.22
Nodes (8): 02 — Animación de explosión al romper bloques, Alcance, Criterios de aceptación, Decisiones tomadas y descartadas, Dentro del spec, Fuera del alcance, Modelo de datos, Plan de implementación

### Community 28 - "Storage State"
Cohesion: 0.22
Nodes (4): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests

### Community 29 - "Root Layout"
Cohesion: 0.25
Nodes (8): 1. Use Descriptive Filenames, 2. Record entire hero scripts., Basic Recording, Best Practices, Limitations, Overlay API Summary, Tracing vs Video, Video Recording

### Community 30 - "Spec-Driven Dev"
Cohesion: 0.67
Nodes (4): Spec Implementation Skill, Spec Design Skill, Spec Template, Spec-Driven Development

### Community 31 - "Storage State API"
Cohesion: 0.25
Nodes (7): Arkanoid, Características, Controles, Estructura del proyecto, Jugar, Niveles, Specs implementadas

### Community 32 - "Storage State API"
Cohesion: 0.29
Nodes (5): Architecture, Game flow, game.js internals, Running the game, Tunable constants (top of game.js)

### Community 33 - "Spec Skills Config"
Cohesion: 0.50
Nodes (4): /spec-impl Skill, /spec Skill, Spec Template, Branch Creation Config

### Community 34 - "IndexedDB Ops"
Cohesion: 0.29
Nodes (3): EXPLOSION_FRAMES, SPRITES, ssCallbacks

### Community 35 - "Games Page"
Cohesion: 0.40
Nodes (3): CATS, GAMES, PLAYERS

### Community 37 - "IndexedDB Ops"
Cohesion: 0.50
Nodes (3): Reporting a Vulnerability, Security Policy, Supported Versions

### Community 40 - "Game Data Model"
Cohesion: 0.67
Nodes (3): Game Data Model, MVP Arcade Vault Spec, localStorage Persistence Model

## Knowledge Gaps
- **375 isolated node(s):** `HighlightIconKind`, `HighlightIconProps`, `initialState`, `HIGHLIGHTS`, `ContactFormData` (+370 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Storage Management` connect `localStorage Ops` to `Storage State`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Browser Automation with playwright-cli` connect `Playwright Automation` to `Cookie Management`, `Storage State`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling` to `Package Dependencies`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `About Page with Resend Spec (03)` (e.g. with `Spec Driven Design Workflow` and `useReveal Hook (IntersectionObserver Animations)`) actually correct?**
  _`About Page with Resend Spec (03)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Home Page Spec (02)` (e.g. with `Spec Driven Design Workflow` and `Tailwind CSS v4 Theme Configuration`) actually correct?**
  _`Home Page Spec (02)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `HighlightIconKind`, `HighlightIconProps`, `initialState` to the rest of the system?**
  _375 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Playwright CLI Reference` be split into smaller, more focused modules?**
  _Cohesion score 0.07030527289546716 - nodes in this community are weakly interconnected._