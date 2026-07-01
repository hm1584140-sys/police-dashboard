'use client'

import { useMemo, useState } from 'react'
import { Gavel, Search, ArrowUpDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeonCard, SectionTitle, Pill } from '@/components/portal/primitives'
import { strikes } from '@/lib/police-data'

type SortKey = 'code' | 'points'
type SortDir = 'asc' | 'desc'

export function StrikeBook() {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('code')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filtered = useMemo(() => {
    const q = query.trim()
    let list = strikes.filter(
      (s) => s.desc.includes(q) || s.code.includes(q),
    )
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'code') {
        cmp =
          parseFloat(a.code.replace('.', '')) -
          parseFloat(b.code.replace('.', ''))
      } else {
        cmp = a.points - b.points
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [query, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Strike Book"
        title="كتيب الجزاءات والمخالفات العسكرية"
        desc="جدول موحد قابل للبحث والفرز لنظام الـ Strikes. المسؤول عن الرصد هو قسم الرقابة الداخلية IA فقط."
        icon={<Gavel className="size-6" />}
      />

      {/* Critical warning */}
      <NeonCard className="flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="text-sm leading-relaxed text-foreground">
          عند تجميع العسكري{' '}
          <strong className="text-destructive">30 نقطة</strong> يُحال فوراً
          للمساءلة والفصل. الرصد حصري لقسم{' '}
          <strong className="text-destructive">الرقابة الداخلية (IA)</strong>.
        </p>
      </NeonCard>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث برقم البند أو الوصف..."
            className="w-full rounded-lg border border-input bg-card/60 py-2.5 pr-10 pl-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:glow-neon"
          />
        </div>
        <div className="flex gap-2">
          <SortButton
            active={sortKey === 'code'}
            dir={sortDir}
            onClick={() => toggleSort('code')}
          >
            رقم البند
          </SortButton>
          <SortButton
            active={sortKey === 'points'}
            dir={sortDir}
            onClick={() => toggleSort('points')}
          >
            النقاط
          </SortButton>
        </div>
      </div>

      {/* Table */}
      <NeonCard className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-mono font-medium">البند</th>
                <th className="px-5 py-3 font-mono font-medium">المخالفة</th>
                <th className="px-5 py-3 font-mono font-medium">العقوبة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.code}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/20',
                    i % 2 ? 'bg-muted/10' : '',
                    s.critical && 'bg-destructive/[0.06]',
                  )}
                >
                  <td className="px-5 py-3.5 align-top">
                    <span className="font-mono text-sm font-bold text-primary" dir="ltr">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <p className="text-sm leading-relaxed text-foreground">
                      {s.desc}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold',
                        s.critical
                          ? 'border-destructive/50 bg-destructive/15 text-destructive'
                          : 'border-primary/40 bg-primary/10 text-primary',
                      )}
                    >
                      {s.critical ? <AlertTriangle className="size-3" /> : null}
                      {s.points} نقاط
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </NeonCard>

      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="muted">إجمالي البنود: {strikes.length}</Pill>
        <Pill tone="danger">بنود الفصل الفوري (30 نقطة): 1.15 • 1.16 • 1.48 • 1.49</Pill>
      </div>
    </div>
  )
}

function SortButton({
  children,
  active,
  dir,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-bold transition-colors',
        active
          ? 'border-primary/50 bg-primary/15 text-primary'
          : 'border-border bg-card/60 text-muted-foreground hover:text-foreground',
      )}
    >
      <ArrowUpDown className="size-3.5" />
      <span className="font-heading">{children}</span>
      {active ? (
        <span className="font-mono text-xs">{dir === 'asc' ? '↑' : '↓'}</span>
      ) : null}
    </button>
  )
}
