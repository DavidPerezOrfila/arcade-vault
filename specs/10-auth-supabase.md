---
state: Implemented
date: 2026-08-27
revision: 2026-08-31 — revisión: cobertura E2E OAuth + avatar en navbar (item 14)
dependencies:
  - 04-supabase-scores-foundation
objective: Sustituir la autenticación simulada de /auth (localStorage) por Supabase Auth real con email+contraseña, OAuth de Google y GitHub, recuperación de contraseña y tabla profiles con nombre de jugador editable, de modo que las puntuaciones queden vinculadas a usuarios reales.
---

# SPEC 10 — Auth: registro, login y autenticación con Supabase

## Scope

**In:**

1. **Migración `profiles`.** Nueva tabla `public.profiles` (`id uuid pk → auth.users`, `username text unique not null`, `created_at`) con RLS (select público, update solo owner) + trigger que crea la fila al registrarse.
2. **Pantalla `/auth` real.** Reescribir `app/auth/page.tsx`: login y registro con email+contraseña vía Server Actions (`signInWithPassword`, `signUp` con username), botones OAuth Google/GitHub (`signInWithOAuth`), enlace "olvidé mi contraseña", mensajes de error en español, soporte de `?redirect=` (hoy se ignora).
3. **Recuperación de contraseña.** Flujo `resetPasswordForEmail` → página `/auth/reset` (nueva contraseña) con redirect URL configurada.
4. **Pantalla de perfil `/cuenta`.** Ver datos de la cuenta y editar `username` (Server Action con validación Zod + unicidad).
5. **Sesión en el nav.** `components/nav.tsx` lee la sesión real (server) en vez de `localStorage`; signOut real; enlace a `/cuenta`.
6. **Proxy de sesión.** `proxy.ts` (convención Next.js 16, sustituye a `middleware.ts`): refresca la sesión con `updateSession` y protege `/cuenta` y `/auth/reset` (redirect a `/auth` sin sesión).
7. **Integración con scores.** `lib/games/leaderboard.ts` resuelve el nombre desde `profiles.username` (fallback actual: `user_metadata` → prefijo email).
8. **Limpieza.** Retirar `av_user` de `app/data/storage.ts` y sus consumidores (migración one-shot del nombre legacy a `profiles` si hay sesión).
9. **E2E.** Spec `tests/e2e/auth.spec.ts`: registro, login, logout, redirect tras login, protección de `/cuenta`.
10. **Docs + grafo.** Actualizar `CLAUDE.md`/`README.md` (setup OAuth en dashboard, redirect URLs) y `graphify update`.

**Out of scope (specs futuras):**

- Verificación de email (desactivada en el proyecto Supabase; activable sin código).
- Magic links, otros proveedores OAuth (Discord, X…).
- Avatares / subida de imágenes (Storage).
- Enlazar cuentas OAuth con cuenta email existente.
- Eliminación de cuenta / exportación de datos (GDPR).
- Rate limiting / anti-spam más allá de RLS y límites de Supabase.
- Roles de usuario / administración.
- Reconciliación masiva de `scores.user_id` legacy (los scores antiguos sin dueño se quedan como están).

---

## Data model

**Postgres (`supabase/migrations/<timestamp>_auth_profiles.sql`):**

