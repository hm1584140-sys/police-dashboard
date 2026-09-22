-- Owner Control Center + Content Management
-- Run once in Supabase SQL Editor.

alter table public.pd_accounts
  add column if not exists discord_name text not null default '',
  add column if not exists is_banned boolean not null default false,
  add column if not exists ban_reason text not null default '',
  add column if not exists banned_at timestamptz,
  add column if not exists banned_by text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_login_at timestamptz;

alter table public.pd_sessions
  add column if not exists discord_name text not null default '';

create table if not exists public.pd_ban_appeals (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  discord_name text not null default '',
  message text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  owner_response text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pd_messages (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('user','online','banned','all')),
  recipient_username text,
  title text not null default '',
  body text not null,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.pd_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  icon text not null default 'FileText',
  page_type text not null default 'content',
  renderer text not null default 'cms',
  is_visible boolean not null default true,
  is_system boolean not null default false,
  sort_order integer not null default 100,
  sector_id text,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pd_roster_columns (
  id uuid primary key default gen_random_uuid(),
  sector_id text not null,
  column_key text not null,
  label text not null,
  kind text not null default 'text' check (kind in ('text','number','select')),
  options jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (sector_id, column_key)
);

alter table public.officers
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

create table if not exists public.strikes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text not null default '',
  points integer not null default 0,
  is_critical boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pd_ban_appeals enable row level security;
alter table public.pd_messages enable row level security;
alter table public.pd_pages enable row level security;
alter table public.pd_roster_columns enable row level security;
alter table public.strikes enable row level security;

drop policy if exists "pd_pages_public_read" on public.pd_pages;
create policy "pd_pages_public_read"
on public.pd_pages for select
to anon, authenticated
using (is_visible = true);

drop policy if exists "pd_roster_columns_public_read" on public.pd_roster_columns;
create policy "pd_roster_columns_public_read"
on public.pd_roster_columns for select
to anon, authenticated
using (true);

drop policy if exists "strikes_public_read" on public.strikes;
create policy "strikes_public_read"
on public.strikes for select
to anon, authenticated
using (true);

-- Public website cannot mutate any of the owner-managed tables directly.
-- Server routes use SUPABASE_SECRET_KEY and bypass RLS.

insert into public.pd_pages
(slug,title,description,icon,page_type,renderer,is_visible,is_system,sort_order,blocks)
values
(
  'sops',
  'كتيب البروتوكولات',
  'المرجع المعتمد للبروتوكولات والقواعد الداخلية.',
  'BookMarked',
  'handbook',
  'cms',
  true,
  true,
  10,
  $cms$
  [
    {"type":"heading","text":"كتيب بروتوكولات وقواعد جهاز الشرطة"},
    {"type":"paragraph","text":"المرجعي المعتمد (SOPs)"},
    {"type":"callout","tone":"info","title":"القواعد العامة والولايات","text":"قطاعات ولاية سان اندرياس تنقسم إلى SASP للخطوط السريعة، LSPD لقسم مشن روو والمدينة، وBCSO لتأمين الضواحي والمناطق الريفية. الهدف الأسمى هو حماية النظام والأمن والمواطنين واحترام التسلسل القيادي."},
    {"type":"callout","tone":"warn","title":"بروتوكولات الكلبشة","text":"تُمنع الكلبشة أثناء الاستيقاف المروري العادي. الحالات المسموحة: استسلام الشخص، بعد استخدام التيزر، أو بعد النطح والسيطرة الجسدية."},
    {"type":"list","title":"بروتوكول استخدام التيزر","items":["بعد 30 ثانية هروب مستمر على الأقدام مع 3 تحذيرات شفهية، وبين التحذير والآخر 5 ثوانٍ.","يمكن استخدامه مباشرة في النطح والعرقلة، التدخل الخارجي لتهريب الشخص، إشهار سلاح أبيض، أو الاقتراب من المسطحات المائية."]},
    {"type":"callout","tone":"danger","title":"إطلاق النار على المسلحين","text":"يتم التحذير شفهياً أولاً، ثم الطلقات التحذيرية على الأطراف بعد 5 ثوانٍ بحد أقصى 3 طلقات. إذا استمر التهديد يتم التنبيه وإطلاق النار بشكل متقطع بمعدل طلقة واحدة كل ثانية."},
    {"type":"callout","tone":"info","title":"الاعتقال وحقوق ميراندا","text":"يجب ذكر أعلى تهمة وقراءة الحقوق نصاً. مثال: تم إلقاء القبض عليك من شرطة لوس سانتوس بتهمة (...) يحق لك التزام الصمت، أي شيء تقوله سيتم استخدامه ضدك في المحكمة، ويحق لك تعيين محامي وفي حال عدم قدرتك سيتم تعيين محامي من قبل الشرطة."},
    {"type":"callout","tone":"warn","title":"المطاردات و PIT","text":"تحديث الدسباتش يبدأ كل 10 ثوانٍ ثم كل 30 ثانية من الدورية الثانية. صدم المركبات مسموح في حالات محددة مع إذن المسؤول، سرعة لا تتجاوز 150km/h، خلو الشارع من المدنيين، ووجود وحدة دعم."},
    {"type":"table","title":"القوة الاستيعابية للسرقات","columns":["نوع الهدف","القوة المطلوبة"],"rows":[["بقالة","4 وحدات"],["منزل","6 وحدات"],["منزل كبير","8 وحدات"],["مصنع أموال","8 وحدات + 1 دورية فانتوم Phantom"],["مصرف / بنك","9 وحدات + 1 دورية فانتوم Phantom"]]},
    {"type":"callout","tone":"danger","title":"مفشلات الهروب الآمن","text":"تشمل نزول الشخص بسلاح، تغيير المركبة، استخدام سيارات السوبر على الطرق السريعة، تهديد المدنيين أو عكس السير، القفزات الخطيرة، الأماكن الضيقة والأنفاق، ورش التصليح، الأوف رود وتسلق الجبال، التدخل الخارجي، الصدم على الأرصفة، العكسات، ولبس عدة الغوص والباراشوت."},
    {"type":"paragraph","text":"الحد الأقصى الكلي للهروب 10 دقائق، وأي تفصيل يحتاج تعديل يمكن تغييره مباشرة من لوحة المالك."}
  ]
  $cms$::jsonb
),
('radio','بروتوكولات اللاسلكي','جداول الأكواد والاتصالات اللاسلكية.','Radio','table','radio',true,true,20,'[]'::jsonb),
('roster','كشف القوات الرقمي','الجدول الرئيسي للأفراد والرتب والقطاعات.','Users','roster','roster',true,true,30,'[]'::jsonb),
('outfits','دليل ملابس الرتب','دليل الـ Decals والـ Textures لكل رتبة.','Shirt','table','outfits',true,true,40,'[]'::jsonb),
('strikes','كتيب الجزاءات','نظام الجزاءات والمخالفات العسكرية.','Gavel','table','strikes',true,true,50,'[]'::jsonb),
('violations','المخالفات المرورية','دليل درجات التهم والمخالفات والعقوبات.','TrafficCone','table','violations',true,true,60,'[]'::jsonb)
on conflict (slug) do nothing;
