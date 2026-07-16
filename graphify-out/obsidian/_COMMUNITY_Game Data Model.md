---
type: community
cohesion: 0.67
members: 3
---

# Game Data Model

**Cohesion:** 0.67 - moderately connected
**Members:** 3 nodes

## Members
- [[Game Data Model]] - concept - specs/01-mvp-arcade-vault.md
- [[MVP Arcade Vault Spec]] - document - specs/01-mvp-arcade-vault.md
- [[localStorage Persistence Model]] - rationale - specs/01-mvp-arcade-vault.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Game_Data_Model
SORT file.name ASC
```
