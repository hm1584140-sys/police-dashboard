'use client'

import { useState } from 'react'
import {
  Link2 as Handcuffs,
  Zap,
  Crosshair,
  ScrollText,
  Car,
  CarFront,
  Building,
  ShieldOff,
  ChevronLeft,
  BookMarked,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NeonCard,
  Pill,
  StatCard,
  InfoBlock,
} from '@/components/portal/primitives'
import { pursuitCapacity, robberyCapacity } from '@/lib/police-data'

const SUB = [
  { id: 'general', label: 'القواعد العامة والولايات', icon: ScrollText },
  { id: 'cuffs', label: 'الكلبشة والتيزر', icon: Zap },
  { id: 'fire', label: 'إطلاق النار على المسلحين', icon: Crosshair },
  { id: 'arrest', label: 'الاعتقال وحقوق ميراندا', icon: Handcuffs },
  { id: 'pursuit', label: 'المطاردات والـ PIT', icon: Car },
  { id: 'vehiclefire', label: 'إطلاق النار على المركبة', icon: CarFront },
  { id: 'capacity', label: 'القوة الاستيعابية للسرقات', icon: Building },
  { id: 'failsafe', label: 'مفشلات الهروب الآمن', icon: ShieldOff },
] as const

type SubId = (typeof SUB)[number]['id']

export function SopsPortal() {
  const [sub, setSub] = useState<SubId>('general')

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <NeonCard glow className="overflow-hidden p-8 text-center md:p-12">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <Pill tone="neon">REV. 1.0</Pill>
          <Pill tone="danger">
            <Lock className="size-3" />
            CLASSIFIED • INTERNAL USE
          </Pill>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-neon">
            <BookMarked className="size-8" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-black text-foreground text-balance glow-text md:text-4xl">
          كتيب بروتوكولات وقواعد جهاز الشرطة
        </h1>
        <p className="mt-2 font-heading text-lg font-bold text-primary md:text-xl">
          المرجعي المعتمد (SOPs)
        </p>
      </NeonCard>

      {/* Three glowing cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard value="3" label="قطاعات" hint="SASP • LSPD • BCSO" />
        <StatCard value="8" label="أقسام" hint="بروتوكولات شاملة" />
        <StatCard value="إلزامي" label="على جميع الرتب" hint="وكافة التفرعات" />
      </div>

      {/* Nested sub-tabs */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <NeonCard className="h-fit p-2 lg:sticky lg:top-36">
          <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            أقسام البروتوكولات
          </p>
          <div className="flex flex-col gap-1">
            {SUB.map((s) => {
              const Icon = s.icon
              const isActive = sub === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSub(s.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-right text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0" />
                    <span className="font-heading">{s.label}</span>
                  </span>
                  {isActive ? <ChevronLeft className="size-4" /> : null}
                </button>
              )
            })}
          </div>
        </NeonCard>

        <div className="min-w-0">
          {sub === 'general' && <GeneralRules />}
          {sub === 'cuffs' && <CuffsTaser />}
          {sub === 'fire' && <FireArmed />}
          {sub === 'arrest' && <ArrestMiranda />}
          {sub === 'pursuit' && <PursuitPit />}
          {sub === 'vehiclefire' && <VehicleFire />}
          {sub === 'capacity' && <RobberyCapacity />}
          {sub === 'failsafe' && <FailSafe />}
        </div>
      </div>
    </div>
  )
}

function GeneralRules() {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="القواعد العامة والولايات">
        <p>
          قطاعات ولاية سان اندرياس تنقسم إلى:{' '}
          <strong className="text-foreground">SASP</strong> بدعوة خاصة للخطوط
          السريعة، <strong className="text-foreground">LSPD</strong> لقسم مشن روو
          والمدينة، <strong className="text-foreground">BCSO</strong> لتأمين
          الضواحي والمناطق الريفية.
        </p>
        <p className="mt-3">
          الهدف الأسمى هو حماية النظام والأمن القومي والمواطنين. احترام التسلسل
          القيادي صارم جداً، وتُمنع التحية العسكرية بالميدان أثناء المداهمات أو
          المطاردات وتقتصر داخل الأقسام فقط.
        </p>
      </InfoBlock>
      <div className="grid gap-4 sm:grid-cols-3">
        <NeonCard className="p-4 text-center">
          <p className="font-heading text-lg font-bold text-primary">SASP</p>
          <p className="text-xs text-muted-foreground">الخطوط السريعة (بدعوة خاصة)</p>
        </NeonCard>
        <NeonCard className="p-4 text-center">
          <p className="font-heading text-lg font-bold text-primary">LSPD</p>
          <p className="text-xs text-muted-foreground">مشن روو والمدينة</p>
        </NeonCard>
        <NeonCard className="p-4 text-center">
          <p className="font-heading text-lg font-bold text-primary">BCSO</p>
          <p className="text-xs text-muted-foreground">الضواحي والمناطق الريفية</p>
        </NeonCard>
      </div>
    </div>
  )
}

