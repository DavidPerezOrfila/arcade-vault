---
state: Draft
dependencies: ["04-scores-foundation", "05-asteroids-game"]
date: 2026-07-28
---
# 06-games-catalog-salon

Migrar catálogo de juegos estático a Supabase (`games` table), renovar `/salon` con pestañas de leaderboard por juego (client-side), y consolidar routing `/games/[slug]`.

## Scope

**In scope:**

1. **Games → Supabase.** Migración `games` con columnas espejo de `GAMES` (`id`, `title`, `short`, `long`, `cat`, `cover`, `color`, `best`, `plays`). Seed con 8 filas vía `INSERT` en la misma migración. RLS: `select` público, `insert/update` solo `service_role` (admin).
2. **Capa de datos `app/data/games.ts` → Server-side.** Reemplazar array estático por funciones async (`getGames()`, `getGameById()`, `getGameBySlug()`) que lean de Supabase (`lib/supabase/server.ts`). Cache `no-store` o revalidate on demand.
3. **`/salon` renovada.** Page Client Component con pestañas client-side (`useState`), sin `searchParams`. Tab activa → fetch leaderboard via Server Action / `getScoresByGame()`. Podio + tabla idéntico a template (`salon.jsx`): top 3 visual + listado 12 filas + fila "TU MEJOR MARCA" si autenticado.
4. **Routing `/games/[slug]` ya hecho.** Confirmar que todo `app/page`, `/games`, `/games/[slug]`, `/player/[id]` usa `/games/${game.id}` (completado en SPEC 05 + fix de folder move).

**Out of scope:**

- Auth real (Supabase Auth) — spec futura
- Realtime leaderboards — spec futura
- Editar juegos desde UI / CMS — spec futura
- Paginación leaderboards (>12 filas) — YAGNI
- Versionado / soft-delete de juegos — YAGNI

## Data Model

### Supabase `games` table

```sql
create table public.games (
  id        text primary key,           -- e.g. 'bloque-buster'
  title     text not null,              -- 'BLOQUE BUSTER'
  short     text not null,              -- short description
  long      text not null,              -- long description
  cat       text not null,              -- category: ARCADE, PUZZLE, SHOOTER, VERSUS
  cover     text not null,              -- cover image key (e.g. 'cover-bricks')
  color     text not null,              -- theme color: cyan, magenta, green, yellow
  best      integer not null default 0, -- current best score
  plays     text not null default '0',  -- formatted play count string (e.g. '12.4K')
  created_at timestamptz default now()
);

alter table public.games enable row level security;

create policy "public select games"
  on public.games for select
  using (true);

create policy "service role write games"
  on public.games for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

### Seed data (8 rows, mirror of `app/data/games.ts`)

```sql
insert into public.games (id, title, short, long, cat, cover, color, best, plays) values
  ('bloque-buster', 'BLOQUE BUSTER', 'Rebota la pelota y destruye muros de neón.', 'Pilota una nave-paleta y rebota un núcleo de plasma para pulverizar muros de bloques cromáticos. Cada nivel reorganiza la grilla en patrones imposibles. ¿Hasta dónde llegará tu racha?', 'ARCADE', 'cover-bricks', 'cyan', 28450, '12.4K'),
  ('caida', 'CAÍDA', 'Encaja las piezas antes de que el techo te aplaste.', 'Piezas geométricas descienden desde la oscuridad. Rótalas, encájalas y limpia líneas para sobrevivir. La velocidad aumenta sin piedad cada 10 líneas.', 'PUZZLE', 'cover-tetro', 'magenta', 184220, '31.8K'),
  ('serpentina', 'SERPENTINA', 'Crece sin morder tu propia cola.', 'Una serpiente de luz recorre la grilla buscando núcleos magenta. Cada bocado la alarga y la hace más veloz. Un movimiento en falso y se devora a sí misma.', 'ARCADE', 'cover-snake', 'green', 7820, '9.1K'),
  ('gloton', 'GLOTÓN', 'Devora puntos y escapa de los fantasmas.', 'Un círculo glotón patrulla un laberinto coleccionando puntos luminosos. Cuatro espectros lo persiguen, pero cada cierto tiempo aparece una píldora que invierte los papeles.', 'ARCADE', 'cover-glot', 'yellow', 96400, '27.2K'),
  ('invasores', 'INVASORES', 'Defiende el planeta de filas alienígenas.', 'Olas de píxeles hostiles descienden formación tras formación. Mueve tu cañón en horizontal y abre fuego con precisión, antes de que toquen la superficie.', 'SHOOTER', 'cover-invaders', 'green', 54190, '18.0K'),
  ('rocas', 'ROCAS', 'Pulveriza asteroides en gravedad cero.', 'Tu nave triangular flota en vacío absoluto. Dispara y rota para dividir rocas en fragmentos cada vez más pequeños. Cuidado con los OVNIs en el horizonte.', 'SHOOTER', 'cover-rocas', 'yellow', 41200, '15.6K'),
  ('ranaria', 'RANARIA', 'Cruza la autopista de píxeles.', 'Salta entre carriles de coches a toda velocidad y troncos a la deriva en el río. Llega a los nenúfares antes de que se acabe el tiempo.', 'ARCADE', 'cover-rana', 'green', 18900, '6.4K'),
  ('duelo-pixel', 'DUELO PIXEL', 'Dos paletas. Una pelota. Reflejos máximos.', 'El duelo más puro: dos paletas verticales se enfrentan por rebotar una pelota luminosa. Modo solitario contra la CPU o partida local a dos jugadores.', 'VERSUS', 'cover-duelo', 'cyan', 24, '4.2K');
