---
type: community
members: 2
---

# scores.md

**Members:** 2 nodes

## Members
- [[appdatascores.ts]] - document - graft/app/data/scores.md
- [[scores]] - document - graft/app/data/scores.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/scoresmd
SORT file.name ASC
```
