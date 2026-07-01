'use client'

import { useState, useEffect } from 'react'
import { Radio, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionTitle, NeonCard, Pill } from '../primitives'
import { TextCell } from '../editable-cells'
import { radioTables, type RadioTableDef } from '@/lib/police-data'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/lib/admin-context'

type Row = { id: string; values: Record<string, string> }

function newRowValues(columns: RadioTableDef['columns']): Record<string, string> {
  const values: Record<string, string> = {}
  columns.forEach((c) => (values[c.key] = ''))
  return values
}

function RadioTable({ def }: { def: RadioTableDef }) {
  const { canEdit } = useAdmin()
  const editable = canEdit('radio')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRows() {
      setLoading(true)
      const { data, error } = await supabase
        .from('radio_rows')
        .select('*')
        .eq('table_id', def.id)
        .order('position', { ascending: true })

      if (!error && data) {
        setRows(
          data.map((row) => ({
            id: row.id,
            values: (row.values as Record<string, string>) || {},
          })),
        )
      }
      setLoading(false)
    }
    loadRows()
  }, [def.id])

  async function addRow() {
    if (!editable) return
    const values = newRowValues(def.columns)
    const { data, error } = await supabase
      .from('radio_rows')
      .insert({ table_id: def.id, values, position: rows.length })
      .select()
      .single()

    if (!error && data) {
      setRows((prev) => [...prev, { id: data.id, values: data.values || {} }])
    }
  }

  async function removeRow(id: string) {
    if (!editable) return
    setRows((prev) => prev.filter((r) => r.id !== id))
    await supabase.from('radio_rows').delete().eq('id', id)
  }

  async function updateCell(id: string, key: string, value: string) {
    if (!editable) return
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, values: { ...r.values, [key]: value } } : r)),
    )
    const row = rows.find((r) => r.id === id)
    const newValues = { ...(row?.values ?? {}), [key]: value }
    await supabase.from('radio_rows').update({ values: newValues }).eq('id', id)
  }

  return (
    <NeonCard className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
        <div>
          <h3 className="font-heading text-lg font-extrabold text-primary glow-text">
            {def.title} — {def.arabic}
          </h3>
          {def.note ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{def.note}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="muted">
            {rows.length} {rows.length === 1 ? 'بند' : 'بنود'}
          </Pill>
          {editable ? (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 py-2 font-heading text-sm font-bold text-primary transition-colors hover:bg-primary/25"
            >
              <Plus className="size-4" />
              إضافة سطر
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-border bg-background/40">
              {def.columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-primary"
                >
                  {col.label}
                </th>
              ))}
              {editable ? <th className="w-12 px-3 py-3" /> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={def.columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  جاري تحميل البيانات...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={def.columns.length + 1}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  الجدول فارغ — اضغط «إضافة سطر» لبدء تعبئة الأكواد.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border/60 align-middle transition-colors hover:bg-muted/20',
                    idx % 2 === 1 && 'bg-background/20',
                  )}
                >
                  {def.columns.map((col, ci) => (
                    <td key={col.key} className="px-2 py-2">
                      {editable ? (
                        <TextCell
                          value={row.values[col.key] ?? ''}
                          onChange={(v) => updateCell(row.id, col.key, v)}
                          placeholder={ci === 0 ? 'Code…' : '—'}
                          className={ci === 0 ? 'font-mono' : undefined}
                        />
                      ) : (
                        <span
                          className={cn(
                            'block px-1 py-1 text-sm text-foreground',
                            ci === 0 ? 'font-mono' : undefined,
                          )}
                        >
                          {row.values[col.key] || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                  {editable ? (
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label="حذف السطر"
                        className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </NeonCard>
  )
}

export function RadioProtocols() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Radio Protocols"
        title="بروتوكولات اللاسلكي والأكواد"
        desc="جداول قابلة للتعديل والكتابة الكاملة. تبدأ فارغة تماماً وجاهزة لتعبئتها بأكواد جهازك."
        icon={<Radio className="size-6" />}
      />
      <div className="grid gap-6">
        {radioTables.map((def) => (
          <RadioTable key={def.id} def={def} />
        ))}
      </div>
    </div>
  )
}
