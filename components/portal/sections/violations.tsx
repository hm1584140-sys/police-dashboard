'use client'

import { useState, useEffect } from 'react'
import { TrafficCone, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeonCard, SectionTitle, Pill } from '@/components/portal/primitives'
import { TextCell } from '@/components/portal/editable-cells'
import { violations as defaultViolations } from '@/lib/police-data'
import { useAdmin } from '@/lib/admin-context'
import { supabase } from '@/lib/supabase'

type ViolationItem = {
  id: string
  degree: string
  desc: string
  penalty: string
  isSevere: boolean
}

export function Violations() {
  const { canEdit } = useAdmin()
  const editable = canEdit('violations')
  const [items, setItems] = useState<ViolationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        if (data.length === 0) {
          // Seed with defaults the first time
          const seeded = defaultViolations.map((v) => ({
            degree: String(v.degree),
            description: v.desc,
            penalty: v.penalty,
            is_severe: v.penalty.includes('سجن') || v.penalty.includes('سحب'),
          }))
          const { data: inserted } = await supabase
            .from('violations')
            .insert(seeded)
            .select()
          if (inserted) {
            setItems(
              inserted.map((row) => ({
                id: row.id,
                degree: row.degree,
                desc: row.description,
                penalty: row.penalty,
                isSevere: row.is_severe,
              })),
            )
          }
        } else {
          setItems(
            data.map((row) => ({
              id: row.id,
              degree: row.degree,
              desc: row.description,
              penalty: row.penalty,
              isSevere: row.is_severe,
            })),
          )
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function addViolation() {
    const nextDegree = String(items.length + 1)
    const { data, error } = await supabase
      .from('violations')
      .insert({ degree: nextDegree, description: '', penalty: '', is_severe: false })
      .select()
      .single()

    if (!error && data) {
      setItems((prev) => [
        ...prev,
        {
          id: data.id,
          degree: data.degree,
          desc: data.description,
          penalty: data.penalty,
          isSevere: data.is_severe,
        },
      ])
    }
  }

  async function removeViolation(id: string) {
    setItems((prev) => prev.filter((v) => v.id !== id))
    await supabase.from('violations').delete().eq('id', id)
  }

  async function updateViolation(id: string, patch: Partial<ViolationItem>) {
    setItems((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
    const dbPatch: Record<string, string | boolean> = {}
    if (patch.degree !== undefined) dbPatch.degree = patch.degree
    if (patch.desc !== undefined) dbPatch.description = patch.desc
    if (patch.penalty !== undefined) dbPatch.penalty = patch.penalty
    if (patch.isSevere !== undefined) dbPatch.is_severe = patch.isSevere
    await supabase.from('violations').update(dbPatch).eq('id', id)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Violations"
        title="المخالفات المرورية والدليل الجنائي"
        desc="دليل تفاعلي لتعريف درجات التهم والمخالفات لتسهيل عمل الأفراد في الميدان."
        icon={<TrafficCone className="size-6" />}
      />

      {editable ? (
        <div className="flex items-center justify-between">
          <Pill tone="muted">
            {items.length} {items.length === 1 ? 'مخالفة' : 'مخالفات'}
          </Pill>
          <button
            type="button"
            onClick={addViolation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 py-2 font-heading text-sm font-bold text-primary transition-colors hover:bg-primary/25"
          >
            <Plus className="size-4" />
            إضافة مخالفة
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground font-mono text-sm">
          جاري تحميل البيانات...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...items]
            .sort((a, b) => {
              const na = parseFloat(a.degree)
              const nb = parseFloat(b.degree)
              if (Number.isNaN(na) && Number.isNaN(nb)) return 0
              if (Number.isNaN(na)) return 1
              if (Number.isNaN(nb)) return -1
              return na - nb
            })
            .map((v) => {
            const isJail = v.isSevere
            return (
              <NeonCard key={v.id} className="flex items-start gap-4 p-5" glow={isJail}>
                <div
                  className={cn(
                    'flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border',
                    isJail
                      ? 'border-destructive/50 bg-destructive/15 text-destructive'
                      : 'border-primary/40 bg-primary/10 text-primary',
                  )}
                >
                  <span className="font-mono text-[10px] uppercase">درجة</span>
                  {editable ? (
                    <input
                      value={v.degree}
                      onChange={(e) => updateViolation(v.id, { degree: e.target.value })}
                      className="w-10 bg-transparent text-center font-heading text-2xl font-black leading-none outline-none"
                    />
                  ) : (
                    <span className="font-heading text-2xl font-black leading-none">
                      {v.degree}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {editable ? (
                    <TextCell
                      value={v.desc}
                      onChange={(val) => updateViolation(v.id, { desc: val })}
                      placeholder="وصف المخالفة..."
                      className="font-heading text-base font-bold"
                    />
                  ) : (
                    <p className="font-heading text-base font-bold text-foreground text-balance">
                      {v.desc}
                    </p>
                  )}
                  {editable ? (
                    <div className="mt-2 flex items-center gap-2">
                      <TextCell
                        value={v.penalty}
                        onChange={(val) => updateViolation(v.id, { penalty: val })}
                        placeholder="العقوبة..."
                      />
                      <button
                        type="button"
                        onClick={() => updateViolation(v.id, { isSevere: !v.isSevere })}
                        title="تبديل لون الخطورة"
                        className={cn(
                          'shrink-0 rounded-md border px-2.5 py-1.5 font-mono text-xs font-bold transition-colors',
                          isJail
                            ? 'border-destructive/60 bg-destructive/20 text-destructive'
                            : 'border-primary/40 bg-primary/10 text-primary',
                        )}
                      >
                        {isJail ? 'خطيرة 🔴' : 'عادية'}
                      </button>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        'mt-2 inline-flex rounded-md border px-3 py-1 text-sm font-bold',
                        isJail
                          ? 'border-destructive/50 bg-destructive/10 text-destructive'
                          : 'border-primary/40 bg-primary/10 text-primary',
                      )}
                    >
                      {v.penalty}
                    </p>
                  )}
                </div>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => removeViolation(v.id)}
                    aria-label="حذف المخالفة"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </NeonCard>
            )
          })}
        </div>
      )}
    </div>
  )
}


