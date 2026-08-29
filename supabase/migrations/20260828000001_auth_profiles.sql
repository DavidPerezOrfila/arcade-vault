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