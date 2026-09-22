'use client'

import { AlertTriangle, Info, ListChecks } from 'lucide-react'
import { NeonCard, SectionTitle, Pill } from './primitives'
import type { ContentBlock, PageDefinition } from '@/lib/page-types'
import { PAGE_ICON_MAP } from '@/lib/page-types'

function toneClasses(tone: string | undefined) {
  if (tone === 'danger') return 'border-destructive/40 bg-destructive/10'
  if (tone === 'warn') return 'border-[oklch(0.82_0.15_90)]/40 bg-[oklch(0.82_0.15_90)]/10'
  return 'border-primary/30 bg-primary/10'
}

export function CmsPage({ page }: { page: PageDefinition }) {
  const Icon = PAGE_ICON_MAP[page.icon] ?? ListChecks

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow={page.page_type === 'handbook' ? 'Handbook' : 'Managed Page'}
        title={page.title}
        desc={page.description}
        icon={<Icon className="size-6" />}
      />

      <CmsBlocks blocks={page.blocks} emptyMessage />
    </div>
  )
}

export function CmsBlocks({ blocks, emptyMessage = false }: { blocks: ContentBlock[]; emptyMessage?: boolean }) {
  const visibleBlocks = blocks.filter((block) => block.type !== 'sops-copy')
  return (
    <div className="flex flex-col gap-4">
      {visibleBlocks.map((block, index) => <Block key={index} block={block} />)}
      {emptyMessage && visibleBlocks.length === 0 ? (
        <NeonCard className="p-8 text-center text-sm text-muted-foreground">
          هذه الصفحة جاهزة للتحرير من لوحة المالك.
        </NeonCard>
      ) : null}
    </div>
  )
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === 'heading') {
    return <h2 className="font-heading text-xl font-black text-foreground">{block.text}</h2>
  }

  if (block.type === 'paragraph') {
    return <NeonCard className="p-5 text-sm leading-8 text-foreground whitespace-pre-wrap">{block.text}</NeonCard>
  }

  if (block.type === 'list') {
    return (
      <NeonCard className="p-5">
        {block.title ? <h3 className="mb-3 font-heading text-base font-bold text-primary">{block.title}</h3> : null}
        <ol className="list-decimal space-y-2 pr-5 marker:text-primary">
          {block.items.map((item, index) => <li key={index} className="text-sm leading-7 text-foreground">{item}</li>)}
        </ol>
      </NeonCard>
    )
  }

  if (block.type === 'callout') {
    const Icon = block.tone === 'danger' ? AlertTriangle : Info
    return (
      <NeonCard className={`border ${toneClasses(block.tone)} p-5`} glow={block.tone === 'danger'}>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <h3 className="font-heading text-base font-extrabold text-foreground">{block.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-8 text-foreground">{block.text}</p>
          </div>
        </div>
      </NeonCard>
    )
  }

  if (block.type === 'stats') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, index) => (
          <NeonCard key={index} className="p-5 text-center">
            <p className="font-heading text-2xl font-black text-primary">{item.value}</p>
            <p className="mt-1 text-sm font-bold text-foreground">{item.label}</p>
            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
          </NeonCard>
        ))}
      </div>
    )
  }

  if (block.type === 'table') {
    return (
      <NeonCard className="overflow-hidden">
        {block.title ? <div className="border-b border-border bg-muted/30 px-5 py-3 font-heading font-bold text-foreground">{block.title}</div> : null}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border bg-background/40">
                {block.columns.map((column) => <th key={column} className="px-4 py-3 text-xs font-bold text-primary">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 ? 'border-b border-border/50 bg-background/20' : 'border-b border-border/50'}>
                  {block.columns.map((_, colIndex) => <td key={colIndex} className="px-4 py-3 text-sm text-foreground">{row[colIndex] ?? ''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.rows.length === 0 ? <div className="px-5 py-8 text-center text-sm text-muted-foreground"><Pill tone="muted">لا توجد صفوف</Pill></div> : null}
      </NeonCard>
    )
  }

  return null
}