function CuffsTaser() {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="بروتوكولات الكلبشة" tone="warn">
        <p>
          تُمنع الكلبشة تماماً أثناء الاستيقاف المروري العادي. الكلبشة مسموحة في{' '}
          <strong className="text-foreground">3 حالات فقط:</strong>
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pr-5 marker:text-primary">
          <li>إذا رفع الشخص يده مستسلماً.</li>
          <li>بعد صعقه بالتيزر.</li>
          <li>بعد النطح والسيطرة الجسدية.</li>
        </ol>
      </InfoBlock>
      <InfoBlock title="بروتوكول استخدام التيزر">
        <p>
          يُستخدم التيزر بعد{' '}
          <strong className="text-foreground">30 ثانية</strong> هروب مستمر على
          الأقدام على الأقل، مع إطلاق{' '}
          <strong className="text-foreground">3 تحذيرات شفهية</strong> بين كل
          تحذير وآخر <strong className="text-foreground">5 ثوانٍ</strong>.
        </p>
        <p className="mt-3">أو يُستخدم مباشرة دون تحذير في الحالات التالية:</p>
        <ul className="mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive">
          <li>النطح والعرقلة.</li>
          <li>التدخل الخارجي لتهريب الشخص.</li>
          <li>إشهار سلاح أبيض.</li>
          <li>
            اقتراب المجرم من البحار أو المسطحات المائية (حيث يعرقل النظام كل 10
            ثوانٍ).
          </li>
        </ul>
      </InfoBlock>
    </div>
  )
}

function FireArmed() {
  return (
    <InfoBlock title="إطلاق النار على المسلحين" tone="danger">
      <p>يتم تحذير الشخص شفهياً أولاً، ثم اتباع التسلسل التالي:</p>
      <ol className="mt-3 list-decimal space-y-2 pr-5 marker:text-destructive">
        <li>
          إطلاق طلقات تحذيرية على الأطراف بعد{' '}
          <strong className="text-foreground">5 ثوانٍ</strong> (بحد أقصى{' '}
          <strong className="text-foreground">3 طلقات</strong> دون احتساب الطلقات
          الضائعة).
        </li>
        <li>
          إذا استمر بإشهار السلاح أو التهديد، يتم التنبيه وإطلاق النار بشكل متقطع
          بمعدل <strong className="text-foreground">طلقة واحدة كل ثانية</strong>.
        </li>
      </ol>
    </InfoBlock>
  )
}

function ArrestMiranda() {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="الاعتقال وحقوق ميراندا">
        <p>
          يجب على العسكري ذكر أعلى تهمة للمجرم (مثل سرقة مركبة أو حيازة سلاح غير
          مرخص)، ثم قراءة الحقوق نصاً وحرفاً:
        </p>
      </InfoBlock>
      <NeonCard glow className="p-6">
        <p className="border-r-4 border-r-primary pr-4 font-heading text-base leading-loose text-foreground">
          «تم إلقاء القبض عليك من شرطة لوس سانتوس بتهمة (...) يحق لك التزام الصمت،
          أي شيء تقوله سيتم استخدامه ضدك في المحكمة، ويحق لك تعيين محامي وفي حال
          عدم قدرتك سيتم تعيين محامي من قبل الشرطة.»
        </p>
      </NeonCard>
      <InfoBlock title="إجراءات ما بعد الاعتقال">
        <p>
          يُنقل للمركز للتفتيش الكامل وتجريده من الممنوعات والتصوير والتبصيم، وفك
          الكلبشة من فتحة باب الزنزانة.
        </p>
      </InfoBlock>
    </div>
  )
}

