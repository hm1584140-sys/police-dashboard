create table if not exists public.pd_site_overrides (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  element_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now(),
  unique(scope, element_key)
);

alter table public.pd_site_overrides enable row level security;
revoke all on public.pd_site_overrides from anon, authenticated;
create index if not exists pd_site_overrides_scope_idx on public.pd_site_overrides(scope);