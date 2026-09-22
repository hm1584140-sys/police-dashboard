'use client'

import { useMemo, useState } from 'react'
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
import { NeonCard, Pill, StatCard, InfoBlock } from '@/components/portal/primitives'
import { pursuitCapacity, robberyCapacity } from '@/lib/police-data'
import type { PageDefinition } from '@/lib/page-types'
import { getSopsCopy } from '@/lib/sops-copy'

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
type Copy = Record<string, string>

function lines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function Extra({ text }: { text?: string }) {
  if (!text?.trim()) return null
  return <NeonCard className="p-5 whitespace-pre-wrap text-sm leading-8 text-foreground">{text}</NeonCard>
}

export function SopsPortal({ page }: { page?: PageDefinition }) {
  const [sub, setSub] = useState<SubId>('general')
  const copy = useMemo(() => getSopsCopy(page?.blocks), [page?.blocks])

  return (
    <div className="flex flex-col gap-8">
      <NeonCard glow className="overflow-hidden p-8 text-center md:p-12">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <Pill tone="neon">REV. 1.0</Pill>
          <Pill tone="danger"><Lock className="size-3" /> CLASSIFIED • INTERNAL USE</Pill>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-neon">
            <BookMarked className="size-8" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-black text-foreground text-balance glow-text md:text-4xl">
          {copy.hero_title}
        </h1>
        <p className="mt-2 font-heading text-lg font-bold text-primary md:text-xl">{copy.hero_subtitle}</p>
      </NeonCard>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard value="3" label="قطاعات" hint="SASP • LSPD • BCSO" />
        <StatCard value="8" label="أقسام" hint="بروتوكولات شاملة" />
        <StatCard value="إلزامي" label="على جميع الرتب" hint="وكافة التفرعات" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <NeonCard className="h-fit p-2 lg:sticky lg:top-36">
          <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">أقسام البروتوكولات</p>
          <div className="flex flex-col gap-1">
            {SUB.map((s) => {
              const Icon = s.icon
              const isActive = sub === s.id
              return (
                <button key={s.id} type="button" onClick={() => setSub(s.id)}
                  className={cn('flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-right text-sm font-bold transition-colors',
                    isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground')}>
                  <span className="flex items-center gap-2"><Icon className="size-4 shrink-0" /><span className="font-heading">{s.label}</span></span>
                  {isActive ? <ChevronLeft className="size-4" /> : null}
                </button>
              )
            })}
          </div>
        </NeonCard>

        <div className="min-w-0">
          {sub === 'general' && <GeneralRules copy={copy} />}
          {sub === 'cuffs' && <CuffsTaser copy={copy} />}
          {sub === 'fire' && <FireArmed copy={copy} />}
          {sub === 'arrest' && <ArrestMiranda copy={copy} />}
          {sub === 'pursuit' && <PursuitPit copy={copy} />}
          {sub === 'vehiclefire' && <VehicleFire copy={copy} />}
          {sub === 'capacity' && <RobberyCapacity />}
          {sub === 'failsafe' && <FailSafe copy={copy} />}
        </div>
      </div>
    </div>
  )
}

function GeneralRules({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="القواعد العامة والولايات">
        <p>{copy.general_1}</p>
        <p className="mt-3">{copy.general_2}</p>
      </InfoBlock>
      <div className="grid gap-4 sm:grid-cols-3">
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">SASP</p><p className="text-xs text-muted-foreground">الخطوط السريعة (بدعوة خاصة)</p></NeonCard>
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">LSPD</p><p className="text-xs text-muted-foreground">مشن روو والمدينة</p></NeonCard>
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">BCSO</p><p className="text-xs text-muted-foreground">الضواحي والمناطق الريفية</p></NeonCard>
      </div>
      <Extra text={copy.general_extra} />
    </div>
  )
}

function CuffsTaser({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="بروتوكولات الكلبشة" tone="warn">
        <p>{copy.cuffs_intro}</p>
        <ol className="mt-3 list-decimal space-y-1.5 pr-5 marker:text-primary">
          {lines(copy.cuffs_items).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </InfoBlock>
      <InfoBlock title="بروتوكول استخدام التيزر">
        <p>{copy.taser_intro}</p>
        <p className="mt-3">{copy.taser_direct_intro}</p>
        <ul className="mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive">
          {lines(copy.taser_items).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </InfoBlock>
      <Extra text={copy.cuffs_extra} />
    </div>
  )
}

function FireArmed({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="إطلاق النار على المسلحين" tone="danger">
        <p>{copy.fire_intro}</p>
        <ol className="mt-3 list-decimal space-y-2 pr-5 marker:text-destructive">
          {lines(copy.fire_items).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </InfoBlock>
      <Extra text={copy.fire_extra} />
    </div>
  )
}

function ArrestMiranda({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="الاعتقال وحقوق ميراندا"><p>{copy.arrest_intro}</p></InfoBlock>
      <NeonCard glow className="p-6"><p className="border-r-4 border-r-primary pr-4 font-heading text-base leading-loose text-foreground">«{copy.miranda}»</p></NeonCard>
      <InfoBlock title="إجراءات ما بعد الاعتقال"><p>{copy.post_arrest}</p></InfoBlock>
      <Extra text={copy.arrest_extra} />
    </div>
  )
}

function PursuitPit({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {pursuitCapacity.map((row) => <NeonCard key={row.type} className="p-4"><p className="font-heading text-sm font-bold text-foreground">{row.type}</p><p className="mt-1 font-mono text-primary">{row.units}</p></NeonCard>)}
      </div>
      <InfoBlock title="تحديثات الدسباتش"><p>{copy.dispatch}</p></InfoBlock>
      <InfoBlock title="مناورة الصدم (PIT Maneuver)" tone="warn">
        <p>{copy.pit_intro}</p>
        <ol className="mt-2 list-decimal space-y-1.5 pr-5 marker:text-primary">{lines(copy.pit_items).map((item) => <li key={item}>{item}</li>)}</ol>
        <p className="mt-4 font-bold text-foreground">الشروط الصارمة للـ PIT:</p>
        <ul className="mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive">{lines(copy.pit_conditions).map((item) => <li key={item}>{item}</li>)}</ul>
      </InfoBlock>
      <Extra text={copy.pursuit_extra} />
    </div>
  )
}

function VehicleFire({ copy }: { copy: Copy }) {
  const cases = lines(copy.vehicle_cases).map((line) => {
    const [t, ...rest] = line.split('|')
    return { t: t || 'حالة', d: rest.join('|') }
  })
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="إطلاق النار على المركبة" tone="danger"><p>{copy.vehicle_intro}</p></InfoBlock>
      <div className="grid gap-3">
        {cases.map((item, i) => (
          <NeonCard key={`${item.t}-${i}`} className="flex items-start gap-4 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/15 font-mono font-bold text-destructive">{i + 1}</span>
            <div><p className="font-heading font-bold text-foreground">{item.t}</p><p className="text-sm text-muted-foreground">{item.d}</p></div>
          </NeonCard>
        ))}
      </div>
      <Extra text={copy.vehicle_extra} />
    </div>
  )
}

function RobberyCapacity() {
  return (
    <NeonCard className="overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-5 py-3"><h3 className="font-heading text-lg font-bold text-foreground">القوة الاستيعابية للسرقات والسطو</h3></div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-right">
          <thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><th className="px-5 py-3 font-mono font-medium">نوع الهدف</th><th className="px-5 py-3 font-mono font-medium">القوة المطلوبة</th></tr></thead>
          <tbody>{robberyCapacity.map((row, i) => <tr key={row.type} className={cn('border-b border-border/50', i % 2 ? 'bg-muted/10' : '')}><td className="px-5 py-3.5 font-heading font-bold text-foreground">{row.type}</td><td className="px-5 py-3.5 font-mono text-sm text-primary">{row.units}</td></tr>)}</tbody>
        </table>
      </div>
    </NeonCard>
  )
}

function FailSafe({ copy }: { copy: Copy }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {lines(copy.failsafe_items).map((item) => <div key={item} className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-foreground"><ShieldOff className="size-4 shrink-0 text-destructive" /><span className="font-heading">{item}</span></div>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NeonCard glow className="p-4"><p className="font-heading font-bold text-foreground">الهروب على الأقدام بسلاح</p><p className="text-sm text-muted-foreground">{copy.foot_escape}</p></NeonCard>
        <NeonCard glow className="p-4"><p className="font-heading font-bold text-foreground">الحد الأقصى الكلي للهروب</p><p className="font-mono text-primary">{copy.max_escape}</p></NeonCard>
      </div>
      <Extra text={copy.failsafe_extra} />
    </div>
  )
}
