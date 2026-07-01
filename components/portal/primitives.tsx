import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function NeonCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card/70 backdrop-blur-sm',
        glow && 'glow-neon',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  icon,
}: {
  eyebrow?: string
  title: string
  desc?: string
  icon?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="mt-1 h-12 w-1.5 rounded-full bg-primary glow-neon" />
      {icon ? (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <div>
        {eyebrow ? (
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-extrabold text-foreground text-balance md:text-3xl">
          {title}
        </h2>
        {desc ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {desc}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function Pill({
  children,
  tone = 'neon',
  className,
}: {
  children: ReactNode
  tone?: 'neon' | 'navy' | 'danger' | 'gold' | 'muted'
  className?: string
}) {
  const tones: Record<string, string> = {
    neon: 'border-primary/40 bg-primary/10 text-primary',
    navy: 'border-accent/60 bg-accent/40 text-accent-foreground',
    danger: 'border-destructive/50 bg-destructive/15 text-destructive',
    gold: 'border-[oklch(0.78_0.14_90)]/45 bg-[oklch(0.78_0.14_90)]/12 text-[oklch(0.82_0.14_90)]',
    muted: 'border-border bg-muted/50 text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function InfoBlock({
  title,
  children,
  tone = 'default',
}: {
  title: string
  children: ReactNode
  tone?: 'default' | 'danger' | 'warn'
}) {
  const accent =
    tone === 'danger'
      ? 'border-r-destructive'
      : tone === 'warn'
        ? 'border-r-[oklch(0.78_0.14_90)]'
        : 'border-r-primary'
  return (
    <NeonCard className="p-5">
      <h3
        className={cn(
          'mb-3 border-r-4 pr-3 font-heading text-lg font-bold text-foreground',
          accent,
        )}
      >
        {title}
      </h3>
      <div className="text-sm leading-loose text-muted-foreground">
        {children}
      </div>
    </NeonCard>
  )
}

export function StatCard({
  value,
  label,
  hint,
}: {
  value: string
  label: string
  hint?: string
}) {
  return (
    <NeonCard glow className="flex flex-col gap-1 p-6 text-center">
      <span className="font-heading text-3xl font-black text-primary glow-text">
        {value}
      </span>
      <span className="font-heading text-base font-bold text-foreground">
        {label}
      </span>
      {hint ? (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </NeonCard>
  )
}
