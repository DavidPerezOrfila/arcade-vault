# Graph Report - 05-arcade-vault  (2026-08-18)

## Corpus Check
- 280 files · ~193,680 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1579 nodes · 2005 edges · 171 communities (96 shown, 75 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `210c067d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- 02-asteroids/game.js
- Advanced Mocking with run-code
- Browser Session Management
- About Page with Resend Spec (03)
- serpentina/game.esm.js
- compilerOptions
- home.jsx
- scripts
- Browser Automation with playwright-cli
- 03-tetris/game.js
- 04-arkanoid/game.js
- leaderboard.ts
- devDependencies
- validate.py
- Tetris
- Tracing
- Arquitectura
- 01 — MVP jugable de Arkanoid
- Cookies
- Template for a useful spec
- Cookies
- 03 — Sonidos y niveles
- Playwright CLI Browser Automation Skill (.claude copy)
- /spec — Guided spec designer
- CaidaGame.tsx
- Asteroids
- Instructions
- 02 — Animación de explosión al romper bloques
- playwright-cli/SKILL.md
- Video Recording
- Spec Design Skill
- Arkanoid
- 03-tetris/CLAUDE.md
- /spec-impl Skill
- spritesheet.js
- compress.py
- 02-asteroids/CLAUDE.md
- Security Policy
- app.jsx
- MVP Arcade Vault Spec
- Next.js 16 Breaking Changes Warning
- next.config.mjs
- postcss.config.mjs
- asteroids/game.esm.js
- about/page.tsx
- Custom Bundler Asset Unpacking System
- levels.js
- Workflow: opencode-loop
- NOTES.md — mundo del usuario
- Workflow: issue-loop
- Integrate an Arcade Vault game
- 08-serpentina-game
- caida/game.esm.js
- app/page.tsx
- 07-tetris-caida
- Juegos catalogados (no jugables todavía)
- data.jsx
- instructions.md
- The tools
- INDEX.md
- caveman-compress/README.md
- biblioteca.jsx
- Commands
- detalle.jsx
- reproductor.jsx
- about/actions.md
- highlight-icon.md
- about/page.md
- about/schema.md
- about/types.md
- asteroids/route.md
- caida/route.md
- auth/page.md
- data/actions.md
- games.md
- players.md
- data/schema.md
- scores.md
- storage.md
- data/types.md
- footer.md
- asteroids/actions.md
- asteroids/page.md
- caida/actions.md
- 06-games-catalog-salon
- caida/page.md
- GamesClient.md
- games/page.md
- cavecrew/SKILL.md
- Caveman Help
- [slug]/page.md
- HomeEnhancer.md
- RecentActivity.md
- TimeAgo.md
- TopPlayersToday.md
- Mermaid AI Skills
- layout.md
- Caveman Compress
- caveman/SKILL.md
- app/page.md
- [id]/page.md
- PlayerClient.md
- caveman-commit
- caveman-review
- salon/page.md
- SalonClient.md
- AsteroidsGame.md
- CaidaGame.md
- components/nav.md
- about.spec.md
- asteroids/game.esm.md
- asteroids/types.md
- caida/game.esm.md
- caida/types.md
- admin.md
- client.md
- server.md
- supabase/types.md
- 02-asteroids/game.md
- 03-tetris/game.md
- SPEC 04 — Supabase: foundation y persistencia de puntuaciones
- 05-asteroids-game
- caveman-stats
- spritesheet.md
- 04-arkanoid/game.md
- levels.md
- app.md
- auth.md
- biblioteca.md
- data.md
- detalle.md
- about.md
- home.md
- home-about/nav.md
- templates/nav.md
- reproductor.md
- salon.md
- asteroids.spec.md
- caida.spec.md
- salon.spec.md
- salon.jsx
- eslint
- next
- game-jam.md
- SalonClient.tsx
- Skins — cobertura por juego
- requireEnv
- bloque-buster spec-b — Engine from scratch: física angular + power-ups + HUD DOM
- refactor-skin-layout-issue.md
- requireEnv
- .agents/skills/consult-graph/SKILL.md
- .claude/skills/consult-graph/SKILL.md
- __init__.py
- copilot-instructions.md

## God Nodes (most connected - your core abstractions)
1. `scripts` - 17 edges
2. `compilerOptions` - 16 edges
3. `LeaderboardEntry` - 15 edges
4. `Browser Automation with playwright-cli` - 15 edges
5. `validate()` - 14 edges
6. `About Page with Resend Spec (03)` - 14 edges
7. `useSkin()` - 13 edges
8. `Home Page Spec (02)` - 13 edges
9. `compress_file()` - 12 edges
10. `isSkinId()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Playwright CLI Browser Automation Skill (.claude copy)` --conceptually_related_to--> `Browser Automation via CLI`  [INFERRED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/SKILL.md
- `Arcade Vault Platform Description` --references--> `Arcade Vault Project Overview`  [INFERRED]
  README.md → CLAUDE.md
- `About Page with Resend Spec (03)` --references--> `Arcade Vault Standalone Bundled Prototype`  [INFERRED]
  specs/03-about-page-resend.md → resources/templates/home-about/arcade-vault-standalone.html
- `Home Page Spec (02)` --references--> `Tailwind CSS v4 Theme Configuration`  [INFERRED]
  specs/02-home-page.md → CLAUDE.md
- `getGames()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  app/data/games.ts → lib/supabase/server.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **About Page Contact Form Flow** — specs_03_about_page_resend_aboutpageresendspec, specs_03_about_page_resend_contactforminput, specs_03_about_page_resend_contactzodschema, specs_03_about_page_resend_resendserveraction, specs_03_about_page_resend_resendemailprovider, specs_03_about_page_resend_playwright_e2e [EXTRACTED 1.00]
- **Home Page Implementation Components** — specs_02_home_page_homepagespec, specs_02_home_page_sevensections, specs_02_home_page_usereveal, specs_02_home_page_floatingsilhouettes, specs_02_home_page_featureicon, specs_02_home_page_minicard [EXTRACTED 1.00]
- **Spec Driven Design Workflow (Klerith/fernando-skills)** — claude_specdrivendesign, readme_fernandoskillsreference, specs_02_home_page_homepagespec, specs_03_about_page_resend_aboutpageresendspec [INFERRED 0.90]
- **Spec-Driven Development Workflow** — _agents_skills_spec_skill_document, _agents_skills_spec_impl_skill_document, _agents_skills_spec_template_document, spec_driven_development_concept [INFERRED 0.95]

## Communities (171 total, 75 thin omitted)

### Community 0 - "02-asteroids/game.js"
Cohesion: 0.07
Nodes (28): Asteroid, Bullet, canvas, ctx, dist(), draw(), drawHUD(), drawLifeIcon() (+20 more)

### Community 1 - "Advanced Mocking with run-code"
Cohesion: 0.22
Nodes (8): Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response, Modify Real Response, Request Mocking, Simulate Network Failures, URL Patterns

### Community 2 - "Browser Session Management"
Cohesion: 0.04
Nodes (43): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+35 more)

