import { motion } from 'framer-motion'
import type { Player } from '../types/game'
import { PlayerCard } from './PlayerCard'

interface PlayerPoolProps {
  players: Player[]
  onSelect: (id: string) => void
  isBlind: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export function PlayerPool({ players, onSelect, isBlind }: PlayerPoolProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelectable={true}
          onSelect={onSelect}
          isBlind={isBlind}
        />
      ))}
    </motion.div>
  )
}
