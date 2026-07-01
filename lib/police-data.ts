// =====================================================================
// بيانات بوابة عمليات جهاز الشرطة - SOPs & Operations Portal Data
// =====================================================================

export type RosterRow = {
  rank: string
  callSigns: string
  note?: string
}

// ---------------------------------------------------------------------
// LSPD Roster (Squad Alpha / Bravo)
// ---------------------------------------------------------------------
export type LspdMember = {
  role: string
  name: string
  callSign?: string
}

export const lspdSquadAlpha: { group: string; members: LspdMember[] }[] = [
  {
    group: 'القيادة',
    members: [{ role: 'Sergeant', name: 'Harvey Specter', callSign: '#402' }],
  },
  {
    group: 'Senior Lead Officers',
    members: [
      { role: 'Senior Lead Officer', name: 'John Parker', callSign: '#494' },
      { role: 'Senior Lead Officer', name: 'Leon Kennedy', callSign: '#469' },
      { role: 'Senior Lead Officer', name: 'Hassan Asiri' },
    ],
  },
  {
    group: 'الأفراد',
    members: [
      { role: 'Senior Officer', name: 'Mushabab', callSign: '#412' },
      { role: 'Senior Officer', name: 'Ahmed', callSign: '#411' },
      { role: 'Senior Officer', name: 'Christopher Miller', callSign: '#401' },
      { role: 'Officer III', name: 'Michael' },
      { role: 'Officer III', name: 'Ziyad QHT', callSign: '#499' },
      { role: 'Officer III', name: 'Sultan', callSign: '#404' },
      { role: 'Officer II', name: 'Martin', callSign: '#410' },
      { role: 'Officer II', name: 'William', callSign: '#420' },
      { role: 'Officer II', name: 'Nick Fury' },
      { role: 'Officer II', name: 'Louis Jones' },
      { role: 'Officer I', name: 'Saleh Cooper' },
      { role: 'Cadet', name: 'Lost Cookl', callSign: '#506' },
    ],
  },
]

export const lspdBadges: { code: string; label: string; req: string }[] = [
  { code: 'Air-1', label: 'وحدة الطيران', req: 'Officer II+' },
  { code: 'MCU', label: 'وحدة الدراجات', req: 'Officer I+' },
  { code: 'IA', label: 'الرقابة الداخلية', req: 'Senior Officer+' },
  { code: 'FTO', label: 'ضابط التدريب الميداني', req: 'Officer I+' },
  { code: 'SWAT', label: 'القوات الخاصة', req: 'Officer I+' },
]

export const lspdInterceptors: { code: string; car: string }[] = [
  { code: 'INT 1', car: 'Mustang Shelby GT350' },
  { code: 'INT 2', car: 'Dodge Challenger Demon' },
  { code: 'INT 3', car: 'Chevrolet Corvette C7' },
  { code: 'INT 4', car: 'Dodge Charger Hellcat' },
]

export const lspdVehiclePermits: { rank: string; cars: string }[] = [
  { rank: 'القيادة والإشراف', cars: 'Ford Vic, Tau, Exp, Cap, Charger, Dodge 2' },
  { rank: 'الأفسرز (Officers)', cars: 'Ford Vic, Exp, Tau, Cap, Char, Tah' },
  { rank: 'المستجدين (Cadet)', cars: 'Ford Vic, Cap, Tah, Exp, Char, Tau' },
]

export const lspdGearPermits: { rank: string; gear: string }[] = [
  {
    rank: 'القيادة والسينيور',
    gear: 'Glock, 10 Armor, 1 Taser, 1 Handcuffs + Heavy Armor',
  },
  { rank: 'الأفسرز والمستجدين', gear: 'Glock, 10 Armor, 1 Taser, 1 Handcuffs' },
]

