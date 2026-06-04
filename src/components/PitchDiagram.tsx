import { motion } from 'framer-motion'
import type { Formation } from '../types/game'

interface Props {
  formation: Formation
  isAnimating?: boolean
  selectedPlayerId: string | null
  onSlotClick?: (index: number) => void
  onSlotRemove?: (index: number) => void
}

const positionColors: Record<string, string> = {
  GK: '#A855F7',
  DEF: '#3B82F6',
  MID: '#22C55E',
  FWD: '#EF4444',
}

const dotPositions = [
  { x: 150, y: 360, pos: 'GK' },
  { x: 50, y: 300, pos: 'DEF' },
  { x: 115, y: 300, pos: 'DEF' },
  { x: 185, y: 300, pos: 'DEF' },
  { x: 250, y: 300, pos: 'DEF' },
  { x: 75, y: 200, pos: 'MID' },
  { x: 150, y: 200, pos: 'MID' },
  { x: 225, y: 200, pos: 'MID' },
  { x: 75, y: 100, pos: 'FWD' },
  { x: 150, y: 100, pos: 'FWD' },
  { x: 225, y: 100, pos: 'FWD' },
]

export function PitchDiagram({
  formation,
  isAnimating = false,
  selectedPlayerId,
  onSlotClick,
  onSlotRemove,
}: Props) {
  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] bg-green-900 rounded-lg overflow-hidden border border-green-700 relative select-none">
      <svg viewBox="0 0 300 400" className="w-full h-full">
        {/* Field background */}
        <rect x="0" y="0" width="300" height="400" fill="#14532d" />

        {/* Outline */}
        <rect x="10" y="10" width="280" height="380" fill="none" stroke="white" strokeWidth="2" />

        {/* Halfway line */}
        <line x1="10" y1="200" x2="290" y2="200" stroke="white" strokeWidth="2" />

        {/* Center circle */}
        <circle cx="150" cy="200" r="40" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="150" cy="200" r="2" fill="white" />

        {/* Penalty boxes */}
        <rect x="70" y="10" width="160" height="60" fill="none" stroke="white" strokeWidth="2" />
        <rect x="70" y="330" width="160" height="60" fill="none" stroke="white" strokeWidth="2" />

        {/* Player dots */}
        {dotPositions.map((dot, i) => {
          const slot = formation[i]
          const isFilled = slot?.player !== null
          const color = isFilled ? positionColors[dot.pos] : '#6B7280'
          const label = isFilled
            ? slot.player!.name.split(' ').slice(-1)[0]
            : dot.pos

          const isClickable = !isFilled && selectedPlayerId !== null

          const circle = (
            <g
              key={i}
              onClick={() => {
                if (isFilled && onSlotRemove) {
                  onSlotRemove(i)
                } else if (isClickable && onSlotClick) {
                  onSlotClick(i)
                }
              }}
              style={{ cursor: isFilled || isClickable ? 'pointer' : 'default' }}
            >
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isFilled ? 24 : 20}
                fill={color}
                stroke={isClickable ? '#FBBF24' : 'white'}
                strokeWidth={isClickable ? 3 : isFilled ? 2 : 1}
                opacity={isFilled ? 1 : 0.5}
              />
              <text
                x={dot.x}
                y={dot.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={isFilled ? 9 : 10}
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                {label.length > 8 ? label.substring(0, 7) + '...' : label}
              </text>
              {isFilled && (
                <text
                  x={dot.x}
                  y={dot.y + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.7)"
                  fontSize={7}
                  fontFamily="system-ui, sans-serif"
                >
                  {slot.player!.club}
                </text>
              )}
            </g>
          )

          if (isAnimating && isFilled) {
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                {circle.props.children}
              </motion.g>
            )
          }

          return circle
        })}
      </svg>
    </div>
  )
}
