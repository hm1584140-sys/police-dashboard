alter table public.pd_accounts
  add column if not exists banned_until timestamptz,
  add column if not exists ban_scope text not null default 'account';

alter table public.pd_sectors
  add column if not exists display_code text;

update public.pd_sectors
set display_code = id
where display_code is null or btrim(display_code) = '';

create table if not exists public.pd_custom_lists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  sector_id text,
  columns jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pd_custom_list_rows (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.pd_custom_lists(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pd_custom_list_rows_list_id_idx
  on public.pd_custom_list_rows(list_id, created_at);

alter table public.pd_custom_lists enable row level security;
alter table public.pd_custom_list_rows enable row level security;

revoke all on public.pd_custom_lists from anon, authenticated;
revoke all on public.pd_custom_list_rows from anon, authenticated;