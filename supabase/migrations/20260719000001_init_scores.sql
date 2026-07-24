-- SPEC 04 · initial schema: scores table
-- Idempotent only under `supabase db reset` (not for repeated `db push` runs).

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
