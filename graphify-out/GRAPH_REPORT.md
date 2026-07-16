# Graph Report - .  (2026-07-17)

## Corpus Check
- 37 files · ~56,979 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 627 nodes · 652 edges · 51 communities (45 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

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
- Auth State Patterns
- IndexedDB Ops
- App Shell
- Game Data Model
- Next.js 16 Warning
- ESLint Config
- Next Config
- PostCSS Config
- Custom Bundler

## God Nodes (most connected - your core abstractions)
1. `Browser Session Management` - 22 edges
2. `Storage Management` - 18 edges
3. `compilerOptions` - 16 edges
4. `Browser Automation with playwright-cli` - 15 edges
5. `Browser Automation with playwright-cli` - 15 edges
6. `About Page with Resend Spec (03)` - 14 edges
7. `Running Custom Playwright Code` - 13 edges
8. `Running Custom Playwright Code` - 13 edges
9. `Home Page Spec (02)` - 13 edges
10. `Template for a useful spec` - 11 edges

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

## Communities (51 total, 6 thin omitted)

### Community 0 - "Playwright CLI Reference"
Cohesion: 0.05
Nodes (33): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests, Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response (+25 more)

### Community 1 - "Playwright CLI Reference"
Cohesion: 0.05
Nodes (33): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests, Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response (+25 more)

### Community 2 - "Browser Sessions"
Cohesion: 0.05
Nodes (39): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+31 more)

### Community 3 - "Project Architecture"
Cohesion: 0.09
Nodes (32): Playwright Test Report, Arcade Vault Project Overview, Graphify Knowledge Graph System, Server Components Default Pattern, Spec Driven Design Workflow, Tailwind CSS v4 Theme Configuration, Tech Stack (Next.js 16, React 19, TypeScript 5, Tailwind v4, ESLint 9), Arcade Vault Platform Description (+24 more)

### Community 4 - "Game Data Layer"
Cohesion: 0.10
Nodes (18): AuthPage(), CATS, GAMES, PLAYERS, seededScores(), clearUser(), getScores(), saveScore() (+10 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "Home Page UI"
Cohesion: 0.08
Nodes (13): Home(), useReveal(), GamePlayer(), PlayerPageProps, HallOfFame(), CATS, GAMES, PLAYERS (+5 more)

### Community 7 - "Package Dependencies"
Cohesion: 0.07
Nodes (25): @dietrichgebert/ponytail, ecc-universal, next, dependencies, @dietrichgebert/ponytail, ecc-universal, next, react (+17 more)

### Community 8 - "Playwright Automation"
Cohesion: 0.08
Nodes (24): Browser Automation with playwright-cli, Browser Sessions, Commands, Core, DevTools, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session (+16 more)

### Community 9 - "Playwright Automation"
Cohesion: 0.08
Nodes (24): Browser Automation with playwright-cli, Browser Sessions, Commands, Core, DevTools, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session (+16 more)

### Community 10 - "Test Generation"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 11 - "Test Generation"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 12 - "Dev Tooling"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 13 - "About Page & Contact"
Cohesion: 0.16
Nodes (13): getRequiredEnv(), resend, sendContactEmail(), HighlightIcon(), HighlightIconKind, HighlightIconProps, AboutPage(), HIGHLIGHTS (+5 more)

### Community 14 - "Playwright Tracing"
Cohesion: 0.12
Nodes (16): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+8 more)

### Community 15 - "Playwright Tracing"
Cohesion: 0.12
Nodes (16): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+8 more)

### Community 16 - "Spec Template"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 17 - "Spec Template"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 18 - "localStorage Ops"
Cohesion: 0.22
Nodes (11): Advanced: Multiple Operations, Clear All localStorage, Clear sessionStorage, Delete Single Item, Get Single Value, List All localStorage Items, List All sessionStorage Items, Local Storage (+3 more)

### Community 19 - "Playwright CLI Skill"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 20 - "localStorage Ops"
Cohesion: 0.22
Nodes (11): Advanced: Multiple Operations, Clear All localStorage, Clear sessionStorage, Delete Single Item, Get Single Value, List All localStorage Items, List All sessionStorage Items, Local Storage (+3 more)

