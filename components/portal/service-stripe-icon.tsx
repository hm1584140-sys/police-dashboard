'use client'

import type { SectorId } from '@/lib/sector-context'

// شكل الشريطة لكل قطاع
const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
  borderColor: string
  hasBorder: boolean
}> = {
  // LSPD — شرائط رمادية فضية مائلة على خلفية داكنة
  LSPD: {
    bg: '#2a2a2a',
    stripeColor: '#b0b8c8',
    borderColor: '#7a8898',
    hasBorder: true,
  },
  // BCSO — شرائط ذهبية على خلفية سوداء
  BCSO: {
    bg: '#111111',
    stripeColor: '#d4a017',
    borderColor: '#a07810',
    hasBorder: true,
  },
  // SASP — شرائط زرقاء بإطار ذهبي على خلفية رمادية فاتحة
  SASP: {
    bg: '#8a9aaa',
    stripeColor: '#1a4a8a',
    borderColor: '#c8a020',
    hasBorder: true,
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

  const stripeW = 8      // عرض الشريطة
  const gap = 7          // المسافة بين الشرائط
  const slant = 12       // مقدار الميل
  const height = 36      // ارتفاع الشارة
  const padX = 4         // حشو أفقي
  const padY = 3         // حشو عمودي
  const borderThickness = 1.5

  const totalWidth = padX * 2 + (count - 1) * gap + stripeW + slant

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      {/* الخلفية */}
      <rect x={0} y={0} width={totalWidth} height={height} fill={style.bg} rx={2} />

      {/* الشرائط */}
      {Array.from({ length: count }, (_, i) => {
        const x = padX + i * gap
        const points = [
          [x + slant, padY],
          [x + slant + stripeW, padY],
          [x + stripeW, height - padY],
          [x, height - padY],
        ].map((p) => p.join(',')).join(' ')

        const borderPoints = [
          [x + slant - borderThickness, padY - borderThickness],
          [x + slant + stripeW + borderThickness, padY - borderThickness],
          [x + stripeW + borderThickness, height - padY + borderThickness],
          [x - borderThickness, height - padY + borderThickness],
        ].map((p) => p.join(',')).join(' ')

        return (
          <g key={i}>
            {style.hasBorder && (
              <polygon points={borderPoints} fill={style.borderColor} />
            )}
            <polygon points={points} fill={style.stripeColor} />
          </g>
        )
      })}
    </svg>
  )
}
