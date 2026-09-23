insert into public.pd_pages
  (slug,title,description,icon,page_type,renderer,is_visible,is_system,sort_order,sector_id,blocks)
values
  ('sops-book','كتاب الـ SOPs','نسخة كتاب إلكتروني حقيقي بتقليب الصفحات من داخل الموقع.','BookMarked','handbook','book',false,true,15,null,'[]'::jsonb)
on conflict (slug) do update
set renderer='book',
    page_type='handbook',
    is_system=true,
    updated_at=now();