### Community 21 - "Playwright CLI Skill"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 22 - "Playwright Summaries"
Cohesion: 0.27
Nodes (10): Running Custom Playwright Code Reference, Browser Session Management Reference, Test Generation Reference (Plan/Generate/Heal), Tracing Reference, Element Attributes Reference (.claude copy), Playwright Tests Reference (.claude copy), Request Mocking Reference (.claude copy), Playwright CLI Browser Automation Skill (.claude copy) (+2 more)

### Community 23 - "MVP Spec"
Cohesion: 0.20
Nodes (9): Acceptance criteria, Data model, Decisions taken and discarded, Identified risks, Implementation plan, Incluye, MVP — Arcade Vault, No incluye (+1 more)

### Community 24 - "Cookie Management"
Cohesion: 0.22
Nodes (9): Advanced: Multiple Cookies or Custom Options, Clear All Cookies, Cookies, Delete a Cookie, Filter Cookies by Domain, Filter Cookies by Path, Get Specific Cookie, List All Cookies (+1 more)

### Community 25 - "Spec-Impl Skill"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 26 - "Cookie Management"
Cohesion: 0.22
Nodes (9): Advanced: Multiple Cookies or Custom Options, Clear All Cookies, Cookies, Delete a Cookie, Filter Cookies by Domain, Filter Cookies by Path, Get Specific Cookie, List All Cookies (+1 more)

### Community 27 - "Spec-Impl Skill"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 28 - "Storage State"
Cohesion: 0.25
Nodes (7): Authentication State Reuse, Common Patterns, Save and Restore Roundtrip, Security Notes, Storage Management, Run Code, Security Notes

### Community 29 - "Root Layout"
Cohesion: 0.29
Nodes (3): metadata, monoFont, pixelFont

### Community 30 - "Spec-Driven Dev"
Cohesion: 0.67
Nodes (4): Spec Implementation Skill, Spec Design Skill, Spec Template, Spec-Driven Development

### Community 31 - "Storage State API"
Cohesion: 0.50
Nodes (4): Restore Storage State, Save Storage State, Storage State, Storage State File Format

### Community 32 - "Storage State API"
Cohesion: 0.50
Nodes (4): Restore Storage State, Save Storage State, Storage State, Storage State File Format

### Community 33 - "Spec Skills Config"
Cohesion: 0.50
Nodes (4): /spec-impl Skill, /spec Skill, Spec Template, Branch Creation Config

### Community 34 - "IndexedDB Ops"
Cohesion: 0.67
Nodes (3): Delete Database, IndexedDB, List Databases

### Community 36 - "Auth State Patterns"
Cohesion: 0.67
Nodes (3): Authentication State Reuse, Common Patterns, Save and Restore Roundtrip

### Community 37 - "IndexedDB Ops"
Cohesion: 0.67
Nodes (3): Delete Database, IndexedDB, List Databases

### Community 40 - "Game Data Model"
Cohesion: 0.67
Nodes (3): Game Data Model, MVP Arcade Vault Spec, localStorage Persistence Model

## Knowledge Gaps
- **383 isolated node(s):** `CATS`, `PLAYERS`, `GameCategory`, `GameColor`, `DetailPageProps` (+378 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Browser Session Management` connect `Browser Sessions` to `Playwright CLI Reference`, `Playwright CLI Reference`, `Storage State`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Storage Management` connect `Storage State` to `Storage State API`, `Playwright CLI Reference`, `Browser Sessions`, `IndexedDB Ops`, `Auth State Patterns`, `IndexedDB Ops`, `localStorage Ops`, `localStorage Ops`, `Cookie Management`, `Cookie Management`, `Storage State API`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `Browser Automation with playwright-cli` connect `Playwright Automation` to `Playwright CLI Reference`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `CATS`, `PLAYERS`, `GameCategory` to the rest of the system?**
  _383 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Playwright CLI Reference` be split into smaller, more focused modules?**
  _Cohesion score 0.05094130675526024 - nodes in this community are weakly interconnected._
- **Should `Playwright CLI Reference` be split into smaller, more focused modules?**
  _Cohesion score 0.0524390243902439 - nodes in this community are weakly interconnected._
- **Should `Browser Sessions` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._