// ---------------------------------------------------------------------
// BCSO Roster
// ---------------------------------------------------------------------
export const bcsoRoster: RosterRow[] = [
  { rank: 'Sheriff', callSigns: '#100' },
  { rank: 'UnderSheriff', callSigns: '#101, #102, #103' },
  { rank: 'Chief Deputy', callSigns: '#104' },
  { rank: 'Captain', callSigns: '#201, #202, #203, #204' },
  { rank: 'Lieutenant II', callSigns: '#205, #206, #207, #208' },
  { rank: 'Lieutenant', callSigns: '#209, #210, #211, #212' },
  { rank: 'Sergeant II', callSigns: '#220, #221, #222, #223' },
  { rank: 'Sergeant', callSigns: '#301, #302, #303, #304' },
  {
    rank: 'Senior Lead Deputy',
    callSigns: '#305 فما فوق',
    note: 'نظام الأرقام التلقائي',
  },
  { rank: 'Senior Deputy', callSigns: '—' },
  { rank: 'Deputy II', callSigns: '—' },
  { rank: 'Deputy I', callSigns: '—' },
  { rank: 'Cadet', callSigns: '#501 — #510' },
]

export const bcsoGearPermits: { rank: string; gear: string }[] = [
  { rank: 'القيادة والسارجنت', gear: 'All Weapons, 10 Armor Heavy' },
  { rank: 'السينيور والليد', gear: 'Heavy Pistol, 5-10 Armor' },
  { rank: 'الديبوتي والمستجدين', gear: 'Glock, 10 Armor' },
]

// ---------------------------------------------------------------------
// SASP Roster
// ---------------------------------------------------------------------
export const saspRoster: RosterRow[] = [
  { rank: 'Commissioner', callSigns: '#100' },
  { rank: 'Assistant Commissioner', callSigns: '#101' },
  { rank: 'Deputy Commissioner', callSigns: '#102' },
  { rank: 'Chief of CHP', callSigns: '#103' },
  { rank: 'Assistant Chief', callSigns: '#104' },
  { rank: 'Captain', callSigns: '#201, #202, #203' },
  { rank: 'Lieutenant II', callSigns: '#205, #206, #207' },
  { rank: 'Lieutenant', callSigns: '#208, #209, #210' },
  { rank: 'Sergeant II', callSigns: '#211, #212, #213' },
  { rank: 'Sergeant', callSigns: '#301, #302, #303' },
  { rank: 'Senior Lead Officer', callSigns: '#304, #305, #306' },
  { rank: 'Senior Officer', callSigns: '#401' },
  { rank: 'Officer III', callSigns: '#402, #403' },
  { rank: 'Officer II', callSigns: '#408, #409, #410, #411, #412' },
  { rank: 'Officer I', callSigns: '#413, #414, #415, #416, #417, #418' },
  { rank: 'Cadet', callSigns: '#501 — #510' },
]

// ---------------------------------------------------------------------
// Outfits (shared columns) - editable empty item numbers
// ---------------------------------------------------------------------
export const outfitColumns = [
  'Jackets',
  'Shirts',
  'Hands',
  'Legs',
  'Shoes',
  'Bags',
  'Body Armor',
  'Scarfs',
  'Hat',
  'Mask',
  'Decals',
] as const

// ---------------------------------------------------------------------
// Capacity tables
// ---------------------------------------------------------------------
export const pursuitCapacity = [
  { type: 'القوة الافتتاحية للمطاردة', units: '3 دوريات كحد أقصى' },
  { type: 'إضافة دورية رابعة (سارجنت+)', units: '4 وحدات كحد أقصى' },
]

export const robberyCapacity = [
  { type: 'بقالة', units: '4 وحدات' },
  { type: 'منزل', units: '6 وحدات' },
  { type: 'منزل كبير', units: '8 وحدات' },
  { type: 'مصنع أموال', units: '8 وحدات + 1 دورية فانتوم Phantom' },
  { type: 'مصرف / بنك', units: '9 وحدات + 1 دورية فانتوم Phantom' },
]

// ---------------------------------------------------------------------
// Service Stripes
// ---------------------------------------------------------------------
export const serviceStripes = [
  { label: 'شارة شهرين', months: '2 أشهر' },
  { label: 'شارة 2.5 شهر', months: '2.5 شهر' },
  { label: 'شارة 5 أشهر', months: '5 أشهر' },
  { label: 'شارة 6 أشهر', months: '6 أشهر' },
  { label: 'شارة 12 شهراً', months: '12 شهر' },
  {
    label: 'الأجنحة الملكية الكاملة (All Wings)',
    months: 'منحة الإدارة العليا',
    elite: true,
  },
]

