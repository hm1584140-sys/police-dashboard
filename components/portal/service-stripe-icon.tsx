'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, { bg: string; stripeColor: string }> = {
  LSPD: { bg: '#111111', stripeColor: '#c8cdd8' },
  BCSO: { bg: '#080808', stripeColor: '#d4a017' },
  SASP: { bg: '#c8a832', stripeColor: '#1a3a7a' },
}

export function ServiceStripeIcon({
  count,
  sector = 'LSPD',
  className,
}: {
  count: number
  sector?: SectorId
  className?: string
}) {
  if (count <= 0 || count > 10) return null

  const style = SECTOR_STYLES[sector]
  const stripeW = 9
  const gap = 1
  const H = 34
  const slantX = 10
  const W = count * (stripeW + gap) - gap + slantX + 2

  const stripes = Array.from({ length: count }, (_, i) => {
    const x = 1 + i * (stripeW + gap)
    return (
      <polygon
        key={i}
        points={`
          ${x},${H - 1}
          ${x + stripeW},${H - 1}
          ${x + stripeW + slantX},1
          ${x + slantX},1
        `}
        fill={style.stripeColor}
      />
    )
  })

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`${count} ${count === 1 ? 'سنة' : 'سنوات'} خدمة`}
    >
      <rect x="0" y="0" width={W} height={H} rx="2" fill={style.bg} />
      {stripes}
    </svg>
  )
}


