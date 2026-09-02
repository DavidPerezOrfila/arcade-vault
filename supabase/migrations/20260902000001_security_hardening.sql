-- Spec 11: revoca EXECUTE en funciones SECURITY DEFINER expuestas
-- vía PostgREST (/rest/v1/rpc). El trigger corre como owner del
-- trigger, no como caller, por lo que el flujo de signup no cambia.

revoke execute on function public.handle_new_user()
  from anon, authenticated, public;

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable()
      from anon, authenticated, public;
  end if;
end $$;
