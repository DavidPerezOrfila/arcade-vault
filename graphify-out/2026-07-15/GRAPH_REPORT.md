# Graph Report - .  (2026-07-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 187 nodes · 216 edges · 25 communities (19 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e10709a1`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Playwright CLI Browser Automation Skill (.claude copy)` - 8 edges
3. `getUser()` - 7 edges
4. `include` - 7 edges
5. `Arcade Vault` - 7 edges
6. `GAMES` - 6 edges
7. `seededScores()` - 5 edges
8. `setUser()` - 5 edges
9. `clearUser()` - 5 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Playwright CLI Browser Automation Skill (.claude copy)` --conceptually_related_to--> `Browser Automation via CLI`  [INFERRED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/SKILL.md
- `Playwright CLI Browser Automation Skill (.claude copy)` --references--> `Running Custom Playwright Code Reference`  [EXTRACTED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/references/running-code.md
- `Playwright CLI Browser Automation Skill (.claude copy)` --references--> `Browser Session Management Reference`  [EXTRACTED]
  .claude/skills/playwright-cli/SKILL.md → .agents/skills/playwright-cli/references/session-management.md
- `Test Generation Reference (Plan/Generate/Heal)` --references--> `Playwright Tests Reference (.claude copy)`  [EXTRACTED]
  .agents/skills/playwright-cli/references/test-generation.md → .claude/skills/playwright-cli/references/playwright-tests.md
- `Test Generation Reference (Plan/Generate/Heal)` --references--> `Request Mocking Reference (.claude copy)`  [EXTRACTED]
  .agents/skills/playwright-cli/references/test-generation.md → .claude/skills/playwright-cli/references/request-mocking.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spec-Driven Development Workflow** — _agents_skills_spec_skill_document, _agents_skills_spec_impl_skill_document, _agents_skills_spec_template_document, spec_driven_development_concept [INFERRED 0.95]
- **Browser Automation and Testing Capability** — _agents_skills_playwright_cli_references_running_code_document, _agents_skills_playwright_cli_references_session_management_document, _agents_skills_playwright_cli_references_storage_state_document, _agents_skills_playwright_cli_references_test_generation_document, _agents_skills_playwright_cli_references_tracing_document, browser_automation_cli_concept, agents_skills_playwright_cli_references_test_generation_workflow_concept [INFERRED 0.95]
- **Spec-Driven Development Workflow** — claude_skills_spec_skill_spec_skill, claude_skills_spec_template_spec_template, claude_skills_spec_impl_skill_spec_impl_skill, specs_spec_config_yml_branch_config [EXTRACTED 1.00]
- **Arcade Vault Tech Stack** — claude_nextjs_16, claude_react_19, claude_tailwind_css_v4, claude_app_router [EXTRACTED 1.00]

## Communities (25 total, 6 thin omitted)

### Community 0 - "Game Data & Types"
Cohesion: 0.13
Nodes (13): CATS, GAMES, PLAYERS, seededScores(), Game, GameCategory, GameColor, GameFilter (+5 more)

### Community 1 - "ESLint Configuration"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 3 - "Arcade Vault Core"
Cohesion: 0.13
Nodes (18): Next.js 16 Breaking Changes Warning, App Router, Arcade Vault, Next.js 16, React 19, /spec-impl Skill, /spec Skill, Spec Template (+10 more)

### Community 4 - "Page Routes & Storage"
Cohesion: 0.30
Nodes (10): AuthPage(), clearUser(), getScores(), getUser(), saveScore(), setUser(), ScoreEntry, GamePlayer() (+2 more)

### Community 5 - "Playwright CLI References"
Cohesion: 0.27
Nodes (10): Running Custom Playwright Code Reference, Browser Session Management Reference, Test Generation Reference (Plan/Generate/Heal), Tracing Reference, Element Attributes Reference (.claude copy), Playwright Tests Reference (.claude copy), Request Mocking Reference (.claude copy), Playwright CLI Browser Automation Skill (.claude copy) (+2 more)

### Community 6 - "npm Dependencies"
Cohesion: 0.09
Nodes (20): @dietrichgebert/ponytail, ecc-universal, next, dependencies, @dietrichgebert/ponytail, ecc-universal, next, react (+12 more)

### Community 7 - "Type Declarations"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 10 - "Layout & Typography"
Cohesion: 0.40
Nodes (3): metadata, monoFont, pixelFont

### Community 11 - "Data Layer"
Cohesion: 0.40
Nodes (3): CATS, GAMES, PLAYERS

### Community 12 - "Spec-Driven Development Workflow"
Cohesion: 0.67
Nodes (4): Spec Implementation Skill, Spec Design Skill, Spec Template, Spec-Driven Development

### Community 13 - "Playwright Management"
Cohesion: 0.50
Nodes (4): Browser Session Management, Run Code, Storage Management, Test Generation

## Knowledge Gaps
- **77 isolated node(s):** `PLAYERS`, `GameCategory`, `GameColor`, `DetailPageProps`, `pixelFont` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `ESLint Configuration` to `npm Dependencies`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `TypeScript Configuration` to `Type Declarations`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `PLAYERS`, `GameCategory`, `GameColor` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Data & Types` be split into smaller, more focused modules?**
  _Cohesion score 0.13230769230769232 - nodes in this community are weakly interconnected._
- **Should `ESLint Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Arcade Vault Core` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._