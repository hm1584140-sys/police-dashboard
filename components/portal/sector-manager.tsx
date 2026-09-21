'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Check, Eye, EyeOff, Pencil, Plus, RefreshCw, Save, Shield, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeonCard, Pill } from './primitives'
import { SECTOR_THEME_PRESETS, type SectorDefinition } from '@/lib/sector-types'
import { useSector } from '@/lib/sector-context'

type Props = { token: string; onClose: () => void }

type FormState = {
  id: string
  name: string
  arabicName: string
  description: string
  tagline: string
  themeKey: string
  ranks: string
}

const emptyForm: FormState = {
  id: '',
  name: '',
  arabicName: '',
  description: '',
  tagline: '',
  themeKey: 'blue',
  ranks: '',
}

function toForm(sector: SectorDefinition): FormState {
  const matching = Object.entries(SECTOR_THEME_PRESETS).find(
    ([, preset]) => JSON.stringify(preset.vars) === JSON.stringify(sector.vars),
  )

  return {
    id: sector.id,
    name: sector.name,
    arabicName: sector.arabic,
    description: sector.description,
    tagline: sector.tagline,
    themeKey: matching?.[0] ?? 'blue',
    ranks: sector.ranks.join('\n'),
  }
}

export function SectorManager({ token, onClose }: Props) {
  const { refreshSectors } = useSector()
  const [sectors, setSectors] = useState<SectorDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<FormState | null>(null)

  async function load() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/sectors?mode=admin&token=' + encodeURIComponent(token), {
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر تحميل القطاعات')
      setSectors(Array.isArray(data.sectors) ? data.sectors : [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر تحميل القطاعات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function refreshAfterChange() {
    await load()
    await refreshSectors()
  }

  async function activateTemplate(sector: SectorDefinition) {
    if (!window.confirm('هل تريد إضافة قطاع ' + sector.name + ' إلى الموقع؟\nسيتم فتحه مع الرتب والثيم والوصف الجاهز.')) return
    setMessage('')
    const res = await fetch('/api/sectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, templateId: sector.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'تعذر إضافة القطاع')
      return
    }
    setMessage('تم فتح القطاع وإضافته للموقع ✓')
    await refreshAfterChange()
  }

  async function toggleVisibility(sector: SectorDefinition) {
    setMessage('')
    const res = await fetch('/api/sectors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        id: sector.id,
        isVisible: !sector.is_visible,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'تعذر تغيير حالة القطاع')
      return
    }
    setMessage(sector.is_visible ? 'تم إخفاء القطاع ✓' : 'تم إظهار القطاع ✓')
    await refreshAfterChange()
  }

  async function deleteSector(sector: SectorDefinition) {
    if (!window.confirm('هل أنت متأكد من حذف قطاع ' + sector.name + ' نهائياً؟')) return
    setMessage('')

    const res = await fetch('/api/sectors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id: sector.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'تعذر حذف القطاع')
      return
    }
    setMessage('تم حذف القطاع ✓')
    await refreshAfterChange()
  }

  async function saveSector() {
    if (!form) return
    if (!form.name.trim()) {
      setMessage('اكتب اسم القطاع أولاً')
      return
    }

    setSaving(true)
    setMessage('')

    const payload = {
      token,
      id: form.id.trim() || undefined,
      name: form.name.trim(),
      arabicName: form.arabicName.trim() || form.name.trim(),
      description: form.description.trim(),
      tagline: form.tagline.trim(),
      themeKey: form.themeKey,
      ranks: form.ranks
        .split('\n')
        .map((rank) => rank.trim())
        .filter(Boolean),
    }

    const isEdit = sectors.some((sector) => sector.id === form.id)
    const res = await fetch('/api/sectors', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? payload : payload),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'تعذر حفظ القطاع')
      setSaving(false)
      return
    }

    setMessage('تم حفظ القطاع بنجاح ✓')
    setForm(null)
    setSaving(false)
    await refreshAfterChange()
  }

  const visible = sectors.filter((sector) => sector.is_visible)
  const hidden = sectors.filter((sector) => !sector.is_visible)

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 md:p-6" onClick={onClose}>
      <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <NeonCard glow className="max-h-[92vh] overflow-y-auto p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <h3 className="font-heading text-xl font-extrabold text-foreground">إدارة القطاعات</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                فتح قطاع جاهز، إخفاؤه، حذفُه أو إنشاء قطاع جديد من الصفر.
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                <RefreshCw className="size-3.5" /> تحديث
              </button>
              <button type="button" onClick={() => setForm(emptyForm)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/25">
                <Plus className="size-3.5" /> قطاع من الصفر
              </button>
              <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                <X className="size-3.5" /> إغلاق
              </button>
            </div>
          </div>

          {message ? (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {message}
            </div>
          ) : null}

          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">جاري تحميل القطاعات...</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-heading text-sm font-extrabold text-foreground">القطاعات المفعلة ({visible.length})</h4>
                  <Pill tone="neon">تظهر في الموقع</Pill>
                </div>
                <div className="flex flex-col gap-2">
                  {visible.map((sector) => (
                    <SectorCard
                      key={sector.id}
                      sector={sector}
                      onEdit={() => setForm(toForm(sector))}
                      onToggle={() => void toggleVisibility(sector)}
                      onDelete={() => void deleteSector(sector)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-heading text-sm font-extrabold text-foreground">قطاعات غير مفعلة ({hidden.length})</h4>
                  <Pill tone="muted">جاهزة للفتح</Pill>
                </div>
                <div className="flex flex-col gap-2">
                  {hidden.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                      لا توجد قطاعات مخفية حالياً.
                    </div>
                  ) : (
                    hidden.map((sector) => (
                      <SectorCard
                        key={sector.id}
                        sector={sector}
                        onEdit={() => setForm(toForm(sector))}
                        onToggle={() => void (sector.is_template ? activateTemplate(sector) : toggleVisibility(sector))}
                        onDelete={() => void deleteSector(sector)}
                        hidden
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </NeonCard>
      </div>

      {form ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3" onClick={() => setForm(null)}>
          <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <NeonCard glow className="max-h-[90vh] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-lg font-extrabold text-foreground">
                    {form.id ? 'تعديل القطاع' : 'إنشاء قطاع جديد'}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">احفظ الرتب كسطر منفصل لكل رتبة.</p>
                </div>
                <button type="button" onClick={() => setForm(null)} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted/40">
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="رمز القطاع">
                  <input value={form.id} disabled={Boolean(form.id)} onChange={(event) => setForm({ ...form, id: event.target.value.toUpperCase() })} placeholder="مثال: HPD" className="input-base" />
                </Field>
                <Field label="اسم القطاع">
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Highway Patrol" className="input-base" />
                </Field>
                <Field label="الاسم العربي">
                  <input value={form.arabicName} onChange={(event) => setForm({ ...form, arabicName: event.target.value })} placeholder="دورية الطرق السريعة" className="input-base" />
                </Field>
                <Field label="الوصف">
                  <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="وصف مختصر للقطاع" className="input-base" />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="الثيم">
                  <select value={form.themeKey} onChange={(event) => {
                    const key = event.target.value
                    setForm({
                      ...form,
                      themeKey: key,
                      tagline: SECTOR_THEME_PRESETS[key]?.tagline ?? form.tagline,
                    })
                  }} className="input-base">
                    {Object.entries(SECTOR_THEME_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label} — {preset.tagline}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-3">
                <Field label="وصف الثيم / العنوان الصغير">
                  <input value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} placeholder="Dark Navy • Cyan Neon" className="input-base" />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="الرتب">
                  <textarea value={form.ranks} onChange={(event) => setForm({ ...form, ranks: event.target.value })} rows={10} placeholder={'Commissioner\nColonel\nMajor\nCaptain\nLieutenant\nSergeant\nTrooper\nCadet'} className="input-base min-h-52 resize-y font-mono text-xs" />
                </Field>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/40">
                  إلغاء
                </button>
                <button type="button" onClick={() => void saveSector()} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/25 disabled:opacity-50">
                  <Save className="size-4" /> {saving ? 'جاري الحفظ...' : 'حفظ القطاع'}
                </button>
              </div>
            </NeonCard>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SectorCard({
  sector,
  onEdit,
  onToggle,
  onDelete,
  hidden = false,
}: {
  sector: SectorDefinition
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  hidden?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border"
          style={{
            background: sector.vars['--primary'] ? sector.vars['--primary'] + '20' : undefined,
            borderColor: sector.vars['--primary'] ? sector.vars['--primary'] + '70' : undefined,
            color: sector.vars['--primary'],
          }}
        >
          <Shield className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-sm font-extrabold text-foreground">{sector.id}</span>
            {sector.is_template ? <Pill tone="gold">جاهز</Pill> : null}
          </div>
          <p className="text-sm font-bold text-primary">{sector.arabic}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sector.name}</p>
          {sector.description ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sector.description}</p> : null}
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">{sector.ranks.length} رتب • {sector.tagline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {hidden && sector.is_template ? (
          <button type="button" onClick={onToggle} className="inline-flex items-center gap-1.5 rounded-md border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25">
            <Check className="size-3.5" /> إضافة للموقع
          </button>
        ) : (
          <button type="button" onClick={onToggle} className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold',
            hidden
              ? 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25'
              : 'border-border text-muted-foreground hover:bg-muted/40',
          )}>
            {hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {hidden ? 'إظهار' : 'إخفاء'}
          </button>
        )}

        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/40">
          <Pencil className="size-3.5" /> تعديل
        </button>

        {!['LSPD', 'BCSO', 'SASP'].includes(sector.id) ? (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20">
            <Trash2 className="size-3.5" /> حذف
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
