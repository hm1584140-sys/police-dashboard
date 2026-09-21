'use client'

import type { SectorId } from '@/lib/sector-context'

// ألوان كل قطاع
const GOLD = '#d4a017'
const SILVER = '#c8cdd8'
const WHITE = '#ffffff'

// لكل قطاع: لون رئيسي ولون ثانوي
const SECTOR_COLORS: Record<SectorId, { main: string; alt: string; bg: string }> = {
  LSPD: { main: SILVER, alt: GOLD,   bg: '#1a2030' },
  BCSO: { main: GOLD,   alt: SILVER, bg: '#1a1408' },
  SASP: { main: GOLD,   alt: SILVER, bg: '#0a0a14' },
}

function Star({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a1 = (i * 72 - 90) * (Math.PI / 180)
    const a2 = ((i * 72 + 36) - 90) * (Math.PI / 180)
    return `${x + Math.cos(a1) * r},${y + Math.sin(a1) * r} ${x + Math.cos(a2) * (r * 0.42)},${y + Math.sin(a2) * (r * 0.42)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} stroke={WHITE} strokeWidth={0.4}/>
}

export function InsigniaIcon({
  value,
  sector = 'LSPD',
  size = 38,
}: {
  value: string
  sector?: SectorId
  size?: number
}) {
  // لا تعرض شيء لـ N/A
  if (!value || value === '— N/A') return null

  const { main, alt, bg } = SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] ?? {
    main: SILVER,
    alt: GOLD,
    bg: '#111827',
  }
  const W = size
  const H = size

  const starRow = (count: number, y: number, r: number, color: string) => {
    const spacing = r * 2.5
    const startX = W / 2 - ((count - 1) * spacing) / 2
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} x={startX + i * spacing} y={y} r={r} fill={color}/>
    ))
  }

  // عمود عمودي
  const bar = (cx: number, color: string, wRatio = 0.16, hRatio = 0.55) => {
    const bW = W * wRatio
    const bH = H * hRatio
    return <rect x={cx - bW/2} y={(H - bH)/2} width={bW} height={bH} fill={color} rx={1}/>
  }

  let content: React.ReactNode = null

  switch (value) {
    // ★★★★★ — LAPD Commissioner
    case '★★★★★':
      content = <>{starRow(3, H * 0.3, W * 0.12, main)}{starRow(2, H * 0.68, W * 0.12, main)}</>
      break

    // ★★★★ — Chief of Police
    case '★★★★':
      content = <>{starRow(2, H * 0.28, W * 0.12, main)}{starRow(2, H * 0.66, W * 0.12, main)}</>
      break

    // ★★★ — Assistant Chief
    case '★★★':
      content = <>{starRow(1, H * 0.26, W * 0.13, main)}{starRow(2, H * 0.64, W * 0.13, main)}</>
      break

    // ★★ — Deputy Chief
    case '★★':
      content = starRow(2, H / 2, W * 0.14, main)
      break

    // ★ — Commander
    case '★':
      content = starRow(1, H / 2, W * 0.18, main)
      break

    // ▮▮▮ — Captain: عمودان بلون main
    case '▮▮▮':
      content = (
        <>
          {bar(W * 0.32, main)}
          {bar(W * 0.68, main)}
        </>
      )
      break

    // ▮▮ — Lieutenant II: عمود واحد بلون main
    case '▮▮':
      content = bar(W / 2, main)
      break

    // ▮ — Lieutenant: عمود واحد بلون alt (عكس Lieutenant II)
    case '▮':
      content = bar(W / 2, alt)
      break

    default:
      return null
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={value}>
      <rect x={0} y={0} width={W} height={H} fill={bg} rx={3}/>
      {content}
    </svg>
  )
}