### Community 3 - "About Page with Resend Spec (03)"
Cohesion: 0.09
Nodes (31): Arcade Vault Project Overview, Graphify Knowledge Graph System, Server Components Default Pattern, Spec Driven Design Workflow, Tailwind CSS v4 Theme Configuration, Tech Stack (Next.js 16, React 19, TypeScript 5, Tailwind v4, ESLint 9), Arcade Vault Platform Description, Klerith/fernando-skills Reference (+23 more)

### Community 4 - "serpentina/game.esm.js"
Cohesion: 0.11
Nodes (34): attachInput(), ball, blocks, clamp(), collideAABB(), destroy(), detachInput(), draw() (+26 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "home.jsx"
Cohesion: 0.12
Nodes (8): CATS, GAMES, PLAYERS, GameDetail(), Home(), useReveal(), GamePlayer(), HallOfFame()

### Community 7 - "scripts"
Cohesion: 0.04
Nodes (42): @dietrichgebert/ponytail, ecc-universal, next, dependencies, @dietrichgebert/ponytail, ecc-universal, next, react (+34 more)

### Community 8 - "Browser Automation with playwright-cli"
Cohesion: 0.14
Nodes (14): Browser Automation with playwright-cli, Browser Sessions, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session, Example: Multi-tab workflow, Installation, Open parameters (+6 more)

### Community 9 - "03-tetris/game.js"
Cohesion: 0.08
Nodes (39): canvas, clearLines(), collide(), COLORS, createBoard(), ctx, draw(), drawBlock() (+31 more)

### Community 10 - "04-arkanoid/game.js"
Cohesion: 0.14
Nodes (18): ball, BLOCK_COLORS, blocks, bounceSound, breakSound, canvas, collideAABB(), ctx (+10 more)

### Community 11 - "leaderboard.ts"
Cohesion: 0.07
Nodes (45): AuthPage(), clearUser(), getUser(), setUser(), User, Footer(), PlayerClient(), PlayerClientProps (+37 more)

### Community 12 - "devDependencies"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-next, globals, devDependencies, eslint, eslint-config-next, globals, @playwright/test (+21 more)

### Community 13 - "validate.py"
Cohesion: 0.11
Nodes (7): ScoreEntry, actions, actions, actions, actions, createLeaderboardActions(), CreateLeaderboardActionsParams

### Community 14 - "Tetris"
Cohesion: 0.12
Nodes (16): 1. `index.html`, 2. `style.css`, 3. `game.js`, Controles, Cómo ejecutar el juego, Cómo funciona, Estructura del proyecto, Flujo del juego (+8 more)

### Community 15 - "Tracing"
Cohesion: 0.08
Nodes (24): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+16 more)

