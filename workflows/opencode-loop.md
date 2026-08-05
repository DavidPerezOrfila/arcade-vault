# Workflow: opencode-loop

> Estado: **aprobado** (grilling completado). Fuente de verdad para implementar el flujo opencode.

## Resumen

Delegar la implementación de issues a opencode: quien lo invoca comenta `/oc` (o `/opencode`) en un issue, opencode implementa y abre un PR; el humano revisa el PR y pide cambios con `/oc` en el review.

## Trigger

- **Evento**: comentario nuevo en un issue o en un review de PR que contiene `/oc` o `/opencode`
- **Autor restringido**: solo `author_association` ∈ {OWNER, MEMBER} — protege `NVIDIA_API_KEY` y el coste (un externo no puede quemar crédito)
- **Sin requisito de spec**: cualquier issue con `/oc` vale; el trigger humano es el filtro

## Flujo

1. Owner/miembro comenta `/oc` en un issue
2. opencode analiza el issue, implementa en una rama, abre PR vinculado al issue (mensaje del PR: `Closes #<issue>`)
3. opencode comenta en el issue: arranque de la tarea y, al terminar, enlace al PR
4. **Checkpoint único**: el humano revisa el PR (push right — todo el trabajo está hecho antes de molestar)
5. Cambios solicitados: comentar `/oc` en el review del PR con el feedback → opencode itera sobre el mismo PR
6. Al mergear el PR, GitHub cierra el issue automáticamente (vía `Closes #<issue>`)

## Reglas de comportamiento

- **Un PR por issue**: si el issue ya tiene PR abierto de opencode, un `/oc` nuevo en el issue se ignora (la iteración va por el review del PR)
- **Fallo**: si opencode no puede implementar, comenta el error/razón en el issue (brief, no silencio)
- **Timeout del job**: 60 min (limita coste y evita jobs colgados). Nota: si el job muere por timeout, no hay comentario de fallo en el issue — el job aparece rojo en Actions

## Configuración técnica (GitHub Actions)

- Action: `anomalyco/opencode/github@latest`
- Modelo: `nvidia/minimaxai/minimax-m3`
- Secret: `NVIDIA_API_KEY` (env)
- **Permisos del job** (el yml actual NO los cumple — solo lectura):
  - `contents: write` — crear rama y commits
  - `pull-requests: write` — abrir/actualizar el PR
  - `issues: write` — comentar progreso/fallo en el issue
  - `id-token: write` — OIDC para el action
- Checkout con `persist-credentials: false` (el action gestiona su propia autenticación con el GITHUB_TOKEN del job)

## Interfaz con el usuario

- Invocar: comentar `/oc` + contexto opcional en el issue
- Iterar: comentar `/oc` + feedback en el review del PR
- Cancelar: cerrar el PR o borrar la rama (no hay comando de cancelación; el humano gobierna vía PR)

## Decisiones documentadas

| Pregunta | Decisión |
|---|---|
| Alcance | Implementación completa + PR (sin aprobación de plan previa) |
| Checkpoint | Revisión del PR (único, tardío) |
| Quién invoca | Solo OWNER/MEMBER |
| Requisito de spec | Ninguno — cualquier issue |
| PR duplicado | Ignorar `/oc` si ya hay PR abierto |
| Vinculación | `Closes #<issue>` en el PR |
| Modelo | `minimax-m3` (NVIDIA) |
| Timeout | 60 min |

## Validación

- Prueba manual: crear un issue de prueba con spec mínima, comentar `/oc`, verificar que abre PR y que la rama contiene cambios reales
- Verificar que un comentario de un usuario no-OWNER/MEMBER NO dispara el job
- Verificar que un segundo `/oc` con PR abierto no crea PR duplicado
- E2E no aplica (workflow externo al repo); la validación es la observación del job en GitHub Actions

## Out of scope

- Integración con el flujo spec-driven (no exige spec aprobada)
- Control de coste por ejecución (solo timeout)
- Comandos de cancelación
- Despliegue u otras acciones post-merge

## Mejora opcional futura

- Pinar `anomalyco/opencode/github@latest` a un SHA de commit (seguridad de supply chain: el job tiene permisos write; `@latest` es una ref mutable). Recomendado antes de depender del loop en producción
