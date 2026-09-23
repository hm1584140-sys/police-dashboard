alter table public.pd_accounts
  add column if not exists permissions jsonb not null default '[]'::jsonb;

create table if not exists public.pd_chat_settings (
  id text primary key default 'global',
  is_open boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.pd_chat_settings (id,is_open)
values ('global',true)
on conflict (id) do nothing;

create table if not exists public.pd_chat_messages (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  discord_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists pd_chat_messages_created_at_idx
  on public.pd_chat_messages(created_at desc);

create table if not exists public.pd_chat_restrictions (
  username text primary key,
  muted boolean not null default false,
  timeout_until timestamptz,
  reason text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.pd_chat_settings enable row level security;
alter table public.pd_chat_messages enable row level security;
alter table public.pd_chat_restrictions enable row level security;

revoke all on public.pd_chat_settings from anon, authenticated;
revoke all on public.pd_chat_messages from anon, authenticated;
revoke all on public.pd_chat_restrictions from anon, authenticated;
