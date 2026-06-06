import { motion, AnimatePresence } from 'framer-motion'
import type { QuadrupleResult } from '../types/game'

interface CompetitionRevealProps {
  quadruple: QuadrupleResult
  revealIndex: number
  onAdvance: () => void
}

const COMPETITIONS = [
  'communityShield',
  'premierLeague',
  'faCup',
  'championsLeague',
] as const

const COMP_NAMES: Record<string, string> = {
  communityShield: 'Community Shield',
  premierLeague: 'Premier League',
  faCup: 'FA Cup',
  championsLeague: 'Champions League',
}

const COMP_ICONS: Record<string, string> = {
  communityShield: '🛡️',
  premierLeague: '🏆',
  faCup: '🏆',
  championsLeague: '⭐',
}

export function CompetitionReveal({ quadruple, revealIndex, onAdvance }: CompetitionRevealProps) {
  const keys = COMPETITIONS
  const currentKey = keys[revealIndex]
  const result = currentKey ? (quadruple as any)[currentKey] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4"
      onClick={onAdvance}
    >
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={currentKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 cursor-pointer"
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl"
            >
              {COMP_ICONS[currentKey]}
            </motion.div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-white">{COMP_NAMES[currentKey]}</h2>

            {/* Result */}
            <div className="flex flex-col items-center gap-2">
              {result.won ? (
                <span className="text-3xl font-black text-yellow-400">🏆 WINNER</span>
              ) : (
                <span className="text-xl font-bold text-white/60">
                  {result.roundReached === 'Final' || result.roundReached.endsWith('st') || result.roundReached.endsWith('nd') || result.roundReached.endsWith('rd') || result.roundReached.endsWith('th')
                    ? `${result.roundReached} Place`
                    : `Reached ${result.roundReached}`}
                </span>
              )}
              {result.scoreline && (
                <span className="text-lg text-white/80">{result.scoreline}</span>
              )}
              {result.finalOpponent && (
                <span className="text-sm text-white/50">vs {result.finalOpponent}</span>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-4">
              {keys.map((k, i) => (
                <div
                  key={k}
                  className={[
                    'w-2 h-2 rounded-full',
                    i === revealIndex ? 'bg-white' : i < revealIndex ? 'bg-white/40' : 'bg-white/10',
                  ].join(' ')}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealIndex >= keys.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-white/60">All competitions revealed</p>
          <p className="text-sm text-white/40 mt-2">Tap to see awards</p>
        </motion.div>
      )}
    </motion.div>
  )
}
