-- Lock sensitive dashboard tables so they are only reachable through server routes.
drop policy if exists "pd_accounts_public_all" on public.pd_accounts;
drop policy if exists "pd_accounts_write_all" on public.pd_accounts;
drop policy if exists "read_own_account_only." on public.pd_accounts;

drop policy if exists "allow_public_read_sessions" on public.pd_sessions;
drop policy if exists "pd_sessions_public_all" on public.pd_sessions;
drop policy if exists "pd_sessions_write_all" on public.pd_sessions;

drop policy if exists "pd_sectors_admin_all" on public.pd_sectors;
drop policy if exists "pd_sectors_write_all" on public.pd_sectors;
drop policy if exists "pd_sectors_read_all" on public.pd_sectors;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
