import type { PositionStats, GKStats, DEFStats, MIDStats, FWDStats } from '../types/game'

interface StatRadarProps {
  stats: PositionStats
  size?: number
}

const POSITION_COLORS = {
  GK: '#A855F7',
  DEF: '#3B82F6',
  MID: '#22C55E',
  FWD: '#EF4444',
} as const

function identifyPosition(stats: PositionStats): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if ('saves' in stats) return 'GK'
  if ('tackles' in stats) return 'DEF'
  if ('passes' in stats) return 'MID'
  if ('shots' in stats) return 'FWD'
  throw new Error('Unknown stats shape')
}

function getNormalizedValues(stats: PositionStats): { values: number[] } {
  if ('saves' in stats) {
    const s = stats as GKStats
    return {
      values: [
        Math.min(s.saves / 200, 1),
        Math.min(s.cleanSheets / 50, 1),
        Math.min(s.distribution / 100, 1),
      ],
    }
  }
  if ('tackles' in stats) {
    const s = stats as DEFStats
    return {
      values: [
        Math.min(s.tackles / 150, 1),
        Math.min(s.blocks / 150, 1),
        Math.min(s.aerials / 150, 1),
        Math.min(s.interceptions / 150, 1),
      ],
    }
  }
  if ('passes' in stats) {
    const s = stats as MIDStats
    return {
      values: [
        Math.min(s.goals / 60, 1),
        Math.min(s.assists / 60, 1),
        Math.min(s.passes / 100, 1),
        Math.min(s.keyPasses / 5, 1),
        Math.min(s.dribbles / 6, 1),
      ],
    }
  }
  if ('shots' in stats) {
    const s = stats as FWDStats
    return {
      values: [
        Math.min(s.goals / 60, 1),
        Math.min(s.assists / 60, 1),
        Math.min(s.shots / 300, 1),
      ],
    }
  }
  throw new Error('Unknown stats shape')
}

export function StatRadar({ stats, size = 80 }: StatRadarProps) {
  const position = identifyPosition(stats)
  const color = POSITION_COLORS[position]
  const { values } = getNormalizedValues(stats)
  const count = values.length

  const center = size / 2
  const radius = size / 2 - 4
  const angleStep = (2 * Math.PI) / count

  const points = values
    .map((value, i) => {
      const angle = -Math.PI / 2 + i * angleStep
      const r = value * radius
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')

  const axisPoints = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + i * angleStep
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { x, y }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {axisPoints.map((pt, i) => (
        <line
          key={`axis-${i}`}
          x1={center}
          y1={center}
          x2={pt.x}
          y2={pt.y}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      <polygon
        points={points}
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={1}
      />
    </svg>
  )
}
