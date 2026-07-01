'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shirt, User, UserRound } from 'lucide-react'
import { SectionTitle, NeonCard, Pill } from '../primitives'
import { TextCell, GroupedSelectCell, type SelectGroup } from '../editable-cells'
import { sectorRanks, outfitPieces, type SectorId } from '@/lib/police-data'
import { supabase } from '@/lib/supabase'

const RANK_GROUPS: SelectGroup[] = (
  [
    ['LSPD', 'LSPD Ranks'],
    ['BCSO', 'BCSO Ranks'],
    ['SASP', 'SASP Ranks'],
  ] as [SectorId, string][]
).map(([id, label]) => ({
  label,
  options: sectorRanks[id].map((r) => `${id} — ${r}`),
}))

const FIRST_RANK = RANK_GROUPS[0].options[0]

type Gender = 'men' | 'women'
// key: `${rank}|${gender}|${piece}|${field}`
type OutfitStore = Record<string, string>

function GenderTable({
  rank,
  gender,
  label,
  icon,
  store,
  setStore,
}: {
  rank: string
  gender: Gender
  label: string
  icon: React.ReactNode
  store: OutfitStore
  setStore: React.Dispatch<React.SetStateAction<OutfitStore>>
}) {
  function val(piece: string, field: 'decal' | 'tex') {
    return store[`${rank}|${gender}|${piece}|${field}`] ?? ''
  }

  async function set(piece: string, field: 'decal' | 'tex', v: string) {
    const key = `${rank}|${gender}|${piece}|${field}`
    setStore((prev) => ({ ...prev, [key]: v }))

    // Save to Supabase (upsert: insert or update)
    await supabase.from('outfits').upsert(
      {
        rank_key: rank,
        gender,
        piece,
        field,
        value: v,
      },
      { onConflict: 'rank_key,gender,piece,field' },
    )
  }

  return (
    <NeonCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
        <h4 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
          {icon}
          {label}
        </h4>
        <Pill tone="neon">{rank}</Pill>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-border bg-background/40">
              <th className="px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                Piece
              </th>
              <th className="px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                Decals #
              </th>
              <th className="px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                Textures #
              </th>
            </tr>
          </thead>
          <tbody>
            {outfitPieces.map((piece, idx) => (
              <tr
                key={piece}
                className={idx % 2 === 1 ? 'bg-background/20' : undefined}
              >
                <td className="whitespace-nowrap px-4 py-2 font-heading text-sm font-semibold text-foreground">
                  {piece}
                </td>
                <td className="px-3 py-2">
                  <TextCell
                    type="number"
                    value={val(piece, 'decal')}
                    onChange={(v) => set(piece, 'decal', v)}
                    placeholder="—"
                    section="outfits"
                  />
                </td>
                <td className="px-3 py-2">
                  <TextCell
                    type="number"
                    value={val(piece, 'tex')}
                    onChange={(v) => set(piece, 'tex', v)}
                    placeholder="—"
                    section="outfits"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeonCard>
  )
}

export function OutfitsBuilder() {
  const [rank, setRank] = useState<string>(FIRST_RANK)
  const [store, setStore] = useState<OutfitStore>({})
  const [loading, setLoading] = useState(true)

  // Load all outfit data from Supabase on mount
  useEffect(() => {
    async function loadOutfits() {
      setLoading(true)
      const { data, error } = await supabase.from('outfits').select('*')

      if (!error && data) {
        const loaded: OutfitStore = {}
        for (const row of data) {
          const key = `${row.rank_key}|${row.gender}|${row.piece}|${row.field}`
          loaded[key] = row.value || ''
        }
        setStore(loaded)
      }
      setLoading(false)
    }
    loadOutfits()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Interactive Outfits"
        title="دليل ملابس الرتب الذكي"
        desc="اختر الرتبة لعرض لوحة ملابس مخصصة — جداول للرجال والنساء بخانات فارغة لإدخال أرقام الـ Decals والـ Textures لكل قطعة."
        icon={<Shirt className="size-6" />}
      />

      <NeonCard glow className="flex flex-wrap items-center gap-4 p-5">
        <label className="font-heading text-sm font-bold text-foreground">
          اختر الرتبة:
        </label>
        <div className="w-full max-w-xs">
          {/* مفتوحة للكل (حتى الزائر) — هذي أداة تصفح لمشاهدة أرقام الملابس، مش تعديل بيانات */}
          <GroupedSelectCell
            value={rank}
            onChange={setRank}
            groups={RANK_GROUPS}
            section="outfits"
            alwaysEnabled
          />
        </div>
        <Pill tone="neon" className="mr-auto">
          {outfitPieces.length} قطع لكل جدول
        </Pill>
      </NeonCard>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground font-mono text-sm">
          جاري تحميل البيانات...
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <GenderTable
            rank={rank}
            gender="men"
            label="ملابس الرجال — Men"
            icon={<User className="size-4 text-primary" />}
            store={store}
            setStore={setStore}
          />
          <GenderTable
            rank={rank}
            gender="women"
            label="ملابس النساء — Women"
            icon={<UserRound className="size-4 text-primary" />}
            store={store}
            setStore={setStore}
          />
        </div>
      )}
    </div>
  )
}
