-- Audit log for owner visibility into administrative changes.
create table if not exists public.pd_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_username text not null default '',
  actor_discord text not null default '',
  actor_role text not null default '',
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.pd_audit_logs enable row level security;

create index if not exists pd_audit_logs_created_at_idx
  on public.pd_audit_logs (created_at desc);

create index if not exists pd_audit_logs_actor_username_idx
  on public.pd_audit_logs (actor_username);
