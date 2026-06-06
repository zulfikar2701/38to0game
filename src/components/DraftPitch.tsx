import { motion } from 'framer-motion'
import type { Formation, Player } from '../types/game'
import { clubColors } from '../data/clubColors'

interface DraftPitchProps {
  formation: Formation
  onSlotClick: (index: number) => void
  onSlotRemove?: (index: number) => void
}

function MiniCard({ player }: { player: Player }) {
  const colors = clubColors[player.club] || { primary: '#fff', accent: '#000' }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
      </div>
      <span className="text-[8px] text-white font-bold truncate max-w-[50px]">{player.name.split(' ').pop()}</span>
      <span className="text-[8px] text-white/70">{player.ovr}</span>
    </div>
  )
}

export function DraftPitch({ formation, onSlotClick, onSlotRemove }: DraftPitchProps) {
  const slotPositions = formation.map((slot, i) => {
    // Map formation index to pitch position (x%, y%)
    // This is a simplified layout for a 4-3-3-ish shape
    // Different formations will use the same visual layout for simplicity
    const positions = [
      { x: 50, y: 92 },  // GK
      { x: 15, y: 72 },  // DEF left
      { x: 38, y: 72 },  // DEF center-left
      { x: 62, y: 72 },  // DEF center-right
      { x: 85, y: 72 },  // DEF right
      { x: 25, y: 48 },  // MID left
      { x: 50, y: 48 },  // MID center
      { x: 75, y: 48 },  // MID right
      { x: 20, y: 22 },  // FWD left
      { x: 50, y: 18 },  // FWD center
      { x: 80, y: 22 },  // FWD right
    ]
    return { ...slot, visualX: positions[i]?.x ?? 50, visualY: positions[i]?.y ?? 50 }
  })

  return (
    <div className="relative w-full aspect-[3/4] bg-green-900/30 rounded-xl border border-white/10 overflow-hidden">
      {/* Pitch lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[94%] h-[94%] border border-white/15 rounded-sm relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-x border-b border-white/15" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[12%] border-x border-t border-white/15" />
          <div className="absolute top-1/2 left-0 right-0 border-t border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white/15" />
        </div>
      </div>

      {/* Slots */}
      {slotPositions.map((slot) => {
        const hasPlayer = slot.player !== null
        return (
          <motion.button
            key={slot.index}
            onClick={() => hasPlayer && onSlotRemove ? onSlotRemove(slot.index) : onSlotClick(slot.index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={[
              'absolute -translate-x-1/2 -translate-y-1/2',
              'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
              'flex flex-col items-center justify-center',
              'border-2 transition-colors',
              hasPlayer
                ? 'bg-white/10 border-white/30'
                : 'bg-white/[0.05] border-white/20 hover:border-white/40 hover:bg-white/[0.08]',
            ].join(' ')}
            style={{ left: `${slot.visualX}%`, top: `${slot.visualY}%` }}
          >
            {hasPlayer && slot.player ? (
              <MiniCard player={slot.player} />
            ) : (
              <span className="text-[10px] font-bold text-white/60">{slot.label}</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
