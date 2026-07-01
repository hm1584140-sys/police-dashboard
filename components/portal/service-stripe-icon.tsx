'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
  borderColor: string
}> = {
  // LSPD — فضي داكن على رمادي
  LSPD: {
    bg: '#1e2230',
    stripeColor: '#c0c8d8',
    borderColor: '#6a7888',
  },
  // BCSO — ذهبي على أسود
  BCSO: {
    bg: '#0a0a0a',
    stripeColor: '#d4a017',
    borderColor: '#8a6008',
  },
  // SASP — أزرق ملكي بإطار ذهبي على رمادي
  SASP: {
    bg: '#7a8a9a',
    stripeColor: '#1a3a7a',
    borderColor: '#c8a020',
  },
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

  // أبعاد كل شريطة — أكبر وأوضح
  const stripeW = 14     // عرض الشريطة
  const gap = 10         // مسافة بين الشرائط
  const slant = 18       // ميل الشريطة
  const height = 48      // ارتفاع الشارة كامل
  const padX = 5
  const padY = 4
  const border = 2       // سمك الإطار

  const totalWidth = padX * 2 + (count - 1) * gap + stripeW + slant

  function makePoints(x: number, extra: number) {
    return [
      [x + slant - extra, padY - extra],
      [x + slant + stripeW + extra, padY - extra],
      [x + stripeW + extra, height - padY + extra],
      [x - extra, height - padY + extra],
    ].map((p) => p.join(',')).join(' ')
  }

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      {/* خلفية الشارة */}
      <rect x={0} y={0} width={totalWidth} height={height} fill={style.bg} rx={3} />

      {/* الشرائط */}
      {Array.from({ length: count }, (_, i) => {
        const x = padX + i * gap
        return (
          <g key={i}>
            {/* إطار الشريطة */}
            <polygon points={makePoints(x, border)} fill={style.borderColor} />
            {/* لون الشريطة */}
            <polygon points={makePoints(x, 0)} fill={style.stripeColor} />
          </g>
        )
      })}
    </svg>
  )
}
