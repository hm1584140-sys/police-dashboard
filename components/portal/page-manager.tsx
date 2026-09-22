'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Eye, EyeOff, FilePlus2, Pencil, Plus, Save, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react'
import { NeonCard, Pill } from './primitives'
import { cn } from '@/lib/utils'
import {
  BUILTIN_PAGES,
  PAGE_ICON_OPTIONS,
  type ContentBlock,
  type PageDefinition,
} from '@/lib/page-types'
import { DEFAULT_SOPS_COPY, SOPS_COPY_FIELDS, getSopsCopy, setSopsCopy } from '@/lib/sops-copy'

function blankPage(): PageDefinition {
  return {
    id: '',
    slug: '',
    title: '',
    description: '',
    icon: 'FileText',
    page_type: 'content',
    renderer: 'cms',
    is_visible: true,
    is_system: false,
    sort_order: 100,
    sector_id: null,
    blocks: [],
  }
}

export function PageManager({
  token,
  onClose,
  initialPage = null,
  onSaved,
}: {
  token: string
  onClose: () => void
  initialPage?: PageDefinition | null
  onSaved?: () => void
}) {
  const [pages, setPages] = useState<PageDefinition[]>(BUILTIN_PAGES)
  const [page, setPage] = useState<PageDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/pages?token=' + encodeURIComponent(token))
      if (!res.ok) throw new Error()
      const data = await res.json()
      const normalized = (data as PageDefinition[]).map((item) =>
        item.slug === 'sops' ? { ...item, renderer: 'sops' as const } : item,
      )
      setPages(normalized.length ? normalized : BUILTIN_PAGES)
    } catch {
      setPages(BUILTIN_PAGES)
      setMessage('تعذر تحميل القوائم من قاعدة البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    if (initialPage) {
      setPage({
        ...initialPage,
        renderer: initialPage.slug === 'sops' ? 'sops' : initialPage.renderer,
        blocks: initialPage.blocks ?? [],
      })
    }
  }, [])

  async function save() {
    if (!page) return
    setSaving(true); setMessage('')
    try {
      const res = await fetch('/api/pages', {
        method: page.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          page.id
            ? { token, ...page }
            : { token, ...page },
        ),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'تعذر الحفظ')
      setMessage('تم حفظ القائمة ✓')
      setPage(null)
      window.dispatchEvent(new CustomEvent('pd:pages-changed'))
      onSaved?.()
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function toggleVisibility(target: PageDefinition) {
    await fetch('/api/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...target, is_visible: !target.is_visible }),
    })
    window.dispatchEvent(new CustomEvent('pd:pages-changed'))
    onSaved?.()
    await load()
  }

  async function deletePage(target: PageDefinition) {
    if (target.is_system) return
    if (!window.confirm('حذف هذه القائمة نهائياً؟')) return
    await fetch('/api/pages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id: target.id }),
    })
    window.dispatchEvent(new CustomEvent('pd:pages-changed'))
    onSaved?.()
    await load()
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-3 md:p-6" onClick={onClose}>
      <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <NeonCard glow className="max-h-[92vh] overflow-y-auto p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-extrabold text-foreground">إدارة القوائم والمحتوى</h3>
              <p className="mt-1 text-xs text-muted-foreground">تعديل الاسم والوصف والأيقونة وإخفاء القوائم وإنشاء صفحات جديدة من الصفر.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage(blankPage())} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/25">
                <FilePlus2 className="size-4" /> قائمة جديدة
              </button>
              <button type="button" onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {message ? <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{message}</div> : null}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">جاري تحميل القوائم...</p>
          ) : (
            <div className="grid gap-3">
              {pages.map((item) => (
                <div key={item.id || item.slug} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={item.is_visible ? 'neon' : 'muted'}>{item.is_visible ? 'مفعلة' : 'مخفية'}</Pill>
                        {item.is_system ? <Pill tone="gold">أساسية</Pill> : <Pill tone="muted">مخصصة</Pill>}
                        <span className="font-mono text-xs text-muted-foreground">/{item.slug}</span>
                      </div>
                      <h4 className="mt-2 font-heading text-base font-extrabold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setPage({ ...item, blocks: item.blocks ?? [] })} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                        <Pencil className="size-3.5" /> تعديل
                      </button>
                      <button type="button" onClick={() => void toggleVisibility(item)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/40">
                        {item.is_visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        {item.is_visible ? 'إخفاء' : 'إظهار'}
                      </button>
                      {!item.is_system ? (
                        <button type="button" onClick={() => void deletePage(item)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20">
                          <Trash2 className="size-3.5" /> حذف
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeonCard>
      </div>

      {page ? (
        <PageEditor page={page} setPage={setPage} saving={saving} onSave={() => void save()} onClose={() => setPage(null)} />
      ) : null}
    </div>
  )
}

function PageEditor({
  page,
  setPage,
  saving,
  onSave,
  onClose,
}: {
  page: PageDefinition
  setPage: (page: PageDefinition | null) => void
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  const isSops = page.slug === 'sops' || page.renderer === 'sops'
  const canEditBlocks = !isSops
  const update = (patch: Partial<PageDefinition>) => setPage({ ...page, ...patch })

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-3" onClick={onClose}>
      <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <NeonCard glow className="max-h-[92vh] overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-heading text-lg font-extrabold text-foreground">{page.id ? 'تعديل القائمة' : 'إنشاء قائمة من الصفر'}</h4>
              <p className="mt-1 text-xs text-muted-foreground">الصفحات المخصصة تعمل كصفحة محتوى ويمكنك بناءها ببلوكات جاهزة.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-md border border-border p-2 text-muted-foreground"><X className="size-4" /></button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="معرّف القائمة">
              <input value={page.slug} disabled={page.is_system} onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input-base" placeholder="my-page" />
            </Field>
            <Field label="اسم القائمة">
              <input value={page.title} onChange={(e) => update({ title: e.target.value })} className="input-base" placeholder="اسم القائمة" />
            </Field>
            <Field label="الوصف">
              <input value={page.description} onChange={(e) => update({ description: e.target.value })} className="input-base" placeholder="وصف القائمة" />
            </Field>
            <Field label="الوظيفة">
              <select value={page.page_type} onChange={(e) => update({ page_type: e.target.value })} className="input-base">
                <option value="content">صفحة محتوى</option>
                <option value="handbook">كتيب / بروتوكول</option>
                <option value="table">جدول / دليل بيانات</option>
              </select>
            </Field>
            <Field label="الأيقونة">
              <select value={page.icon} onChange={(e) => update({ icon: e.target.value })} className="input-base">
                {PAGE_ICON_OPTIONS.map((option) => <option key={option.name} value={option.name}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="ترتيب القائمة">
              <input type="number" value={page.sort_order} onChange={(e) => update({ sort_order: Number(e.target.value) })} className="input-base" />
            </Field>
          </div>

          {isSops ? (
            <SopsCopyEditor
              blocks={page.blocks}
              onChange={(values) => update({ blocks: setSopsCopy(page.blocks, values), renderer: 'sops' })}
            />
          ) : canEditBlocks ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h5 className="font-heading text-sm font-bold text-foreground">{page.renderer === 'cms' ? 'محتوى الصفحة' : 'محتوى إضافي لهذه القائمة'}</h5>
                  <p className="text-[11px] text-muted-foreground">{page.renderer === 'cms' ? 'تقدر تضيف نصوص، قوائم، تنبيهات، جداول وبطاقات.' : 'يظهر هذا المحتوى أسفل الوظيفة الأساسية للقائمة ويمكن تعديله أو حذفه في أي وقت.'}</p>
                </div>
                <BlockAdd onAdd={(block) => update({ blocks: [...page.blocks, block] })} />
              </div>
              <div className="flex flex-col gap-3">
                {page.blocks.map((block, index) => (
                  <BlockEditor
                    key={index}
                    block={block}
                    index={index}
                    total={page.blocks.length}
                    onChange={(next) => update({ blocks: page.blocks.map((item, i) => i === index ? next : item) })}
                    onDelete={() => update({ blocks: page.blocks.filter((_, i) => i !== index) })}
                    onMove={(direction) => {
                      const next = [...page.blocks]
                      const target = index + direction
                      if (target < 0 || target >= next.length) return
                      const item = next[index]
                      next[index] = next[target]
                      next[target] = item
                      update({ blocks: next })
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              هذه قائمة بنظام متخصص؛ يمكنك تغيير بياناتها من أدوات الإدارة الخاصة بها، مثل كشف القوات أو المخالفات أو اللاسلكي.
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button>
            <button type="button" onClick={onSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50">
              <Save className="size-4" /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}

function SopsCopyEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[]
  onChange: (values: Record<string, string>) => void
}) {
  const values = getSopsCopy(blocks)
  return (
    <div className="mt-5 rounded-xl border border-border bg-background/30 p-4">
      <div className="mb-4">
        <h5 className="font-heading text-sm font-bold text-foreground">نصوص كتيب البروتوكولات</h5>
        <p className="mt-1 text-[11px] text-muted-foreground">كل تعديل هنا محلي داخل النموذج ولن يُحفظ إلا عند الضغط على زر «حفظ» أسفل النافذة.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {SOPS_COPY_FIELDS.map((field) => (
          <Field key={field.key} label={field.label}>
            <textarea
              value={values[field.key] ?? DEFAULT_SOPS_COPY[field.key] ?? ''}
              rows={field.rows ?? 2}
              onChange={(event) => onChange({ ...values, [field.key]: event.target.value })}
              className="input-base resize-y"
            />
          </Field>
        ))}
      </div>
    </div>
  )
}

function BlockAdd({ onAdd }: { onAdd: (block: ContentBlock) => void }) {
  return (
    <select value="" onChange={(e) => {
      if (!e.target.value) return
      onAdd(makeBlock(e.target.value))
      e.currentTarget.value = ''
    }} className="input-base w-auto text-xs">
      <option value="">+ إضافة محتوى</option>
      <option value="heading">عنوان</option>
      <option value="paragraph">فقرة</option>
      <option value="list">قائمة</option>
      <option value="callout">تنبيه</option>
      <option value="table">جدول</option>
      <option value="stats">بطاقات إحصائية</option>
    </select>
  )
}

function makeBlock(type: string): ContentBlock {
  if (type === 'heading') return { type: 'heading', text: 'عنوان جديد' }
  if (type === 'paragraph') return { type: 'paragraph', text: 'اكتب المحتوى هنا...' }
  if (type === 'list') return { type: 'list', title: 'عنوان القائمة', items: ['عنصر جديد'] }
  if (type === 'callout') return { type: 'callout', tone: 'info', title: 'عنوان التنبيه', text: 'اكتب النص هنا...' }
  if (type === 'table') return { type: 'table', title: 'جدول جديد', columns: ['الاسم', 'الوصف'], rows: [['', '']] }
  return { type: 'stats', items: [{ value: '0', label: 'عنوان', hint: '' }] }
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  block: ContentBlock
  index: number
  total: number
  onChange: (block: ContentBlock) => void
  onDelete: () => void
  onMove: (direction: number) => void
}) {
  if (block.type === 'sops-copy') return null

  return (
    <div className="rounded-xl border border-border bg-background/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">بلوك {index + 1} • {block.type}</span>
        <div className="flex gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded border border-border p-1.5 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded border border-border p-1.5 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
          <button type="button" onClick={onDelete} className="rounded border border-destructive/40 p-1.5 text-destructive"><Trash2 className="size-3.5" /></button>
        </div>
      </div>
      {block.type === 'heading' || block.type === 'paragraph' ? (
        <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className="input-base min-h-24 resize-y" />
      ) : null}
      {block.type === 'list' ? (
        <div className="grid gap-2">
          <input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input-base" placeholder="عنوان القائمة" />
          <textarea value={block.items.join('\n')} onChange={(e) => onChange({ ...block, items: e.target.value.split('\n').filter(Boolean) })} className="input-base min-h-32 resize-y" placeholder="عنصر في كل سطر" />
        </div>
      ) : null}
      {block.type === 'callout' ? (
        <div className="grid gap-2">
          <select value={block.tone ?? 'info'} onChange={(e) => onChange({ ...block, tone: e.target.value as 'info' | 'warn' | 'danger' })} className="input-base">
            <option value="info">معلومة</option>
            <option value="warn">تحذير</option>
            <option value="danger">خطر</option>
          </select>
          <input value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input-base" placeholder="العنوان" />
          <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className="input-base min-h-28 resize-y" placeholder="النص" />
        </div>
      ) : null}
      {block.type === 'table' ? (
        <TableBlockEditor block={block} onChange={onChange} />
      ) : null}
      {block.type === 'stats' ? (
        <StatsBlockEditor block={block} onChange={onChange} />
      ) : null}
    </div>
  )
}

function TableBlockEditor({ block, onChange }: { block: Extract<ContentBlock,{type:'table'}>; onChange:(block:ContentBlock)=>void }) {
  return (
    <div className="grid gap-2">
      <input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input-base" placeholder="عنوان الجدول" />
      <Field label="الأعمدة — كل عمود في سطر">
        <textarea value={block.columns.join('\n')} onChange={(e) => {
          const columns=e.target.value.split('\n').filter(Boolean)
          const rows=block.rows.map((row)=>columns.map((_,i)=>row[i]??''))
          onChange({ ...block, columns, rows })
        }} className="input-base min-h-20 resize-y" />
      </Field>
      <Field label="الصفوف — استخدم | بين الأعمدة، وسطر لكل صف">
        <textarea value={block.rows.map((row)=>row.join('|')).join('\n')} onChange={(e) => {
          const rows=e.target.value.split('\n').filter((line)=>line.trim()).map((line)=>line.split('|'))
          onChange({ ...block, rows })
        }} className="input-base min-h-28 resize-y font-mono text-xs" />
      </Field>
    </div>
  )
}

function StatsBlockEditor({ block, onChange }: { block: Extract<ContentBlock,{type:'stats'}>; onChange:(block:ContentBlock)=>void }) {
  return (
    <Field label="البطاقات — value|label|hint لكل سطر">
      <textarea value={block.items.map((item)=>[item.value,item.label,item.hint??''].join('|')).join('\n')} onChange={(e)=>{
        const items=e.target.value.split('\n').filter(Boolean).map((line)=>{const [value,label,hint]=line.split('|');return {value:value??'',label:label??'',hint:hint??''}})
        onChange({ ...block, items })
      }} className="input-base min-h-24 resize-y font-mono text-xs" />
    </Field>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label>
}