### Community 16 - "Arquitectura"
Cohesion: 0.13
Nodes (13): API de `spritesheet.js`, Archivos principales, Arquitectura, Assets, Ciclo de vida de una spec, Comandos, Desarrollo, Estado del juego (en `game.js`) (+5 more)

### Community 17 - "01 — MVP jugable de Arkanoid"
Cohesion: 0.15
Nodes (12): 01 — MVP jugable de Arkanoid, Alcance, Bloques, Criterios de aceptación, Decisiones tomadas y descartadas, Dentro del MVP, Estado del juego, Fuera del MVP (dejado para specs posteriores) (+4 more)

### Community 18 - "Cookies"
Cohesion: 0.06
Nodes (36): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+28 more)

### Community 19 - "Template for a useful spec"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 20 - "Cookies"
Cohesion: 0.06
Nodes (35): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+27 more)

### Community 21 - "03 — Sonidos y niveles"
Cohesion: 0.17
Nodes (11): 03 — Sonidos y niveles, Alcance, Criterios de aceptación, Decisiones tomadas y descartadas, Definición de niveles, Dentro del spec, Estado de pausa, Fuera del alcance (+3 more)

### Community 22 - "Playwright CLI Browser Automation Skill (.claude copy)"
Cohesion: 0.27
Nodes (10): Running Custom Playwright Code Reference, Browser Session Management Reference, Test Generation Reference (Plan/Generate/Heal), Tracing Reference, Element Attributes Reference (.claude copy), Playwright Tests Reference (.claude copy), Request Mocking Reference (.claude copy), Playwright CLI Browser Automation Skill (.claude copy) (+2 more)

### Community 23 - "/spec — Guided spec designer"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 24 - "CaidaGame.tsx"
Cohesion: 0.08
Nodes (36): metadata, metadata, metadata, metadata, AsteroidsGame(), TOUCH_BUTTONS, AuthPrompt(), AuthPromptProps (+28 more)

### Community 25 - "Asteroids"
Cohesion: 0.22
Nodes (8): Asteroids, Características, Controles, Cómo correr, Demo:, Descripción, Puntuación, Tecnologías

### Community 26 - "Instructions"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 27 - "02 — Animación de explosión al romper bloques"
Cohesion: 0.22
Nodes (8): 02 — Animación de explosión al romper bloques, Alcance, Criterios de aceptación, Decisiones tomadas y descartadas, Dentro del spec, Fuera del alcance, Modelo de datos, Plan de implementación

### Community 28 - "playwright-cli/SKILL.md"
Cohesion: 0.22
Nodes (4): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests

### Community 29 - "Video Recording"
Cohesion: 0.25
Nodes (8): 1. Use Descriptive Filenames, 2. Record entire hero scripts., Basic Recording, Best Practices, Limitations, Overlay API Summary, Tracing vs Video, Video Recording

