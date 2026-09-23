'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBuiltinSectors, type SectorDefinition, type SectorId } from '@/lib/sector-types'

type SectorContextValue = {
  sector: SectorId
  setSector: (s: SectorId) => void
  sectors: SectorDefinition[]
  currentSector: SectorDefinition
  refreshSectors: () => Promise<void>
  loading: boolean
}

const SectorContext = createContext<SectorContextValue | null>(null)
let sectorCache: SectorDefinition[] | null = null

export function SectorProvider({ children }: { children: ReactNode }) {
  const builtins = useMemo(() => getBuiltinSectors(), [])
  const initial = sectorCache?.length ? sectorCache : builtins
  const [sector, setSectorState] = useState<SectorId>(initial[0]?.id ?? 'LSPD')
  const [sectors, setSectors] = useState<SectorDefinition[]>(initial)
  const [loading, setLoading] = useState(false)

  const refreshSectors = useCallback(async () => {
    if (!sectorCache) setLoading(true)
    try {
      const res = await fetch('/api/sectors', { cache: 'no-store' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      if (Array.isArray(data.sectors) && data.sectors.length > 0) {
        sectorCache = data.sectors
        setSectors(data.sectors)
        setSectorState((current) =>
          data.sectors.some((item: SectorDefinition) => item.id === current)
            ? current
            : data.sectors[0].id,
        )
      }
    } catch {
      if (!sectorCache) {
        setSectors(builtins)
        setSectorState((current) =>
          builtins.some((item) => item.id === current) ? current : builtins[0].id,
        )
      }
    } finally {
      setLoading(false)
    }
  }, [builtins])

  useEffect(() => {
    void refreshSectors()
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshSectors()
    }, 1200)
    const onFocus = () => void refreshSectors()
    window.addEventListener('focus', onFocus)
    window.addEventListener('pd:sectors-changed', onFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pd:sectors-changed', onFocus)
    }
  }, [refreshSectors])

  const setSector = useCallback((id: SectorId) => {
    setSectorState((current) => {
      if (current === id) return current
      return sectors.some((item) => item.id === id) ? id : current
    })
  }, [sectors])

  const currentSector = useMemo(
    () => sectors.find((item) => item.id === sector) ?? sectors[0] ?? builtins[0],
    [sectors, sector, builtins],
  )

  const value = useMemo<SectorContextValue>(() => ({
    sector,
    setSector,
    sectors,
    currentSector,
    refreshSectors,
    loading,
  }), [sector, setSector, sectors, currentSector, refreshSectors, loading])

  return <SectorContext.Provider value={value}>{children}</SectorContext.Provider>
}

export function useSector() {
  const ctx = useContext(SectorContext)
  if (!ctx) throw new Error('useSector must be used within SectorProvider')
  return ctx
}

export type { SectorDefinition, SectorId }
export { sectorThemes } from '@/lib/police-data'
