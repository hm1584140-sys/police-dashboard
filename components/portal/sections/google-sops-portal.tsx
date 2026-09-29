'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookMarked, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react'
import { GOOGLE_SOPS, type GoogleSopsBlock, type GoogleSopsSection } from '@/lib/google-sops-data'
import { GOOGLE_SOPS_SPECIAL } from '@/lib/google-sops-special'
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

function readableChunks(value: string) {
  const base = value
    .replace(/\u000b/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const chunks: string[] = []
  for (const line of base) {
    const numbered = line
      .split(/(?=(?:^|\s)\d+(?:\.\d+)*\s*[-–—.)]\s*)/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (numbered.length > 1) chunks.push(...numbered)
    else chunks.push(line)
  }
  return chunks
}

const SECTOR_SOPS_META: Record<string, { agency: string; reference: string; subtitle: string }> = {
  LSPD: {
    agency: 'Los Santos Police Department',
    reference: 'LAPD',
    subtitle: 'شرطة مدينة لوس سانتوس',
  },
  BCSO: {
    agency: "Blaine County Sheriff's Office",
    reference: 'LASD',
    subtitle: 'مكتب شريف مقاطعة بلين',
  },
  SASP: {
    agency: 'San Andreas State Police',
    reference: 'CHP',
    subtitle: 'شرطة ولاية سان أندرياس والطرق السريعة',
  },
}

function adaptSectorText(value: string, code: string, agency: string, reference: string) {
  if (code === 'LSPD') return value
  return value
    .replaceAll('Los Santos Police Department', agency)
    .replaceAll('LSPD', code)
    .replaceAll('LAPD', reference)
}

export function GoogleSopsPortal() {
  const { currentSector } = useSector()
  const sectorMeta = SECTOR_SOPS_META[currentSector.code ?? currentSector.id] ?? {
    agency: currentSector.name || currentSector.code || currentSector.id,
    reference: currentSector.code ?? currentSector.id,
    subtitle: currentSector.arabic || currentSector.description || '',
  }
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
      const haystack = [
        adaptSectorText(section.title, currentSector.code ?? currentSector.id, sectorMeta.agency, sectorMeta.reference),
        ...section.blocks.map((block) => block.type === 'paragraph'
          ? adaptSectorText(block.text, currentSector.code ?? currentSector.id, sectorMeta.agency, sectorMeta.reference)
          : block.alt),
      ].join(' ')
      return cleanForSearch(haystack).includes(q)
    })
  }, [query, sections, currentSector, sectorMeta])

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
                    <span className="min-w-0 truncate font-heading text-xs font-bold">{adaptSectorText(section.title, currentSector.code ?? currentSector.id, sectorMeta.agency, sectorMeta.reference)}</span>
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
            <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Pill tone="neon">{currentSector.code ?? currentSector.id}</Pill>
                  <Pill tone="muted">SOPs</Pill>
                  {parentTitle ? <span className="text-[10px] text-muted-foreground">{parentTitle}</span> : null}
                </div>
                <h1 className="font-heading text-2xl font-black leading-tight text-foreground sm:text-3xl">{adaptSectorText(active.title, currentSector.code ?? currentSector.id, sectorMeta.agency, sectorMeta.reference)}</h1>
                <p className="mt-2 text-xs text-muted-foreground">
                  القسم {activeIndex + 1} من {sections.length} • مستورد من المستند الرسمي
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 md:pt-1">
                <button type="button" disabled={activeIndex === 0} onClick={() => setActiveId(sections[activeIndex - 1].id)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background/50 px-3 text-xs font-bold text-muted-foreground hover:text-primary disabled:opacity-30">
                  <ChevronRight className="size-4" /> السابق
                </button>
                <button type="button" disabled={activeIndex >= sections.length - 1} onClick={() => setActiveId(sections[activeIndex + 1].id)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-primary/35 bg-primary/10 px-3 text-xs font-bold text-primary disabled:opacity-30">
                  التالي <ChevronLeft className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mx-5 mt-5 rounded-xl border border-primary/30 bg-primary/[0.06] px-4 py-3 sm:mx-7">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md border border-primary/35 bg-primary/10 px-2 py-1 font-mono font-bold text-primary">{currentSector.code ?? currentSector.id}</span>
              <span className="font-heading font-extrabold text-foreground">{sectorMeta.agency}</span>
              <span className="text-muted-foreground">مرجع واقعي: {sectorMeta.reference}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              هذا الدليل يحتوي القواعد والإجراءات التشغيلية المشتركة. مسميات الرتب والمكاتب والوحدات والتسميات الإدارية تتغير تلقائياً حسب القطاع المختار، بينما تبقى القواعد العامة كما هي ما لم يُذكر خلاف ذلك.
            </p>
          </div>

          <article className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
            {active.id === 't.0' ? (
              <SopsCoverSection agency={sectorMeta.agency} reference={sectorMeta.reference} code={currentSector.code ?? currentSector.id} />
            ) : active.id === 't.b6akqpo520ow' ? (
              <RankNamesSection sectorCode={currentSector.code ?? currentSector.id} ranks={currentSector.ranks} />
            ) : active.id === GOOGLE_SOPS_SPECIAL.service.sectionId ? (
              <ServiceStripesSection />
            ) : active.id === GOOGLE_SOPS_SPECIAL.medals.sectionId ? (
              <MedalsSection />
            ) : (
              <div className="space-y-5">
                {active.blocks.map((block, index) => <SopsBlock key={index} block={block} sectorCode={currentSector.code ?? currentSector.id} agency={sectorMeta.agency} reference={sectorMeta.reference} />)}
                {!active.blocks.length ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">هذا القسم ما فيه محتوى نصي حالياً.</div>
                ) : null}
              </div>
            )}
          </article>

          <div className="border-t border-border bg-muted/10 px-5 py-3 sm:px-7">
            <div className="text-[10px] text-muted-foreground">
              المصدر: {GOOGLE_SOPS.title} • Revision {String(GOOGLE_SOPS.revisionId).slice(0, 10)}
            </div>
          </div>
        </NeonCard>
      </main>
    </div>
  )
}

