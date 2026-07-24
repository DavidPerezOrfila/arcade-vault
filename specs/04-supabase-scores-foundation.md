---
state: Approved
date: 2026-07-20
dependencies:
  - 01-mvp-arcade-vault
  - 02-home-page
  - 03-about-page-resend
objective: Sustituir la persistencia de puntuaciones (y de usuario mientras no exista Auth) en localStorage por una base de datos Postgres gestionada por Supabase en local, con migraciones versionadas, RLS desde el inicio y migración one-shot del estado legacy la primera vez que el cliente se hidrate.
---

# SPEC 04 — Supabase: foundation y persistencia de puntuaciones

## Scope

**In:**

1. **Proyecto Supabase local.** Inicializar Supabase con `npx supabase init`, generar `supabase/config.toml`, arrancar stack local con `npx supabase start` (Postgres + GoTrue + PostgREST + Realtime + Storage). Documentar variables `api_url`, `anon_key`, `service_role_key` y `db_url` que imprime el comando.
2. **Migración inicial del esquema.** Crear `supabase/migrations/20260719000001_init_scores.sql` con:
   - Tabla `scores` (`id`, `game`, `score`, `name`, `user_id` nullable, `at`) + índice `(game, score desc)`.
   - Extensión `pgcrypto` habilitada (para `gen_random_uuid()`).
   - RLS habilitado y dos policies (`select` público, `insert` con `user_id is null or auth.uid() = user_id`).
   - Aplicar con `npx supabase db reset` (idempotente en local).
3. **Dependencias de cliente.** Instalar `@supabase/supabase-js` (runtime) y `@supabase/ssr` (runtime). Mantener `supabase` (CLI) en `devDependencies`, ya está.
4. **Factorías Supabase.** Crear en `lib/supabase/`:
   - `server.ts` → `createServerClient(URL, ANON_KEY, { cookies })` para RSC/Server Actions.
   - `client.ts` → `createBrowserClient(URL, ANON_KEY)` para Client Components.
   - `admin.ts` → client con `SUPABASE_SERVICE_ROLE_KEY`, solo servidor, RLS bypass explícito. **Sin uso en esta spec** (queda preparado para la spec de Auth).
   - `types.ts` → generado con `npx supabase gen types typescript --local`.
   - Cada factoría lee env con `assert(process.env.X, "Missing X")` para fallar rápido.
5. **Capa de scores (`app/data/scores.ts`, reemplazar el código actual de `storage.ts` que toca scores).** Funciones:
   - `getScores(): Promise<ScoreEntry[]>` — todas las filas, ordenadas por `score desc` (`limit 100`).
   - `getScoresByGame(game: string): Promise<ScoreEntry[]>` — filtradas por `game`, `score desc`, `at desc`. `limit 100`.
   - `saveScore(input: ScoreEntryInputParsed): Promise<ScoreEntry>` — inserta fila; devuelve la fila creada (mapea `at` ISO → ms).
   - Reescritura: ya no devuelve `[]` durante SSR; las llamadas server-side usan el cliente `server.ts`, las llamadas client-side el `client.ts`. Los componentes que hoy hacen `useEffect(getScores, ...)` pasan a ser Server Components que hacen `await getScores()` directamente.
6. **Server Action `saveScoreAction`.** En `app/data/actions.ts` con `"use server"`:
   - Valida `ScoreEntryInput` con Zod (`game`, `score int >= 0`, `name` 1–40, `at` epoch).
   - Llama a `saveScore` desde `lib/supabase/server.ts`.
   - Tras éxito ejecuta `revalidatePath('/salon')`, `revalidatePath('/games')`, `revalidatePath('/detalle/[id]', 'page')` y `revalidateTag('leaderboard')`.
   - Devuelve `{ ok: true }` o `{ ok: false, error: string }`.
7. **Migración legacy.** Componente `components/migrate-local-storage.tsx` (`"use client"`, montado en `app/layout.tsx`):
   - En `useEffect` (post-hidratación), lee `av_scores` y `av_user`.
   - Si encuentra datos y `localStorage.getItem('av_migrated_v1') !== 'true'`, los sube uno a uno vía `saveScoreAction` (y `setUser` action local — sigue en localStorage) y marca el flag. Si no hay datos, sale.
   - **Marca el flag ANTES de empezar el bucle**, no después, para evitar carreras entre pestañas.
   - Implementación tolerante a fallos parciales: si una fila falla, sigue con las siguientes y registra en consola.