function PursuitPit() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {pursuitCapacity.map((row) => (
          <NeonCard key={row.type} className="p-4">
            <p className="font-heading text-sm font-bold text-foreground">
              {row.type}
            </p>
            <p className="mt-1 font-mono text-primary">{row.units}</p>
          </NeonCard>
        ))}
      </div>
      <InfoBlock title="تحديثات الدسباتش">
        <p>
          يتم تحديث الدسباتش بالصوت واللاسلكي (النوع، الشارع، المعلم، الاتجاه) كل{' '}
          <strong className="text-foreground">10 ثوانٍ</strong> بالبداية ثم كل{' '}
          <strong className="text-foreground">30 ثانية</strong> من الدورية
          الثانية.
        </p>
      </InfoBlock>
      <InfoBlock title="مناورة الصدم (PIT Maneuver)" tone="warn">
        <p>
          صدم المركبات وعرقلتها مسموح في{' '}
          <strong className="text-foreground">3 حالات فقط:</strong>
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pr-5 marker:text-primary">
          <li>اصطدام متكرر ومتعمد من المجرم بالممتلكات.</li>
          <li>تدخل أطراف خارجية للتهريب.</li>
          <li>مرور 5 دقائق على المطاردة تقديرياً.</li>
        </ol>
        <p className="mt-4 font-bold text-foreground">الشروط الصارمة للـ PIT:</p>
        <ul className="mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive">
          <li>إذن من المسؤول.</li>
          <li>السرعة لا تتجاوز 150km/h.</li>
          <li>خلو الشارع تماماً من المدنيين.</li>
          <li>وجود وحدة دعم مرافقة للتأمين.</li>
        </ul>
      </InfoBlock>
    </div>
  )
}

function VehicleFire() {
  const cases = [
    {
      t: 'إطلاق النار من المركبة نحو رجال الأمن',
      d: 'يتم الرد فوراً ودون تردد.',
    },
    {
      t: 'محاولة دهس الشرطي',
      d: 'يستهدف العسكري الإطارات أولاً.',
    },
    {
      t: 'دهس الشرطي وإسقاطه عمداً',
      d: 'يستهدف العسكري الشخص القائد مباشرة لحماية روحه.',
    },
  ]
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="إطلاق النار على المركبة" tone="danger">
        <p>يتم فوراً ودون تردد في الحالات التالية:</p>
      </InfoBlock>
      <div className="grid gap-3">
        {cases.map((c, i) => (
          <NeonCard key={c.t} className="flex items-start gap-4 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/15 font-mono font-bold text-destructive">
              {i + 1}
            </span>
            <div>
              <p className="font-heading font-bold text-foreground">{c.t}</p>
              <p className="text-sm text-muted-foreground">{c.d}</p>
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  )
}

function RobberyCapacity() {
  return (
    <NeonCard className="overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          القوة الاستيعابية للسرقات والسطو
        </h3>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-mono font-medium">نوع الهدف</th>
              <th className="px-5 py-3 font-mono font-medium">القوة المطلوبة</th>
            </tr>
          </thead>
          <tbody>
            {robberyCapacity.map((row, i) => (
              <tr
                key={row.type}
                className={cn(
                  'border-b border-border/50',
                  i % 2 ? 'bg-muted/10' : '',
                )}
              >
                <td className="px-5 py-3.5 font-heading font-bold text-foreground">
                  {row.type}
                </td>
                <td className="px-5 py-3.5 font-mono text-sm text-primary">
                  {row.units}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeonCard>
  )
}

function FailSafe() {
  const items = [
    'نزول الشخص بسلاح',
    'تغيير المركبة',
    'استخدام سيارات السوبر على الطرق السريعة',
    'تهديد المدنيين أو عكس السير',
    'القفزات الخطيرة',
    'الدخول في الأماكن الضيقة والأنفاق',
    'ورش التصليح',
    'الأوف رود وتسلق الجبال',
    'التدخل الخارجي',
    'الصدم على الأرصفة (الحد الأقصى 3 أرصفة)',
    'العكسات (الحد الأقصى 3 عكسات)',
    'لبس عدة الغوص والباراشوت',
  ]
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="مفشلات الهروب الآمن" tone="danger">
        <p>تنهي التفاوض فوراً وتحوّل المطاردة إلى عنيفة:</p>
      </InfoBlock>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-foreground"
          >
            <ShieldOff className="size-4 shrink-0 text-destructive" />
            <span className="font-heading">{item}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NeonCard glow className="p-4">
          <p className="font-heading font-bold text-foreground">
            الهروب على الأقدام بسلاح
          </p>
          <p className="text-sm text-muted-foreground">
            لمدة 5 ثوانٍ يستوجب إطلاق النار على الأطراف.
          </p>
        </NeonCard>
        <NeonCard glow className="p-4">
          <p className="font-heading font-bold text-foreground">
            الحد الأقصى الكلي للهروب
          </p>
          <p className="font-mono text-primary">10 دقائق</p>
        </NeonCard>
      </div>
    </div>
  )
}
