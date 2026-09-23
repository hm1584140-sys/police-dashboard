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
  Plus,
  Copy,
  Pencil,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NeonCard, Pill, StatCard, InfoBlock } from '@/components/portal/primitives'
import { pursuitCapacity, robberyCapacity } from '@/lib/police-data'
import { PAGE_ICON_MAP, type ContentBlock, type PageDefinition } from '@/lib/page-types'
import { DEFAULT_SOPS_COPY, SOPS_COPY_FIELDS, getSopsCopy, setSopsCopy } from '@/lib/sops-copy'
import { useAdmin } from '@/lib/admin-context'

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

type Copy = Record<string, string>
type CustomSection = Extract<ContentBlock, { type: 'sops-section' }>
type SectionTemplate = NonNullable<CustomSection['template']>
type SectionEditorState = {
  id?: string
  title: string
  content: string
  template: SectionTemplate
  values: Record<string, string>
}

const TEMPLATE_LABELS: Record<SectionTemplate, string> = {
  plain: 'قسم حر',
  general: 'نفس تصميم القواعد العامة',
  cuffs: 'نفس تصميم الكلبشة والتيزر',
  fire: 'نفس تصميم إطلاق النار',
  arrest: 'نفس تصميم الاعتقال وميراندا',
  pursuit: 'نفس تصميم المطاردات و PIT',
  vehiclefire: 'نفس تصميم إطلاق النار على المركبة',
  capacity: 'نفس تصميم القوة الاستيعابية',
  failsafe: 'نفس تصميم مفشلات الهروب',
}

const TEMPLATE_KEYS: Record<SectionTemplate, string[]> = {
  plain: [],
  general: ['general_1','general_2','general_extra'],
  cuffs: ['cuffs_intro','cuffs_items','taser_intro','taser_direct_intro','taser_items','cuffs_extra'],
  fire: ['fire_intro','fire_items','fire_extra'],
  arrest: ['arrest_intro','miranda','post_arrest','arrest_extra'],
  pursuit: ['dispatch','pit_intro','pit_items','pit_conditions','pursuit_extra'],
  vehiclefire: ['vehicle_intro','vehicle_cases','vehicle_extra'],
  capacity: [],
  failsafe: ['failsafe_items','foot_escape','max_escape','failsafe_extra'],
}

function templateValues(template: SectionTemplate, source: Copy = DEFAULT_SOPS_COPY) {
  return Object.fromEntries(TEMPLATE_KEYS[template].map((key) => [key, source[key] ?? '']))
}

function lines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function Extra({ text }: { text?: string }) {
  if (!text?.trim()) return null
  return <NeonCard className="p-5 whitespace-pre-wrap text-sm leading-8 text-foreground">{text}</NeonCard>
}