8. **Actualización de consumidores de `getScores` / `saveScore`.** Pasar a Server Components / Server Actions:
   - `app/player/[id]` — al guardar puntuación usa `saveScoreAction` en lugar de `saveScore` directo.
   - `app/salon` — Server Component que hace `await getScoresByGame(activeGame)`.
   - `app/detalle/[id]` — leaderboard lateral lee `getScoresByGame(id)` en el server.
   - `app/page.tsx` (Home, sección Activity ticker) — `await getScores()` con slice top N.
   - `seededScores()` se mantiene solo para los nombres del top-5 "Players del día" en la Home mientras no haya suficientes jugadores reales.
9. **Variables de entorno.** Añadir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, **sin** `NEXT_PUBLIC_`) a `.env.local.example`. Documentar en `CLAUDE.md` la tabla de variables Supabase y la nota: "los valores se obtienen de `npx supabase status` en desarrollo local". El password de la DB local vive en `.env.db` (gitignored); el CLI de Supabase lo carga automáticamente.
10. **Tipos generados.** Añadir script `db:types` en `package.json`: `"db:types": "supabase gen types typescript --local > lib/supabase/types.ts"`.
11. **Verificación.** `npm run build`, `npm run lint`, `npx supabase status` muestra stack arriba, `npm run test:e2e` pasa (los flows existentes — `/auth` → `/games` → `/detalle/[id]` → `/player/[id]` → guardar score → ver `/salon` — deben seguir funcionando).
12. **Actualizar grafo.** Ejecutar `graphify update .` al finalizar.

**Out of scope (for future specs):**

- **Auth real (Supabase Auth).** Login/registro con email+password, OAuth, magic links. Esto es una spec propia que también moverá `av_user` a `auth.users` y reconciliará `user_id` en `scores`.
- **Realtime.** Suscripción realtime para leaderboards en `/salon`. Se usa `revalidatePath` por ahora.
- **Storage (avatars, game assets).** Buckets, uploads firmados.
- **Edge Functions.**
- **Catálogo de juegos en DB.** `GAMES` sigue en `app/data/games.ts`. Solo 8 juegos, sin valor meterlos en tabla.
- **Multi-tenant / orgs.**
- **Cloud.** Esta spec es 100 % local. Crear proyecto en `app.supabase.com`, `supabase link`, `supabase db push` va en spec independiente.
- **Backups / PITR / redundancia.**
- **Rate limiting real o anti-spam** (más allá de RLS).
- **Paginación de leaderboards** (100 entradas caben de sobra por ahora).
- **Tests unitarios dedicados para `scores.ts`.** Smoke test se cubre con Playwright E2E.

---

## Data model

**Postgres (`supabase/migrations/20260719000001_init_scores.sql`):**

```sql
create extension if not exists pgcrypto;

create table public.scores (
  id        uuid primary key default gen_random_uuid(),
  game      text not null,
  score     integer not null check (score >= 0),
  name      text not null,
  user_id   uuid null,
  at        timestamptz not null default now()
);

create index scores_game_score_idx on public.scores (game, score desc);

alter table public.scores enable row level security;

create policy scores_select_public
  on public.scores
  for select using (true);

create policy scores_insert_anon_or_owner
  on public.scores
  for insert
  with check (user_id is null or auth.uid() = user_id);
```

**Tipos TypeScript generados (`lib/supabase/types.ts`, vía `supabase gen types typescript --local`):**

```typescript
// Salida concreta del generador — mostrado aquí solo para que la spec
// no dependa de archivos efímeros. La fuente de verdad es el archivo generado.

export interface Database {
  public: {
    Tables: {
      scores: {
        Row: { id: string; game: string; score: number; name: string; user_id: string | null; at: string };
        Insert: { id?: string; game: string; score: number; name: string; user_id?: string | null; at?: string };
        Update: { id?: string; game?: string; score?: number; name?: string; user_id?: string | null; at?: string };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
```

**Tipos de dominio (`app/data/types.ts`, ampliado sobre la versión de SPEC 01):**

```typescript
import type { Database } from "@/lib/supabase/types";

// Lo que consume la UI. Se mantiene idéntico al de SPEC 01.
export interface ScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number; // epoch ms — la UI formatea a dd/mm/aaaa
}

// Lo que valida la Server Action.
export interface ScoreEntryInput {
  game: string;
  score: number;
  name: string;
  at: number;
}

// Helper de mapeo fila DB → dominio. Vive en `app/data/scores.ts`,
// no aquí, para mantener la separación "persistido" vs "lo que ve la UI".
export type ScoreRowDb = Database["public"]["Tables"]["scores"]["Row"];
```

