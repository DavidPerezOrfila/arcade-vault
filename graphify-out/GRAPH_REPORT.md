# Graph Report - 05-arcade-vault  (2026-07-16)

## Corpus Check
- 66 files · ~45,507 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 625 nodes · 650 edges · 44 communities (38 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e77164e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game Data & Types
- ESLint Configuration
- TypeScript Configuration
- Arcade Vault Core
- Page Routes & Storage
- Playwright CLI References
- npm Dependencies
- Type Declarations
- Cookies
- Home UI Components
- Layout & Typography
- Data Layer
- Spec-Driven Development Workflow
- Playwright Management
- App Root Component
- Playwright Tracing & Recording
- ESLint Config File
- Next.js Configuration
- PostCSS Configuration
- 3. Heal
- 3. Heal
- Browser Session Management
- Browser Session Management
- Tracing
- Tracing
- Template for a useful spec
- Template for a useful spec
- /spec — Guided spec designer
- /spec — Guided spec designer
- MVP — Arcade Vault
- About Page con envío de correo vía Resend
- Instructions
- Instructions
- 02-home-page.md
- Arcade Vault
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Browser Automation with playwright-cli` - 15 edges
3. `Browser Automation with playwright-cli` - 15 edges
4. `Running Custom Playwright Code` - 13 edges
5. `Running Custom Playwright Code` - 13 edges
6. `Template for a useful spec` - 11 edges
7. `Template for a useful spec` - 11 edges
8. `Commands` - 10 edges
9. `Browser Session Management` - 10 edges
10. `Commands` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Playwright CLI Browser Automation Skill (.claude copy)` --conceptually_related_to--> `Browser Automation via CLI`  [INFERRED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/SKILL.md
- `Spec driven design` --references--> `/spec Skill`  [EXTRACTED]
  CLAUDE.md → .claude/skills/spec/SKILL.md
- `Arcade Vault README` --references--> `Spec driven design`  [EXTRACTED]
  README.md → CLAUDE.md
- `Playwright CLI Browser Automation Skill (.claude copy)` --references--> `Running Custom Playwright Code Reference`  [EXTRACTED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/references/running-code.md
- `Playwright CLI Browser Automation Skill (.claude copy)` --references--> `Browser Session Management Reference`  [EXTRACTED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/references/session-management.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spec-Driven Development Workflow** — _agents_skills_spec_skill_document, _agents_skills_spec_impl_skill_document, _agents_skills_spec_template_document, spec_driven_development_concept [INFERRED 0.95]
- **Spec-Driven Development Workflow** — claude_skills_spec_skill_spec_skill, claude_skills_spec_template_spec_template, claude_skills_spec_impl_skill_spec_impl_skill, specs_spec_config_yml_branch_config [EXTRACTED 1.00]
- **Arcade Vault Tech Stack** — claude_nextjs_16, claude_react_19, claude_tailwind_css_v4, claude_app_router [EXTRACTED 1.00]

## Communities (44 total, 6 thin omitted)

### Community 0 - "Game Data & Types"
Cohesion: 0.07
Nodes (28): AuthPage(), CATS, GAMES, PLAYERS, seededScores(), clearUser(), getScores(), getUser() (+20 more)

### Community 1 - "ESLint Configuration"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 3 - "Arcade Vault Core"
Cohesion: 0.08
Nodes (27): Next.js 16 Breaking Changes Warning, App Router, Arcade Vault, Architecture notes, Common commands, graphify, Important warnings, Localization (+19 more)

### Community 4 - "Page Routes & Storage"
Cohesion: 0.05
Nodes (33): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests, Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response (+25 more)

### Community 5 - "Playwright CLI References"
Cohesion: 0.27
Nodes (10): Running Custom Playwright Code Reference, Browser Session Management Reference, Test Generation Reference (Plan/Generate/Heal), Tracing Reference, Element Attributes Reference (.claude copy), Playwright Tests Reference (.claude copy), Request Mocking Reference (.claude copy), Playwright CLI Browser Automation Skill (.claude copy) (+2 more)

### Community 6 - "npm Dependencies"
Cohesion: 0.09
Nodes (20): @dietrichgebert/ponytail, ecc-universal, next, dependencies, @dietrichgebert/ponytail, ecc-universal, next, react (+12 more)

### Community 7 - "Type Declarations"
Cohesion: 0.06
Nodes (35): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+27 more)

### Community 8 - "Cookies"
Cohesion: 0.06
Nodes (35): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+27 more)

### Community 10 - "Layout & Typography"
Cohesion: 0.08
Nodes (24): Browser Automation with playwright-cli, Browser Sessions, Commands, Core, DevTools, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session (+16 more)

### Community 11 - "Data Layer"
Cohesion: 0.40
Nodes (3): CATS, GAMES, PLAYERS

### Community 12 - "Spec-Driven Development Workflow"
Cohesion: 0.67
Nodes (4): Spec Implementation Skill, Spec Design Skill, Spec Template, Spec-Driven Development

### Community 13 - "Playwright Management"
Cohesion: 0.05
Nodes (36): Browser Session Management, Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests, Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request (+28 more)

### Community 15 - "Playwright Tracing & Recording"
Cohesion: 0.08
Nodes (24): Browser Automation with playwright-cli, Browser Sessions, Commands, Core, DevTools, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session (+16 more)

### Community 26 - "3. Heal"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 27 - "3. Heal"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 28 - "Browser Session Management"
Cohesion: 0.10
Nodes (20): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+12 more)

### Community 29 - "Browser Session Management"
Cohesion: 0.10
Nodes (20): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+12 more)

