# Arcade Vault — Grafo de Conocimiento

Este directorio contiene el grafo de conocimiento del proyecto Arcade Vault, generado por [graphify](https://github.com/safishamsi/graphify).

## Estructura

```
graphify-out/
├── graph.json              # Datos del grafo (705+ nodos, 770+ edges)
├── graph.html              # Visualizador interactivo (abrir en navegador)
├── GRAPH_REPORT.md         # Informe de auditoría (god nodes, conexiones sorprendentes)
├── obsidian/               # Bóveda de Obsidian con wikilinks y color groups
│   ├── _ABOUT_VAULT.md     # → Instrucciones de apertura ←
│   ├── index.md            # Índice navegable
│   ├── _COMMUNITY_*.md     # Una página por comunidad con sus miembros
│   ├── *.md                # Una nota por nodo del grafo
│   └── .obsidian/          # Config de color groups
├── cache/                  # Caché hash de extracción (no commitear)
├── cost.json               # Registro acumulativo de tokens
└── manifest.json           # Manifiesto de archivos para updates incrementales
```

## Cómo abrir el vault en Obsidian

1. Abre [Obsidian](https://obsidian.md).
2. **"Open folder as vault"** y selecciona `graphify-out/obsidian/`.
3. `Ctrl+G` para ver el grafo. Los nodos se organizan por comunidades con colores.

## Comandos de mantenimiento

```bash
# Reconstruir el grafo tras cambios en el código (AST‑only, sin coste de LLM)
npm run graphify:update

# Re‑exportar la bóveda de Obsidian (después de un update)
npm run graphify:obsidian
```

## Política de git

| Se commitea | No se commitea |
|---|---|
| `graph.json`, `GRAPH_REPORT.md`, `graph.html` | `cache/` (archivos hash regenerables) |
| `obsidian/` (notas, comunidades, canvas) | |