### Community 30 - "Spec Design Skill"
Cohesion: 0.67
Nodes (4): Spec Implementation Skill, Spec Design Skill, Spec Template, Spec-Driven Development

### Community 31 - "Arkanoid"
Cohesion: 0.25
Nodes (7): Arkanoid, Características, Controles, Estructura del proyecto, Jugar, Niveles, Specs implementadas

### Community 32 - "03-tetris/CLAUDE.md"
Cohesion: 0.29
Nodes (5): Architecture, Game flow, game.js internals, Running the game, Tunable constants (top of game.js)

### Community 33 - "/spec-impl Skill"
Cohesion: 0.50
Nodes (4): /spec-impl Skill, /spec Skill, Spec Template, Branch Creation Config

### Community 34 - "spritesheet.js"
Cohesion: 0.29
Nodes (3): EXPLOSION_FRAMES, SPRITES, ssCallbacks

### Community 35 - "compress.py"
Cohesion: 0.07
Nodes (49): benchmark_pair(), count_tokens(), main(), print_table(), Path, main(), print_usage(), backup_dir_for() (+41 more)

### Community 37 - "Security Policy"
Cohesion: 0.50
Nodes (3): Reporting a Vulnerability, Security Policy, Supported Versions

### Community 40 - "MVP Arcade Vault Spec"
Cohesion: 0.67
Nodes (3): Game Data Model, MVP Arcade Vault Spec, localStorage Persistence Model

### Community 48 - "asteroids/game.esm.js"
Cohesion: 0.06
Nodes (35): Asteroid, attachInput(), Bullet, destroy(), detachInput(), dist(), draw(), drawHUD() (+27 more)

### Community 49 - "about/page.tsx"
Cohesion: 0.10
Nodes (20): sendContactEmail(), ContactForm(), ContactFormProps, EMPTY_FORM, FormFields, HeroSection(), HIGHLIGHTS, HighlightIcon() (+12 more)

### Community 52 - "Workflow: opencode-loop"
Cohesion: 0.18
Nodes (10): Configuración técnica (GitHub Actions), Decisiones documentadas, Flujo, Interfaz con el usuario, Out of scope, Reglas de comportamiento, Resumen, Trigger (+2 more)

### Community 53 - "NOTES.md — mundo del usuario"
Cohesion: 0.29
Nodes (6): Contexto del workspace, Herramientas y canales, Loops observados (patrones recurrentes delegables), NOTES.md — mundo del usuario, Pendiente de entrevista, Terminología

### Community 54 - "Workflow: issue-loop"
Cohesion: 0.22
Nodes (8): Configuración técnica, Decisiones documentadas, Flujo, Out of scope, Resumen, Trigger, Validación, Workflow: issue-loop

### Community 57 - "Integrate an Arcade Vault game"
Cohesion: 0.14
Nodes (13): Catalog seed, Common mistakes, Fase A — Planificar (método /spec), Fase B — Implementar (método /spec-impl), Fase C — Receta técnica, Integrate an Arcade Vault game, React component lifecycle, REUSE, do not modify (+5 more)

### Community 58 - "08-serpentina-game"
Cohesion: 0.22
Nodes (8): 08-serpentina-game, Acceptance Criteria, Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Scope, What is **not** in this spec

### Community 63 - "caida/game.esm.js"
Cohesion: 0.15
Nodes (30): attachInput(), clearLines(), collide(), createBoard(), destroy(), detachInput(), draw(), drawBlock() (+22 more)

### Community 64 - "app/page.tsx"
Cohesion: 0.22
Nodes (14): PLAYERS, seededScores(), ScoreRow, DetailPage(), DetailPageProps, TopPlayersToday(), LeaderboardRow, LeaderboardTable() (+6 more)

### Community 65 - "07-tetris-caida"
Cohesion: 0.22
Nodes (8): 07-tetris-caida, Acceptance Criteria, Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Scope, What is **not** in this spec

### Community 67 - "Juegos catalogados (no jugables todavía)"
Cohesion: 0.14
Nodes (13): ASTEROIDS — `asteroids`, BLOQUE BUSTER — `bloque-buster`, CAÍDA — `caida`, DUELO PIXEL — `duelo-pixel`, GLOTÓN — `gloton`, INVASORES — `invasores`, Juegos catalogados (no jugables todavía), Juegos implementados en Arcade Vault (+5 more)