export function SopsPortal({ page }: { page?: PageDefinition }) {
  const { token, can } = useAdmin()
  const editable = Boolean(token && can('pages.manage') && page?.id)
  const [sub, setSub] = useState<string>('general')
  const [sectionEditor, setSectionEditor] = useState<SectionEditorState | null>(null)
  const [inlineEdit, setInlineEdit] = useState<{ key: string; value: string } | null>(null)
  const copy = useMemo(() => getSopsCopy(page?.blocks), [page?.blocks])
  const customSections = useMemo(
    () => (page?.blocks ?? []).filter((block): block is CustomSection => block.type === 'sops-section'),
    [page?.blocks],
  )
  const navigation = useMemo(
    () => [
      ...SUB.map((item) => ({ ...item, custom: false as const })),
      ...customSections.map((item) => ({
        id: item.id,
        label: item.title,
        icon: PAGE_ICON_MAP[item.icon] ?? ScrollText,
        custom: true as const,
      })),
    ],
    [customSections],
  )

  async function saveBlocks(blocks: ContentBlock[]) {
    if (!editable || !page || !token) return
    const res = await fetch('/api/pages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...page, blocks }),
    })
    if (res.ok) window.dispatchEvent(new CustomEvent('pd:pages-changed'))
  }

  async function saveCopyValue(key: string, value: string) {
    if (!page) return
    const next = setSopsCopy(page.blocks ?? [], { ...copy, [key]: value })
    await saveBlocks(next)
    setInlineEdit(null)
  }

  async function saveSectionEditor() {
    if (!sectionEditor || !page) return
    const existing = (page.blocks ?? []).filter((block) => block.type !== 'sops-section' || block.id !== sectionEditor.id)
    const id = sectionEditor.id || 'sops-' + crypto.randomUUID()
    const section: CustomSection = {
      type: 'sops-section',
      id,
      title: sectionEditor.title.trim() || 'قسم جديد',
      icon: 'ScrollText',
      content: sectionEditor.content,
      template: sectionEditor.template,
      values: sectionEditor.values,
    }
    await saveBlocks([...existing, section])
    setSectionEditor(null)
    setSub(id)
  }

  function snapshotCurrentSection() {
    const nav = navigation.find((item) => item.id === sub)
    const custom = customSections.find((item) => item.id === sub)
    if (custom) {
      const template = custom.template ?? 'plain'
      setSectionEditor({
        title: 'نسخة من ' + custom.title,
        content: custom.content ?? '',
        template,
        values: { ...templateValues(template, copy), ...(custom.values ?? {}) },
      })
      return
    }

    const template: SectionTemplate = (SUB.some((item) => item.id === sub) ? sub : 'plain') as SectionTemplate
    setSectionEditor({
      title: 'نسخة من ' + (nav?.label ?? 'قسم'),
      content: '',
      template,
      values: templateValues(template, copy),
    })
  }

  function editCustomSection(section: CustomSection) {
    const template = section.template ?? 'plain'
    setSectionEditor({
      id: section.id,
      title: section.title,
      content: section.content ?? '',
      template,
      values: { ...templateValues(template, copy), ...(section.values ?? {}) },
    })
  }

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
        <StatCard value={String(8 + customSections.length)} label="أقسام" hint="بروتوكولات شاملة" />
        <StatCard value="إلزامي" label="على جميع الرتب" hint="وكافة التفرعات" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <NeonCard className="h-fit p-2 lg:sticky lg:top-36">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">أقسام البروتوكولات</p>
            {editable ? <button type="button" onClick={() => setSectionEditor({ title: 'قسم جديد', content: '', template: 'general', values: templateValues('general', copy) })} title="إضافة قسم" className="inline-flex size-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary"><Plus className="size-3.5" /></button> : null}
          </div>
          <div className="flex flex-col gap-1">
            {navigation.map((s) => {
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
          {editable ? <div className="mb-3 flex justify-end gap-2">
            <button type="button" onClick={snapshotCurrentSection} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary"><Copy className="size-3.5" /> نسخ هذا القسم</button>
          </div> : null}
          {sub === 'general' && <GeneralRules copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'cuffs' && <CuffsTaser copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'fire' && <FireArmed copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'arrest' && <ArrestMiranda copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'pursuit' && <PursuitPit copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'vehiclefire' && <VehicleFire copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {sub === 'capacity' && <RobberyCapacity />}
          {sub === 'failsafe' && <FailSafe copy={copy} editable={editable} onEdit={(key,value)=>setInlineEdit({key,value})} />}
          {customSections.map((section) =>
            sub === section.id ? (
              <div key={section.id}>
                {editable ? <div className="mb-3 flex justify-end"><button type="button" onClick={() => editCustomSection(section)} className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"><Pencil className="size-3.5" /> تعديل هذا القسم</button></div> : null}
                <CustomSopsSection section={section} baseCopy={copy} />
              </div>
            ) : null,
          )}
        </div>
      </div>
      {sectionEditor ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 p-3" onClick={() => setSectionEditor(null)}>
          <div className="w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="p-5">
              <div className="mb-4 flex items-center justify-between"><h4 className="font-heading text-lg font-extrabold">إضافة / تعديل قسم بروتوكول</h4><button type="button" onClick={()=>setSectionEditor(null)} className="rounded border border-border p-2"><X className="size-4"/></button></div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">اسم القسم</span><input value={sectionEditor.title} onChange={(e)=>setSectionEditor({...sectionEditor,title:e.target.value})} className="input-base" placeholder="اسم القسم"/></label>
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">تصميم القسم</span>
                  <select value={sectionEditor.template} onChange={(e)=>{
                    const template=e.target.value as SectionTemplate
                    setSectionEditor({...sectionEditor,template,values:{...templateValues(template,copy),...sectionEditor.values}})
                  }} className="input-base">
                    {Object.entries(TEMPLATE_LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
              </div>

              {sectionEditor.template === 'plain' ? (
                <label className="mt-3 block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">محتوى حر</span><textarea value={sectionEditor.content} onChange={(e)=>setSectionEditor({...sectionEditor,content:e.target.value})} className="input-base min-h-72 resize-y" placeholder="محتوى القسم..."/></label>
              ) : sectionEditor.template === 'capacity' ? (
                <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">هذا القالب يستخدم نفس تصميم جدول القوة الاستيعابية الأصلي.</div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-border bg-background/35 p-3"><p className="text-xs font-bold text-primary">المحرر مرتب حسب مكان ظهور النص في التصميم، وليس حقل واحد مبهم.</p></div>
                  {TEMPLATE_KEYS[sectionEditor.template].map((key)=>{
                    const field=SOPS_COPY_FIELDS.find((item)=>item.key===key)
                    return <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">{field?.label ?? key}</span><textarea rows={field?.rows ?? 2} value={sectionEditor.values[key] ?? ''} onChange={(e)=>setSectionEditor({...sectionEditor,values:{...sectionEditor.values,[key]:e.target.value}})} className="input-base resize-y"/></label>
                  })}
                </div>
              )}

              <div className="mt-5 rounded-xl border border-border bg-background/30 p-4">
                <p className="mb-3 text-xs font-bold text-muted-foreground">معاينة مباشرة لنفس شكل القسم في الموقع</p>
                <CustomSopsSection section={{ type:'sops-section', id:sectionEditor.id ?? 'preview', title:sectionEditor.title, icon:'ScrollText', content:sectionEditor.content, template:sectionEditor.template, values:sectionEditor.values }} baseCopy={copy} />
              </div>

              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setSectionEditor(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void saveSectionEditor()} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">حفظ القسم</button></div>
            </NeonCard>
          </div>
        </div>
      ) : null}

      {inlineEdit ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/75 p-3" onClick={()=>setInlineEdit(null)}>
          <div className="w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="p-5">
              <div className="mb-3 flex items-center gap-2"><Pencil className="size-4 text-primary"/><h4 className="font-heading font-extrabold">تعديل النص مباشرة</h4></div>
              <textarea value={inlineEdit.value} onChange={(e)=>setInlineEdit({...inlineEdit,value:e.target.value})} className="input-base min-h-44 resize-y"/>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setInlineEdit(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void saveCopyValue(inlineEdit.key,inlineEdit.value)} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">حفظ النص</button></div>
            </NeonCard>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CustomSopsSection({ section, baseCopy }: { section: CustomSection; baseCopy: Copy }) {
  const template = section.template ?? 'plain'
  if (template === 'plain') {
    return (
      <NeonCard className="p-5">
        <h3 className="font-heading text-lg font-extrabold text-primary">{section.title}</h3>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-8 text-foreground">{section.content || 'هذا القسم فارغ حالياً.'}</div>
      </NeonCard>
    )
  }

  const localCopy = { ...baseCopy, ...(section.values ?? {}) }
  return (
    <div className="flex flex-col gap-4">
      <NeonCard className="p-4"><h3 className="font-heading text-lg font-extrabold text-primary">{section.title}</h3></NeonCard>
      {template === 'general' ? <GeneralRules copy={localCopy} /> : null}
      {template === 'cuffs' ? <CuffsTaser copy={localCopy} /> : null}
      {template === 'fire' ? <FireArmed copy={localCopy} /> : null}
      {template === 'arrest' ? <ArrestMiranda copy={localCopy} /> : null}
      {template === 'pursuit' ? <PursuitPit copy={localCopy} /> : null}
      {template === 'vehiclefire' ? <VehicleFire copy={localCopy} /> : null}
      {template === 'capacity' ? <RobberyCapacity /> : null}
      {template === 'failsafe' ? <FailSafe copy={localCopy} /> : null}
    </div>
  )
}

function GeneralRules({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="القواعد العامة والولايات">
        <p onDoubleClick={() => editable && onEdit?.('general_1', copy.general_1)} className={editable ? 'cursor-text' : ''}>{copy.general_1}</p>
        <p onDoubleClick={() => editable && onEdit?.('general_2', copy.general_2)} className={editable ? 'mt-3 cursor-text' : 'mt-3'}>{copy.general_2}</p>
      </InfoBlock>
      <div className="grid gap-4 sm:grid-cols-3">
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">SASP</p><p className="text-xs text-muted-foreground">الخطوط السريعة (بدعوة خاصة)</p></NeonCard>
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">LSPD</p><p className="text-xs text-muted-foreground">مشن روو والمدينة</p></NeonCard>
        <NeonCard className="p-4 text-center"><p className="font-heading text-lg font-bold text-primary">BCSO</p><p className="text-xs text-muted-foreground">الضواحي والمناطق الريفية</p></NeonCard>
      </div>
      <div onDoubleClick={() => editable && onEdit?.('general_extra', copy.general_extra)} className={editable ? 'cursor-text' : ''}><Extra text={copy.general_extra} /></div>
    </div>
  )
}

function CuffsTaser({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="بروتوكولات الكلبشة" tone="warn">
        <p onDoubleClick={()=>editable&&onEdit?.('cuffs_intro',copy.cuffs_intro)} className={editable?'cursor-text':''}>{copy.cuffs_intro}</p>
        <ol onDoubleClick={()=>editable&&onEdit?.('cuffs_items',copy.cuffs_items)} className={cn('mt-3 list-decimal space-y-1.5 pr-5 marker:text-primary',editable&&'cursor-text')}>
          {lines(copy.cuffs_items).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </InfoBlock>
      <InfoBlock title="بروتوكول استخدام التيزر">
        <p onDoubleClick={()=>editable&&onEdit?.('taser_intro',copy.taser_intro)} className={editable?'cursor-text':''}>{copy.taser_intro}</p>
        <p onDoubleClick={()=>editable&&onEdit?.('taser_direct_intro',copy.taser_direct_intro)} className={editable?'mt-3 cursor-text':'mt-3'}>{copy.taser_direct_intro}</p>
        <ul onDoubleClick={()=>editable&&onEdit?.('taser_items',copy.taser_items)} className={cn('mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive',editable&&'cursor-text')}>
          {lines(copy.taser_items).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </InfoBlock>
      <div onDoubleClick={()=>editable&&onEdit?.('cuffs_extra',copy.cuffs_extra)} className={editable?'cursor-text':''}><Extra text={copy.cuffs_extra} /></div>
    </div>
  )
}

function FireArmed({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="إطلاق النار على المسلحين" tone="danger">
        <p onDoubleClick={()=>editable&&onEdit?.('fire_intro',copy.fire_intro)} className={editable?'cursor-text':''}>{copy.fire_intro}</p>
        <ol onDoubleClick={()=>editable&&onEdit?.('fire_items',copy.fire_items)} className={cn('mt-3 list-decimal space-y-2 pr-5 marker:text-destructive',editable&&'cursor-text')}>
          {lines(copy.fire_items).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </InfoBlock>
      <div onDoubleClick={()=>editable&&onEdit?.('fire_extra',copy.fire_extra)} className={editable?'cursor-text':''}><Extra text={copy.fire_extra} /></div>
    </div>
  )
}

function ArrestMiranda({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="الاعتقال وحقوق ميراندا"><p onDoubleClick={()=>editable&&onEdit?.('arrest_intro',copy.arrest_intro)} className={editable?'cursor-text':''}>{copy.arrest_intro}</p></InfoBlock>
      <NeonCard glow className="p-6"><p onDoubleClick={()=>editable&&onEdit?.('miranda',copy.miranda)} className={cn('border-r-4 border-r-primary pr-4 font-heading text-base leading-loose text-foreground',editable&&'cursor-text')}>«{copy.miranda}»</p></NeonCard>
      <InfoBlock title="إجراءات ما بعد الاعتقال"><p onDoubleClick={()=>editable&&onEdit?.('post_arrest',copy.post_arrest)} className={editable?'cursor-text':''}>{copy.post_arrest}</p></InfoBlock>
      <div onDoubleClick={()=>editable&&onEdit?.('arrest_extra',copy.arrest_extra)} className={editable?'cursor-text':''}><Extra text={copy.arrest_extra} /></div>
    </div>
  )
}

function PursuitPit({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {pursuitCapacity.map((row) => <NeonCard key={row.type} className="p-4"><p className="font-heading text-sm font-bold text-foreground">{row.type}</p><p className="mt-1 font-mono text-primary">{row.units}</p></NeonCard>)}
      </div>
      <InfoBlock title="تحديثات الدسباتش"><p onDoubleClick={()=>editable&&onEdit?.('dispatch',copy.dispatch)} className={editable?'cursor-text':''}>{copy.dispatch}</p></InfoBlock>
      <InfoBlock title="مناورة الصدم (PIT Maneuver)" tone="warn">
        <p onDoubleClick={()=>editable&&onEdit?.('pit_intro',copy.pit_intro)} className={editable?'cursor-text':''}>{copy.pit_intro}</p>
        <ol onDoubleClick={()=>editable&&onEdit?.('pit_items',copy.pit_items)} className={cn('mt-2 list-decimal space-y-1.5 pr-5 marker:text-primary',editable&&'cursor-text')}>{lines(copy.pit_items).map((item) => <li key={item}>{item}</li>)}</ol>
        <p className="mt-4 font-bold text-foreground">الشروط الصارمة للـ PIT:</p>
        <ul onDoubleClick={()=>editable&&onEdit?.('pit_conditions',copy.pit_conditions)} className={cn('mt-2 list-disc space-y-1.5 pr-5 marker:text-destructive',editable&&'cursor-text')}>{lines(copy.pit_conditions).map((item) => <li key={item}>{item}</li>)}</ul>
      </InfoBlock>
      <div onDoubleClick={()=>editable&&onEdit?.('pursuit_extra',copy.pursuit_extra)} className={editable?'cursor-text':''}><Extra text={copy.pursuit_extra} /></div>
    </div>
  )
}

function VehicleFire({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  const cases = lines(copy.vehicle_cases).map((line) => {
    const [t, ...rest] = line.split('|')
    return { t: t || 'حالة', d: rest.join('|') }
  })
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="إطلاق النار على المركبة" tone="danger"><p onDoubleClick={()=>editable&&onEdit?.('vehicle_intro',copy.vehicle_intro)} className={editable?'cursor-text':''}>{copy.vehicle_intro}</p></InfoBlock>
      <div onDoubleClick={()=>editable&&onEdit?.('vehicle_cases',copy.vehicle_cases)} className={cn('grid gap-3',editable&&'cursor-text')}>
        {cases.map((item, i) => (
          <NeonCard key={`${item.t}-${i}`} className="flex items-start gap-4 p-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-destructive/50 bg-destructive/15 font-mono font-bold text-destructive">{i + 1}</span>
            <div><p className="font-heading font-bold text-foreground">{item.t}</p><p className="text-sm text-muted-foreground">{item.d}</p></div>
          </NeonCard>
        ))}
      </div>
      <div onDoubleClick={()=>editable&&onEdit?.('vehicle_extra',copy.vehicle_extra)} className={editable?'cursor-text':''}><Extra text={copy.vehicle_extra} /></div>
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

function FailSafe({ copy, editable, onEdit }: { copy: Copy; editable?: boolean; onEdit?: (key:string,value:string)=>void }) {
  return (
    <div className="flex flex-col gap-4">
      <div onDoubleClick={()=>editable&&onEdit?.('failsafe_items',copy.failsafe_items)} className={cn('grid gap-2.5 sm:grid-cols-2',editable&&'cursor-text')}>
        {lines(copy.failsafe_items).map((item) => <div key={item} className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-foreground"><ShieldOff className="size-4 shrink-0 text-destructive" /><span className="font-heading">{item}</span></div>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NeonCard glow className="p-4"><p className="font-heading font-bold text-foreground">الهروب على الأقدام بسلاح</p><p onDoubleClick={()=>editable&&onEdit?.('foot_escape',copy.foot_escape)} className={editable?'cursor-text text-sm text-muted-foreground':'text-sm text-muted-foreground'}>{copy.foot_escape}</p></NeonCard>
        <NeonCard glow className="p-4"><p className="font-heading font-bold text-foreground">الحد الأقصى الكلي للهروب</p><p onDoubleClick={()=>editable&&onEdit?.('max_escape',copy.max_escape)} className={editable?'cursor-text font-mono text-primary':'font-mono text-primary'}>{copy.max_escape}</p></NeonCard>
      </div>
      <div onDoubleClick={()=>editable&&onEdit?.('failsafe_extra',copy.failsafe_extra)} className={editable?'cursor-text':''}><Extra text={copy.failsafe_extra} /></div>
    </div>
  )
}
