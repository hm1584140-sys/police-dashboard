'use client'

import { useState, useCallback, useEffect, type CSSProperties, type PointerEvent } from 'react'
import { Shield, Plus, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionTitle, NeonCard, Pill } from '../primitives'
import { TextCell, SelectCell } from '../editable-cells'
import { ServiceStripeIcon } from '../service-stripe-icon'
import { useSector } from '@/lib/sector-context'
import { useAdmin } from '@/lib/admin-context'
import { supabase } from '@/lib/supabase'
import {
  sectorThemes,
  sectorRanks,
  insigniaOptions,
  sectionOptions,
  statusOptions,
  certificationKeys,
  makeOfficer,
  emptyCerts,
  type SectorId,
  type Officer,
  type OfficerStatus,
  type CertKey,
} from '@/lib/police-data'

const SECTORS: SectorId[] = ['LSPD', 'BCSO', 'SASP']

const statusStyles: Record<OfficerStatus, string> = {
  'ON DUTY': 'border-[oklch(0.7_0.17_150)]/50 bg-[oklch(0.7_0.17_150)]/15 text-[oklch(0.78_0.17_150)]',
  'OFF DUTY': 'border-destructive/50 bg-destructive/15 text-destructive',
  LOA: 'border-[oklch(0.82_0.15_90)]/50 bg-[oklch(0.82_0.15_90)]/15 text-[oklch(0.85_0.15_90)]',
}

const COLUMNS: { key: string; label: string; w: number }[] = [
  { key: 'badge', label: '#Badge / CallSign', w: 128 },
  { key: 'discord', label: 'Discord', w: 144 },
  { key: 'insignia', label: 'Insignia', w: 112 },
  { key: 'rank', label: 'Rank', w: 176 },
  { key: 'ys', label: 'Y&S', w: 96 },
  { key: 'section', label: 'Section', w: 144 },
  { key: 'responsibility', label: 'Responsibility', w: 160 },
  { key: 'adminRank', label: 'Administrative Rank', w: 160 },
  { key: 'squads', label: 'Squads', w: 144 },
  { key: 'status', label: 'Status', w: 144 },
  { key: 'points', label: 'Points', w: 88 },
  { key: 'strikes', label: 'Strikes', w: 88 },
  { key: 'name', label: 'Name', w: 176 },
  { key: 'certs', label: 'Units / Certifications', w: 288 },
]

const ACTIONS_W = 56
const MIN_COL_W = 64

const DEFAULT_WIDTHS: Record<string, number> = COLUMNS.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.w }),
  {} as Record<string, number>,
)

function dbToOfficer(row: Record<string, unknown>): Officer {
  return {
    id: row.id as string,
    badge: (row.badge as string) || '',
    discord: (row.discord as string) || '',
    insignia: (row.insignia as string) || '— N/A',
    rank: (row.rank as string) || '',
    ys: (row.ys as string) || '',
    section: (row.section as string) || 'N/A',
    responsibility: (row.responsibility as string) || '',
    adminRank: (row.admin_rank as string) || '',
    squads: (row.squads as string) || '',
    status: ((row.status as string) || 'OFF DUTY') as OfficerStatus,
    points: (row.points as string) || '0',
    strikes: (row.strikes as string) || '0',
    name: (row.name as string) || '',
    certs: (row.certs as Record<CertKey, boolean>) || emptyCerts(),
  }
}