export const rankInsignia = [
  { rank: 'Captain', placement: 'الس����رة + الأكمام القصيرة + الطويلة', item: 'Item 44', tex: 'Textures 1' },
  { rank: 'Lieutenant', placement: 'السترة + الأكمام القصيرة + الطويلة', item: 'Item 44', tex: 'Textures 1' },
  { rank: 'Sergeant II & I', placement: 'السترة + الأكمام القصيرة + الطويلة', item: 'Item 44', tex: 'Textures 0' },
  { rank: 'Senior Lead & Senior Officer', placement: 'السترة + الأكمام القصيرة + الطويلة', item: 'Item 44', tex: 'Textures 0' },
  { rank: 'Officer III (قصيرة)', placement: 'الأكمام القصيرة', item: 'Item 8', tex: 'Textures 3' },
  { rank: 'Officer III (طويلة)', placement: 'الأكمام الطويلة', item: 'Item 11', tex: 'Textures 5' },
]

// ---------------------------------------------------------------------
// Strike Book
// ---------------------------------------------------------------------
export type Strike = {
  code: string
  desc: string
  points: number
  critical?: boolean
}

export const strikes: Strike[] = [
  { code: '1.1', desc: 'عدم احترام الشرطة أو زميل بالخدمة', points: 5 },
  { code: '1.2', desc: 'عدم ترك مسافة آمنة أثناء المطاردة', points: 2 },
  { code: '1.3', desc: 'تهريب شخص مطلوب للأمن', points: 15 },
  { code: '1.4', desc: 'تحرير الرهائن بدون إذن مسبق أو الفشل في تحريرها', points: 10 },
  {
    code: '1.5',
    desc: 'مصادرة سلاح مواطن بخلاف الحالات القانونية (تهمة جنائية، إخراج/استخدام السلاح، أو أكثر من 24 طلقة)',
    points: 8,
  },
  { code: '1.6', desc: 'مخالفة البروتوكولات واللوائح العامة', points: 10 },
  { code: '1.7', desc: 'عدم التقيد بالمركبات المخصصة والمصرحة للرتبة', points: 10 },
  { code: '1.8', desc: 'مخالفة الملابس العسكرية الرسمية', points: 5 },
  { code: '1.9', desc: 'مخالفة استخدام الأسلحة والتسليح', points: 8 },
  { code: '1.10', desc: 'التأخر عن مواعيد الخدمة أو الانصراف المبكر بدون إذن', points: 5 },
  { code: '1.11', desc: 'عصيان أوامر العمليات والدسباتش', points: 15 },
  { code: '1.12', desc: 'المناقشة والجدال أمام الأفراد والمدنيين', points: 10 },
  { code: '1.13', desc: 'استخدام ألفاظ غير لائقة أثناء الخدمة', points: 6 },
  { code: '1.14', desc: 'إهمال تحديث الدسباتش أثناء البلاغات والمطاردات', points: 8 },
  {
    code: '1.15',
    desc: 'الإساءة لوزارة الداخلية عبر البثوث أو وسائل التواصل',
    points: 30,
    critical: true,
  },
  {
    code: '1.16',
    desc: 'إطلاق النار المباشر على شرطي آخر (فصل ومحاكمة جنائية عاجلة)',
    points: 30,
    critical: true,
  },
  { code: '1.17', desc: 'مغادرة موقع البلاغ قبل تأمينه بالكامل', points: 8 },
  { code: '1.18', desc: 'التعامل مع البلاغ دون إبلاغ العمليات', points: 7 },
  { code: '1.19', desc: 'استخدام مركبة فانتوم بدون تصريح', points: 10 },
  { code: '1.20', desc: 'الدخول في مطاردة بأكثر من القوة الاستيعابية المسموحة', points: 8 },
  { code: '1.21', desc: 'تنفيذ مناورة PIT بدون إذن المسؤول', points: 12 },
  { code: '1.22', desc: 'تنفيذ PIT بسرعة تتجاوز 150 كم/س', points: 12 },
  { code: '1.23', desc: 'تنفيذ PIT بوجود مدنيين في محيط العملية', points: 14 },
  { code: '1.24', desc: 'مطاردة دون وجود وحدة دعم مرافقة', points: 8 },
  { code: '1.25', desc: 'إطلاق النار بخلاف الحالات الثلاث المحددة بالميدان', points: 20 },
  { code: '1.26', desc: 'إطلاق طلقات تحذيرية بأكثر من العدد المسموح (3)', points: 10 },
  { code: '1.27', desc: 'عدم إعطاء التحذيرات الشفهية قبل إطلاق النار', points: 12 },
  { code: '1.28', desc: 'إطلاق النار على شخص أعزل', points: 25 },
  { code: '1.29', desc: 'إطلاق النار على مركبة بخلاف الحالات المصرح بها', points: 18 },
  { code: '1.30', desc: 'استهداف القائد بدلاً من الإطارات عند محاولة الدهس', points: 16 },
  { code: '1.31', desc: 'الكلبشة في استيقاف مروري عادي', points: 8 },
  { code: '1.32', desc: 'الكلبشة بدون استيفاء إحدى الحالات الثلاث المصرح بها', points: 10 },
  { code: '1.33', desc: 'استخدام التيزر قبل اكتمال 30 ثانية هروب', points: 8 },
  { code: '1.34', desc: 'استخدام التيزر دون إطلاق التحذيرات الثلاثة', points: 8 },
  { code: '1.35', desc: 'استخدام التيزر على شخص أعزل دون مبرر قانوني', points: 15 },
  { code: '1.36', desc: 'حمل سلاح ثقيل بدون إذن رسمي', points: 15 },
  { code: '1.37', desc: 'استخدام عتاد غير مصرح به للرتبة', points: 10 },
  { code: '1.38', desc: 'عدم قراءة حقوق ميراندا عند الاعتقال', points: 10 },
  { code: '1.39', desc: 'سجن مواطن بدون وجود أدلة قاطعة', points: 20 },
  { code: '1.40', desc: 'عدم ذكر أعلى تهمة عند الاعتقال', points: 6 },
  { code: '1.41', desc: 'إجراء تفتيش بدون مبرر قانوني', points: 10 },
  { code: '1.42', desc: 'فك الكلبشة بطريقة غير آمنة داخل المركز', points: 6 },
  { code: '1.43', desc: 'إساءة معاملة المعتقلين', points: 18 },
  { code: '1.44', desc: 'تزوير محضر أو تقرير ميداني', points: 22 },
  { code: '1.45', desc: 'إخفاء أدلة أو التلاعب بمسرح الجريمة', points: 22 },
  { code: '1.46', desc: 'تسريب معلومات داخلية أو سرية', points: 25 },
  { code: '1.47', desc: 'استغلال الصلاحيات لمصلحة شخصية', points: 20 },
  { code: '1.48', desc: 'قبول رشوة أو محاولة الحصول عليها', points: 30, critical: true },
  { code: '1.49', desc: 'التواطؤ مع جهة إجرامية', points: 30, critical: true },
  { code: '1.50', desc: 'الغياب عن الخدمة بدون إذن مسبق', points: 8 },
  { code: '1.51', desc: 'ترك السلاح أو العتاد دون تأمين', points: 10 },
  { code: '1.52', desc: 'إتلاف ممتلكات الجهاز بإهمال', points: 12 },
  { code: '1.53', desc: 'القيادة المتهورة لمركبة الدورية', points: 8 },
  { code: '1.54', desc: 'استخدام مركبة الدورية لأغراض شخصية', points: 8 },
  { code: '1.55', desc: 'عدم استخدام صفارات الإنذار عند الضرورة', points: 4 },
  { code: '1.56', desc: 'مخالفة بروتوكولات اللاسلكي والأكواد', points: 6 },
  { code: '1.57', desc: 'إفشاء كود زيرو دون وجود حالة طارئة', points: 12 },
  { code: '1.58', desc: 'عدم الاستجابة لكود زيرو زميل بالخدمة', points: 14 },
  { code: '1.59', desc: 'تجاوز حدود القوة الاستيعابية في السرقات', points: 10 },
  { code: '1.60', desc: 'مداهمة موقع سرقة بدون اكتمال القوة المطلوبة', points: 12 },
  { code: '1.61', desc: 'عدم الالتزام بالتسلسل القيادي بالميدان', points: 10 },
  { code: '1.62', desc: 'إصدار أوامر دون امتلاك الصلاحية', points: 12 },
  { code: '1.63', desc: 'التحية العسكرية أثناء المداهمات أو المطاردات', points: 4 },
  { code: '1.64', desc: 'الدخول لقطاع آخر دون تنسيق مسبق', points: 8 },
  { code: '1.65', desc: 'التدخل في عملية قطاع آخر دون طلب دعم', points: 10 },
  { code: '1.66', desc: 'إهمال تأمين محيط البلاغ', points: 8 },
  { code: '1.67', desc: 'إطلاق نار عشوائي يعرض المدنيين للخطر', points: 22 },
  { code: '1.68', desc: 'مطاردة تتجاوز الحد الأقصى للزمن (10 دقائق) دون إنهاء', points: 8 },
  { code: '1.69', desc: 'عدم احتساب مفشلات الهروب الآمن أثناء المطاردة', points: 6 },
  { code: '1.70', desc: 'تجاوز الحد الأقصى للصدم على الأرصفة (3)', points: 8 },
  { code: '1.71', desc: 'تجاوز الحد الأقصى للعكسات المسموحة (3)', points: 8 },
  { code: '1.72', desc: 'إهمال إجراءات السلامة عند نقطة التفتيش', points: 6 },
  { code: '1.73', desc: 'التهاون في توثيق الأدلة والممتلكات المصادرة', points: 10 },
  { code: '1.74', desc: 'استخدام القوة المفرطة دون مبرر', points: 18 },
  { code: '1.75', desc: 'إهمال تقديم الإسعافات الأولية عند الحاجة', points: 10 },
  { code: '1.76', desc: 'التصرف بشكل يسيء لسمعة الجهاز علناً', points: 16 },
  { code: '1.77', desc: 'تكرار المخالفات بعد الإنذار الرسمي', points: 18 },
  { code: '1.78', desc: 'عدم احترام الرتب العليا وتجاوز حدود الأدب', points: 25 },
]

