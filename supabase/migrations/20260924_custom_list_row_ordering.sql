alter table public.pd_custom_list_rows add column if not exists sort_order double precision not null default 0;
with ranked as (
  select id, row_number() over (partition by list_id order by created_at, id) as rn
  from public.pd_custom_list_rows
)
update public.pd_custom_list_rows r
set sort_order = ranked.rn
from ranked
where ranked.id = r.id and (r.sort_order = 0 or r.sort_order is null);
create index if not exists pd_custom_list_rows_order_idx on public.pd_custom_list_rows(list_id, sort_order);