'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
  borderColor: string
}> = {
  LSPD: { bg: '#111111', stripeColor: '#c8cdd8', borderColor: '#000000' },
  BCSO: { bg: '#000000', stripeColor: '#d4a017', borderColor: '#000000' },
  SASP: { bg: '#c8a832', stripeColor: '#1a3a7a', borderColor: '#c8a832' },
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

  const badgeW = 32
  const stripeH = 7
  const gap = 4
  const slant = 10
  const padY = 4
  const padX = 2
  const border = 1.5
  const totalHeight = padY * 2 + count * stripeH + (count - 1) * gap
  const clipId = `clip-${sector}-${count}`

  function makeStripe(y: number, extra: number) {
    return [
      [padX - extra + slant, y - extra],
      [badgeW - padX + extra + slant, y - extra],
      [badgeW - padX + extra, y + stripeH + extra],
      [padX - extra, y + stripeH + extra],
    ].map(p => p.join(',')).join(' ')
  }

  return (
    <svg
      width={badgeW}
      height={totalHeight}
      viewBox={`0 0 ${badgeW} ${totalHeight}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={badgeW} height={totalHeight} rx={2} />
        </clipPath>
      </defs>

      {/* خلفية */}
      <rect x={0} y={0} width={badgeW} height={totalHeight} fill={style.bg} rx={2} />

      {/* الشرائط داخل الـ clip */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: count }, (_, i) => {
          const y = padY + i * (stripeH + gap)
          return (
            <g key={i}>
              <polygon points={makeStripe(y, border)} fill={style.borderColor} />
              <polygon points={makeStripe(y, 0)} fill={style.stripeColor} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
