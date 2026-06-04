import { motion } from 'framer-motion'
import type { Formation, Role } from '../types/game'
import { clubColors } from '../data/clubColors'

interface PitchDiagramProps {
  formation: Formation
  selectedPlayerId: string | null
  selectedRole?: Role | null
  isAnimating?: boolean
  onSlotClick?: (slotIndex: number) => void
  onSlotRemove?: (slotIndex: number) => void
}

const SLOT_LABELS: Record<string, string> = {
  GK: 'GK',
  LCB: 'LCB',
  RCB: 'RCB',
  LB: 'LB',
  RB: 'RB',
  LCM: 'LCM',
  CM: 'CM',
  RCM: 'RCM',
  LW: 'LW',
  RW: 'RW',
  ST: 'ST',
}

// Fixed order for 4-3-3: GK, LB, LCB, RCB, RB, LCM, CM, RCM, LW, ST, RW
const POSITION_ORDER = [
  'GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CM', 'RCM', 'LW', 'ST', 'RW',
] as const

function getSlotPosition(slotLabel: string): { top: string; left: string } {
  const positions: Record<string, { top: string; left: string }> = {
    GK: { top: '92%', left: '50%' },
    LB: { top: '72%', left: '18%' },
    LCB: { top: '74%', left: '38%' },
    RCB: { top: '74%', left: '62%' },
    RB: { top: '72%', left: '82%' },
    LCM: { top: '48%', left: '25%' },
    CM: { top: '44%', left: '50%' },
    RCM: { top: '48%', left: '75%' },
    LW: { top: '22%', left: '20%' },
    ST: { top: '16%', left: '50%' },
    RW: { top: '22%', left: '80%' },
  }
  return positions[slotLabel] || { top: '50%', left: '50%' }
}

export function PitchDiagram({
  formation,
  selectedPlayerId,
  selectedRole = null,
  isAnimating = false,
  onSlotClick,
  onSlotRemove,
}: PitchDiagramProps) {
  const filledCount = formation.filter((s) => s.player !== null).length

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-38-border/30 bg-white/[0.02] shadow-lg">
      {/* Pitch background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <svg viewBox="0 0 100 133" className="w-full h-full" preserveAspectRatio="none">
          <rect x="5" y="5" width="90" height="123" fill="none" stroke="currentColor" strokeWidth="0.5" rx="2" />
          <line x1="5" y1="66.5" x2="95" y2="66.5" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="66.5" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="66.5" r="0.5" fill="currentColor" />
          <rect x="30" y="5" width="40" height="15" fill="none" stroke="currentColor" strokeWidth="0.5" rx="1" />
          <rect x="40" y="5" width="20" height="8" fill="none" stroke="currentColor" strokeWidth="0.5" rx="1" />
          <rect x="30" y="113" width="40" height="15" fill="none" stroke="currentColor" strokeWidth="0.5" rx="1" />
          <rect x="40" y="120" width="20" height="8" fill="none" stroke="currentColor" strokeWidth="0.5" rx="1" />
        </svg>
      </div>

      {/* Slots */}
      {formation.map((slot, index) => {
        const label = POSITION_ORDER[index]
        const { top, left } = getSlotPosition(label)
        const hasPlayer = slot.player !== null
        const canAssignHere = selectedRole !== null && !hasPlayer && slot.role === selectedRole
        const isHighlighted = selectedPlayerId !== null && !hasPlayer && canAssignHere
        const colors = hasPlayer ? clubColors[slot.player!.club] : undefined

        return (
          <motion.div
            key={index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top, left }}
            initial={isAnimating && hasPlayer ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={isAnimating && hasPlayer ? { delay: index * 0.08, duration: 0.3 } : undefined}
          >
            <button
              className={[
                'relative flex flex-col items-center gap-1',
                onSlotClick && canAssignHere ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
              onClick={() => {
                if (onSlotClick && canAssignHere) {
                  onSlotClick(index)
                }
              }}
            >
              {/* Player circle / slot */}
              <div
                className={[
                  'w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isHighlighted
                    ? 'ring-2 ring-38-gold ring-offset-2 ring-offset-38-bg scale-110'
                    : '',
                  hasPlayer
                    ? 'text-white'
                    : canAssignHere
                      ? 'border border-white/30 text-white/50 bg-white/[0.04]'
                      : 'border border-white/10 text-white/20 bg-white/[0.02]',
                ].join(' ')}
                style={
                  colors
                    ? {
                        borderColor: `${colors.primary}80`,
                        boxShadow: `0 0 20px ${colors.primary}30`,
                        backgroundColor: `${colors.primary}15`,
                      }
                    : undefined
                }
              >
                {hasPlayer ? (
                  <span className="text-[10px] font-bold text-white">
                    {slot.role}
                  </span>
                ) : (
                  <span className={canAssignHere ? 'text-white/60' : ''}>{slot.role}</span>
                )}
              </div>

              {/* Club dots */}
              {hasPlayer && colors && (
                <div className="flex gap-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                </div>
              )}

              {/* Name label */}
              <span className="text-[10px] font-medium text-white/80 whitespace-nowrap max-w-[80px] truncate">
                {slot.player?.name || SLOT_LABELS[label]}
              </span>

              {/* Remove button for filled slots */}
              {hasPlayer && onSlotRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSlotRemove(index)
                  }}
                  className="text-[10px] text-38-muted hover:text-white transition-colors px-1"
                >
                  ×
                </button>
              )}
            </button>
          </motion.div>
        )
      })}

      {/* Filled count indicator */}
      <div className="absolute bottom-3 right-4 text-xs text-38-muted">
        {filledCount}/11
      </div>
    </div>
  )
}
