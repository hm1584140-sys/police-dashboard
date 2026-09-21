-- Sector management
-- Run this file once in Supabase SQL Editor.

create table if not exists public.pd_sectors (
  id text primary key,
  name text not null,
  arabic_name text not null,
  description text not null default '',
  tagline text not null default '',
  theme jsonb not null default '{}'::jsonb,
  ranks jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pd_sectors enable row level security;

drop policy if exists "pd_sectors_public_read" on public.pd_sectors;

create policy "pd_sectors_public_read"
on public.pd_sectors
for select
to anon, authenticated
using (is_visible = true);

-- LSPD
insert into public.pd_sectors
(id, name, arabic_name, description, tagline, theme, ranks, is_visible, is_template)
values (
'LSPD',
'Los Santos Police Dept.',
'شرطة لوس سانتوس',
'قطاع شرطة لوس سانتوس ومسؤوليات المدينة والمناطق الحضرية.',
'Dark Navy • Cyan Neon',
jsonb_build_object('vars', jsonb_build_object(
'--background','oklch(0.15 0.045 264)',
'--card','oklch(0.21 0.05 264)',
'--popover','oklch(0.19 0.05 264)',
'--primary','oklch(0.74 0.16 220)',
'--primary-foreground','oklch(0.14 0.04 264)',
'--accent','oklch(0.34 0.1 262)',
'--muted','oklch(0.25 0.05 264)',
'--neon','oklch(0.8 0.17 218)',
'--ring','oklch(0.74 0.16 220)',
'--border','oklch(0.45 0.1 235 / 45%)'
)),
to_jsonb(array[
'LAPD Commissioner','Chief of Police','Assistant Chief','Deputy Chief','Commander',
'Captain','Lieutenant II','Lieutenant','Sergeant II','Sergeant','Senior Lead Officer',
'Senior Officer','Officer III','Officer II','Officer I','Cadet'
]),
true,false
)
on conflict (id) do update set
name=excluded.name,
arabic_name=excluded.arabic_name,
description=excluded.description,
tagline=excluded.tagline,
theme=excluded.theme,
ranks=excluded.ranks;

-- BCSO
insert into public.pd_sectors
(id, name, arabic_name, description, tagline, theme, ranks, is_visible, is_template)
values (
'BCSO',
'Blaine County Sheriff',
'مكتب شريف مقاطعة بلين',
'قطاع شريف مقاطعة بلين والمسؤوليات الريفية والضواحي.',
'Desert Charcoal • Gold Amber',
jsonb_build_object('vars', jsonb_build_object(
'--background','oklch(0.17 0.018 70)',
'--card','oklch(0.22 0.022 68)',
'--popover','oklch(0.2 0.022 68)',
'--primary','oklch(0.79 0.14 80)',
'--primary-foreground','oklch(0.16 0.02 70)',
'--accent','oklch(0.34 0.05 70)',
'--muted','oklch(0.26 0.025 70)',
'--neon','oklch(0.82 0.15 82)',
'--ring','oklch(0.79 0.14 80)',
'--border','oklch(0.5 0.07 80 / 42%)'
)),
to_jsonb(array[
'Sheriff','UnderSheriff','Chief Deputy','Captain','Lieutenant II','Lieutenant',
'Sergeant II','Sergeant','Senior Lead Deputy','Senior Deputy','Deputy II','Deputy I','Cadet'
]),
true,false
)
on conflict (id) do update set
name=excluded.name,
arabic_name=excluded.arabic_name,
description=excluded.description,
tagline=excluded.tagline,
theme=excluded.theme,
ranks=excluded.ranks;

-- SASP
insert into public.pd_sectors
(id, name, arabic_name, description, tagline, theme, ranks, is_visible, is_template)
values (
'SASP',
'San Andreas State Police',
'شرطة ولاية سان أندرياس',
'شرطة ولاية سان أندرياس والطرق السريعة والعمليات على مستوى الولاية.',
'Matte Black • Silver / Royal Blue',
jsonb_build_object('vars', jsonb_build_object(
'--background','oklch(0.13 0.008 260)',
'--card','oklch(0.18 0.012 260)',
'--popover','oklch(0.16 0.012 260)',
'--primary','oklch(0.58 0.18 268)',
'--primary-foreground','oklch(0.96 0.01 260)',
'--accent','oklch(0.3 0.04 265)',
'--muted','oklch(0.23 0.012 260)',
'--neon','oklch(0.85 0.025 255)',
'--ring','oklch(0.58 0.18 268)',
'--border','oklch(0.55 0.03 260 / 40%)'
)),
to_jsonb(array[
'Commissioner','Assistant Commissioner','Deputy Commissioner','Chief of CHP','Assistant Chief',
'Captain','Lieutenant II','Lieutenant','Sergeant II','Sergeant','Senior Lead Officer',
'Senior Officer','Officer III','Officer II','Officer I','Cadet'
]),
true,false
)
on conflict (id) do update set
name=excluded.name,
arabic_name=excluded.arabic_name,
description=excluded.description,
tagline=excluded.tagline,
theme=excluded.theme,
ranks=excluded.ranks;

-- Hidden ready-made template: Highway Patrol
insert into public.pd_sectors
(id, name, arabic_name, description, tagline, theme, ranks, is_visible, is_template)
values (
'HIGHWAY_PATROL',
'Highway Patrol',
'دورية الطرق السريعة',
'قطاع جاهز للفتح مستقبلاً، مع رتب وثيم محفوظة مسبقاً.',
'State Highway • Royal Blue',
jsonb_build_object('vars', jsonb_build_object(
'--background','oklch(0.13 0.008 260)',
'--card','oklch(0.18 0.012 260)',
'--popover','oklch(0.16 0.012 260)',
'--primary','oklch(0.58 0.18 268)',
'--primary-foreground','oklch(0.96 0.01 260)',
'--accent','oklch(0.3 0.04 265)',
'--muted','oklch(0.23 0.012 260)',
'--neon','oklch(0.85 0.025 255)',
'--ring','oklch(0.58 0.18 268)',
'--border','oklch(0.55 0.03 260 / 40%)'
)),
to_jsonb(array[
'Commissioner','Colonel','Major','Captain','Lieutenant','Sergeant',
'Senior Trooper','Trooper','Cadet'
]),
false,true
)
on conflict (id) do nothing;

-- Hidden ready-made template: County Sheriff
insert into public.pd_sectors
(id, name, arabic_name, description, tagline, theme, ranks, is_visible, is_template)
values (
'COUNTY_SHERIFF',
'County Sheriff',
'شريف المقاطعة',
'قطاع جاهز للفتح مستقبلاً، مع رتب وثيم محفوظة مسبقاً.',
'County • Gold Amber',
jsonb_build_object('vars', jsonb_build_object(
'--background','oklch(0.17 0.018 70)',
'--card','oklch(0.22 0.022 68)',
'--popover','oklch(0.2 0.022 68)',
'--primary','oklch(0.79 0.14 80)',
'--primary-foreground','oklch(0.16 0.02 70)',
'--accent','oklch(0.34 0.05 70)',
'--muted','oklch(0.26 0.025 70)',
'--neon','oklch(0.82 0.15 82)',
'--ring','oklch(0.79 0.14 80)',
'--border','oklch(0.5 0.07 80 / 42%)'
)),
to_jsonb(array[
'Sheriff','Undersheriff','Chief Deputy','Major','Captain','Lieutenant',
'Sergeant','Corporal','Deputy II','Deputy I','Cadet'
]),
false,true
)
on conflict (id) do nothing;
