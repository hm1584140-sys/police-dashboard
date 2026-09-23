'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2, Pencil, Plus, Trash2, ArrowRight, ArrowLeft, X } from 'lucide-react'
import { getSopsCopy } from '@/lib/sops-copy'
import type { ContentBlock, PageDefinition } from '@/lib/page-types'
import { pursuitCapacity, robberyCapacity } from '@/lib/police-data'
import { useAdmin } from '@/lib/admin-context'
import { NeonCard } from '../primitives'

type BookLeaf = { id: string; title: string; body: string }

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function bodyLines(body:string){
  return body.split('\n').map((item)=>item.trim()).filter(Boolean)
}

export function SopsBook({ page }: { page?: PageDefinition }) {
  const { token, can } = useAdmin()
  const editable=Boolean(token && can('pages.manage') && page?.id)
  const [sops, setSops] = useState<PageDefinition | null>(null)
  const [spread, setSpread] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null)
  const [editor,setEditor]=useState<{index:number;title:string;body:string}|null>(null)

  useEffect(() => {
    fetch('/api/pages', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : [])
      .then((pages: PageDefinition[]) => setSops(pages.find((item) => item.slug === 'sops') ?? null))
      .catch(() => {})
  }, [])

  const copy = useMemo(() => getSopsCopy(sops?.blocks), [sops?.blocks])

  const generatedLeaves = useMemo<BookLeaf[]>(() => {
    const custom = (sops?.blocks ?? []).filter((block): block is Extract<typeof block, { type: 'sops-section' }> => block.type === 'sops-section')
    return [
      { id:'cover', title: copy.hero_title || 'دليل الإجراءات التشغيلية', body: [copy.hero_subtitle || 'المرجع المعتمد','CLASSIFIED • INTERNAL USE',page?.description || 'دليل بروتوكولات وقواعد جهاز الشرطة.'].join('\n') },
      { id:'general', title: 'القواعد العامة والولايات', body: [copy.general_1, copy.general_2, copy.general_extra].filter(Boolean).join('\n\n') },
      { id:'cuffs', title: 'الكلبشة والتيزر', body: [copy.cuffs_intro, ...splitLines(copy.cuffs_items), copy.taser_intro, copy.taser_direct_intro, ...splitLines(copy.taser_items), copy.cuffs_extra].filter(Boolean).join('\n') },
      { id:'fire', title: 'إطلاق النار على المسلحين', body: [copy.fire_intro, ...splitLines(copy.fire_items), copy.fire_extra].filter(Boolean).join('\n') },
      { id:'arrest', title: 'الاعتقال وحقوق ميراندا', body: [copy.arrest_intro, copy.miranda, copy.post_arrest, copy.arrest_extra].filter(Boolean).join('\n\n') },
      { id:'pursuit', title: 'المطاردات والـ PIT', body: [...pursuitCapacity.map((row) => row.type + ' — ' + row.units), copy.dispatch, copy.pit_intro, ...splitLines(copy.pit_items), ...splitLines(copy.pit_conditions), copy.pursuit_extra].filter(Boolean).join('\n') },
      { id:'vehicle', title: 'إطلاق النار على المركبة', body: [copy.vehicle_intro, ...splitLines(copy.vehicle_cases).map((line) => line.replace('|', ' — ')), copy.vehicle_extra].filter(Boolean).join('\n') },
      { id:'capacity', title: 'القوة الاستيعابية للسرقات', body: robberyCapacity.map((row) => row.type + ' — ' + row.units).join('\n') },
      { id:'failsafe', title: 'مفشلات الهروب الآمن', body: [...splitLines(copy.failsafe_items), 'الهروب على الأقدام بسلاح — ' + copy.foot_escape, 'الحد الأقصى الكلي للهروب — ' + copy.max_escape, copy.failsafe_extra].filter(Boolean).join('\n') },
      ...custom.map((section) => ({
        id:section.id,
        title: section.title,
        body: section.content?.trim() || Object.values(section.values ?? {}).filter(Boolean).join('\n'),
      })),
    ]
  }, [copy, page?.description, sops?.blocks])

  const customBookPages=useMemo(
    ()=>(page?.blocks??[]).filter((block):block is Extract<ContentBlock,{type:'book-page'}>=>block.type==='book-page'),
    [page?.blocks],
  )

  const leaves=useMemo<BookLeaf[]>(
    ()=>customBookPages.length?customBookPages.map((block)=>({id:block.id,title:block.title,body:block.body})):generatedLeaves,
    [customBookPages,generatedLeaves],
  )

  const pages = useMemo(() => {
    const padded = [...leaves]
    if (padded.length % 2) padded.push({ id:'blank-end', title: '', body: '' })
    return padded
  }, [leaves])

  const maxSpread = Math.max(0, Math.ceil(pages.length / 2) - 1)
  const leftIndex=spread*2
  const rightIndex=spread*2+1
  const left = pages[leftIndex]
  const right = pages[rightIndex]

  async function persist(nextLeaves:BookLeaf[]){
    if(!page || !token) return
    const bookBlocks:ContentBlock[]=nextLeaves.map((leaf)=>({type:'book-page',id:leaf.id,title:leaf.title,body:leaf.body}))
    const keep=(page.blocks??[]).filter((block)=>block.type!=='book-page')
    const res=await fetch('/api/pages',{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token,...page,blocks:[...keep,...bookBlocks],renderer:'book'}),
    })
    if(res.ok) window.dispatchEvent(new CustomEvent('pd:pages-changed'))
  }

  function editableLeaves(){
    return leaves.map((leaf)=>({...leaf}))
  }

  function openEditor(index:number){
    const leaf=leaves[index]
    if(!leaf) return
    setEditor({index,title:leaf.title,body:leaf.body})
  }

  async function saveEditor(){
    if(!editor) return
    const next=editableLeaves()
    if(!next[editor.index]) return
    next[editor.index]={...next[editor.index],title:editor.title,body:editor.body}
    setEditor(null)
    await persist(next)
  }

  async function addPage(){
    const next=editableLeaves()
    const insertAt=Math.min(next.length,rightIndex+1)
    next.splice(insertAt,0,{id:'book-'+crypto.randomUUID(),title:'صفحة جديدة',body:'اكتب محتوى الصفحة هنا...'})
    await persist(next)
    setSpread(Math.floor(insertAt/2))
  }

  async function deletePage(index:number){
    if(leaves.length<=1 || !leaves[index]) return
    const next=editableLeaves()
    next.splice(index,1)
    await persist(next)
    setSpread((current)=>Math.min(current,Math.max(0,Math.ceil(next.length/2)-1)))
  }

  async function movePage(index:number,direction:-1|1){
    const next=editableLeaves()
    const target=index+direction
    if(!next[index] || target<0 || target>=next.length) return
    ;[next[index],next[target]]=[next[target],next[index]]
    await persist(next)
    setSpread(Math.floor(target/2))
  }

  function turn(direction: 'next' | 'prev') {
    if (turning) return
    const next = direction === 'next' ? Math.min(maxSpread, spread + 1) : Math.max(0, spread - 1)
    if (next === spread) return
    setTurning(direction)
    window.setTimeout(() => {
      setSpread(next)
      setTurning(null)
    }, 260)
  }

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if(editor) return
      if (event.key === 'ArrowLeft') turn('next')
      if (event.key === 'ArrowRight') turn('prev')
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  return (
    <div className={zoom ? 'fixed inset-0 z-[90] overflow-auto bg-[#101d27] p-3' : ''}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#172b38]/90 px-4 py-3 text-[#f1ede4] shadow-xl">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-[#d4c59d]" />
            <div>
              <h2 className="font-heading text-sm font-extrabold">{page?.title || 'كتاب الإجراءات التشغيلية'}</h2>
              <p className="text-[10px] text-[#a9bec0]">SOPs • كتاب إلكتروني قابل للتعديل بالكامل</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editable?<button type="button" onClick={()=>void addPage()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4c59d55] bg-[#d4c59d18] px-3 py-2 text-xs font-bold text-[#f1e5c7]"><Plus className="size-3.5"/> إضافة صفحة</button>:null}
            <button type="button" onClick={() => setZoom((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-[#dce7e4] hover:bg-white/10">
              {zoom ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              {zoom ? 'تصغير' : 'تكبير'}
            </button>
          </div>
        </div>

        {editable?<div className="mb-3 grid gap-2 sm:grid-cols-2">
          {[leftIndex,rightIndex].map((index)=>{
            const leaf=leaves[index]
            if(!leaf) return <div key={index}/>
            return <div key={leaf.id} className="flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#172b38]/70 p-2 text-[#dce7e4]">
              <span className="ml-2 text-[10px] text-[#9fb0af]">صفحة {index+1}</span>
              <button type="button" onClick={()=>openEditor(index)} className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-1 text-[11px] font-bold"><Pencil className="size-3"/> تعديل</button>
              <button type="button" disabled={index===0} onClick={()=>void movePage(index,-1)} className="rounded border border-white/15 p-1 disabled:opacity-30" title="تحريك قبل"><ArrowRight className="size-3"/></button>
              <button type="button" disabled={index===leaves.length-1} onClick={()=>void movePage(index,1)} className="rounded border border-white/15 p-1 disabled:opacity-30" title="تحريك بعد"><ArrowLeft className="size-3"/></button>
              <button type="button" onClick={()=>void deletePage(index)} className="rounded border border-[#d5606066] p-1 text-[#ff8a8a]" title="حذف الصفحة"><Trash2 className="size-3"/></button>
            </div>
          })}
        </div>:null}

        <div className="relative mx-auto aspect-[1.414/1] w-full max-w-[1180px] [perspective:2600px]">
          <div className="absolute inset-0 rounded-[10px] bg-[#7a6b50] shadow-[0_28px_55px_#020609aa]" />
          <div className="absolute inset-[8px] grid grid-cols-2 overflow-hidden rounded-md bg-[#f6f3e9] text-[#20201d]">
            <BookPage side="left" leaf={left} pageNumber={leftIndex + 1} onDoubleClick={editable&&leaves[leftIndex]?()=>openEditor(leftIndex):undefined} />
            <BookPage side="right" leaf={right} pageNumber={rightIndex + 1} onDoubleClick={editable&&leaves[rightIndex]?()=>openEditor(rightIndex):undefined} />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-5 -translate-x-1/2 bg-gradient-to-r from-[#6a5b4333] via-[#fffdf6cc] to-[#5b4a333b] shadow-[0_0_16px_#54442c66]" />
            {turning ? <div className={['pointer-events-none absolute inset-y-0 z-30 w-1/2 bg-[#f4f0e3] shadow-2xl transition-transform duration-300 [transform-style:preserve-3d]',turning === 'next' ? 'right-0 origin-left -rotate-y-[84deg]' : 'left-0 origin-right rotate-y-[84deg]'].join(' ')} /> : null}
          </div>
          <button aria-label="السابق" type="button" onClick={() => turn('prev')} disabled={spread === 0} className="absolute inset-y-0 left-0 z-40 w-[8%] cursor-w-resize bg-transparent disabled:cursor-default" />
          <button aria-label="التالي" type="button" onClick={() => turn('next')} disabled={spread === maxSpread} className="absolute inset-y-0 right-0 z-40 w-[8%] cursor-e-resize bg-transparent disabled:cursor-default" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[#e7eee9]">
          <button type="button" onClick={() => turn('prev')} disabled={spread === 0} className="inline-flex items-center gap-1 rounded-lg border border-[#9eb8b566] bg-[#edf3ee] px-4 py-2 text-xs font-extrabold text-[#203a45] disabled:opacity-40"><ChevronRight className="size-4" /> السابق</button>
          <span className="min-w-40 text-center font-mono text-xs text-[#b9cac8]">صفحات {leftIndex + 1}–{Math.min(leaves.length, rightIndex + 1)} من {leaves.length}</span>
          <button type="button" onClick={() => turn('next')} disabled={spread === maxSpread} className="inline-flex items-center gap-1 rounded-lg border border-[#9eb8b566] bg-[#edf3ee] px-4 py-2 text-xs font-extrabold text-[#203a45] disabled:opacity-40">التالي <ChevronLeft className="size-4" /></button>
        </div>
      </div>

      {editor?(
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/75 p-3" onClick={()=>setEditor(null)}>
          <div className="w-full max-w-3xl" onClick={(e)=>e.stopPropagation()}>
            <NeonCard glow className="max-h-[90vh] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between"><div><h3 className="font-heading text-lg font-extrabold">تعديل صفحة {editor.index+1}</h3><p className="mt-1 text-xs text-muted-foreground">العنوان والنص هنا هما نفس ما يظهر داخل ورقة الكتاب.</p></div><button type="button" onClick={()=>setEditor(null)} className="rounded border border-border p-2"><X className="size-4"/></button></div>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">عنوان الصفحة</span><input value={editor.title} onChange={(e)=>setEditor({...editor,title:e.target.value})} className="input-base"/></label>
              <label className="mt-3 block"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">محتوى الصفحة — كل سطر/فقرة يظهر بالترتيب</span><textarea value={editor.body} onChange={(e)=>setEditor({...editor,body:e.target.value})} className="input-base min-h-80 resize-y"/></label>
              <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setEditor(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground">إلغاء</button><button type="button" onClick={()=>void saveEditor()} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">حفظ الصفحة</button></div>
            </NeonCard>
          </div>
        </div>
      ):null}
    </div>
  )
}

function BookPage({ leaf, side, pageNumber, onDoubleClick }: { leaf?: BookLeaf; side: 'left' | 'right'; pageNumber: number; onDoubleClick?:()=>void }) {
  return (
    <article onDoubleClick={onDoubleClick} className={[
      'relative min-w-0 overflow-hidden bg-[linear-gradient(135deg,#fffdf6,#f2eddd)] px-[7%] py-[6%]',
      onDoubleClick?'cursor-text':'',
      side === 'left' ? 'shadow-[inset_-14px_0_24px_#4e3e2428]' : 'shadow-[inset_14px_0_24px_#4e3e2428]',
    ].join(' ')}>
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <div className="mb-4 border-b border-[#a79d873d] pb-3">
          <p className="font-mono text-[9px] tracking-[.18em] text-[#7a725f]">LADP • STANDARD OPERATING PROCEDURES</p>
          <h3 className="mt-2 text-balance font-heading text-[clamp(16px,1.7vw,27px)] font-black leading-tight text-[#2d312e]">{leaf?.title ?? ''}</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="space-y-[clamp(5px,.8vw,12px)] text-[clamp(9px,1.05vw,15px)] leading-[1.7] text-[#373a35]">
            {bodyLines(leaf?.body ?? '').map((line, index) => <p key={index} className={index === 0 && pageNumber === 1 ? 'text-center text-[1.25em] font-bold text-[#284a55]' : ''}>{line}</p>)}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#a79d873d] pt-2 font-mono text-[9px] text-[#8d836d]"><span>CLASSIFIED</span><span>{pageNumber}</span></div>
      </div>
    </article>
  )
}