// ---------------------------------------------------------------------
// Radio Protocols — editable table definitions (start empty)
// ---------------------------------------------------------------------
export type RadioColumn = { key: string; label: string }
export type RadioTableDef = {
  id: string
  title: string
  arabic: string
  note?: string
  columns: RadioColumn[]
}

export const radioTables: RadioTableDef[] = [
  {
    id: 'ten',
    title: '10 Codes',
    arabic: 'أكواد العشرة',
    note: 'أكواد الحالة والبلاغات الرئيسية المستخدمة على اللاسلكي.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'meaning', label: 'المعنى / Meaning' },
      { key: 'usage', label: 'طريقة الاستخدام' },
    ],
  },
  {
    id: 'general',
    title: 'General Codes',
    arabic: 'الأكواد العامة',
    note: 'الأكواد العامة لإلقاء وإلغاء البلاغات والتنسيق الميداني.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'meaning', label: 'المعنى / Meaning' },
      { key: 'usage', label: 'طريقة الإلقاء / الإلغاء' },
    ],
  },
  {
    id: 'zero',
    title: 'Zero Codes',
    arabic: 'أكواد الزيرو',
    note: 'أكواد الطوارئ القصوى — تُستخدم في الحالات الحرجة فقط.',
    columns: [
      { key: 'code', label: 'Zero Code' },
      { key: 'meaning', label: 'المعنى / Meaning' },
      { key: 'priority', label: 'الأولوية' },
    ],
  },
  {
    id: 'english',
    title: 'English Codes',
    arabic: 'الأكواد الإنجليزية',
    note: 'المصطلحات والأكواد الإنجليزية المعتمدة على اللاسلكي.',
    columns: [
      { key: 'code', label: 'Code / Phrase' },
      { key: 'meaning', label: 'المعنى / Meaning' },
      { key: 'usage', label: 'الاستخدام' },
    ],
  },
]

