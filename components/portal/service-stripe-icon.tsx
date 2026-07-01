'use client'

// Renders a diagonal "years of service" stripe badge, 1-7 stripes, matching
// the classic military-style chevron patch look. count=0 renders nothing.
export function ServiceStripeIcon({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  if (count <= 0) return null

  const stripeWidth = 6
  const gap = 5
  const slant = 14
  const height = 32
  const width = (count - 1) * gap + stripeWidth + slant + 4

  const stripes = Array.from({ length: count }, (_, i) => {
    const x = 2 + i * gap
    const points = [
      [x + slant, 2],
      [x + slant + stripeWidth, 2],
      [x + stripeWidth, height - 2],
      [x, height - 2],
    ]
      .map((p) => p.join(','))
      .join(' ')
    return <polygon key={i} points={points} fill="currentColor" />
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`${count} ${count === 1 ? 'stripe' : 'stripes'} of service`}
    >
      {stripes}
    </svg>
  )
}