### Community 69 - "data.jsx"
Cohesion: 0.18
Nodes (17): getSalonLeaderboard(), LeaderboardRow, parseFormData(), saveScoreAction(), SaveScoreResult, ScoreEntryInputParsed, scoreEntrySchema, fetchScores() (+9 more)

### Community 71 - "The tools"
Cohesion: 0.15
Nodes (12): 1 · `graft ask "<question>" --source`: locate + understand (the default), 2 · `graft grep "<pattern>"`: exhaustive find, 3 · `graft skeleton <file>`: a file's API at a glance, 4 · `graft callers <symbol>`: the exact edges, 5 · `graft map`: orientation for an unfamiliar repo or area, 6 · Lifecycle: `graft build` / `graft check`, graft, Report what graft saved, every turn (+4 more)

### Community 72 - "INDEX.md"
Cohesion: 0.17
Nodes (7): eslint.config.mjs, Concepts, Files, graft — repo map, next.config.mjs, playwright.config.ts, postcss.config.mjs

### Community 73 - "caveman-compress/README.md"
Cohesion: 0.09
Nodes (20): Before / After, Benchmarks, How It Work, <img src="../../docs/assets/dancing-rock.svg" width="20" height="20" alt="rock"/> Caveman (285 tokens), Install, 📄 Original (706 tokens), Part of Caveman, Security (+12 more)

### Community 74 - "biblioteca.jsx"
Cohesion: 0.13
Nodes (18): getGameById(), getGameBySlug(), getGames(), getGamesByCategory(), GamesPage(), FeatureIcon(), FeatureIconKind, FloatingSilhouettes() (+10 more)

### Community 76 - "Commands"
Cohesion: 0.20
Nodes (10): Commands, Core, DevTools, Keyboard, Mouse, Navigation, Network, Save as (+2 more)

### Community 77 - "detalle.jsx"
Cohesion: 0.11
Nodes (17): CATS, Game, GameCategory, GameColor, GameFilter, ScoreRowDb, GamesClientProps, CompositeTypes (+9 more)

### Community 78 - "reproductor.jsx"
Cohesion: 0.36
Nodes (7): getScores(), gameLabel(), PALETTE, RecentActivity(), tone(), relativeTime(), TimeAgo()

### Community 98 - "06-games-catalog-salon"
Cohesion: 0.12
Nodes (15): 06-games-catalog-salon, Acceptance Criteria, Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Phase 1: Supabase Migration (DB), Phase 2: Data Layer (`app/data/games.ts`) (+7 more)

### Community 102 - "cavecrew/SKILL.md"
Cohesion: 0.14
Nodes (12): cavecrew, Example chaining, How to invoke, Model overrides, See also, What it does, Auto-clarity (inherited), Chaining patterns (+4 more)

### Community 103 - "Caveman Help"
Cohesion: 0.14
Nodes (12): caveman-help, Example output, How to invoke, See also, What it does, Caveman Help, Configure Default Mode, Deactivate (+4 more)

### Community 109 - "Mermaid AI Skills"
Cohesion: 0.15
Nodes (12): Diagram editing & preview, Docs, Generate diagrams (GitHub Copilot required), Install / update this pack, LM Tools — call these for every diagram interaction, Mermaid AI Skills, Mermaid Chart cloud, @mermaid-chart slash commands (+4 more)

### Community 111 - "Caveman Compress"
Cohesion: 0.17
Nodes (11): Boundaries, Caveman Compress, Compress, Compression Rules, Pattern, Preserve EXACTLY (never modify), Preserve Structure, Process (+3 more)

### Community 112 - "caveman/SKILL.md"
Cohesion: 0.17
Nodes (10): caveman, Example output, How to invoke, See also, What it does, Auto-Clarity, Boundaries, Intensity (+2 more)

### Community 116 - "caveman-commit"
Cohesion: 0.18
Nodes (9): caveman-commit, Example output, How to invoke, See also, What it does, Auto-Clarity, Boundaries, Examples (+1 more)

### Community 117 - "caveman-review"
Cohesion: 0.18
Nodes (9): caveman-review, Example output, How to invoke, See also, What it does, Auto-Clarity, Boundaries, Examples (+1 more)

