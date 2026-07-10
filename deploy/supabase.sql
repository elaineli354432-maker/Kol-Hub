create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_state enable row level security;

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

insert into public.app_state (id, payload)
values (
  'brandream-main',
  '{"version":"db-seed-1","influencers":[],"brands":[]}'::jsonb
)
on conflict (id) do nothing;
