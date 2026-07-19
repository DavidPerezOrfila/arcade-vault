---
type: community
members: 4
---

# Spec Skills Config

**Members:** 4 nodes

## Members
- [[spec Skill]] - document - .claude/skills/spec/SKILL.md
- [[spec-impl Skill]] - document - .claude/skills/spec-impl/SKILL.md
- [[Branch Creation Config]] - document - specs/.spec-config.yml
- [[Spec Template_1]] - document - .claude/skills/spec/template.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Spec_Skills_Config
SORT file.name ASC
```