export function RosterHub() {
  const { sector: active, setSector: setActive } = useSector()
  const { canEdit } = useAdmin()
  const editable = canEdit('roster')
  const [rosters, setRosters] = useState<Record<SectorId, Officer[]>>({
    LSPD: [],
    BCSO: [],
    SASP: [],
  })
  const [loading, setLoading] = useState(true)
  const [widths, setWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS)

  // Load all officers from Supabase on mount
  useEffect(() => {
    async function loadOfficers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        const grouped: Record<SectorId, Officer[]> = { LSPD: [], BCSO: [], SASP: [] }
        for (const row of data) {
          const sector = row.sector as SectorId
          if (grouped[sector]) {
            grouped[sector].push(dbToOfficer(row))
          }
        }
        setRosters(grouped)
      }
      setLoading(false)
    }
    loadOfficers()
  }, [])

  const startResize = useCallback(
    (key: string, e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startW = widths[key] ?? MIN_COL_W

      function onMove(ev: globalThis.PointerEvent) {
        const delta = startX - ev.clientX
        setWidths((prev) => ({ ...prev, [key]: Math.max(MIN_COL_W, startW + delta) }))
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [widths],
  )

  const theme = sectorThemes[active]
  const rows = rosters[active]
  const tableWidth = COLUMNS.reduce((sum, c) => sum + (widths[c.key] ?? c.w), 0) + ACTIONS_W

  async function updateOfficer(id: string, patch: Partial<Officer>) {
    if (!editable) return

    // Map camelCase to snake_case for DB
    const dbPatch: Record<string, unknown> = {}
    if (patch.badge !== undefined) dbPatch.badge = patch.badge
    if (patch.discord !== undefined) dbPatch.discord = patch.discord
    if (patch.insignia !== undefined) dbPatch.insignia = patch.insignia
    if (patch.rank !== undefined) dbPatch.rank = patch.rank
    if (patch.ys !== undefined) dbPatch.ys = patch.ys
    if (patch.section !== undefined) dbPatch.section = patch.section
    if (patch.responsibility !== undefined) dbPatch.responsibility = patch.responsibility
    if (patch.adminRank !== undefined) dbPatch.admin_rank = patch.adminRank
    if (patch.squads !== undefined) dbPatch.squads = patch.squads
    if (patch.status !== undefined) dbPatch.status = patch.status
    if (patch.points !== undefined) dbPatch.points = patch.points
    if (patch.strikes !== undefined) dbPatch.strikes = patch.strikes
    if (patch.name !== undefined) dbPatch.name = patch.name
    if (patch.certs !== undefined) dbPatch.certs = patch.certs

    // Update UI immediately
    setRosters((prev) => ({
      ...prev,
      [active]: prev[active].map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))

    // Save to Supabase
    await supabase.from('officers').update(dbPatch).eq('id', id)
  }

  async function toggleCert(id: string, cert: CertKey) {
    if (!editable) return
    const officer = rosters[active].find((o) => o.id === id)
    if (!officer) return
    const newCerts = { ...officer.certs, [cert]: !officer.certs[cert] }
    await updateOfficer(id, { certs: newCerts })
  }

  async function addOfficer() {
    if (!editable) return
    const newOfficer = makeOfficer()

    // Save to Supabase first to get real ID
    const { data, error } = await supabase
      .from('officers')
      .insert({
        sector: active,
        badge: newOfficer.badge,
        discord: newOfficer.discord,
        insignia: newOfficer.insignia,
        rank: newOfficer.rank,
        ys: newOfficer.ys,
        section: newOfficer.section,
        responsibility: newOfficer.responsibility,
        admin_rank: newOfficer.adminRank,
        squads: newOfficer.squads,
        status: newOfficer.status,
        points: newOfficer.points,
        strikes: newOfficer.strikes,
        name: newOfficer.name,
        certs: newOfficer.certs,
      })
      .select()
      .single()

    if (!error && data) {
      setRosters((prev) => ({
        ...prev,
        [active]: [...prev[active], dbToOfficer(data)],
      }))
    }
  }

  async function removeOfficer(id: string) {
    if (!editable) return

    // Update UI immediately
    setRosters((prev) => ({
      ...prev,
      [active]: prev[active].filter((o) => o.id !== id),
    }))

    // Delete from Supabase
    await supabase.from('officers').delete().eq('id', id)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Interactive Roster Hub"
        title="منظومة كشف القوات الرقمي"
        desc="اختر القطاع لتغيير الثيم بالكامل. جميع الخلايا قابلة للتعديل المباشر — أضف الأفراد وعبّئ البيانات بنفسك."
        icon={<Users className="size-6" />}
      />

      {/* Sector selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SECTORS.map((id) => {
          const t = sectorThemes[id]
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              style={t.vars as CSSProperties}
              className={cn(
                'group flex items-center gap-3 rounded-xl border p-4 text-right transition-all',
                isActive
                  ? 'border-primary bg-card glow-neon'
                  : 'border-border bg-card/50 hover:bg-card',
              )}
            >
              <div
                className={cn(
                  'flex size-11 items-center justify-center rounded-lg border',
                  isActive
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground',
                )}
              >
                <Shield className="size-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <p
                  className={cn(
                    'font-heading text-lg font-extrabold',
                    isActive ? 'text-primary glow-text' : 'text-foreground',
                  )}
                >
                  {id}
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t.tagline}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Themed roster panel */}
      <div style={theme.vars as CSSProperties} className="rounded-2xl">
        <NeonCard glow className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
            <div>
              <h3 className="font-heading text-xl font-extrabold text-primary glow-text">
                {active} — {theme.arabic}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">{theme.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="muted">
                {rows.length} {rows.length === 1 ? 'فرد' : 'أفراد'}
              </Pill>
              {editable ? (
                <button
                  type="button"
                  onClick={addOfficer}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3.5 py-2 font-heading text-sm font-bold text-primary transition-colors hover:bg-primary/25"
                >
                  <Plus className="size-4" />
                  إضافة فرد
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground font-mono text-sm">
              جاري تحميل البيانات...
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table
                className="table-fixed border-collapse text-right"
                style={{ width: tableWidth }}
              >
                <colgroup>
                  {COLUMNS.map((col) => (
                    <col key={col.key} style={{ width: widths[col.key] ?? col.w }} />
                  ))}
                  <col style={{ width: ACTIONS_W }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-background/40">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="relative whitespace-nowrap px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-primary"
                      >
                        <span className="block truncate pl-2">{col.label}</span>
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          onPointerDown={(e) => startResize(col.key, e)}
                          title="اسحب لتغيير عرض العمود"
                          className="absolute inset-y-0 left-0 z-10 flex w-2 cursor-col-resize touch-none items-center justify-center"
                        >
                          <span className="h-1/2 w-px bg-border transition-colors hover:bg-primary" />
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length + 1}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        لا يوجد أفراد بعد — اضغط «إضافة فرد» لبدء تعبئة الكشف.
                      </td>
                    </tr>
                  ) : (
                    rows.map((o, idx) => (
                      <tr
                        key={o.id}
                        className={cn(
                          'border-b border-border/60 align-middle transition-colors hover:bg-muted/20',
                          idx % 2 === 1 && 'bg-background/20',
                        )}
                      >
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.badge}
                            onChange={(v) => updateOfficer(o.id, { badge: v })}
                            placeholder="#000"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.discord}
                            onChange={(v) => updateOfficer(o.id, { discord: v })}
                            placeholder="user#0000"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <SelectCell
                            value={o.insignia}
                            onChange={(v) => updateOfficer(o.id, { insignia: v })}
                            options={insigniaOptions}
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <SelectCell
                            value={o.rank}
                            onChange={(v) => updateOfficer(o.id, { rank: v })}
                            options={sectorRanks[active]}
                            placeholder="الرتبة"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <ServiceStripeIcon
                              count={Number(o.ys) || 0}
                              sector={active}
                              className="shrink-0"
                            />
                            <select
                              value={o.ys || '0'}
                              onChange={(e) => updateOfficer(o.id, { ys: e.target.value })}
                              disabled={!editable}
                              className={cn(
                                'w-12 cursor-pointer appearance-none rounded-md border border-border bg-background/40 px-1 py-1.5 text-center font-mono text-xs text-foreground outline-none',
                                !editable && 'cursor-default opacity-70',
                              )}
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                                <option key={n} value={n} className="bg-card text-foreground">
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <SelectCell
                            value={o.section}
                            onChange={(v) => updateOfficer(o.id, { section: v })}
                            options={sectionOptions}
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.responsibility}
                            onChange={(v) => updateOfficer(o.id, { responsibility: v })}
                            placeholder="N/A"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.adminRank}
                            onChange={(v) => updateOfficer(o.id, { adminRank: v })}
                            placeholder="N/A"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.squads}
                            onChange={(v) => updateOfficer(o.id, { squads: v })}
                            placeholder="Squad…"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOfficer(o.id, { status: e.target.value as OfficerStatus })
                            }
                            disabled={!editable}
                            className={cn(
                              'w-full cursor-pointer appearance-none rounded-md border px-2.5 py-1.5 text-center font-mono text-xs font-bold outline-none transition-colors',
                              statusStyles[o.status],
                              !editable && 'cursor-default opacity-70',
                            )}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s} className="bg-card text-foreground">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            type="number"
                            value={o.points}
                            onChange={(v) => updateOfficer(o.id, { points: v })}
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            type="number"
                            value={o.strikes}
                            onChange={(v) => updateOfficer(o.id, { strikes: v })}
                            section="roster"
                            className={cn(
                              Number(o.strikes) >= 30 && 'border-destructive text-destructive',
                            )}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <TextCell
                            value={o.name}
                            onChange={(v) => updateOfficer(o.id, { name: v })}
                            placeholder="اكتب الاسم…"
                            section="roster"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {certificationKeys.map((cert) => {
                              const on = o.certs[cert]
                              return (
                                <button
                                  key={cert}
                                  type="button"
                                  onClick={() => toggleCert(o.id, cert)}
                                  disabled={!editable}
                                  aria-pressed={on}
                                  className={cn(
                                    'rounded-md border px-2 py-1 font-mono text-[11px] font-bold transition-colors',
                                    on
                                      ? 'border-primary/60 bg-primary/20 text-primary glow-neon'
                                      : 'border-border bg-background/40 text-muted-foreground hover:text-foreground',
                                    !editable && 'cursor-default opacity-70 hover:text-muted-foreground',
                                  )}
                                >
                                  {cert}
                                </button>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {editable ? (
                            <button
                              type="button"
                              onClick={() => removeOfficer(o.id)}
                              aria-label="حذف الفرد"
                              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </NeonCard>
      </div>
    </div>
  )
}

