create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_state enable row level security;

insert into public.app_state (id, payload)
values (
  'brandream-main',
  '{"version":"db-seed-1","influencers":[],"brands":[]}'::jsonb
)
on conflict (id) do nothing;