### Community 30 - "Tracing"
Cohesion: 0.12
Nodes (16): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+8 more)

### Community 31 - "Tracing"
Cohesion: 0.12
Nodes (16): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+8 more)

### Community 32 - "Template for a useful spec"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 33 - "Template for a useful spec"
Cohesion: 0.17
Nodes (11): Final section — What is NOT in (reinforcement), Global rules about the whole document, Header, Section 1 — Why this spec exists (optional), Section 2 — Scope, Section 3 — Data model, Section 4 — Implementation plan, Section 5 — Acceptance criteria (+3 more)

### Community 34 - "/spec — Guided spec designer"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 35 - "/spec — Guided spec designer"
Cohesion: 0.18
Nodes (10): Arguments, Command flow, Hard rules, Phase 1 — Understand the context, Phase 2 — Clarify through questions, Phase 3 — Develop the spec section by section, Phase 4 — Save the spec, Philosophy (+2 more)

### Community 36 - "MVP — Arcade Vault"
Cohesion: 0.20
Nodes (9): Acceptance criteria, Data model, Decisions taken and discarded, Identified risks, Implementation plan, Incluye, MVP — Arcade Vault, No incluye (+1 more)

### Community 37 - "About Page con envío de correo vía Resend"
Cohesion: 0.20
Nodes (9): About Page con envío de correo vía Resend, Acceptance criteria, Data model, Decisions taken and discarded, Identified risks, Implementation plan, Incluye, No incluye (+1 more)

### Community 38 - "Instructions"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 39 - "Instructions"
Cohesion: 0.22
Nodes (8): Instructions, Phase 1 — Identify the spec, Phase 2 — Validate the spec's state, Phase 3 — Create the git branch and switch to it, Phase 4 — Implement step by step, Session context, /spec-impl — Implementer of approved specs, Summary of expected behavior

### Community 40 - "02-home-page.md"
Cohesion: 0.22
Nodes (8): Acceptance criteria, Data model, Decisions taken and discarded, Identified risks, Implementation plan, Incluye, No incluye, Scope

### Community 41 - "Arcade Vault"
Cohesion: 0.50
Nodes (3): Arcade Vault, Skills usadas, Usa Spec Driven Design

## Knowledge Gaps
- **401 isolated node(s):** `PLAYERS`, `GameCategory`, `GameColor`, `DetailPageProps`, `pixelFont` (+396 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Browser Automation with playwright-cli` connect `Playwright Tracing & Recording` to `Playwright Management`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `PLAYERS`, `GameCategory`, `GameColor` to the rest of the system?**
  _401 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Data & Types` be split into smaller, more focused modules?**
  _Cohesion score 0.07294117647058823 - nodes in this community are weakly interconnected._
- **Should `ESLint Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Arcade Vault Core` be split into smaller, more focused modules?**
  _Cohesion score 0.07635467980295567 - nodes in this community are weakly interconnected._
- **Should `Page Routes & Storage` be split into smaller, more focused modules?**
  _Cohesion score 0.0524390243902439 - nodes in this community are weakly interconnected._