```

### TypeScript types (extend existing `app/data/types.ts`)

```typescript
interface Game {
  id: string
  title: string
  short: string
  long: string
  cat: GameFilter
  cover: string
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  best: number
  plays: string
}

type GameFilter = 'TODOS' | 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS'
```

## Implementation Plan

### Phase 1: Supabase Migration (DB)

1. Create migration file `supabase/migrations/20260728_games_catalog.sql` with table + RLS + seed
2. Run `npm run db:migrate` to apply
3. Verify with `supabase db diff` and select from `games`

### Phase 2: Data Layer (`app/data/games.ts`)

1. Replace static `GAMES` array with async functions:
   - `getGames(): Promise<Game[]>`
   - `getGameById(id: string): Promise<Game | null>`
   - `getGameBySlug(slug: string): Promise<Game | null>` — alias since `id` = slug
   - `getGamesByCategory(cat: GameFilter): Promise<Game[]>`
2. Use `createServerClient()` from `lib/supabase/server.ts`
3. Cache strategy: `no-store` (dynamic) or `revalidate` on mutation

### Phase 3: `/salon` Renovation

1. Convert `app/salon/page.tsx` to Client Component (`"use client"`)
2. State: `const [activeTab, setActiveTab] = useState<string>(firstGameId)`
3. Fetch leaderboard via Server Action `getSalonLeaderboard(gameId)` (reuses `getScoresByGame` from spec 04)
4. Render tabs from `games` list (fetched via `getGames()` in parent Server Component, passed as prop)
5. Podium + table matching `salon.jsx` template exactly:
   - Gold/silver/bronze slots for top 3
   - 12-row table with rank, player, score, date
   - "TU MEJOR MARCA EN {title}" row if authenticated (use `getUser()` from Supabase auth)
6. Styles: reuse existing `hall-tabs`, `podium`, `hall-table` CSS classes

### Phase 4: Routing Verification

1. Confirm all `/juegos/` → `/games/` and `/detalle/` → `/games/` refs updated (done)
2. Verify `app/games/[slug]/page.tsx` uses `slug` param correctly via `getGameBySlug()`
3. Verify `app/player/[id]/page.tsx` and `app/page.tsx` links point to `/games/${game.id}`

### Phase 5: Tests

1. Unit: `getGames()`, `getGameById()`, `getGameBySlug()` return expected shape
2. E2E: `/salon` loads, tabs switch, leaderboard renders, "TU MEJOR MARCA" appears for auth user
3. Build + lint pass

## Acceptance Criteria

- [ ] `npm run db:migrate` creates `games` table with 8 seeded rows
- [ ] `app/data/games.ts` exports async functions reading from Supabase (no static `GAMES` array)
- [ ] `/salon` renders as Client Component with client-side tabs (no URL change)
- [ ] Tab switch fetches leaderboard for that game via Server Action
- [ ] Podium (top 3) + table (12 rows) + "TU MEJOR MARCA" row match `salon.jsx` visual
- [ ] All routing uses `/games/${game.id}` consistently
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` passes

## Decisions Taken & Discarded

| Decisión | Justificación |
|----------|---------------|
| **Mirror static `GAMES` schema 1:1** | Zero mapping layer, simple migration, template (`salon.jsx`, `biblioteca.jsx`) uses same field names |
| **`id` = slug (text PK)** | Keeps routing simple `/games/[slug]`, no extra column, matches existing static `id` values |
| **`plays` as text** | Formatted strings like `'12.4K'` are display-only; no arithmetic needed |
| **Client-side tabs on `/salon`** | Template uses `useState` tabs; avoids SSR hydration mismatch, enables instant switch |
| **Server Action for leaderboard** | Reuses `getScoresByGame` from spec 04; keeps data fetching server-side |
| **RLS: public select, service_role write** | Games catalog is read-only for public; admin writes via service role (future CMS) |

## Identified Risks

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Supabase local not running** | Migration fails | `npm run db:status` verifies; `npm run db:start` if needed |
| **Hydration mismatch on `/salon`** | Client tabs vs SSR | Page is Client Component; data passed as prop from parent→no searchParams |
| **Auth "TU MEJOR MARCA" row** | Requires `getUser()` | Use existing auth helper from spec 04; fallback gracefully if no user |
| **Cover images missing** | Visual regression | Covers referenced by key; ensure `public/covers/` has all 8 files |
| **RLS blocking seed** | Migration fails | Seed runs as `service_role` (migration role) — use `auth.role() = 'service_role'` policy |

---

**¿Procedo con Implementation Plan Phase 1 (Supabase Migration)?**