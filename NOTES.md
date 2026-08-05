# NOTES.md — mundo del usuario

Notas crudas sobre el mundo del usuario: herramientas, canales y terminología. Se afinan y canonizan durante las sesiones de grilling (loop-me).

## Contexto del workspace

- Proyecto: **Arcade Vault** (Next.js 16, Supabase, Playwright, GitHub)
- Idioma de trabajo: **español**
- Flujo de desarrollo actual: spec (`specs/*.md`) → issue GitHub → rama desde main → commits pequeños → PR → merge
- El repo usa **spec-driven development** y conocimiento gráfico (graphify)

## Herramientas y canales

- **GitHub**: issues, PRs, comentarios (idioma español en issues)
- **Supabase local** (Docker): se apaga; los tests de salón requieren `npm run db:start`
- **Docker Desktop**: no siempre corriendo
- **Playwright**: E2E (`tests/e2e/`), config con webServer propio
- **opencode** (NUEVO): workflow `anomalyco/opencode/github@latest`, modelo `nvidia/minimaxai/minimax-m3`, trigger = comentario `/oc` o `/opencode` en issue/PR. Secret: `NVIDIA_API_KEY`
- **Skills**: request-refactor-plan, spec-impl, graphify, caveman, loop-me, code-review

## Loops observados (patrones recurrentes delegables)

1. **Resolver issue**: leer → rama desde main → commits pequeños → validar (lint/tsc/build/E2E) → PR
2. **Refactor planificado**: request-refactor-plan → issue → rama → commits → review
3. **Mantener grafo**: `graphify update` + export tras cada cambio de código (obligatorio por CLAUDE.md)
4. **Validación E2E**: correr spec afectado antes de cerrar; los de salón requieren Supabase local
5. **opencode**: comentar `/oc` en un issue → agente implementa

## Terminología

- **loop**: patrón recurrente en la vida del usuario; lo que se delega
- **workflow**: el spec de un loop, hecho real; vive en `workflows/*.md`
- **checkpoint**: punto humano-en-el-loop donde el usuario verifica/decide
- **brief**: resumen listo para decidir que presenta un checkpoint (no output crudo)
- **push right**: retrasar el checkpoint lo máximo posible

## Pendiente de entrevista

- [ ] Qué loop quiere diseñar primero
- [ ] Otros loops de su vida (carrera/semana/día) que valga la pena delegar
- [ ] ¿Dónde viven los specs? (workflows/*.md en este repo, por defecto)