function SopsBlock({ block, sectorCode, agency, reference }: { block: GoogleSopsBlock; sectorCode: string; agency: string; reference: string }) {
  if (block.type === 'image') {
    return (
      <div className="flex justify-center rounded-2xl border border-border bg-background/40 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.src} alt={block.alt} className="max-h-[460px] max-w-full rounded-xl object-contain" loading="lazy" />
      </div>
    )
  }

  const adaptedText = adaptSectorText(block.text, sectorCode, agency, reference)
  const chunks = readableChunks(adaptedText)
  const isHeading = block.style === 'HEADING_1' || block.style === 'HEADING_2' || block.style === 'HEADING_3' || block.style === 'TITLE'
  const tooLongForHeading = adaptedText.length > 120 || chunks.length > 2

  if (block.list && chunks.length) {
    return (
      <ul className="space-y-2 rounded-xl border border-border bg-background/35 p-5 pr-8">
        {chunks.map((line, index) => (
          <li key={index} className="list-disc break-words text-right text-[15px] leading-8 text-foreground/90 marker:text-primary">{line}</li>
        ))}
      </ul>
    )
  }

  if (isHeading && !tooLongForHeading) {
    return <h2 className={cn(paragraphClass(block.style), 'break-words text-right')}>{adaptedText}</h2>
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/40 bg-background/25 p-4 sm:p-5">
      {chunks.map((line, index) => {
        const numbered = /^\d+(?:\.\d+)*\s*[-–—.)]/.test(line)
        return (
          <p
            key={index}
            className={cn(
              'break-words whitespace-pre-wrap text-right text-[15px] leading-8 text-foreground/90',
              numbered && 'rounded-lg border-r-2 border-primary/55 bg-primary/[0.04] px-3 py-2 font-semibold',
              isHeading && index === 0 && 'font-heading text-lg font-extrabold text-primary',
            )}
          >
            {line}
          </p>
        )
      })}
    </div>
  )
}


