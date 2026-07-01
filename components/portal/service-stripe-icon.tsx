'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
}> = {
  LSPD: { bg: '#111111', stripeColor: '#c8cdd8' },
  BCSO: { bg: '#c8a832', stripeColor: '#1a3a7a' },
  SASP: { bg: '#080808', stripeColor: '#d4a017' },
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

  // شكل مستطيل عريض أفقي مائل — الشرائط جنب بعض
  const stripeW = 14   // عرض كل شريطة
  const gap = 5        // فراغ بين الشرائط
  const H = 40         // ارتفاع الشارة
  const slant = 12     // ميل الشكل
  const padX = 4
  const padY = 4

  const totalW = padX * 2 + count * stripeW + (count - 1) * gap + slant

  const clipId = `clip-${sector}-${count}`

  return (
    <svg
      width={totalW}
      height={H}
      viewBox={`0 0 ${totalW} ${H}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      <defs>
        <clipPath id={clipId}>
          {/* شكل متوازي أضلاع مائل للشارة كاملة */}
          <polygon points={`
            ${slant},0
            ${totalW},0
            ${totalW - slant},${H}
            0,${H}
          `}/>
        </clipPath>
      </defs>

      {/* خلفية الشارة — شكل مائل */}
      <polygon
        points={`${slant},0 ${totalW},0 ${totalW - slant},${H} 0,${H}`}
        fill={style.bg}
      />

      {/* الشرائط أفقياً جنب بعض */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: count }, (_, i) => {
          const x = padX + i * (stripeW + gap)
          return (
            <rect
              key={i}
              x={x}
              y={padY}
              width={stripeW}
              height={H - padY * 2}
              fill={style.stripeColor}
            />
          )
        })}
      </g>
    </svg>
  )
}
