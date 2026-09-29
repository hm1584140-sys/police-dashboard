'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookMarked, ChevronLeft, ChevronRight, ExternalLink, FileText, Search } from 'lucide-react'
import { GOOGLE_SOPS, type GoogleSopsBlock, type GoogleSopsSection } from '@/lib/google-sops-data'
import { useSector } from '@/lib/sector-context'
import { NeonCard, Pill } from '../primitives'
import { cn } from '@/lib/utils'

function paragraphClass(style: string) {
  if (style === 'TITLE') return 'font-heading text-3xl font-black leading-tight text-foreground'
  if (style === 'HEADING_1') return 'font-heading text-2xl font-black leading-tight text-primary'
  if (style === 'HEADING_2') return 'font-heading text-xl font-extrabold leading-tight text-foreground'
  if (style === 'HEADING_3') return 'font-heading text-lg font-extrabold text-foreground'
  return 'text-[15px] leading-8 text-foreground/90'
}

function cleanForSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function GoogleSopsPortal() {
  const { currentSector } = useSector()
  const sections = GOOGLE_SOPS.sections as readonly GoogleSopsSection[]
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId))
  const active = sections[activeIndex] ?? sections[0]

  const parentTitle = useMemo(() => {
    if (!active?.parentId) return null
    return sections.find((section) => section.id === active.parentId)?.title ?? null
  }, [active, sections])

  const matches = useMemo(() => {
    const q = cleanForSearch(query)
    if (!q) return []
    return sections.filter((section) => {
      const haystack = [section.title, ...section.blocks.map((block) => block.type === 'paragraph' ? block.text : block.alt)].join(' ')
      return cleanForSearch(haystack).includes(q)
    })
  }, [query, sections])

  useEffect(() => {
    if (!sections.some((section) => section.id === activeId) && sections[0]) setActiveId(sections[0].id)
  }, [activeId, sections])

  if (!active) return null

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <NeonCard glow className="overflow-hidden p-0">
          <div className="border-b border-border bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                <BookMarked className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-extrabold text-foreground">دليل الـ SOPs</p>
                <p className="truncate text-[10px] text-muted-foreground">{currentSector.code ?? currentSector.id} • Google Docs Source</p>
              </div>
            </div>
            <label className="relative mt-3 block">
              <Search className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="input-base pr-9 text-xs" placeholder="ابحث داخل الـ SOPs..." />
            </label>
          </div>

          {query.trim() ? (
            <div className="max-h-[62vh] overflow-y-auto p-2 scrollbar-thin">
              <p className="px-2 py-2 text-[10px] font-bold text-muted-foreground">نتائج البحث ({matches.length})</p>
              {matches.map((section) => (
                <button key={section.id} type="button" onClick={() => { setActiveId(section.id); setQuery('') }}
                  className="mb-1 w-full rounded-lg border border-transparent px-3 py-2 text-right text-xs font-bold text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary">
                  {section.title}
                </button>
              ))}
              {!matches.length ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">ما حصلت نتيجة.</p> : null}
            </div>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto p-2 scrollbar-thin">
              {sections.map((section) => {
                const selected = section.id === active.id
                return (
                  <button key={section.id} type="button" onClick={() => setActiveId(section.id)}
                    style={{ paddingRight: 12 + Math.min(section.level, 3) * 14 }}
                    className={cn(
                      'mb-1 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-right transition-colors',
                      selected ? 'border-primary/35 bg-primary/12 text-primary' : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                    )}>
                    <span className="min-w-0 truncate font-heading text-xs font-bold">{section.title}</span>
                    {section.level > 0 ? <span className="shrink-0 font-mono text-[9px] opacity-50">L{section.level}</span> : null}
                  </button>
                )
              })}
            </div>
          )}

          <div className="border-t border-border p-3">
            <a href={GOOGLE_SOPS.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-2 text-[11px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary">
              فتح المستند الأصلي <ExternalLink className="size-3.5" />
            </a>
          </div>
        </NeonCard>
      </aside>

      <main className="min-w-0">
        <NeonCard glow className="overflow-hidden p-0">
          <div className="border-b border-border bg-gradient-to-l from-primary/12 via-primary/4 to-transparent px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Pill tone="neon">{currentSector.code ?? currentSector.id}</Pill>
                  <Pill tone="muted">SOPs</Pill>
                  {parentTitle ? <span className="text-[10px] text-muted-foreground">{parentTitle}</span> : null}
                </div>
                <h1 className="font-heading text-2xl font-black leading-tight text-foreground sm:text-3xl">{active.title}</h1>
                <p className="mt-2 text-xs text-muted-foreground">
                  القسم {activeIndex + 1} من {sections.length} • مستورد من المستند الرسمي
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={activeIndex === 0} onClick={() => setActiveId(sections[activeIndex - 1].id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary disabled:opacity-30">
                  <ChevronRight className="size-4" /> السابق
                </button>
                <button type="button" disabled={activeIndex >= sections.length - 1} onClick={() => setActiveId(sections[activeIndex + 1].id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-bold text-primary disabled:opacity-30">
                  التالي <ChevronLeft className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <article className="mx-auto max-w-4xl px-5 py-6 sm:px-8 sm:py-8">
            <div className="space-y-5">
              {active.blocks.map((block, index) => <SopsBlock key={index} block={block} />)}
              {!active.blocks.length ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">هذا القسم ما فيه محتوى نصي حالياً.</div>
              ) : null}
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/10 px-5 py-4 sm:px-7">
            <div className="text-[10px] text-muted-foreground">
              المصدر: {GOOGLE_SOPS.title} • Revision {String(GOOGLE_SOPS.revisionId).slice(0, 10)}
            </div>
            <div className="flex gap-2">
              {activeIndex > 0 ? <button type="button" onClick={() => setActiveId(sections[activeIndex - 1].id)} className="text-xs font-bold text-muted-foreground hover:text-primary">← {sections[activeIndex - 1].title}</button> : null}
              {activeIndex < sections.length - 1 ? <button type="button" onClick={() => setActiveId(sections[activeIndex + 1].id)} className="text-xs font-bold text-primary">{sections[activeIndex + 1].title} →</button> : null}
            </div>
          </div>
        </NeonCard>
      </main>
    </div>
  )
}

function SopsBlock({ block }: { block: GoogleSopsBlock }) {
  if (block.type === 'image') {
    return (
      <div className="flex justify-center rounded-2xl border border-border bg-background/40 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.src} alt={block.alt} className="max-h-[460px] max-w-full rounded-xl object-contain" loading="lazy" />
      </div>
    )
  }

  const lines = block.text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (block.list && lines.length) {
    return (
      <ul className="space-y-2 rounded-xl border border-border bg-background/35 p-5 pr-8">
        {lines.map((line, index) => <li key={index} className="list-disc text-[15px] leading-8 text-foreground/90 marker:text-primary">{line}</li>)}
      </ul>
    )
  }

  if (block.style === 'HEADING_1' || block.style === 'HEADING_2' || block.style === 'HEADING_3' || block.style === 'TITLE') {
    return <h2 className={paragraphClass(block.style)}>{block.text}</h2>
  }

  return (
    <div className="rounded-xl border border-transparent px-1 py-0.5 transition-colors hover:border-primary/10 hover:bg-primary/[0.02]">
      {lines.map((line, index) => (
        <p key={index} className={cn(paragraphClass(block.style), index > 0 && 'mt-3')}>{line}</p>
      ))}
    </div>
  )
}
