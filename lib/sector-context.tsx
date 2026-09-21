'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
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

export function SectorProvider({ children }: { children: ReactNode }) {
  const builtins = useMemo(() => getBuiltinSectors(), [])
  const [sector, setSectorState] = useState<SectorId>('LSPD')
  const [sectors, setSectors] = useState<SectorDefinition[]>(builtins)
  const [loading, setLoading] = useState(false)

  const refreshSectors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sectors', { cache: 'no-store' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      if (Array.isArray(data.sectors) && data.sectors.length > 0) {
        setSectors(data.sectors)
        setSectorState((current) =>
          data.sectors.some((item: SectorDefinition) => item.id === current)
            ? current
            : data.sectors[0].id,
        )
      }
    } catch {
      setSectors(builtins)
      setSectorState((current) =>
        builtins.some((item) => item.id === current) ? current : builtins[0].id,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshSectors()
  }, [])

  function setSector(id: SectorId) {
    if (sectors.some((item) => item.id === id)) {
      setSectorState(id)
    }
  }

  const currentSector =
    sectors.find((item) => item.id === sector) ??
    sectors[0] ??
    builtins[0]

  return (
    <SectorContext.Provider
      value={{ sector, setSector, sectors, currentSector, refreshSectors, loading }}
    >
      {children}
    </SectorContext.Provider>
  )
}

export function useSector() {
  const ctx = useContext(SectorContext)
  if (!ctx) throw new Error('useSector must be used within SectorProvider')
  return ctx
}

export type { SectorDefinition, SectorId }

export { sectorThemes } from '@/lib/police-data'
