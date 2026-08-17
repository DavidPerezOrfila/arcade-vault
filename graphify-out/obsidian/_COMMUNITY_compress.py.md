---
type: community
members: 58
---

# compress.py

**Members:** 58 nodes

## Members
- [[.__init__()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[.add_error()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[.add_warning()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[Check if a line looks like code.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Check if content is valid JSON.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Classify a file as 'natural_language', 'code', 'config', or 'unknown'.      Re]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Heuristic denylist for files that must never be shipped to a third-party API.]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Heuristic check if content looks like YAML.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Line-based fenced code block extractor.      Handles ``` and ~~~ fences with v]] - rationale - .agents/skills/caveman-compress/scripts/validate.py
- [[Path]] - code
- [[Path_1]] - code
- [[Path_2]] - code
- [[Path_3]] - code
- [[Resolve the out-of-tree backup directory for a given source file.      Backups]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Return True if the file is natural language and should be compressed.]] - rationale - .agents/skills/caveman-compress/scripts/detect.py
- [[Send a prompt to Claude.      Prefers the Anthropic SDK when ANTHROPIC_API_KEY]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Split YAML frontmatter from body. Returns (frontmatter, body).      Memory fil]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[Strip outer ```markdown ... ``` fence when it wraps the entire output.]] - rationale - .agents/skills/caveman-compress/scripts/compress.py
- [[ValidationResult]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[__main__.py]] - code - .agents/skills/caveman-compress/scripts/__main__.py
- [[_is_code_line()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[_is_json_content()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[_is_yaml_content()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[backup_dir_for()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[benchmark.py]] - code - .agents/skills/caveman-compress/scripts/benchmark.py
- [[benchmark_pair()]] - code - .agents/skills/caveman-compress/scripts/benchmark.py
- [[build_compress_prompt()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[build_fix_prompt()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[call_claude()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[cli.py]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[compress.py]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[compress_file()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[count_bullets()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[count_tokens()]] - code - .agents/skills/caveman-compress/scripts/benchmark.py
- [[detect.py]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[detect_file_type()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[extract_code_blocks()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[extract_headings()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[extract_inline_codes()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[extract_paths()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[extract_urls()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[is_sensitive_path()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[main()]] - code - .agents/skills/caveman-compress/scripts/benchmark.py
- [[main()_1]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[print_table()]] - code - .agents/skills/caveman-compress/scripts/benchmark.py
- [[print_usage()]] - code - .agents/skills/caveman-compress/scripts/cli.py
- [[read_file()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[should_compress()]] - code - .agents/skills/caveman-compress/scripts/detect.py
- [[split_frontmatter()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[strip_llm_wrapper()]] - code - .agents/skills/caveman-compress/scripts/compress.py
- [[validate()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate.py]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_bullets()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_code_blocks()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_headings()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_inline_codes()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_paths()]] - code - .agents/skills/caveman-compress/scripts/validate.py
- [[validate_urls()]] - code - .agents/skills/caveman-compress/scripts/validate.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/compresspy
SORT file.name ASC
```
