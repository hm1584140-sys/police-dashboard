'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { getSopsCopy } from '@/lib/sops-copy'
import type { PageDefinition } from '@/lib/page-types'
import { pursuitCapacity, robberyCapacity } from '@/lib/police-data'

type BookLeaf = { title: string; body: string[] }

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export function SopsBook({ page }: { page?: PageDefinition }) {
  const [sops, setSops] = useState<PageDefinition | null>(null)
  const [spread, setSpread] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null)

  useEffect(() => {
    fetch('/api/pages', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : [])
      .then((pages: PageDefinition[]) => setSops(pages.find((item) => item.slug === 'sops') ?? null))
      .catch(() => {})
  }, [])

  const copy = useMemo(() => getSopsCopy(sops?.blocks), [sops?.blocks])

  const leaves = useMemo<BookLeaf[]>(() => {
    const custom = (sops?.blocks ?? []).filter((block): block is Extract<typeof block, { type: 'sops-section' }> => block.type === 'sops-section')
    return [
      {
        title: copy.hero_title || 'دليل الإجراءات التشغيلية',
        body: [
          copy.hero_subtitle || 'المرجع المعتمد',
          'CLASSIFIED • INTERNAL USE',
          page?.description || 'دليل بروتوكولات وقواعد جهاز الشرطة.',
        ],
      },
      { title: 'القواعد العامة والولايات', body: [copy.general_1, copy.general_2, copy.general_extra].filter(Boolean) },
      { title: 'الكلبشة والتيزر', body: [copy.cuffs_intro, ...splitLines(copy.cuffs_items), copy.taser_intro, copy.taser_direct_intro, ...splitLines(copy.taser_items), copy.cuffs_extra].filter(Boolean) },
      { title: 'إطلاق النار على المسلحين', body: [copy.fire_intro, ...splitLines(copy.fire_items), copy.fire_extra].filter(Boolean) },
      { title: 'الاعتقال وحقوق ميراندا', body: [copy.arrest_intro, copy.miranda, copy.post_arrest, copy.arrest_extra].filter(Boolean) },
      { title: 'المطاردات والـ PIT', body: [...pursuitCapacity.map((row) => row.type + ' — ' + row.units), copy.dispatch, copy.pit_intro, ...splitLines(copy.pit_items), ...splitLines(copy.pit_conditions), copy.pursuit_extra].filter(Boolean) },
      { title: 'إطلاق النار على المركبة', body: [copy.vehicle_intro, ...splitLines(copy.vehicle_cases).map((line) => line.replace('|', ' — ')), copy.vehicle_extra].filter(Boolean) },
      { title: 'القوة الاستيعابية للسرقات', body: robberyCapacity.map((row) => row.type + ' — ' + row.units) },
      { title: 'مفشلات الهروب الآمن', body: [...splitLines(copy.failsafe_items), 'الهروب على الأقدام بسلاح — ' + copy.foot_escape, 'الحد الأقصى الكلي للهروب — ' + copy.max_escape, copy.failsafe_extra].filter(Boolean) },
      ...custom.map((section) => ({ title: section.title, body: splitLines(section.content) })),
    ]
  }, [copy, page?.description, sops?.blocks])

  const pages = useMemo(() => {
    const padded = [...leaves]
    if (padded.length % 2) padded.push({ title: 'نهاية الدليل', body: ['تم اعتماد هذا الدليل للاستخدام الداخلي.'] })
    return padded
  }, [leaves])

  const maxSpread = Math.max(0, Math.ceil(pages.length / 2) - 1)
  const left = pages[spread * 2]
  const right = pages[spread * 2 + 1]

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
              <p className="text-[10px] text-[#a9bec0]">SOPs • كتاب إلكتروني داخل الموقع</p>
            </div>
          </div>
          <button type="button" onClick={() => setZoom((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-[#dce7e4] hover:bg-white/10">
            {zoom ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {zoom ? 'تصغير' : 'تكبير'}
          </button>
        </div>

        <div className="relative mx-auto aspect-[1.414/1] w-full max-w-[1180px] [perspective:2600px]">
          <div className="absolute inset-0 rounded-[10px] bg-[#7a6b50] shadow-[0_28px_55px_#020609aa]" />
          <div className="absolute inset-[8px] grid grid-cols-2 overflow-hidden rounded-md bg-[#f6f3e9] text-[#20201d]">
            <BookPage side="left" leaf={left} pageNumber={spread * 2 + 1} />
            <BookPage side="right" leaf={right} pageNumber={spread * 2 + 2} />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-5 -translate-x-1/2 bg-gradient-to-r from-[#6a5b4333] via-[#fffdf6cc] to-[#5b4a333b] shadow-[0_0_16px_#54442c66]" />
            {turning ? (
              <div className={[
                'pointer-events-none absolute inset-y-0 z-30 w-1/2 bg-[#f4f0e3] shadow-2xl transition-transform duration-300 [transform-style:preserve-3d]',
                turning === 'next' ? 'right-0 origin-left -rotate-y-[84deg]' : 'left-0 origin-right rotate-y-[84deg]',
              ].join(' ')} />
            ) : null}
          </div>
          <button aria-label="السابق" type="button" onClick={() => turn('prev')} disabled={spread === 0} className="absolute inset-y-0 left-0 z-40 w-[12%] cursor-w-resize bg-transparent disabled:cursor-default" />
          <button aria-label="التالي" type="button" onClick={() => turn('next')} disabled={spread === maxSpread} className="absolute inset-y-0 right-0 z-40 w-[12%] cursor-e-resize bg-transparent disabled:cursor-default" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[#e7eee9]">
          <button type="button" onClick={() => turn('prev')} disabled={spread === 0} className="inline-flex items-center gap-1 rounded-lg border border-[#9eb8b566] bg-[#edf3ee] px-4 py-2 text-xs font-extrabold text-[#203a45] disabled:opacity-40">
            <ChevronRight className="size-4" /> السابق
          </button>
          <span className="min-w-40 text-center font-mono text-xs text-[#b9cac8]">صفحات {spread * 2 + 1}–{Math.min(pages.length, spread * 2 + 2)} من {pages.length}</span>
          <button type="button" onClick={() => turn('next')} disabled={spread === maxSpread} className="inline-flex items-center gap-1 rounded-lg border border-[#9eb8b566] bg-[#edf3ee] px-4 py-2 text-xs font-extrabold text-[#203a45] disabled:opacity-40">
            التالي <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function BookPage({ leaf, side, pageNumber }: { leaf?: BookLeaf; side: 'left' | 'right'; pageNumber: number }) {
  return (
    <article className={[
      'relative min-w-0 overflow-hidden bg-[linear-gradient(135deg,#fffdf6,#f2eddd)] px-[7%] py-[6%]',
      side === 'left' ? 'shadow-[inset_-14px_0_24px_#4e3e2428]' : 'shadow-[inset_14px_0_24px_#4e3e2428]',
    ].join(' ')}>
      <div className="mx-auto flex h-full max-w-xl flex-col">
        <div className="mb-4 border-b border-[#a79d873d] pb-3">
          <p className="font-mono text-[9px] tracking-[.18em] text-[#7a725f]">LADP • STANDARD OPERATING PROCEDURES</p>
          <h3 className="mt-2 text-balance font-heading text-[clamp(16px,1.7vw,27px)] font-black leading-tight text-[#2d312e]">{leaf?.title ?? ''}</h3>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="space-y-[clamp(5px,.8vw,12px)] text-[clamp(9px,1.05vw,15px)] leading-[1.7] text-[#373a35]">
            {(leaf?.body ?? []).map((line, index) => (
              <p key={index} className={index === 0 && pageNumber === 1 ? 'text-center text-[1.25em] font-bold text-[#284a55]' : ''}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#a79d873d] pt-2 font-mono text-[9px] text-[#8d836d]">
          <span>CLASSIFIED</span><span>{pageNumber}</span>
        </div>
      </div>
    </article>
  )
}
