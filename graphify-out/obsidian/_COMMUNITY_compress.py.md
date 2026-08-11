---
type: community
members: 31
---

# compress.py

**Members:** 31 nodes

## Members
- [[Check if a line looks like code.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Check if content is valid JSON.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Classify a file as 'natural_language', 'code', 'config', or 'unknown'. Returns…]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Heuristic denylist for files that must never be shipped to a third-party API.]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Heuristic check if content looks like YAML.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Path_2]] - code
- [[Path_3]] - code
- [[Resolve the out-of-tree backup directory for a given source file. Backups must…]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Return True if the file is natural language and should be compressed.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Send a prompt to Claude. Prefers the Anthropic SDK when ANTHROPIC_API_KEY is…]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Split YAML frontmatter from body. Returns (frontmatter, body). Memory files…]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Strip outer ```markdown ... ``` fence when it wraps the entire output.]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[__main__.py]] - code - .agents/skills/caveman-compress/scripts/__main__.py
- [[_is_code_line()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[_is_json_content()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[_is_yaml_content()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[backup_dir_for()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[build_compress_prompt()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[build_fix_prompt()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[call_claude()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[cli.py]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[compress.py]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[compress_file()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[detect.py]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[detect_file_type()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[is_sensitive_path()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[main()_1]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[print_usage()]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[should_compress()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[split_frontmatter()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[strip_llm_wrapper()]] - code - .agents/skills/caveman-compress/scripts/compress.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/compresspy
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_validate.py]]

## Top bridge nodes
- [[compress.py]] - degree 13, connects to 1 community
- [[compress_file()]] - degree 12, connects to 1 community