**Schema Zod (`app/data/schema.ts`, nuevo):**

```typescript
import { z } from "zod";

export const scoreEntrySchema = z.object({
  game:  z.string().min(1).max(64),
  score: z.number().int().nonnegative().max(1_000_000_000),
  name:  z.string().min(1).max(40),
  at:    z.number().int().positive(), // epoch ms
});

export type ScoreEntryInputParsed = z.infer<typeof scoreEntrySchema>;
```

**Variables de entorno (`app/.env.local.example`, añadir):**

```bash
# .env.local — claves de la API de Supabase (servidor + cliente).
# Valores en dev local: `npx supabase status`.
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh…"
# Solo servidor. NUNCA usar NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY="eyJh…"

# .env.db — gitignored. Contiene solo la contraseña del rol `postgres`
# que arrancará el stack local. El CLI de Supabase la carga automáticamente
# (referenciada en `supabase/config.toml` → `[db].password = "${DB_PASSWORD}"`).
```

**Notas explícitas:**

- **No se introducen más tablas.** `GAMES` se queda en `app/data/games.ts` (catálogo estático de 8 juegos, sin valor en DB).
- `user_id` queda **null** hasta que aterrice Auth. La policy `with check (user_id is null or auth.uid() = user_id)` admite inserts anónimos hoy sin abrir la puerta a escrituras cross-user mañana.
- El dominio (`ScoreEntry`) sigue usando `at: number` en epoch ms. La capa `app/data/scores.ts` mapea `timestamptz → number` con `new Date(row.at).getTime()`. La UI nunca ve el `string` ISO de Postgres.
- `seededScores()` (`app/data/players.ts`) deja de alimentar leaderboards. Pasa a usarse solo para los avatares / nombres del top-5 "Players del día" en la Home mientras no haya suficientes jugadores reales (ver Decisions).

---

## Implementation plan

1. **Inicializar Supabase local.**
   - `npx supabase init` (crea `supabase/` con `config.toml` y `migrations/`).
   - Confirmar `.gitignore` ignora `supabase/.branches`, `supabase/.temp`.
   - Instalar deps: `npm install @supabase/supabase-js @supabase/ssr` (runtime).
   - Configurar `supabase/config.toml` para que el stack local use la contraseña indicada en `.env.db` (el CLI la carga automáticamente):
     ```toml
     [db]
     port = 54322
     shadow_port = 54320
     password = "${DB_PASSWORD}"
     # …
     ```
   - `.env.db` debe existir en la raíz con solo la contraseña (gitignored, ya cubierto por `.env*` en `.gitignore`).
   - Resultado: stack arrancable con `npx supabase start` (requiere Docker Desktop).
   - Verificación: `npx supabase status` imprime `API URL`, `anon key`, `service_role key`, `DB URL`.

2. **Aplicar el esquema inicial.**
   - Crear `supabase/migrations/20260719000001_init_scores.sql` con el bloque SQL del Data model (extensión `pgcrypto`, tabla `scores`, índice, RLS, 2 policies).
   - `npx supabase db reset` para aplicar desde cero (idempotente en local).
   - Verificación: `npx supabase db diff` no muestra drift; `select * from scores` desde psql devuelve 0 filas.

