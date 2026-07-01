'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
}> = {
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
  const W = 36       // عرض الشارة
  const H = 20 * count + 4  // ارتفاع حسب عدد الشرائط
  const stripeH = 12  // سماكة الشريطة
  const gap = 8       // فراغ بين الشرائط (لون الخلفية)
  const slant = 8     // مقدار الميل
  const padY = 2

  const clipId = `clip-${sector}-${count}`

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={W} height={H} rx={2}/>
        </clipPath>
      </defs>

      {/* خلفية */}
      <rect x={0} y={0} width={W} height={H} fill={style.bg} rx={2}/>

      {/* الشرائط مع فراغ بينهم */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: count }, (_, i) => {
          const y = padY + i * (stripeH + gap)
          // شريطة مائلة 45 درجة
          const points = [
            `${slant},${y}`,
            `${W},${y}`,
            `${W - slant},${y + stripeH}`,
            `0,${y + stripeH}`,
          ].join(' ')
          return (
            <polygon key={i} points={points} fill={style.stripeColor}/>
          )
        })}
      </g>
    </svg>
  )
}