// ---------------------------------------------------------------------
// Traffic / Criminal Violations
// ---------------------------------------------------------------------
export type Violation = {
  degree: number
  desc: string
  penalty: string
}

export const violations: Violation[] = [
  { degree: 1, desc: 'قيادة مركبة آلية بدون رخصة سوق', penalty: 'تحرير مخالفة بقيمة 300$' },
  { degree: 2, desc: 'قيادة دراجة آلية بدون رخصة سوق', penalty: 'تحرير مخالفة بقيمة 300$' },
  { degree: 3, desc: 'عدم وجود لوحة للمركبة أو غير واضحة', penalty: 'تحرير مخالفة بقيمة 400$' },
  {
    degree: 4,
    desc: 'القيادة تحت تأثير العقاقير المخدرة أو المسكرات',
    penalty: '4 أشهر سجن مع سحب المركبة',
  },
  { degree: 5, desc: 'عكس السير في الطرق السريعة', penalty: 'سحب المركبة وتحرير المخالفة فوراً' },
]

// =====================================================================
// Interactive Roster Hub — Sectors, Themes, Ranks, Options
// =====================================================================
export type SectorId = 'LSPD' | 'BCSO' | 'SASP'

// Per-sector CSS variable overrides. Applied inline on a wrapper element so
// every Tailwind color utility inside re-themes automatically.
export type SectorTheme = {
  id: SectorId
  name: string
  arabic: string
  tagline: string
  vars: Record<string, string>
}

