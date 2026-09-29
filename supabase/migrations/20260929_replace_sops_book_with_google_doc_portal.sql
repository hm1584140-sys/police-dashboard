update public.pd_pages
set title='دليل الـ SOPs',
    description='نسخة منظمة من مستند Google الرسمي مع تنقل سريع بين الأقسام.',
    renderer='google-sops',
    is_visible=true,
    is_system=true,
    sort_order=15,
    updated_at=now()
where slug='sops-book';

insert into public.pd_pages
  (slug,title,description,icon,page_type,renderer,is_visible,is_system,sort_order,sector_id,blocks)
values
  ('future-book','كتاب فارغ','كتاب إلكتروني محفوظ للاستخدام المستقبلي.','BookMarked','handbook','book',false,true,16,null,'[]'::jsonb)
on conflict (slug) do update
set title=excluded.title,
    description=excluded.description,
    renderer='book',
    is_visible=false,
    is_system=true,
    blocks='[]'::jsonb,
    updated_at=now();