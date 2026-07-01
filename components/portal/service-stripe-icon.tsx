'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
}> = {
  LSPD: { bg: '#111111', stripeColor: '#c8cdd8' },  // فضي على أسود
  BCSO: { bg: '#080808', stripeColor: '#d4a017' },  // ذهبي على أسود
  SASP: { bg: '#c8a832', stripeColor: '#1a3a7a' },  // أزرق على ذهبي
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

  // شكل عمودي صغير — الشرائط مائلة أفقياً جوا المستطيل
  const W = 24          // عرض ثابت وصغير
  const stripeH = 5     // سماكة الشريطة
  const gap = 3         // فراغ بين الشرائط
  const slant = 6       // ميل الشريطة
  const padY = 3
  const H = padY * 2 + count * stripeH + (count - 1) * gap

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

      {/* شرائط مائلة */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: count }, (_, i) => {
          const y = padY + i * (stripeH + gap)
          const pts = [
            `${slant},${y}`,
            `${W + slant},${y}`,
            `${W},${y + stripeH}`,
            `0,${y + stripeH}`,
          ].join(' ')
          return <polygon key={i} points={pts} fill={style.stripeColor}/>
        })}
      </g>
    </svg>
  )
}
