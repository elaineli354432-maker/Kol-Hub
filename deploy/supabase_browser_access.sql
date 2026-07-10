grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.app_state to anon, authenticated;

drop policy if exists app_state_public_select on public.app_state;
create policy app_state_public_select
on public.app_state
for select
to anon, authenticated
using (id = 'brandream-main');

drop policy if exists app_state_public_insert on public.app_state;
create policy app_state_public_insert
on public.app_state
for insert
to anon, authenticated
with check (id = 'brandream-main');

drop policy if exists app_state_public_update on public.app_state;
create policy app_state_public_update
on public.app_state
for update
to anon, authenticated
using (id = 'brandream-main')
with check (id = 'brandream-main');
