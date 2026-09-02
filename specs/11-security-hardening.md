---
state: Approved
date: 2026-09-01
dependencies: [04-supabase-scores-foundation, 10-auth-supabase]
objective: Endurecer la seguridad codificable de Arcade Vault aplicando headers en Next.js, corrigiendo funciones SECURITY DEFINER expuestas y verificando RLS/policies de games y scores sin tocar toggles de dashboard.
---

# SPEC 11 — Hardening de seguridad codificable

## Scope

**In:**

1. Headers de seguridad en `next.config.mjs` con `headers()` para todas las rutas: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. Funciones `SECURITY DEFINER` expuestas: revocar `EXECUTE` a `anon` y `authenticated` en `public.handle_new_user` y `public.rls_auto_enable` si existe, o moverlas fuera del schema expuesto cuando aplique. `handle_new_user` queda solo como trigger interno.
3. Verificación de RLS: `games` y `scores` con `enable row level security` y policies existentes sin regresión.
4. Verificación de escritura en `games` solo por `service_role`.

**Out (no en este spec):**

- Toggles de dashboard Supabase: leaked password protection, minimum password length, max signup rate. Se documentan como fuera de código.
- CSP, HSTS, Permissions-Policy u otros headers adicionales.
- Nuevas features de auth, roles o cambios de schema de `scores`/`profiles`.

## Data model

No hay tablas nuevas. Cambios sobre objetos existentes:

- `public.games` y `public.scores`: sin cambios de columnas; verificación de `enable row level security` y policies ya migradas.
- `public.handle_new_user()`: `SECURITY DEFINER SET search_path = public` existente; se revoca `EXECUTE` a `anon, authenticated` vía `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public` o equivalente. No exponer vía `/rest/v1/rpc`.
- `public.rls_auto_enable()` si existe en remoto: mismo `REVOKE` o `DROP` si es helper legacy sin consumidores.
- `next.config.mjs`: añade `headers: async () => [{ source: '/(.*)', headers: [...] }]` con los 3 headers del Scope.

## Implementation plan

1. Verificar baseline sin tocar código: confirmar `games` y `scores` con RLS activo y policies presentes; confirmar `handle_new_user` como `SECURITY DEFINER` y si `rls_auto_enable` existe en remoto. Sin cambios. Verificación: queries a `pg_class`/`pg_policy`/`pg_proc` y linter local.
2. Añadir headers en `next.config.mjs`: exportar `headers()` con los 3 valores del Scope para `/(.*)`. Sistema sigue funcional, solo añade cabeceras. Verificación: `npm run build && npm run start`, inspeccionar cabeceras en `/` y `/games/caida`.
3. Migración `supabase/migrations/<ts>_security_hardening.sql`: `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public` y lo mismo para `rls_auto_enable` si existe con `DO` guard. Verificación: `anon`/`authenticated` ya no pueden `POST /rest/v1/rpc/*`.
4. Aplicar migración al remoto sin Docker: el usuario corre `! npx supabase db push --db-url "$(cat .env.db)"` (pooler, no requiere stack local). Verificación con script efímero `pg` + REST (lee `.env.db` y `.env.local` en runtime, no se commitea): ACL de `handle_new_user`/`rls_auto_enable` sin `EXECUTE` para `anon`/`authenticated`; trigger `on_auth_user_created` intacto en `auth.users`; signup efímero vía admin API crea fila en `profiles` (usuario de prueba borrado al terminar); `POST /rest/v1/rpc/handle_new_user` y `rls_auto_enable` con anon key devuelven 403/404; INSERT y UPDATE en `games` con anon key y con token `authenticated` rechazados por RLS. Verificación: salida del script con todos los checks en verde.
5. Cierre: `npm run build`, `npm run lint`, `npm run test:e2e` verdes (corren contra el remoto vía `.env.local`, sin Docker); `npm run graphify:update`; actualizar `specs/.spec-config.yml` si falta; commits en la rama del spec.

## Acceptance criteria

- [ ] `next.config.mjs` exporta `headers()` que aplica a `/(.*)` los 3 headers: `nosniff`, `DENY`, `strict-origin-when-cross-origin`.
- [ ] `curl -I http://localhost:3000/` y `/games/caida` devuelven los 3 headers.
- [ ] `public.handle_new_user()` no es ejecutable por `anon` ni `authenticated` vía `/rest/v1/rpc/handle_new_user` (403 o 404).
- [ ] `public.rls_auto_enable()` si existe tampoco es ejecutable por `anon`/`authenticated`; si no existe la migración no falla.
- [ ] Registro email y OAuth siguen creando fila en `public.profiles` vía trigger.
- [ ] `games` y `scores` mantienen `enable row level security` y sus policies (`public select games`, `scores_select_public`, `scores_insert_anon_or_owner`).
- [ ] `games` no es escribible por `anon`/`authenticated` (insert/update rechazado), solo `service_role`.
- [ ] `npm run build`, `npm run lint` y `npm run test:e2e` pasan sin regresiones.

## Decisiones tomadas y descartadas

| Decisión          | Elegida                                  | Descartada                         | Justificación                                                                                         |
| ----------------- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Alcance           | Solo hardening codificable               | Incluir toggles de dashboard       | Dashboard no es código; evita spec mixto código/manual.                                               |
| Funciones DEFINER | `REVOKE EXECUTE` a `anon, authenticated` | Cambiar a `SECURITY INVOKER`       | `handle_new_user` necesita definer para insertar en `profiles`; revocar es mínimo y preserva trigger. |
| `rls_auto_enable` | Revocar o dropear si legacy              | Dejar expuesta                     | Linter la marca como riesgo; sin consumidores no aporta.                                              |
| Headers           | Solo 3 del checklist                     | Añadir CSP/HSTS/Permissions-Policy | CSP rompe canvas y HSTS requiere prod; se deja para spec futuro.                                      |
| `games`           | Verificar sin migrar                     | Reescribir policies                | Ya es solo `service_role` en escritura; reescribir añade riesgo sin beneficio.                        |

## Identified risks

| Riesgo                                       | Impacto | Mitigación                                                                                             |
| -------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `REVOKE` rompe trigger                       | Alto    | Trigger corre como owner, no como caller; `REVOKE` solo afecta RPC. Verificar registro tras migración. |
| `rls_auto_enable` con consumidores ocultos   | Medio   | `DO` guard con `IF EXISTS`; buscar referencias antes de dropear.                                       |
| Headers rompen embeds                        | Bajo    | `DENY` es intencional; si se necesita embed futuro migrar a `SAMEORIGIN` en spec aparte.               |
| RLS verificado sin migración falla en remoto | Bajo    | Baseline documentado; si remoto diverge, nueva migración corrige sin tocar app.                        |
