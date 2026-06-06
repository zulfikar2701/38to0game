import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '../types/game'
import { PlayerCard } from './PlayerCard'

interface CardPickerProps {
  cards: Card[]
  onPick: (index: number) => void
  onClose: () => void
}

export function CardPicker({ cards, onPick, onClose }: CardPickerProps) {
  const hasCards = cards.length > 0

  return (
    <AnimatePresence>
      {hasCards && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white">Pick a Player</h3>
            <p className="text-sm text-white/60">Tap a card to draft them into your squad</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 max-w-full">
            {cards.map((card, i) => (
              <motion.div
                key={card.player.id + i}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onPick(i)
                }}
              >
                <PlayerCard
                  player={card.player}
                  tier={card.tier}
                  size="md"
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="mt-6 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
