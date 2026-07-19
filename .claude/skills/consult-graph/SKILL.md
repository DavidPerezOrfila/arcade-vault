---
name: consult-graph
description: Consult the project's graphify knowledge graph (graphify-out/obsidian/) for context about a file, symbol, community, or decision, before reading the corresponding source. Use when the user asks about architecture, dependencies between modules, "what does X do", "how does Y connect to Z", "what specs touch this", or when the agent is about to read more than a handful of files from /app, /specs, or config roots. Skip for trivial edits or when the user explicitly says "skip the graph".
---

## Workflow

1. Open `graphify-out/obsidian/index.md`. This is the community-level map.
2. Open `graphify-out/GRAPH_REPORT.md` only if needed (god nodes, surprising connections, gaps).
3. Read 1–3 community pages (`_COMMUNITY_*.md`) relevant to the question.
4. Read at most 5 individual node notes.
5. Stop. Do not re-read source code unless the graph note explicitly cites a line or the graph is older than 2 weeks.
6. Report findings as a short summary with `[[wikilinks]]` so the user can navigate in Obsidian.

## Refresh policy

If the question touches a module whose last note is older than the graph's "Built from commit" in `GRAPH_REPORT.md`, re-export the vault:

```
npm run graphify:obsidian
```

Only do that if `graphify-out/manifest.json` is stale relative to the working tree. For full rebuild use `npm run graphify:update` (AST only, cheap).

## Boundaries

- The graph is advisory. If a wiki note contradicts the current source code, the source wins, but flag the stale note.
- Do not read `graph.json` directly (it is huge). Use the markdown notes.
- Do not load `graph.html` (binary-ish; useless to the LLM).
