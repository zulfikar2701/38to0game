import { motion, AnimatePresence } from 'framer-motion'
import type { Formation, Player } from '../types/game'
import { clubColors } from '../data/clubColors'

interface AssignModalProps {
  player: Player | null
  formation: Formation
  onAssign: (slotIndex: number) => void
  onClose: () => void
}

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

export function AssignModal({ player, formation, onAssign, onClose }: AssignModalProps) {
  if (!player) return null

  const selectedRole = player.role
  const colors = clubColors[player.club] || { primary: '#fff', accent: '#000' }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-38-bg border border-38-border rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-38-border flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-38-muted uppercase tracking-wider">Assign Player</span>
              <span className="text-sm font-bold text-white">{player.name}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <span className="text-[10px] text-38-muted">{player.club} · {player.season} · {selectedRole}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-38-muted hover:text-white transition-colors text-lg px-1"
            >
              ×
            </button>
          </div>

          {/* Compact Pitch */}
          <div className="relative w-full aspect-[3/4] bg-white/[0.02]">
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
              const canAssignHere = !hasPlayer && slot.role === selectedRole

              const slotColors = hasPlayer ? clubColors[slot.player!.club] : undefined

              return (
                <motion.div
                  key={index}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top, left }}
                  animate={canAssignHere ? { scale: [1, 1.08, 1] } : {}}
                  transition={canAssignHere ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
                >
                  <button
                    className={[
                      'relative flex flex-col items-center gap-0.5',
                      canAssignHere ? 'cursor-pointer' : 'cursor-default',
                    ].join(' ')}
                    onClick={() => {
                      if (canAssignHere) {
                        onAssign(index)
                      }
                    }}
                  >
                    {/* Player circle */}
                    <div
                      className={[
                        'w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                        canAssignHere
                          ? 'ring-2 ring-38-gold ring-offset-2 ring-offset-38-bg scale-110 border border-38-gold/50 text-white bg-38-gold/10'
                          : hasPlayer
                            ? 'text-white'
                            : 'border border-white/10 text-white/20 bg-white/[0.02]',
                      ].join(' ')}
                      style={
                        slotColors && hasPlayer
                          ? {
                              borderColor: `${slotColors.primary}80`,
                              boxShadow: `0 0 20px ${slotColors.primary}30`,
                              backgroundColor: `${slotColors.primary}15`,
                            }
                          : undefined
                      }
                    >
                      {hasPlayer ? slot.role : slot.role}
                    </div>

                    {/* Club dots for filled */}
                    {hasPlayer && slotColors && (
                      <div className="flex gap-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: slotColors.primary }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: slotColors.accent }}
                        />
                      </div>
                    )}

                    {/* Name label */}
                    <span className="text-[9px] font-medium text-white/80 whitespace-nowrap max-w-[70px] truncate">
                      {slot.player?.name || label}
                    </span>
                  </button>
                </motion.div>
              )
            })}

            {/* Filled count */}
            <div className="absolute bottom-2 right-3 text-[10px] text-38-muted">
              {formation.filter((s) => s.player !== null).length}/11
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 border-t border-38-border bg-white/[0.02] text-center">
            <span className="text-[10px] text-38-muted">
              Tap a <span className="text-38-gold font-semibold">{selectedRole}</span> slot to assign
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