3. **Configurar variables de entorno.**
   - Sobre `.env.local.example`, añadir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` con comentarios.
   - Pedir al usuario que vuelque `npx supabase status` → `.env.local` para desarrollo.
   - Documentar en `CLAUDE.md` la nueva tabla de variables.
   - Verificación: `next dev` arranca sin errores ni warnings de "missing env".

4. **Crear factorías Supabase.**
   - `lib/supabase/server.ts`: exporta `createSupabaseServerClient()` que invoca `createServerClient(URL, ANON_KEY, { cookies: { getAll, setAll } })` usando `next/headers`.
   - `lib/supabase/client.ts`: exporta `createSupabaseBrowserClient()` con `createBrowserClient(URL, ANON_KEY)`.
   - `lib/supabase/admin.ts`: exporta `createSupabaseAdminClient()` con `createClient(URL, SERVICE_ROLE_KEY, { auth: { persistSession: false }})`. **Sin uso en esta spec**, queda listo.
   - Cada factoría lee env con `assert(process.env.X, "Missing X")` para fallar rápido.
   - Verificación: TS compila sin errores, sin `any` accidental.

5. **Generar tipos desde el esquema.**
   - Añadir script en `package.json`: `"db:types": "supabase gen types typescript --local > lib/supabase/types.ts"`.
   - `npm run db:types` produce `lib/supabase/types.ts` con `Database`, `Tables`, `scores.Row/Insert/Update`.
   - Verificación: `grep -q "scores" lib/supabase/types.ts`.

6. **Crear `app/data/schema.ts` con Zod.**
   - Exporta `scoreEntrySchema` y `ScoreEntryInputParsed` (mostrados en Data model).
   - Verificación: `npm run lint` pasa.

7. **Crear la capa `app/data/scores.ts` (Postgres, por ahora no consumida).**
   - `getScores(): Promise<ScoreEntry[]>` — `from('scores').select('*').order('score', { ascending: false }).limit(100)`, mapea `at` timestamptz → ms.
   - `getScoresByGame(game: string): Promise<ScoreEntry[]>` — análogo + filtro `eq('game', game)`.
   - `saveScore(input: ScoreEntryInputParsed): Promise<ScoreEntry>` — convierte `at: number` → ISO, `insert`, devuelve la columna mapeada.
   - Todas usan `createSupabaseServerClient()` (capa servidor).
   - Verificación: build no rompe (aún nadie llama a `scores.ts`); TS strict compila.

8. **Crear la Server Action `app/data/actions.ts`.**
   - `"use server"`, export `saveScoreAction(prev, formData): Promise<{ ok: true } | { ok: false; error: string }>`.
   - Parsea `FormData`, valida con `scoreEntrySchema` (los fallos devuelven `{ ok: false, error: 'INVALID_INPUT' }`).
   - Llama a `saveScore(...)` del paso anterior. Tras éxito, `revalidatePath('/salon')`, `revalidatePath('/games')`, `revalidatePath('/detalle/[id]', 'page')`, `revalidateTag('leaderboard')`.
   - Verificación: build OK, ningún call site la usa todavía.

9. **Actualizar `app/player/[id]` para guardar con la Server Action.**
   - Reemplazar la llamada actual a `saveScore` (localStorage) por `saveScoreAction(null, new FormData())` con los campos.
   - El toast "PUNTUACIÓN GUARDADA" se mantiene. El flujo sigue funcionando idénticamente para el usuario durante el primer save en DB.
   - Verificación: `npm run dev`, entrar a un player, terminar partida → toast sigue saliendo y la fila aparece en Supabase (verificable con `npx supabase db inspect`).

10. **Migrar consumidores de `getScores` a Server Components que lean de Supabase.**
    - `app/salon/page.tsx`: pasa a `async`, fetch inicial con `await getScoresByGame(activeGame)` en el server. Cada cambio de tab (cliente) ejecuta `useTransition` + revalidate con `router.refresh()`; alternativa: dejar el salón como Server Component con `?game=` query param.
    - `app/detalle/[id]/page.tsx`: enseña `await getScoresByGame(id)` junto a la cover. RSC, sin cambios de cliente.
    - `app/page.tsx` (Home, sección Activity ticker): `await getScores({ limit: 10 })` para el ticker; el top-5 jugadores del día mantiene `seededScores()` (ver Decisions).
    - `seededScores()` se conserva en `app/data/players.ts` solo para nombres del top-5 Home (no para leaderboards de Salón/Detalle).
    - Verificación: navegación por tabs en `/salon` actualiza filas reales, no fake.

11. **Migración legacy de localStorage.**
    - `components/migrate-local-storage.tsx` (`"use client"`):
      - En `useEffect` (post-hidratación): lee `av_scores` y `av_user`.
      - Si encuentra datos y `localStorage.getItem('av_migrated_v1') !== 'true'`:
        - Marca `localStorage.setItem('av_migrated_v1', 'true')` **antes** de empezar el bucle (evita carrera entre pestañas).
        - Itera y sube cada score vía `saveScoreAction`.
      - Tras éxito total, elimina `av_scores`/`av_user` de localStorage.
      - Tolerante: errores individuales no abortan el batch; errores globales se loggean a consola.
    - Montar en `app/layout.tsx` (al final, fuera de `<body>` server-only).
    - Verificación manual: con datos en localStorage, primera carga sube las filas y limpia; segunda carga no hace nada (sale por el flag).

12. **Actualizar scripts y docs.**
    - Añadir scripts a `package.json`:
      - `"db:start": "supabase start"`
      - `"db:stop": "supabase stop"`
      - `"db:reset": "supabase db reset"`
      - `"db:types": "supabase gen types typescript --local > lib/supabase/types.ts"`
    - Actualizar `CLAUDE.md`: tabla de env vars Supabase, comandos `db:*` y nota sobre `user_id` nullable.
    - Actualizar `README.md` con la sección "Setup local de la DB":
      1. Confirma que `.env.db` existe en la raíz (gitignored).
      2. `npm run db:start`.
    - Verificación: `cat package.json | jq '.scripts'` lista los 4 scripts nuevos.

13. **Verificación final.**
    - `npm run build` → 0 errores ni warnings.
    - `npm run lint` → 0 errores en `app components e2e`.
    - `npm run test:e2e` → flujo crítico (`/auth` → `/games` → `/detalle/[id]` → `/player/[id]` → guardar score → ver `/salon`) pasa.
    - `npx supabase status` → stack arriba.
    - Smoke test SQL: `select relname from pg_class where relname='scores' and relrowsecurity` → 1 fila (RLS activa).

14. **Refrescar el grafo de conocimiento.**
    - `npm run graphify:update` (AST-only).
    - Sin coste de API.

---

## Acceptance criteria

- [ ] `npm run build` termina con código 0 y sin warnings.
- [ ] `npm run lint` no reporta errores ni warnings.
- [ ] `npx supabase status` imprime `API URL`, `anon key`, `service_role key`, `DB URL` con la stack arriba.
- [ ] `npx supabase db diff` no muestra drift entre la migración y el esquema real local.
- [ ] Existe `supabase/migrations/20260719000001_init_scores.sql` en el repo.
- [ ] La extensión `pgcrypto` está habilitada en la DB local.
- [ ] La tabla `scores` existe con las columnas exactas: `id` (uuid pk por defecto), `game` (text not null), `score` (integer not null, `check (score >= 0)`), `name` (text not null), `user_id` (uuid **null** sin default), `at` (timestamptz not null, `default now()`).
- [ ] El índice `scores_game_score_idx` existe sobre `(game, score desc)`.
- [ ] RLS está habilitado en `public.scores` y existen exactamente dos policies: `scores_select_public` (`for select using (true)`) y `scores_insert_anon_or_owner` (`for insert with check (user_id is null or auth.uid() = user_id)`).
- [ ] `select count(*) from scores` devuelve 0 en la DB recién reseteada.
- [ ] Un `insert into public.scores (game, score, name, user_id) values ('demo', 1, 'test', null)` ejecutado como rol `anon` desde el SQL editor de Supabase se acepta y persiste.
- [ ] `npm run db:types` produce `lib/supabase/types.ts` con la interfaz `Database` que contiene `Tables.scores.{Row,Insert,Update}`.
- [ ] `lib/supabase/server.ts`, `lib/supabase/client.ts` y `lib/supabase/admin.ts` exportan sus factorías (`createSupabaseServerClient`, `createSupabaseBrowserClient`, `createSupabaseAdminClient`).
- [ ] `lib/supabase/server.ts` y `lib/supabase/client.ts` fallan rápido con mensaje claro si falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] `app/data/scores.ts` exporta `getScores()`, `getScoresByGame(game)` y `saveScore(input)` con los tipos del Data model.
- [ ] `app/data/schema.ts` exporta `scoreEntrySchema` (Zod) y el tipo inferido.
- [ ] `app/data/actions.ts` exporta `saveScoreAction` con `"use server"`, usa `scoreEntrySchema` para validar y revida `/salon`, `/games` y `/detalle/[id]` tras un guardado exitoso.
- [ ] `saveScoreAction` devuelve `{ ok: false, error: 'INVALID_INPUT' }` ante un fallo de validación Zod.
- [ ] `app/player/[id]/page.tsx` guarda la puntuación vía `saveScoreAction` (no usa `setItem` ni `saveScore` directo de localStorage).
- [ ] Tras guardar una puntuación en el flujo de juego, la fila aparece en `public.scores` consultable desde el SQL editor.
- [ ] `app/salon/page.tsx` es ahora un Server Component que llama a `getScoresByGame(activeGame)` y renderiza filas reales; `seededScores()` ya no alimenta este leaderboard.
- [ ] `app/detalle/[id]/page.tsx` usa `await getScoresByGame(id)` para el leaderboard lateral; si no hay filas, muestra el estado vacío definido por la UI (no filas fake).
- [ ] `app/page.tsx` (Home, sección Activity ticker) usa `await getScores()` para el ticker; el top-5 "Players del día" sigue usando `seededScores()`.
- [ ] `components/migrate-local-storage.tsx` está montado en `app/layout.tsx` y se ejecuta solo en cliente (`typeof window !== "undefined"`).
- [ ] Con `localStorage['av_scores']` con datos, tras la primera carga las filas quedan en `public.scores` y `localStorage['av_scores']` queda vacío.
- [ ] Tras la primera migración, `localStorage['av_migrated_v1']` vale `'true'` y, al recargar, el componente no sube nada nuevo.
- [ ] El componente de migración es **tolerante a fallos individuales**: un `saveScoreAction` que falla no aborta el batch (sigue con los siguientes y registra en consola).
- [ ] El componente de migración marca `localStorage['av_migrated_v1'] = 'true'` **antes** del bucle de subida (evita carrera entre pestañas).
- [ ] `.env.local.example` lista `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, cada una con comentario.
- [ ] `package.json` incluye los scripts `db:start`, `db:stop`, `db:reset`, `db:types`.
- [ ] `CLAUDE.md` documenta la tabla de variables Supabase y los comandos `db:*`.
- [ ] `README.md` incluye la sección "Setup local de la DB" con los dos pasos (`db:start`, asumiendo `.env.db` ya presente).
- [ ] El flujo E2E crítico (`/auth` → `/games` → `/detalle/[id]` → `/player/[id]` → guardar score → ver `/salon`) pasa con `npm run test:e2e`.
- [ ] La consola del navegador queda libre de errores y warnings no esperados durante el flujo crítico.
- [ ] `npm run graphify:update` se ejecuta sin errores al final.

