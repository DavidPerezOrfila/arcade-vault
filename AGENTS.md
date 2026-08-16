# AGENTS.md

- Do not preserve backward compatibility. Remove obsolete paths instead of adding compatibility layers, fallbacks, or migrations.
- Choose the simplest implementation that fully meets the current requirements. Avoid speculative abstractions, configuration, and indirection.
- Grow the system in layers. Start from the smallest version that works end to end, and add each new capability on top of a product that already works. Never trade a working product for unfinished complexity.
- Keep components modular and concerns clearly separated.
- Prefer established, well-maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.
- Lean on the dependencies already in the project before writing your own implementation or adding packages. Do not assume a library lacks a capability without checking its documentation and types.
- Make architectural decisions for the long term. Do not accept a stopgap that only works for now and is meant to be replaced later.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:graphify-reminder -->
Before exploring the source code of an unfamiliar module, check whether the project's knowledge graph in `graphify-out/obsidian/` already answers the question. Invoke the `consult-graph` skill to read `index.md` and the relevant community pages. Fall back to the source only when the graph is silent or stale.
<!-- END:graphify-reminder -->

## Clean code (source: `instructions.md`)

- Reply short and concise.
- Code in English — identifiers, functions, classes, everything.
- Comments in Spanish, only when they add value.
- Prioritize simplicity: readable code, small functions, no duplication (DRY).
- Follow SOLID principles where applicable.
- No superfluous comments — self-documenting code where possible.
- No magic: avoid cryptic expressions, prefer clarity.
- Good security practices when relevant.

## Line endings (CRLF vs LF)

- `npm run lint` enforces **LF** line endings (`linebreak-style`); CRLF files fail with hundreds of `Expected linebreaks to be 'LF'` errors.
- The repo stores LF: `.gitattributes` has `* text=auto eol=lf`. Never commit CRLF.
- On Windows, `core.autocrlf=true` (or OneDrive placeholders) can leave CRLF in the working tree for files checked out before normalization. Git may report them clean while eslint fails — the lint error is the source of truth.
- Always write/edit files with LF endings. If `npm run lint` suddenly fails with CRLF errors, normalize the working tree back to LF instead of committing CRLF (e.g. `git add --renormalize .` in a dedicated commit, or convert the affected files to LF).
