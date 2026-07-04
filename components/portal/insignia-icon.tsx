'use client'

import type { SectorId } from '@/lib/sector-context'

const COLORS: Record<SectorId, { primary: string; secondary: string; bg: string }> = {
  LSPD: { primary: '#c8cdd8', secondary: '#ffffff', bg: '#1a2030' },
  BCSO: { primary: '#d4a017', secondary: '#f0c040', bg: '#1a1408' },
  SASP: { primary: '#d4a017', secondary: '#f0c040', bg: '#0a0a14' },
}

// ألوان Lieutenant II — فضي للـ LSPD، ذهبي للباقي
const LT2_COLORS: Record<SectorId, string> = {
  LSPD: '#c8cdd8',
  BCSO: '#d4a017',
  SASP: '#d4a017',
}

function Star({ x, y, r, fill, stroke }: { x: number; y: number; r: number; fill: string; stroke: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180)
    return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r} ${x + Math.cos(innerAngle) * (r * 0.42)},${y + Math.sin(innerAngle) * (r * 0.42)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={0.5}/>
}

export function InsigniaIcon({
  value,
  sector = 'LSPD',
  size = 36,
}: {
  value: string
  sector?: SectorId
  size?: number
}) {
  const c = COLORS[sector]
  const W = size
  const H = size

  const starRow = (count: number, y: number, r: number) => {
    const spacing = r * 2.4
    const totalW = (count - 1) * spacing
    const startX = W / 2 - totalW / 2
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} x={startX + i * spacing} y={y} r={r} fill={c.primary} stroke={c.secondary}/>
    ))
  }

  const renderInsignia = () => {
    switch (value) {

      // ★★★★★ — LAPD Commissioner (5 نجوم: صف 3 + صف 2)
      case '★★★★★':
        return (
          <>
            {starRow(3, H * 0.3, W * 0.12)}
            {starRow(2, H * 0.68, W * 0.12)}
          </>
        )

      // ★★★★ — Chief of Police (4 نجوم: صف 2 + صف 2)
      case '★★★★':
        return (
          <>
            {starRow(2, H * 0.28, W * 0.12)}
            {starRow(2, H * 0.66, W * 0.12)}
          </>
        )

      // ★★★ — Assistant Chief (3 نجوم: 1 فوق + 2 تحت)
      case '★★★':
        return (
          <>
            {starRow(1, H * 0.26, W * 0.13)}
            {starRow(2, H * 0.64, W * 0.13)}
          </>
        )

      // ★★ — Deputy Chief (نجمتان)
      case '★★':
        return starRow(2, H / 2, W * 0.14)

      // ★ — Commander (نجمة وحدة)
      case '★':
        return starRow(1, H / 2, W * 0.18)

      // ▮▮▮ — Captain (عمودان عريضان)
      case '▮▮▮': {
        const bW = W * 0.18
        const bH = H * 0.55
        const gap = W * 0.13
        const y = (H - bH) / 2
        return (
          <>
            <rect x={W/2 - gap - bW} y={y} width={bW} height={bH} fill={c.primary} rx={1}/>
            <rect x={W/2 + gap} y={y} width={bW} height={bH} fill={c.primary} rx={1}/>
          </>
        )
      }

      // ▮▮ — Lieutenant II (عمود واحد — فضي LSPD، ذهبي للباقي)
      case '▮▮': {
        const bW = W * 0.18
        const bH = H * 0.52
        const color = LT2_COLORS[sector]
        return (
          <rect x={(W - bW)/2} y={(H - bH)/2} width={bW} height={bH} fill={color} rx={1}/>
        )
      }

      // ▮ — Lieutenant (مثلث للأعلى)
      case '▮': {
        const tW = W * 0.5
        const tH = H * 0.38
        return (
          <polygon
            points={`${W/2},${H*0.2} ${W/2 - tW/2},${H*0.2 + tH} ${W/2 + tW/2},${H*0.2 + tH}`}
            fill={c.primary}
          />
        )
      }

      // — N/A — بدون شارة
      case '— N/A':
        return null

      default:
        return null
    }
  }

  const content = renderInsignia()
  if (!content) return null

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={value}
    >
      <rect x={0} y={0} width={W} height={H} fill={c.bg} rx={3}/>
      {content}
    </svg>
  )
}