export const sectorThemes: Record<SectorId, SectorTheme> = {
  LSPD: {
    id: 'LSPD',
    name: 'Los Santos Police Dept.',
    arabic: 'شرطة لوس سانتوس',
    tagline: 'Dark Navy • Cyan Neon',
    vars: {
      '--background': 'oklch(0.15 0.045 264)',
      '--card': 'oklch(0.21 0.05 264)',
      '--popover': 'oklch(0.19 0.05 264)',
      '--primary': 'oklch(0.74 0.16 220)',
      '--primary-foreground': 'oklch(0.14 0.04 264)',
      '--accent': 'oklch(0.34 0.1 262)',
      '--muted': 'oklch(0.25 0.05 264)',
      '--neon': 'oklch(0.8 0.17 218)',
      '--ring': 'oklch(0.74 0.16 220)',
      '--border': 'oklch(0.45 0.1 235 / 45%)',
    },
  },
  BCSO: {
    id: 'BCSO',
    name: 'Blaine County Sheriff',
    arabic: 'مكتب شريف مقاطعة بلين',
    tagline: 'Desert Charcoal • Gold Amber',
    vars: {
      '--background': 'oklch(0.17 0.018 70)',
      '--card': 'oklch(0.22 0.022 68)',
      '--popover': 'oklch(0.2 0.022 68)',
      '--primary': 'oklch(0.79 0.14 80)',
      '--primary-foreground': 'oklch(0.16 0.02 70)',
      '--accent': 'oklch(0.34 0.05 70)',
      '--muted': 'oklch(0.26 0.025 70)',
      '--neon': 'oklch(0.82 0.15 82)',
      '--ring': 'oklch(0.79 0.14 80)',
      '--border': 'oklch(0.5 0.07 80 / 42%)',
    },
  },
  SASP: {
    id: 'SASP',
    name: 'San Andreas State Police',
    arabic: 'شرطة ولاية سان أندرياس',
    tagline: 'Matte Black • Silver / Royal Blue',
    vars: {
      '--background': 'oklch(0.13 0.008 260)',
      '--card': 'oklch(0.18 0.012 260)',
      '--popover': 'oklch(0.16 0.012 260)',
      '--primary': 'oklch(0.58 0.18 268)',
      '--primary-foreground': 'oklch(0.96 0.01 260)',
      '--accent': 'oklch(0.3 0.04 265)',
      '--muted': 'oklch(0.23 0.012 260)',
      '--neon': 'oklch(0.85 0.025 255)',
      '--ring': 'oklch(0.58 0.18 268)',
      '--border': 'oklch(0.55 0.03 260 / 40%)',
    },
  },
}

