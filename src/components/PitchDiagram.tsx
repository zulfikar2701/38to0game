import { motion } from 'framer-motion'
import type { Formation } from '../types/game'

interface Props {
  formation: Formation
  isAnimating?: boolean
  selectedPlayerId: string | null
  onSlotClick?: (index: number) => void
  onSlotRemove?: (index: number) => void
}

const dotPositions = [
  { x: 150, y: 360, pos: 'GK', label: 'GK' },
  { x: 50, y: 300, pos: 'DEF', label: 'LB' },
  { x: 115, y: 300, pos: 'DEF', label: 'LCB' },
  { x: 185, y: 300, pos: 'DEF', label: 'RCB' },
  { x: 250, y: 300, pos: 'DEF', label: 'RB' },
  { x: 75, y: 200, pos: 'MID', label: 'LCM' },
  { x: 150, y: 200, pos: 'MID', label: 'CM' },
  { x: 225, y: 200, pos: 'MID', label: 'RCM' },
  { x: 75, y: 100, pos: 'FWD', label: 'LW' },
  { x: 150, y: 100, pos: 'FWD', label: 'ST' },
  { x: 225, y: 100, pos: 'FWD', label: 'RW' },
]

export function PitchDiagram({
  formation,
  isAnimating = false,
  selectedPlayerId,
  onSlotClick,
  onSlotRemove,
}: Props) {
  return (
    <div className="w-full max-w-sm mx-auto aspect-[3/4] bg-[#0f2e1f] rounded-lg overflow-hidden border border-white/5 relative select-none">
      <svg viewBox="0 0 300 400" className="w-full h-full">
        {/* Field */}
        <rect x="0" y="0" width="300" height="400" fill="#0f2e1f" />
        <rect x="10" y="10" width="280" height="380" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="10" y1="200" x2="290" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="150" cy="200" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="150" cy="200" r="2" fill="rgba(255,255,255,0.3)" />
        <rect x="70" y="10" width="160" height="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <rect x="70" y="330" width="160" height="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Player dots */}
        {dotPositions.map((dot, i) => {
          const slot = formation[i]
          const isFilled = slot?.player !== null
          const label = isFilled
            ? slot.player!.name.split(' ').slice(-1)[0]
            : dot.label

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
                r={isFilled ? 22 : 18}
                fill={isFilled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                stroke={isClickable ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isClickable ? 2 : 1}
              />
              <text
                x={dot.x}
                y={dot.y - 3}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isFilled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}
                fontSize={isFilled ? 8 : 9}
                fontWeight={isFilled ? '600' : '400'}
                fontFamily="system-ui, sans-serif"
              >
                {label.length > 8 ? label.substring(0, 7) + '..' : label}
              </text>
              {isFilled && (
                <text
                  x={dot.x}
                  y={dot.y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.4)"
                  fontSize={6}
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
                transition={{ delay: i * 0.08, duration: 0.25 }}
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
