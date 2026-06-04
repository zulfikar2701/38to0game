import { motion } from 'framer-motion'
import type { Player } from '../types/game'
import { StatRadar } from './StatRadar'

interface PlayerCardProps {
  player: Player
  isSelectable: boolean
  onSelect: (id: string) => void
  isBlind: boolean
}

const POSITION_BORDER: Record<Player['position'], string> = {
  GK: 'border-treble-gk',
  DEF: 'border-treble-def',
  MID: 'border-treble-mid',
  FWD: 'border-treble-fwd',
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function PlayerCard({ player, isSelectable, onSelect, isBlind }: PlayerCardProps) {
  const borderColor = POSITION_BORDER[player.position]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={isSelectable ? { scale: 1.03 } : undefined}
      whileTap={isSelectable ? { scale: 0.98 } : undefined}
      onClick={() => isSelectable && onSelect(player.id)}
      className={[
        'bg-treble-surface rounded-xl border-2 p-4 transition-colors',
        borderColor,
        isSelectable
          ? 'cursor-pointer hover:brightness-110'
          : 'opacity-50 cursor-not-allowed',
      ].join(' ')}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">{player.name}</h3>
        <div className="flex flex-wrap gap-2 text-sm text-gray-300">
          <span className="rounded-md bg-gray-800 px-2 py-0.5">{player.club}</span>
          <span className="rounded-md bg-gray-800 px-2 py-0.5">{player.era}</span>
          <span className="rounded-md bg-gray-800 px-2 py-0.5">Peak: {player.peakSeason}</span>
        </div>

        {!isBlind ? (
          <div className="mt-2 flex justify-center">
            <StatRadar stats={player.stats} size={100} />
          </div>
        ) : (
          <div className="mt-2 flex h-[100px] items-center justify-center rounded-lg bg-gray-800/50">
            <span className="text-lg font-bold tracking-widest text-gray-500">???</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