// Ranks per sector, ordered high command -> cadet
export const sectorRanks: Record<SectorId, string[]> = {
  LSPD: [
    'Chief of Police',
    'Assistant Chief',
    'Deputy Chief',
    'Commander',
    'Captain',
    'Lieutenant II',
    'Lieutenant',
    'Sergeant II',
    'Sergeant',
    'Senior Lead Officer',
    'Senior Officer',
    'Officer III',
    'Officer II',
    'Officer I',
    'Cadet',
  ],
  BCSO: [
    'Sheriff',
    'UnderSheriff',
    'Chief Deputy',
    'Captain',
    'Lieutenant II',
    'Lieutenant',
    'Sergeant II',
    'Sergeant',
    'Senior Lead Deputy',
    'Senior Deputy',
    'Deputy II',
    'Deputy I',
    'Cadet',
  ],
  SASP: [
    'Commissioner',
    'Assistant Commissioner',
    'Deputy Commissioner',
    'Chief of CHP',
    'Assistant Chief',
    'Captain',
    'Lieutenant II',
    'Lieutenant',
    'Sergeant II',
    'Sergeant',
    'Senior Lead Officer',
    'Senior Officer',
    'Officer III',
    'Officer II',
    'Officer I',
    'Cadet',
  ],
}

export const insigniaOptions = [
  '★★★★★',
  '★★★★',
  '★★★',
  '★★',
  '★',
  '▮▮▮',
  '▮▮',
  '▮',
  '— N/A',
] as const

export const sectionOptions = [
  'Mission Row',
  'Vinewood',
  'Vespucci',
  'Sandy Shores',
  'Paleto Bay',
  'N/A',
] as const

export const statusOptions = ['ON DUTY', 'OFF DUTY', 'LOA'] as const
export type OfficerStatus = (typeof statusOptions)[number]

export const certificationKeys = ['IA', 'F.T.O', 'C.T.U', 'H.G.U', 'Air-1'] as const
export type CertKey = (typeof certificationKeys)[number]

export type Officer = {
  id: string
  badge: string
  discord: string
  insignia: string
  rank: string
  ys: string
  section: string
  responsibility: string
  adminRank: string
  squads: string
  status: OfficerStatus
  points: string
  strikes: string
  name: string
  certs: Record<CertKey, boolean>
}

export function emptyCerts(): Record<CertKey, boolean> {
  return { IA: false, 'F.T.O': false, 'C.T.U': false, 'H.G.U': false, 'Air-1': false }
}

export function makeOfficer(partial?: Partial<Officer>): Officer {
  return {
    id: Math.random().toString(36).slice(2, 10),
    badge: '',
    discord: '',
    insignia: '— N/A',
    rank: '',
    ys: '',
    section: 'N/A',
    responsibility: '',
    adminRank: '',
    squads: '',
    status: 'OFF DUTY',
    points: '0',
    strikes: '0',
    name: '',
    certs: emptyCerts(),
    ...partial,
  }
}

// One sample row per sector to demonstrate the workflow
export const sampleOfficers: Record<SectorId, Officer> = {
  LSPD: makeOfficer({
    badge: '402',
    discord: 'harvey#0001',
    insignia: '▮',
    rank: 'Sergeant',
    ys: '6m',
    section: 'Mission Row',
    responsibility: 'Supervisor',
    adminRank: 'High Command',
    squads: 'Squad Alpha',
    status: 'ON DUTY',
    points: '25',
    strikes: '0',
    name: 'Harvey Specter',
    certs: { IA: true, 'F.T.O': true, 'C.T.U': false, 'H.G.U': false, 'Air-1': true },
  }),
  BCSO: makeOfficer({
    badge: '100',
    rank: 'Sheriff',
    section: 'Sandy Shores',
    responsibility: 'High Command',
    adminRank: 'Department Head',
    squads: 'Command',
    status: 'ON DUTY',
    points: '30',
    name: '',
  }),
  SASP: makeOfficer({
    badge: '100',
    rank: 'Commissioner',
    section: 'N/A',
    responsibility: 'High Command',
    adminRank: 'Department Head',
    squads: 'HQ',
    status: 'ON DUTY',
    points: '30',
    name: '',
  }),
}

// =====================================================================
// Interactive Outfits — pieces & per-rank store
// =====================================================================
export const outfitPieces = [
  'Jackets',
  'Shirts',
  'Hands',
  'Legs',
  'Shoes',
  'Bags',
  'Body Armor',
  'Scarfs',
  'Hat',
  'Mask',
] as const

export const allRanks: string[] = Array.from(
  new Set([...sectorRanks.LSPD, ...sectorRanks.BCSO, ...sectorRanks.SASP]),
)
