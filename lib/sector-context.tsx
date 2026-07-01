'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { sectorThemes, type SectorId } from '@/lib/police-data'

type SectorContextValue = {
  sector: SectorId
  setSector: (s: SectorId) => void
}

const SectorContext = createContext<SectorContextValue | null>(null)

export function SectorProvider({ children }: { children: ReactNode }) {
  const [sector, setSector] = useState<SectorId>('LSPD')
  return (
    <SectorContext.Provider value={{ sector, setSector }}>{children}</SectorContext.Provider>
  )
}

export function useSector() {
  const ctx = useContext(SectorContext)
  if (!ctx) throw new Error('useSector must be used within SectorProvider')
  return ctx
}

export { sectorThemes }
export type { SectorId }
