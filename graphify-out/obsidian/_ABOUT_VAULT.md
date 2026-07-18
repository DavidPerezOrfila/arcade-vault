# Arcade Vault — Bóveda de Obsidian

Esta bóveda es el **wiki persistente** del proyecto. Siguiendo el patrón [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) de Andrej Karpathy:

- **Raw sources** → el código fuente del repositorio (`app/`, `specs/`, etc.)
- **The wiki** → esta bóveda. El LLM la escribe; tú la lees.
- **The schema** → `CLAUDE.md` define las reglas para mantener el grafo.

## Cómo abrirla

1. **Obsidian** → "Open folder as vault" → seleccionar `graphify-out/obsidian/`.
2. `Ctrl+G` para ver el grafo (cada comunidad tiene su color).
3. Navegar por los wikilinks `[[...]]` entre notas.

## Mantenimiento

```bash
npm run graphify:update     # reconstruir el grafo (AST, sin coste LLM)
npm run graphify:obsidian   # re‑exportar el vault
```

## Comunidades principales

- [[_COMMUNITY_Project Architecture]]
- [[_COMMUNITY_App Shell]]
- [[_COMMUNITY_Home Page UI]]
- [[_COMMUNITY_Games Page]]
- [[_COMMUNITY_About Page & Contact]]
- [[_COMMUNITY_Game Data Layer]]
- [[_COMMUNITY_Playwright Automation]]
- [[_COMMUNITY_Test Generation]]
- [[_COMMUNITY_Browser Sessions]]
- [[_COMMUNITY_Spec-Driven Dev]]
- [[_COMMUNITY_MVP Spec]]
- [[_COMMUNITY_TypeScript Config]]

## God Nodes (más conectados)

1. Browser Session Management — 22 edges
2. Storage Management — 18 edges
3. About Page with Resend Spec (03) — 14 edges
4. Home Page Spec (02) — 13 edges