---

## Decisiones tomadas y descartadas

| Decisión                                        | Elegida                                                                                                           | Descartada                                  | Justificación                                                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entorno Supabase                                | Local con CLI (`npx supabase start`)                                                                              | Supabase Cloud desde el inicio              | Iteración offline, barata y reproducible; Cloud queda en spec propia.                                                                                          |
| Carga de la contraseña local                    | CLI lee `.env.db` automáticamente (config.toml: `password = "${DB_PASSWORD}"`)                                    | `export DB_PASSWORD=$(cat .env.db)` manual  | Confirmado por el usuario: el CLI ya carga el archivo; cero pasos manuales en setup.                                                                           |
| Cliente Supabase                                | `@supabase/supabase-js` + `@supabase/ssr`                                                                         | Solo `@supabase/supabase-js`                | `ssr` aporta factorías oficiales para App Router (`createServerClient`/`createBrowserClient`) que ya gestionan cookies + refresh tokens.                       |
| RLS en la primera migración                     | RLS activo + 2 policies (`select` público, `insert` con `user_id is null or auth.uid() = user_id`)                | RLS apagado / `using (true)` permisivo      | Endurecer desde el día uno elimina la "deuda de seguridad por defecto". El coste de tres líneas SQL es trivial.                                                |
| Modelado de `user_id`                           | `uuid null` ahora, rellenable en spec futura de Auth                                                              | Sin `user_id` / generarlo en cliente        | Permite inserts guests sin romper la semántica "cada fila pertenece (si tiene dueño)". Al añadir Auth, un `UPDATE` rellena la columna sin migrar datos.        |
| Escritura desde la app                          | Server Action con `"use server"` (patrón de `app/about/actions.ts`)                                               | Route Handler en `app/api/scores/route.ts`  | Mismo patrón que la spec 03; secret fuera del bundle; `revalidatePath` nativo.                                                                                 |
| Migración legacy                                | Componente cliente `useEffect` post-hidratación, flag `av_migrated_v1` (marcado antes del bucle)                  | Endpoint `/api/migrate` con `service_role`  | El componente solo necesita permisos `anon`; no expone una ruta nueva ni requiere clave privilegiada. El flag temprano evita carrera entre pestañas.           |
| Realtime                                        | No esta spec; usar `revalidatePath` + `revalidateTag('leaderboard')`                                              | Suscripción Realtime en `/salon`            | Realtime introduce canales, cleanup y latencias que no necesitamos hoy; spec propia si se justifica.                                                           |
| Catálogo de juegos                              | `GAMES` se queda en `app/data/games.ts` (estático)                                                                | Mover `GAMES` a Supabase                    | 8 entradas, sin queries; pasar a DB añade operacional sin valor de producto.                                                                                   |
| `seededScores()`                                | Se elimina como fuente del leaderboard de Salón/Detalle; se conserva solo para el top-5 "Players del día" en Home | Mantener filas fake mezcladas con reales    | Mezclar reales y fake rompe el orden/timestamp de la tabla; mejor vacío honesto en leaderboards. Avatares Home pueden seguir sintéticos sin mentir al usuario. |
| Tipo `ScoreEntry.at`                            | Sigue siendo `number` (epoch ms); `app/data/scores.ts` mapea `timestamptz ↔ ms`                                   | Cambiar a `string` ISO y refactorizar la UI | Evita refactor masivo (la UI pinta `dd/mm/aaaa`); la conversión es 1 línea por lectura/escritura.                                                              |
| Tests                                           | Solo E2E (flujo crítico sigue verde)                                                                              | Unit tests de `scores.ts`                   | YAGNI: la Server Action ya cubre Zod y RLS; un E2E que la ejerza es suficiente. Unit tests se añaden si la lógica crece.                                       |
| Paginación de leaderboards                      | `limit 100` por query, sin UI de paginación                                                                       | Paginación real (from/to, total, etc.)      | 100 filas × 8 juegos caben en una vista; la paginación se mete cuando el leaderboard supere la vista, no antes.                                                |
| Versionado de migraciones                       | Archivo único con timestamp `20260719000001_init_scores.sql` (convención CLI)                                     | Versionado manual / múltiples archivos      | Convención oficial de Supabase CLI; se alinea con `db diff`, `db reset`, `db push`.                                                                            |
| Auth, Realtime, Storage, Edge Functions, Cloud  | Fuera de scope                                                                                                    | Incluidos en esta spec                      | Cada uno merece su propia spec; meterlos aquí convierte la spec en cajón de sastre.                                                                            |
| Hardening RLS (límite por IP, anti-spam, otros) | No                                                                                                                | Endurecer policies                          | YAGNI: con Auth + limites por usuario en spec futura; el `user_id` nullable cierra la valla mínima hoy.                                                        |

