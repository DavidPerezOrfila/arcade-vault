# Workflow: issue-loop

> Estado: **aprobado** (grilling completado). Absorbe a `workflows/opencode-loop.md` (queda como referencia de configuración del action).

## Resumen

Flujo completo de resolución de issues, de punta a punta: el humano inicia, opencode implementa, la CI valida, el humano aprueba el merge. Un solo workflow — sin solapamientos.

## Trigger

- **Evento**: comentario nuevo de un OWNER/MEMBER en un issue que contiene `/oc` o `/opencode` (o `resuelve #X`)
- **El comentario debe incluir instrucciones** para que opencode implemente: un `/oc` a secas hace que el action nativo resuma el hilo (`Summarize this thread`) sin editar nada ni abrir PR. Ejemplo: `/oc implementa este issue`
- El trigger humano es el filtro: no hay arranques automáticos
- Mismo filtro `author_association` del opencode-loop (protege `NVIDIA_API_KEY`)

## Flujo

1. Owner/miembro comenta `/oc` + instrucciones en el issue (p.ej. `/oc implementa este issue`)
2. opencode implementa (action `anomalyco/opencode/github` — ver opencode-loop.md para config: modelo `minimax-m3`, `GITHUB_TOKEN`, `NVIDIA_API_KEY`, pinned a SHA)
3. opencode abre el PR vinculado (`Closes #<issue>`) y comenta el enlace en el issue
4. **CI valida el PR**: `lint` + `tsc --noEmit` + `build` (job de checks en cada PR)
5. **Gate humano (checkpoint único y tardío)**: revisar el PR en GitHub
   - Cambios solicitados: comentar `/oc` + feedback en el review del PR → opencode itera sobre el mismo PR
   - Aprobado: **merge manual por el humano** → GitHub cierra el issue vía `Closes #<issue>`
6. Un PR por issue: `/oc` duplicado con PR abierto se ignora (la iteración va por el review)

## Configuración técnica

- Reutiliza `.github/workflows/opencode.yml` (ya operativo) para la implementación
- Requiere **checkout con credenciales persistidas** (el push de opencode usa el token de `.git/config`; con `persist-credentials: false` falla) y que el workflow configure la **identidad git** del runner (sin `user.name`/`user.email` el commit falla y no hay PR)
- Añade un workflow de checks en PRs (`.github/workflows/ci.yml`): `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`
- E2E **fuera** de CI (los de salón requieren Supabase local/Docker); la validación E2E es manual o local

## Decisiones documentadas

| Pregunta | Decisión |
|---|---|
| Alcance | Flujo completo issue → PR, humano como gate del merge |
| Relación con opencode-loop | Absorbe: un solo workflow |
| Trigger | Comentario del owner (`/oc` o `resuelve #X`) |
| Validación | lint + tsc + build en CI (sin Docker) |
| Merge | Manual, por el humano |
| Duplicados | Un PR por issue; `/oc` extra ignorado |

## Validación

- Crear issue de prueba, comentar `/oc implementa este issue`, verificar que: el job de opencode corre, crea PR vinculado, el job de CI marca el PR con checks, el merge cierra el issue
- Verificar que el filtro OWNER/MEMBER y la advertencia de Git Bash (`MSYS_NO_PATHCONV=1`) se respetan
- Iterar: `/oc` + feedback en el review actualiza el mismo PR

## Out of scope

- E2E en CI (requiere Supabase local)
- Auto-merge
- Triaje/enriquecimiento de issues
- Despliegue post-merge