```sql
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (char_length(username) between 3 and 20),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_public
  on public.profiles for select using (true);

create policy profiles_update_owner
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Crea la fila de profile al registrarse. El username sale de
-- raw_user_meta_data->>'username' (registro email) o del nombre
-- del proveedor OAuth (full_name/user_name), con fallback al
-- prefijo del email. La unicidad la resuelve el constraint unique:
-- en colisión el trigger añade un sufijo numérico.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  base := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1),
    'jugador'
  );
  base := lower(regexp_replace(base, '[^a-zA-Z0-9_]', '', 'g'));
  base := left(nullif(base, ''), 20);
  candidate := coalesce(base, 'jugador');
  while exists (select 1 from public.profiles where username = candidate) loop
    i := i + 1;
    candidate := left(base, 17) || '_' || i;
  end loop;
  insert into public.profiles (id, username) values (new.id, candidate);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Tipos (`app/data/types.ts`):**

```typescript
// Perfil público del jugador (fila de public.profiles).
export interface Profile {
  id: string;
  username: string;
}
```

`lib/supabase/types.ts` se regenera con `npm run db:types` (añade `Tables.profiles`).

**Schemas Zod (`app/data/schema.ts`, ampliado):**

```typescript
export const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/);

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  username: usernameSchema,
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});
```

**Notas explícitas:**

- `scores` no cambia: la columna `user_id` ya existe y la policy `user_id is null or auth.uid() = user_id` ya cubre el caso autenticado.
- El nombre visible en leaderboards sigue siendo `scores.name` (desnormalizado al insertar); `profiles.username` es la fuente en el momento del guardado. Los scores antiguos conservan el nombre con que se guardaron.
- El constraint `unique` de `username` es la garantía real de unicidad; el bucle del trigger solo evita el error en el caso común de colisión OAuth.
- Sin tabla de sesiones ni tokens propios: toda la gestión de sesión vive en Supabase Auth (cookies vía `@supabase/ssr`).

---

## Implementation plan

1. **Migración `profiles`.**
   - Crear `supabase/migrations/<timestamp>_auth_profiles.sql` con el SQL del Data model (tabla, RLS, 2 policies, función `handle_new_user`, trigger).
   - Aplicar con `npm run db:reset` (local) o `supabase db push` (remoto).
   - Regenerar tipos: `npm run db:types`.
   - Verificación: `select relname from pg_class where relname='profiles' and relrowsecurity` → 1 fila; insert manual de un usuario de prueba en `auth.users` crea su fila en `profiles`.

2. **Configuración en el dashboard de Supabase (manual, documentada).**
   - Desactivar "Confirm email" en Authentication → Providers → Email.
   - Activar providers Google y GitHub con sus credenciales.
   - Añadir `http://localhost:3000/auth/callback` a las Redirect URLs (y la URL de producción).
   - Documentar los pasos en `README.md` (sección "Setup de Auth").
   - Verificación: `signInWithOAuth('google')` desde consola de navegador redirige al provider.

