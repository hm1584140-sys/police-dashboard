'use client'

import type { SectorId } from '@/lib/sector-context'

const SECTOR_STYLES: Record<SectorId, {
  bg: string
  stripeColor: string
  borderColor: string
}> = {
  // LSPD — فضي على أسود
  LSPD: {
    bg: '#111111',
    stripeColor: '#c8cdd8',
    borderColor: '#000000',
  },
  // BCSO — ذهبي على أسود
  BCSO: {
    bg: '#000000',
    stripeColor: '#d4a017',
    borderColor: '#000000',
  },
  // SASP — أزرق بإطار ذهبي على بيج/ذهبي فاتح
  SASP: {
    bg: '#c8a832',
    stripeColor: '#1a3a7a',
    borderColor: '#c8a832',
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

  // أبعاد الشارة — شكل عمودي مثل الصور
  const badgeW = 28       // عرض الشارة
  const stripeH = 6       // سماكة كل شريطة
  const gap = 4           // مسافة بين الشرائط
  const slant = 8         // مقدار الميل الأفقي
  const padY = 5          // حشو من الأعلى والأسفل
  const padX = 3
  const border = 1.5

  const totalHeight = padY * 2 + count * stripeH + (count - 1) * gap

  function makeStripe(y: number, extra: number) {
    // شريطة مائلة أفقياً
    const x1 = padX - extra
    const x2 = badgeW - padX + extra
    const topLeft = [x1 + slant - extra, y - extra]
    const topRight = [x2 + slant + extra, y - extra]
    const botRight = [x2, y + stripeH + extra]
    const botLeft = [x1, y + stripeH + extra]
    return [topLeft, topRight, botRight, botLeft].map(p => p.join(',')).join(' ')
  }

  return (
    <svg
      width={badgeW + slant + padX}
      height={totalHeight}
      viewBox={`0 0 ${badgeW + slant + padX} ${totalHeight}`}
      className={className}
      role="img"
      aria-label={`${count} سنة خدمة`}
    >
      {/* خلفية الشارة */}
      <rect
        x={0} y={0}
        width={badgeW + slant + padX}
        height={totalHeight}
        fill={style.bg}
        rx={2}
      />

      {/* الشرائط من فوق لتحت */}
      {Array.from({ length: count }, (_, i) => {
        const y = padY + i * (stripeH + gap)
        return (
          <g key={i}>
            <polygon points={makeStripe(y, border)} fill={style.borderColor} />
            <polygon points={makeStripe(y, 0)} fill={style.stripeColor} />
          </g>
        )
      })}
    </svg>
  )
}
