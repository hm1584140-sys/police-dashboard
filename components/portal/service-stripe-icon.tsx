'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, { bg: string; stripeColor: string }> = {
  LSPD: { bg: '#111111', stripeColor: '#c8cdd8' },   // فضي على أسود مثل LAPD
  BCSO: { bg: '#080808', stripeColor: '#d4a017' },   // ذهبي على أسود
  SASP: { bg: '#c8a832', stripeColor: '#1a3a7a' },   // أزرق ملكي على ذهبي مثل CHP
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

  const stripeH = 4    // ارتفاع كل شريط أفقي
  const gap = 3        // فراغ بين الشرائط
  const W = 36         // عرض ثابت
  const slant = 8      // ميل جانبي
  const padY = 3
  const padX = 3
  const totalH = padY * 2 + count * stripeH + (count - 1) * gap
  const clipId = `hclip-${sector}-${count}`

  return (
    <svg
      width={W}
      height={totalH}
      viewBox={`0 0 ${W} ${totalH}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={`${slant},0 ${W},0 ${W - slant},${totalH} 0,${totalH}`} />
        </clipPath>
      </defs>

      {/* خلفية مائلة */}
      <polygon
        points={`${slant},0 ${W},0 ${W - slant},${totalH} 0,${totalH}`}
        fill={style.bg}
      />

      {/* شرائط أفقية */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: count }, (_, i) => {
          const y = padY + i * (stripeH + gap)
          return (
            <rect
              key={i}
              x={padX}
              y={y}
              width={W - padX * 2}
              height={stripeH}
              fill={style.stripeColor}
            />
          )
        })}
      </g>
    </svg>
  )
}