### Community 134 - "SPEC 04 — Supabase: foundation y persistencia de puntuaciones"
Cohesion: 0.25
Nodes (7): Acceptance criteria, Data model, Decisiones tomadas y descartadas, Identified risks, Implementation plan, Scope, SPEC 04 — Supabase: foundation y persistencia de puntuaciones

### Community 135 - "05-asteroids-game"
Cohesion: 0.25
Nodes (7): 05-asteroids-game, Acceptance Criteria, Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Scope

### Community 136 - "caveman-stats"
Cohesion: 0.29
Nodes (5): caveman-stats, Example output, How to invoke, See also, What it does

### Community 154 - "salon.jsx"
Cohesion: 0.22
Nodes (8): Candidate pools, Fit criteria (score every candidate against these), Hard constraints, Memory contract — `resources/game-suggestions-todo.md`, Output template, Process, Prompt Defense Baseline, Red flags

### Community 155 - "eslint"
Cohesion: 0.22
Nodes (8): Engine integration contract, Hard constraints, Infraestructura global, Output template, Proceso, Prompt Defense Baseline, Red flags, Skin contract

### Community 156 - "next"
Cohesion: 0.14
Nodes (13): 2026-08-12 — Pool B: 19 propuestas (4 agentes paralelos; 20 brutas, 1 duplicado descartado), 2026-08-12 — Ranking de Pool A, Catalogued, pending engine, Game Suggestions TODO, Implemented (do not re-recommend), New proposals (Pool B), Port 1/5, Port 1.5/5 (+5 more)

### Community 158 - "game-jam.md"
Cohesion: 0.25
Nodes (7): Engine contract — aplicarlo en las DOS specs, Formato de spec (9 secciones, espejar specs 07/08), Hard constraints, Output template, Process, Prompt Defense Baseline, Red flags

### Community 159 - "SalonClient.tsx"
Cohesion: 0.11
Nodes (18): Boundaries, Cambios, Cambios por juego, Capability 1: responsive-ui, Capability 2: mobile-game-input, Capability Map (aprobado 2026-08-17), Code Style, Commands (+10 more)

### Community 161 - "requireEnv"
Cohesion: 0.20
Nodes (9): Acceptance Criteria, Addendum — implementación (2026-08-17), bloque-buster spec-a — Port del vanilla ref (single-canvas + sprites), Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Scope (+1 more)

### Community 162 - "bloque-buster spec-b — Engine from scratch: física angular + power-ups + HUD DOM"
Cohesion: 0.22
Nodes (8): Acceptance Criteria, bloque-buster spec-b — Engine from scratch: física angular + power-ups + HUD DOM, Data Model, Decisions Taken & Discarded, Identified Risks, Implementation Plan, Scope, What is **not** in this spec

### Community 165 - "refactor-skin-layout-issue.md"
Cohesion: 0.25
Nodes (7): Commits, Decisiones de testing, Documento de decisiones, Fuera de alcance, Notas adicionales, Problema, Solución

### Community 166 - "requireEnv"
Cohesion: 0.52
Nodes (3): requireEnv(), createSupabaseAdminClient(), createSupabaseBrowserClient()

### Community 178 - ".agents/skills/consult-graph/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Refresh policy, Workflow

### Community 179 - ".claude/skills/consult-graph/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Refresh policy, Workflow

## Knowledge Gaps
- **774 isolated node(s):** `FeatureIconKind`, `PALETTE`, `FeatureItem`, `StatItem`, `FormFields` (+769 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PALETTES` connect `leaderboard.ts` to `asteroids/game.esm.js`, `serpentina/game.esm.js`, `caida/game.esm.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `AsteroidsGame()` connect `CaidaGame.tsx` to `asteroids/game.esm.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `isSkinId()` connect `leaderboard.ts` to `asteroids/game.esm.js`, `serpentina/game.esm.js`, `caida/game.esm.js`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `FeatureIconKind`, `PALETTE`, `FeatureItem` to the rest of the system?**
  _774 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `02-asteroids/game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07030527289546716 - nodes in this community are weakly interconnected._
- **Should `Browser Session Management` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `About Page with Resend Spec (03)` be split into smaller, more focused modules?**
  _Cohesion score 0.09032258064516129 - nodes in this community are weakly interconnected._