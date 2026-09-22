'use client'

import { useEffect, useMemo, useState } from 'react'
import { Gavel, Search, ArrowUpDown, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeonCard, SectionTitle, Pill } from '@/components/portal/primitives'
import { TextCell } from '@/components/portal/editable-cells'
import { useAdmin } from '@/lib/admin-context'
import type { PageDefinition } from '@/lib/page-types'

type StrikeItem = {
  id: string
  code: string
  description: string
  points: number
  is_critical: boolean
}

type SortKey = 'code' | 'points'
type SortDir = 'asc' | 'desc'

export function StrikeBook({ page }: { page?: PageDefinition }) {
  const { canEdit, token } = useAdmin()
  const editable = canEdit('strikes')
  const [items, setItems] = useState<StrikeItem[]>([])
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('code')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/strikes')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    const list = items.filter((s) => !q || s.description.includes(q) || s.code.includes(q))
    return [...list].sort((a, b) => {
      const cmp = sortKey === 'code'
        ? parseFloat(a.code.replace('.', '')) - parseFloat(b.code.replace('.', ''))
        : a.points - b.points
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, query, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((dir) => dir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  async function addStrike() {
    if (!token || !editable) return
    const res = await fetch('/api/strikes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, code: '', description: '', points: 0, isCritical: false }),
    })
    if (res.ok) await load()
  }

  async function updateStrike(id: string, patch: Partial<StrikeItem>) {
    if (!token || !editable) return
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item))
    const res = await fetch('/api/strikes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id, ...patch, isCritical: patch.is_critical }),
    })
    if (!res.ok) await load()
  }

  async function removeStrike(id: string) {
    if (!token || !editable) return
    setItems((prev) => prev.filter((item) => item.id !== id))
    await fetch('/api/strikes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Strike Book"
        title={page?.title ?? 'كتيب الجزاءات والمخالفات العسكرية'}
        desc={page?.description ?? 'جدول موحد قابل للبحث والفرز لنظام الـ Strikes. المسؤول عن الرصد هو قسم الرقابة الداخلية IA فقط.'}
        icon={<Gavel className="size-6" />}
      />

      <NeonCard className="flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="text-sm leading-relaxed text-foreground">
          عند تجميع العسكري <strong className="text-destructive">30 نقطة</strong> يُحال للمساءلة والفصل وفق نظامكم الداخلي.
        </p>
      </NeonCard>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث برقم البند أو الوصف..." className="w-full rounded-lg border border-input bg-card/60 py-2.5 pr-10 pl-4 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <SortButton active={sortKey === 'code'} dir={sortDir} onClick={() => toggleSort('code')}>رقم البند</SortButton>
        <SortButton active={sortKey === 'points'} dir={sortDir} onClick={() => toggleSort('points')}>النقاط</SortButton>
        {editable ? <button type="button" onClick={() => void addStrike()} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 py-2.5 text-sm font-bold text-primary"><Plus className="size-4" /> إضافة بند</button> : null}
      </div>

      <NeonCard className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? <div className="py-12 text-center text-sm text-muted-foreground">جاري تحميل البيانات...</div> : (
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-mono font-medium">البند</th>
                  <th className="px-5 py-3 font-mono font-medium">المخالفة</th>
                  <th className="px-5 py-3 font-mono font-medium">النقاط</th>
                  <th className="px-5 py-3 font-mono font-medium">الحالة</th>
                  {editable ? <th className="px-5 py-3" /> : null}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className={cn('border-b border-border/50 hover:bg-muted/20', i % 2 ? 'bg-muted/10' : '', item.is_critical && 'bg-destructive/[0.06]')}>
                    <td className="px-3 py-2 align-top">{editable ? <TextCell value={item.code} onChange={(value) => updateStrike(item.id, { code: value })} section="strikes" /> : <span className="font-mono text-sm font-bold text-primary">{item.code || '—'}</span>}</td>
                    <td className="px-3 py-2 align-top">{editable ? <TextCell value={item.description} onChange={(value) => updateStrike(item.id, { description: value })} section="strikes" className="min-w-[320px]" /> : <p className="text-sm leading-relaxed text-foreground">{item.description || '—'}</p>}</td>
                    <td className="px-3 py-2 align-top">{editable ? <TextCell type="number" value={String(item.points)} onChange={(value) => updateStrike(item.id, { points: Number(value) || 0 })} section="strikes" /> : <Pill tone={item.is_critical ? 'danger' : 'neon'}>{item.points} نقاط</Pill>}</td>
                    <td className="px-3 py-2 align-top">
                      <button type="button" disabled={!editable} onClick={() => updateStrike(item.id, { is_critical: !item.is_critical })} className={cn('rounded-full border px-3 py-1 text-xs font-bold', item.is_critical ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/40 bg-primary/10 text-primary', !editable && 'cursor-default opacity-70')}>
                        {item.is_critical ? 'حرج' : 'عادي'}
                      </button>
                    </td>
                    {editable ? <td className="px-3 py-2 text-center"><button type="button" onClick={() => void removeStrike(item.id)} className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></td> : null}
                  </tr>
                ))}
                {!filtered.length && !loading ? <tr><td colSpan={editable ? 5 : 4} className="px-5 py-10 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</td></tr> : null}
              </tbody>
            </table>
          )}
        </div>
      </NeonCard>

      <div className="flex flex-wrap gap-2"><Pill tone="muted">إجمالي البنود: {items.length}</Pill><Pill tone="danger">30 نقطة = فصل حسب النظام الداخلي</Pill></div>
    </div>
  )
}

function SortButton({ children, active, dir, onClick }: { children: React.ReactNode; active: boolean; dir: SortDir; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn('flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-bold', active ? 'border-primary/50 bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground')}><ArrowUpDown className="size-3.5" /><span>{children}</span>{active ? <span className="font-mono text-xs">{dir === 'asc' ? '↑' : '↓'}</span> : null}</button>
}