3. **Server Actions de auth (`app/auth/actions.ts`).**
   - `"use server"`: `signInAction(prev, formData)`, `signUpAction(prev, formData)`, `signOutAction()`, `updateUsernameAction(prev, formData)`, `resetPasswordAction(prev, formData)`, `updatePasswordAction(prev, formData)`.
   - Validan con los schemas Zod del Data model; devuelven `{ ok: true } | { ok: false; error: string }` con códigos estables (`INVALID_INPUT`, `INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `USERNAME_TAKEN`, `UNAUTHENTICATED`, `UNKNOWN`).
   - Usan `createSupabaseServerClient()`; `signUp` pasa `username` en `options.data` (lo recoge el trigger).
   - Tras login/registro exitoso: `redirect(redirectPath)` validado (solo rutas internas, sin `//` ni schemes).
   - Verificación: build OK; cada action devuelve el código esperado ante entrada inválida.

4. **Reescribir `app/auth/page.tsx`.**
   - Mantiene la estética actual (tabs INICIAR SESIÓN / CREAR CUENTA, botón "seguir sin cuenta").
   - Login: email + contraseña → `signInAction` con `useActionState`; errores en español bajo el formulario.
   - Registro: username + email + contraseña → `signUpAction`.
   - Botones "Continuar con Google" / "Continuar con GitHub" → componente cliente que llama `signInWithOAuth({ provider, options: { redirectTo: '<origin>/auth/callback' } })` y redirige a `data.url`.
   - Enlace "¿Olvidaste tu contraseña?" → `resetPasswordAction` con mensaje de confirmación ("revisa tu correo").
   - Lee `?redirect=` de la URL y lo pasa como hidden input a las actions.
   - Verificación: flujo manual registro → redirect funciona; credenciales malas muestran error sin romper la página.

5. **Callback OAuth (`app/auth/callback/route.ts`).**
   - Route Handler GET: intercambia `code` por sesión (`exchangeCodeForSession`), luego `redirect('/')` o al `?redirect=` validado.
   - Verificación: login con Google termina en la home con sesión activa.

6. **Página de reset (`app/auth/reset/page.tsx`).**
   - Client component: al montar, si la URL trae tokens de recuperación, llama `updateUser({ password })` vía `updatePasswordAction`; si no, muestra enlace para solicitar uno nuevo.
   - Verificación: flujo completo de reset funciona con un email real (o Mailpit local si se configura).

7. **Pantalla de perfil (`app/cuenta/page.tsx`).**
   - Server Component: lee sesión + `profiles` con `createSupabaseServerClient()`; sin sesión → `redirect('/auth?redirect=/cuenta')`.
   - Muestra email, proveedor y username actual; formulario de edición con `updateUsernameAction` (maneja `USERNAME_TAKEN`).
   - Botón "Cerrar sesión" → `signOutAction`.
   - Verificación: cambiar username se refleja en el nav y en el siguiente score guardado.

8. **Proxy de sesión (`proxy.ts` en la raíz).**
   - Convención Next.js 16 (`export function proxy(request)`, no `middleware.ts`).
   - Refresca la sesión con el patrón oficial de `@supabase/ssr` (`updateSession` con `getAll`/`setAll` sobre `request.cookies`).
   - Matcher con negative pattern excluyendo `_next/static`, `_next/image` y assets; protege `/cuenta` y `/auth/reset` (redirect a `/auth` sin sesión).
   - Verificación: cookie de sesión se refresca al navegar; `/cuenta` sin sesión redirige a `/auth?redirect=/cuenta`; CSS/JS siguen cargando.

9. **Nav con sesión real (`components/nav.tsx`).**
   - Convertir en Server Component que lee `auth.getUser()` + `profiles.username`; el panel móvil y el SkinSwitcher se extraen a un client component (`components/nav-client.tsx`) que recibe `user` como prop.
   - SignOut vía `signOutAction`; enlace "Iniciar Sesión" → `/auth`; con sesión, el nombre enlaza a `/cuenta`.
   - Eliminar lecturas de `getUser()`/`clearUser()`.
   - Verificación: nav muestra el username real tras login; vuelve a "Iniciar Sesión" tras signOut.

10. **Integración con scores (`lib/games/leaderboard.ts`).**
    - En `submitScore`: tras `auth.getUser()`, leer `profiles.username` por `id`; usarlo como `name` (fallback: cadena actual `user_metadata` → prefijo email si el profile no existe).
    - Verificación: score guardado tras cambiar el username lleva el nombre nuevo.

11. **Limpieza de `av_user`.**
    - Eliminar `getUser`/`setUser`/`clearUser` de `app/data/storage.ts` (y el tipo `User` de `app/data/types.ts` si queda sin consumidores); actualizar `PlayerClient.tsx` y demás consumidores.
    - One-shot: si hay `av_user` en localStorage Y sesión activa, `updateUsernameAction` migra el nombre legacy (solo si pasa `usernameSchema`) y borra la clave; si no pasa el schema, se descarta y queda el username del trigger.
    - Verificación: `grep -r "av_user" app components lib` → solo el código de migración.

12. **E2E (`tests/e2e/auth.spec.ts`).**
    - Registro email → sesión activa → nav muestra username.
    - Login con credenciales correctas e incorrectas (mensaje de error).
    - Logout limpia la sesión.
    - `?redirect=` tras login devuelve al juego.
    - `/cuenta` sin sesión redirige a `/auth`.
    - Usuario de prueba único por run (email con timestamp) para no chocar con `unique`.
    - Los flujos OAuth se cubren en `tests/e2e/oauth.spec.ts` (ver item 14): iniciación hacia Google/GitHub, callback con code inválido (`/auth?error=callback`) y login real con GitHub (gated por env, cuenta de prueba sin 2FA). El reset por email queda fuera del E2E; se verifica manualmente.
    - Verificación: `npx playwright test tests/e2e/auth.spec.ts` verde; `npm run test:e2e` completo sigue verde.

13. **Docs + verificación final + grafo.**
    - `CLAUDE.md`: sección de auth (proxy.ts, actions, profiles).
    - `README.md`: setup OAuth + redirect URLs.
    - `npm run build`, `npm run lint`, `npm run test:e2e` → verdes.
    - `npm run graphify:update`.

14. **E2E OAuth + avatar en navbar** (revisión 2026-08-31).
    - `tests/e2e/oauth.spec.ts` con 4 tests: iniciación del flujo con GOOGLE (tolerante al bloqueo de tráfico inusual de Google) y GITHUB (`github.com/login`), callback con code inválido vía mock de `**/auth/v1/authorize*` → `/auth?error=callback`, y login completo con GitHub (gated: solo chromium y solo si existen `GH_E2E_USERNAME`/`GH_E2E_PASSWORD`; sin ellas el test se salta y la suite queda verde).
    - Login real solo con GitHub: cuenta de prueba dedicada, sin 2FA ni passkeys (nunca la cuenta personal). Credenciales por entorno (shell o `.env` gitignored); nunca en el repo.
    - El login completo con Google queda descartado: CAPTCHA / "tráfico inusual" impide automatizarlo.
    - Avatar en el nav logueado: `components/nav.tsx` expone `avatarUrl` (de `user_metadata.avatar_url`, presente en OAuth) e iniciales fallback; `components/nav-client.tsx` muestra círculo con foto o iniciales junto al nombre; `.auth-avatar` en `app/globals.css`.
    - Verificación: `npx playwright test tests/e2e/oauth.spec.ts -g "inicia el flujo|inválido"` verde; con credenciales, `-g "login completo" --project=chromium` verde; `tests/e2e/auth.spec.ts` sigue verde.

---

## Acceptance criteria

- [ ] Existe `supabase/migrations/<timestamp>_auth_profiles.sql` con tabla `profiles`, RLS activo, policies `profiles_select_public` y `profiles_update_owner`, función `handle_new_user` y trigger `on_auth_user_created`.
- [ ] Registrar un usuario nuevo (email u OAuth) crea automáticamente su fila en `public.profiles` con username válido (3–20 chars, `[a-zA-Z0-9_]`).
- [ ] Dos usuarios con el mismo nombre base no colisionan: el trigger genera un username alternativo único.
- [ ] `npm run db:types` regenera `lib/supabase/types.ts` incluyendo `Tables.profiles`.
- [ ] `app/auth/actions.ts` exporta `signInAction`, `signUpAction`, `signOutAction`, `updateUsernameAction`, `resetPasswordAction`, `updatePasswordAction`, todas con `"use server"`, validación Zod y retorno `{ ok, error? }` con códigos estables.
- [ ] `/auth` muestra tabs de login/registro, botones Google y GitHub, enlace de recuperación y mensajes de error en español sin recargar la página.
- [ ] Login con credenciales incorrectas muestra `INVALID_CREDENTIALS` traducido y no crea sesión.
- [ ] Registro con email ya usado muestra error `EMAIL_TAKEN`; username ya usado muestra `USERNAME_TAKEN`.
- [ ] `?redirect=` en `/auth` devuelve al usuario a esa ruta interna tras login/registro; valores externos o con `//` se ignoran y caen en `/`.
- [ ] `app/auth/callback/route.ts` intercambia el código OAuth por sesión y redirige al destino válido.
- [ ] Login con Google y con GitHub funciona manualmente (sesión activa al volver).
- [ ] El flujo de recuperación envía el email y `/auth/reset` actualiza la contraseña con tokens válidos; sin tokens muestra estado de error/enlace nuevo.
- [ ] `/cuenta` sin sesión redirige a `/auth?redirect=/cuenta`; con sesión muestra email, proveedor y username.
- [ ] Editar el username en `/cuenta` persiste (constraint unique) y se refleja en el nav inmediatamente.
- [ ] `proxy.ts` existe en la raíz, exporta `proxy` (no `middleware`), refresca la sesión y protege `/cuenta` y `/auth/reset`.
- [ ] `components/nav.tsx` es Server Component; no importa `app/data/storage`; con sesión muestra el username de `profiles` enlazado a `/cuenta`; signOut limpia la sesión real de Supabase.
- [ ] `lib/games/leaderboard.ts` usa `profiles.username` como `name` al guardar (con fallback documentado).
- [ ] Un score guardado tras cambiar el username lleva el nombre nuevo en `scores.name`.
- [ ] `getUser`/`setUser`/`clearUser` y la clave `av_user` desaparecen del código salvo el one-shot de migración; el tipo `User` legacy se elimina si no tiene consumidores.
- [ ] El botón "seguir sin cuenta" de `/auth` navega a `/` sin sesión; guardar un score sin sesión sigue mostrando el AuthPrompt.
- [ ] `tests/e2e/auth.spec.ts` cubre: registro, login OK, login con error, logout, redirect tras login y protección de `/cuenta`; `npx playwright test tests/e2e/auth.spec.ts` pasa.
- [ ] `npm run test:e2e` completo sigue verde (specs de juegos y salón no regresan).
- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings.
- [ ] `README.md` documenta el setup de providers OAuth y redirect URLs; `CLAUDE.md` documenta el flujo de auth (proxy.ts, actions, profiles).
- [ ] `npm run graphify:update` se ejecuta sin errores al final.

Criterios de la revisión 2026-08-31 (E2E OAuth + avatar):

- [ ] Los botones GOOGLE y GITHUB de `/auth` inician el flujo hacia el proveedor (`oauth.spec.ts`).
- [ ] El callback con code inválido redirige a `/auth?error=callback` (rama de error real del route handler).
- [ ] El login real con GitHub (gated por `GH_E2E_USERNAME`/`GH_E2E_PASSWORD`, solo chromium) crea sesión y el nav muestra avatar (foto o iniciales), nombre y botón SALIR; `/cuenta` accesible.
- [ ] El logout desde el nav vuelve al estado "Iniciar Sesión".
- [ ] `npm run test:e2e` queda verde sin credenciales (el test gated se salta).
- [ ] `components/nav-client.tsx` muestra `.auth-avatar` con la foto de `user_metadata.avatar_url` o iniciales cuando no hay foto.

---

## Decisiones tomadas y descartadas

| Decisión                | Elegida                                                                                                                                          | Descartada                                                      | Justificación                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proveedor de auth       | Supabase Auth (email+password, OAuth Google/GitHub)                                                                                              | Auth.js / Clerk / solución propia                               | Ya está en el stack (`@supabase/ssr`), RLS integrado con `auth.uid()`, cero deps nuevas.                                                                          |
| Identidad del jugador   | Tabla `profiles` con `username` unique + trigger                                                                                                 | `user_metadata` / prefijo del email                             | RLS propio, editable, único garantizado por constraint; era el camino que adelantó la spec 04.                                                                    |
| Creación del profile    | Trigger en `auth.users` (PL/pgSQL)                                                                                                               | Insert desde la Server Action de registro                       | Cubre TODAS las vías de alta (email, Google, GitHub, futuro) sin duplicar lógica; el usuario nunca queda sin profile.                                             |
| Colisiones de username  | Constraint unique + bucle de sufijo en el trigger                                                                                                | Validar solo en la app                                          | La DB es la garantía real; el bucle evita el error en el caso común (dos "Carlos" vía OAuth).                                                                     |
| Verificación de email   | Desactivada en el proyecto Supabase                                                                                                              | Activada de serie                                               | Flujo simple y E2E fiable; activable en el dashboard sin tocar código. Decisión del usuario.                                                                      |
| Convención de proxy     | `proxy.ts` (Next.js 16)                                                                                                                          | `middleware.ts`                                                 | `middleware` está deprecado en Next.js 16; docs locales (`node_modules/next/dist/docs`) confirman el rename.                                                      |
| Escritura de auth       | Server Actions con `useActionState`                                                                                                              | Route Handlers / cliente directo (`signIn` desde el navegador)  | Mismo patrón que scores (spec 04); validación Zod server-side; secretos fuera del bundle. Excepción: `signInWithOAuth` necesita cliente browser para el redirect. |
| Nombre en scores        | `profiles.username` leído en `submitScore`, desnormalizado en `scores.name`                                                                      | FK a `profiles` + join en cada leaderboard                      | El esquema de `scores` no cambia; los leaderboards siguen siendo una sola query; el nombre histórico se preserva aunque el usuario lo cambie.                     |
| Nav                     | Server Component que lee la sesión                                                                                                               | Cliente con `onAuthStateChange`                                 | Sin flash de estado ni suscripciones; el panel móvil/SkinSwitcher bajan a un client component con props.                                                          |
| Redirect tras login     | `?redirect=` validado (solo rutas internas)                                                                                                      | Estado en sessionStorage / cookie                               | El AuthPrompt ya genera el enlace; validación corta open-redirects.                                                                                               |
| Botón invitado          | Se mantiene como "seguir sin cuenta" (sin sesión)                                                                                                | Eliminarlo / sesión anónima de Supabase                         | Decisión del usuario; los scores siguen bloqueados sin sesión (AuthPrompt), que es el comportamiento actual.                                                      |
| Reset de contraseña     | En esta spec (`resetPasswordForEmail` + `/auth/reset`)                                                                                           | Spec futura                                                     | Decisión del usuario. Requiere redirect URL configurada; queda documentado.                                                                                       |
| E2E de OAuth/reset      | OAuth automatizado en `oauth.spec.ts` (iniciación + callback inválido + login real GitHub gated por env, cuenta de prueba sin 2FA); reset manual | Tests automatizados con cuentas reales para todos los providers | Google no es automatizable (CAPTCHA / "tráfico inusual"); GitHub sí con cuenta de prueba dedicada. Revisión 2026-08-31 (item 14).                                 |
| Scores legacy sin dueño | Se quedan como están (`user_id null`)                                                                                                            | Backfill masivo / borrado                                       | Sin email no hay forma fiable de atribuirlos; la policy ya los admite.                                                                                            |

---

## Identified risks

| Riesgo                                                                                                       | Impacto | Mitigación                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config manual del dashboard (providers OAuth, redirect URLs, confirm-email off) no reproducible desde código | Alto    | Documentar paso a paso en `README.md`; sin esa config, OAuth y reset fallan con errores confusos de Supabase. Verificación manual explícita en el plan (paso 2).                                                    |
| `proxy.ts` mal configurado bloquea estáticos o rompe el build                                                | Alto    | Matcher con negative pattern excluyendo `_next/static`, `_next/image` y assets; verificar que CSS/JS siguen cargando tras añadirlo. Consultar `node_modules/next/dist/docs/.../proxy.md` durante la implementación. |
| Trigger con `security definer` mal escrito = agujero de privilegios                                          | Alto    | `set search_path = public` explícito; la función solo inserta en `profiles` con `new.id` (nunca un id arbitrario); smoke test SQL en el plan.                                                                       |
| `signInWithOAuth` desde Server Action no funciona (necesita redirect del navegador)                          | Medio   | Decidido: componente cliente con `createSupabaseBrowserClient()` para OAuth; Server Actions solo para email/password. Verificado en el paso 4.                                                                      |
| E2E crea usuarios reales en el proyecto Supabase compartido                                                  | Medio   | Emails únicos por run (timestamp); los tests no dependen de limpiar usuarios. Si el proyecto es remoto, considerar un proyecto de test separado (fuera de scope).                                                   |
| Colisión de usernames entre el trigger y el edit de `/cuenta`                                                | Bajo    | El edit valida con Zod + captura el error de unicidad de Postgres (`USERNAME_TAKEN`); el constraint es la última barrera.                                                                                           |
| `av_user` legacy con nombre que viola el nuevo constraint (<3 chars, símbolos)                               | Bajo    | El one-shot de migración solo aplica si el nombre pasa `usernameSchema`; si no, se descarta y el usuario conserva el username del trigger.                                                                          |
| Sesión caducada en páginas largas (juegos)                                                                   | Bajo    | El proxy refresca en cada navegación; `submitScore` devuelve `UNAUTHENTICATED` y el AuthPrompt cubre el caso. Sin `onAuthStateChange` por simplicidad.                                                              |
| Flags de seguridad de GitHub sobre la cuenta de prueba del login real                                        | Bajo    | Cuenta dedicada sin 2FA ni passkeys (nunca la personal); test gated por env (skip si faltan `GH_E2E_USERNAME`/`GH_E2E_PASSWORD`) y solo chromium; recomendado ejecutarlo con `--headed` ante bloqueos.              |