function SopsCoverSection({ agency, reference, code }: { agency: string; reference: string; code: string }) {
  const cover = GOOGLE_SOPS.sections.find((section) => section.id === 't.0')
  const image = cover?.blocks.find((block) => block.type === 'image')

  return (
    <div className="space-y-5">
      {image && image.type === 'image' ? (
        <div className="flex justify-center rounded-2xl border border-border bg-background/35 p-5 sm:p-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt} className="max-h-[430px] max-w-full object-contain" />
        </div>
      ) : null}

      <div className="flex items-center justify-center rounded-2xl border border-border bg-background/30 px-6 py-9 text-center sm:px-10 sm:py-11">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2.5">
          <h2 className="font-heading text-2xl font-black leading-tight text-destructive sm:text-3xl">
            {'{ ' + agency + ' }'}
          </h2>

          <div className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            <span className="text-destructive">S</span>tandard{' '}
            <span className="text-destructive">O</span>perating{' '}
            <span className="text-destructive">P</span>rocedures
          </div>

          <div className="font-heading text-3xl font-black text-destructive sm:text-4xl">
            SOPs
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 font-heading text-sm font-extrabold text-foreground sm:text-lg">
            <span>{code}</span>
            <span className="text-muted-foreground">•</span>
            <span>Reference: {reference}</span>
            {code === 'LSPD' ? <>
              <span className="text-muted-foreground">•</span>
              <span>By : Ofc. - Jonathan L.Kennedy</span>
            </> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function rankGroupsForSector(sectorCode: string, ranks: string[]) {
  const normalized = ranks.map((rank) => ({ rank, key: rank.toLowerCase() }))

  if (sectorCode === 'LSPD') {
    return [
      { title: 'ينادى بـ Cadet / Officer', ranks: ranks.filter((rank) => /cadet|officer one|officer two|officer three|senior officer/i.test(rank)) },
      { title: 'ينادى بـ Senior Lead / Sergeant / Lieutenant', ranks: ranks.filter((rank) => /senior lead|sergeant|lieutenant/i.test(rank)) },
      { title: 'ينادى بـ Captain', ranks: ranks.filter((rank) => /^captain/i.test(rank)) },
      { title: 'ينادى بـ Commander / Chief', ranks: ranks.filter((rank) => /commander|chief/i.test(rank)) },
    ].filter((group) => group.ranks.length)
  }

  if (sectorCode === 'BCSO') {
    return [
      { title: 'ينادى بـ Cadet / Deputy', ranks: ranks.filter((rank) => /cadet|deputy i|deputy ii|senior deputy/i.test(rank)) },
      { title: 'ينادى بـ Senior Lead / Sergeant / Lieutenant', ranks: ranks.filter((rank) => /senior lead deputy|sergeant|lieutenant/i.test(rank)) },
      { title: 'ينادى بـ Captain', ranks: ranks.filter((rank) => /^captain/i.test(rank)) },
      { title: 'ينادى بـ Chief Deputy / UnderSheriff / Sheriff', ranks: ranks.filter((rank) => /chief deputy|undersheriff|sheriff/i.test(rank)) },
    ].filter((group) => group.ranks.length)
  }

  if (sectorCode === 'SASP') {
    return [
      { title: 'ينادى بـ Cadet / Officer', ranks: ranks.filter((rank) => /cadet|officer i|officer ii|officer iii|senior officer/i.test(rank)) },
      { title: 'ينادى بـ Senior Lead / Sergeant / Lieutenant', ranks: ranks.filter((rank) => /senior lead|sergeant|lieutenant/i.test(rank)) },
      { title: 'ينادى بـ Captain / Chief', ranks: ranks.filter((rank) => /captain|assistant chief|chief of chp/i.test(rank)) },
      { title: 'ينادى بـ Commissioner', ranks: ranks.filter((rank) => /commissioner/i.test(rank)) },
    ].filter((group) => group.ranks.length)
  }

  // Custom sectors: split the configured hierarchy into four readable bands while preserving the user's exact order.
  const size = Math.max(1, Math.ceil(normalized.length / 4))
  return Array.from({ length: 4 }, (_, index) => {
    const slice = normalized.slice(index * size, (index + 1) * size).map((item) => item.rank)
    return slice.length ? { title: 'مجموعة الرتب ' + (index + 1), ranks: slice } : null
  }).filter(Boolean) as Array<{ title: string; ranks: string[] }>
}

function RankNamesSection({ sectorCode, ranks }: { sectorCode: string; ranks: string[] }) {
  const groups = rankGroupsForSector(sectorCode, ranks)

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.05] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary">{sectorCode} RANK NAMING GUIDE</p>
            <h2 className="mt-1 font-heading text-xl font-black text-foreground">نبذة عن طريقة مسميات الرتب</h2>
          </div>
          <span className="rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 font-mono text-xs font-bold text-primary">{ranks.length} رتبة</span>
        </div>
        <p className="mt-3 text-xs leading-7 text-muted-foreground">
          هذا القسم يشرح طريقة تجميع ومسميات الرتب داخل القطاع المختار. الفكرة العامة مشتركة بين القطاعات، لكن أسماء الرتب ومسميات القيادة تختلف من قطاع إلى آخر. القوائم أدناه تُسحب مباشرة من رتب القطاع التي أنت محددها في إدارة القطاعات، لذلك أي تعديل هناك ينعكس هنا تلقائياً.
        </p>
      </section>

      <div className="space-y-3">
        {groups.map((group, groupIndex) => (
          <section key={group.title} className="rounded-2xl border border-border bg-background/30 p-5 sm:p-6">
            <h3 className="font-heading text-lg font-black text-destructive sm:text-xl">{group.title}</h3>
            <div className="mt-4 grid gap-2">
              {group.ranks.map((rank, index) => (
                <div key={rank + index} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/45 px-4 py-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{String(groupIndex + 1).padStart(2, '0')}.{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-right font-heading text-base font-extrabold text-foreground sm:text-lg">{rank}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-primary/25 bg-primary/[0.035] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary">{sectorCode} RANK STRUCTURE</p>
            <h3 className="mt-1 font-heading text-lg font-black text-foreground">جميع رتب القطاع بالترتيب</h3>
          </div>
          <span className="text-xs text-muted-foreground">نفس ترتيب إدارة القطاعات</span>
        </div>

        <div className="grid gap-2">
          {ranks.map((rank, index) => (
            <div key={rank + '-full-' + index} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] font-mono text-[11px] font-black text-primary">{index + 1}</span>
              <span className="flex-1 text-right font-heading text-base font-extrabold text-foreground sm:text-lg">{rank}</span>
            </div>
          ))}
          {!ranks.length ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">لا توجد رتب مضبوطة لهذا القطاع حالياً.</div> : null}
        </div>
      </section>
    </div>
  )
}

function ServiceStripesSection() {
  const introLines = GOOGLE_SOPS_SPECIAL.service.intro.split('\n').map((line) => line.trim()).filter(Boolean)
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <h2 className="font-heading text-2xl font-black text-foreground">{introLines[0]}</h2>
        <p className="mx-auto mt-3 max-w-4xl text-sm leading-8 text-foreground/85">{introLines.slice(1).join(' ')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background/35 shadow-[0_0_30px_hsl(var(--primary)/0.08)]">
        <div className="grid grid-cols-[84px_minmax(0,1fr)_170px] border-b border-border bg-primary/8 text-center text-xs font-extrabold text-primary">
          <div className="border-l border-border px-3 py-3">N</div>
          <div className="border-l border-border px-3 py-3">الوصف وشروط الاستحقاق</div>
          <div className="px-3 py-3">شكل الشارة</div>
        </div>
        {GOOGLE_SOPS_SPECIAL.service.rows.map((row) => (
          <div key={row.n} className="grid grid-cols-[84px_minmax(0,1fr)_170px] items-stretch border-b border-border/70 last:border-b-0">
            <div className="flex items-center justify-center border-l border-border/70 bg-muted/10 px-3 py-4 font-mono text-lg font-black text-primary">{row.n}</div>
            <div className="flex items-center border-l border-border/70 px-5 py-4 text-right text-sm leading-7 text-foreground/90">{row.desc}</div>
            <div className="flex items-center justify-center bg-background/20 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.image} alt={'شارة خدمة رقم ' + row.n} className="max-h-20 max-w-[120px] object-contain" loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MedalsSection() {
  const introLines = GOOGLE_SOPS_SPECIAL.medals.intro.split('\n').map((line) => line.trim()).filter(Boolean)
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <h2 className="font-heading text-2xl font-black text-foreground">{introLines[0]}</h2>
        <p className="mx-auto mt-3 max-w-4xl text-sm leading-8 text-foreground/85">{introLines.slice(1).join(' ')}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background/35 shadow-[0_0_30px_hsl(var(--primary)/0.08)]">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[64px_150px_190px_90px_minmax(0,1fr)] border-b border-border bg-primary/8 text-center text-xs font-extrabold text-primary">
            <div className="border-l border-border px-2 py-3">N</div>
            <div className="border-l border-border px-2 py-3">الشكل</div>
            <div className="border-l border-border px-2 py-3">اسم الميدالية / الشارة</div>
            <div className="border-l border-border px-2 py-3">النقاط</div>
            <div className="px-3 py-3">الوصف</div>
          </div>
          {GOOGLE_SOPS_SPECIAL.medals.rows.map((row) => (
            <div key={row.n} className="grid grid-cols-[64px_150px_190px_90px_minmax(0,1fr)] items-stretch border-b border-border/70 last:border-b-0">
              <div className="flex items-center justify-center border-l border-border/70 bg-muted/10 px-2 py-4 font-mono text-base font-black text-primary">{row.n}</div>
              <div className="flex items-center justify-center border-l border-border/70 bg-background/20 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.image} alt={row.name} className="max-h-20 max-w-[120px] object-contain" loading="lazy" />
              </div>
              <div className="flex items-center justify-center border-l border-border/70 px-3 py-4 text-center">
                <span className="font-mono text-[12px] font-bold leading-6 text-foreground">{row.name}</span>
              </div>
              <div className="flex items-center justify-center border-l border-border/70 px-2 py-4">
                <span className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-sm font-black text-primary">{row.points}</span>
              </div>
              <div className="flex items-center px-5 py-4 text-right text-sm leading-7 text-foreground/90">{row.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