---

## Identified risks

| Riesgo                                               | Impacto | Mitigación                                                                                                                                                                                                                                   |
| ---------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cookies y `next/headers` con Next.js 16              | Alto    | `@supabase/ssr` con adapter `cookies.getAll`/`setAll` cubre el patrón oficial de App Router. Verificar que el primer render del Server Component lea sesión sin `401`. Consultar `node_modules/next/dist/docs/` si hay deprecation warnings. |
| Docker Desktop requerido para `supabase start`       | Alto    | Documentar pre-requisito en `README.md`. Si el dev no tiene Docker, queda como "use Cloud" (futura spec).                                                                                                                                    |
| Tipos generados desincronizados del esquema          | Medio   | `npm run db:types` queda como script manual; añadir nota en `CLAUDE.md` ("regenerar tipos tras cada migración"). Sin él, TS acepta queries que la DB rechaza y los errores son confusos.                                                     |
| Carrera en migración legacy (dos pestañas a la vez)  | Medio   | Marcar `av_migrated_v1 = 'true'` **antes** del bucle de subida, no después. La segunda pestaña que llegue lee el flag y sale en silencio sin tocar nada. Alternativa: índice único `(game, name, at)` en Postgres.                           |
| `.env.db` commiteado por error                       | Alto    | `.env*` ya está cubierto por `.gitignore`. Aun así, considerar pre-commit hook `ecc:setup-pre-commit` que falle si `.env.db` (o cualquier `.env*` no whitelisted) aparece en `git status`.                                                   |
| Impersonación temporal por `user_id null`            | Medio   | Hasta que aterrice Auth, cualquiera puede insertar filas con `name` arbitrario. Aceptable en local dev: no hay datos sensibles que proteger. Cuando llegue Auth, la policy se endurece con un `ALTER POLICY`, sin migración de datos.        |
| RLS desactivado por accidente en futuras migraciones | Alto    | Smoke test SQL en cada `db:reset`: confirmar que `pg_class.relrowsecurity=true` para `public.scores`. Hookable como test de CI o paso manual documentado.                                                                                    |
