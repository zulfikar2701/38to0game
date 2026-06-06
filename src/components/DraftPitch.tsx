import type { Formation, Player } from '../types/game'
import { clubColors } from '../data/clubColors'

interface DraftPitchProps {
  formation: Formation
  onSlotClick: (index: number) => void
  onSlotRemove?: (index: number) => void
  onSlotReroll?: (index: number) => void
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

function getPos(label: string, role: string): { x: number; y: number } {
  const l = label.toUpperCase()
  if (role === 'GK' || l === 'GK') return { x: 50, y: 92 }
  if (role === 'CB' || role === 'FB') {
    const m: Record<string, number> = { LWB: 10, LB: 14, LCB: 30, CB: 50, RCB: 70, RB: 86, RWB: 90 }
    for (const [k, v] of Object.entries(m)) if (l.includes(k)) return { x: v, y: 72 }
    return { x: 50, y: 72 }
  }
  if (role === 'CM') {
    const m: Record<string, number> = { LM: 12, LCM: 25, CDM: 38, CM: 50, RCM: 75, RM: 88 }
    for (const [k, v] of Object.entries(m)) if (l.includes(k)) return { x: v, y: 48 }
    return { x: 50, y: 48 }
  }
  if (role === 'ST' || role === 'W') {
    const m: Record<string, number> = { LW: 14, LST: 30, CAM: 50, ST: 50, RST: 70, RW: 86 }
    for (const [k, v] of Object.entries(m)) if (l.includes(k)) return { x: v, y: 20 }
    return { x: 50, y: 20 }
  }
  return { x: 50, y: 50 }
}

export function DraftPitch({ formation, onSlotClick, onSlotRemove, onSlotReroll }: DraftPitchProps) {
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
      {formation.map((slot) => {
        const hasPlayer = slot.player !== null
        const { x, y } = getPos(slot.label, slot.role)
        return (
          <button
            key={slot.index}
            onClick={() => !hasPlayer && onSlotClick(slot.index)}
            className={[
              'absolute -translate-x-1/2 -translate-y-1/2',
              'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
              'flex flex-col items-center justify-center',
              'border-2',
              hasPlayer
                ? 'bg-white/10 border-white/30'
                : 'bg-white/[0.05] border-white/20 hover:border-white/40 hover:bg-white/[0.08]',
            ].join(' ')}
            style={{ left: x + '%', top: y + '%' }}
          >
            {hasPlayer && slot.player ? (
              <MiniCard player={slot.player} />
            ) : (
              <span className="text-[10px] font-bold text-white/60">{slot.label}</span>
            )}
          </button>
        )
      })}

      {/* Re-roll buttons */}
      {formation.filter(s => s.player !== null).map((slot) => {
        const { x, y } = getPos(slot.label, slot.role)
        return (
          <button
            key={'rr-' + slot.index}
            onClick={(e) => { e.stopPropagation(); onSlotReroll?.(slot.index) }}
            className="absolute w-5 h-5 bg-white/10 border border-white/30 rounded-full flex items-center justify-center text-[8px] text-white/60 hover:text-white hover:bg-white/20"
            style={{ left: 'calc(' + x + '% + 22px)', top: 'calc(' + y + '% - 22px)' }}
            title="Re-roll"
          >R</button>
        )
      })}
    </div>
  )
}
