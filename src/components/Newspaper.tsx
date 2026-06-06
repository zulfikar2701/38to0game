import { motion } from 'framer-motion'

interface NewspaperProps {
  headline: string
  tagline: string
  trophies: number
  stats: { points: number; goalsFor: number; goalsAgainst: number; position: number }
  onContinue: () => void
}

export function Newspaper({ headline, tagline, trophies, stats, onContinue }: NewspaperProps) {
  const trophyEmojis = '🏆'.repeat(Math.min(trophies, 4))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4"
      onClick={onContinue}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden cursor-pointer">
        {/* Paper texture header */}
        <div className="bg-neutral-100 px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">⚽ The Premier Post</span>
            <span className="text-[10px] text-neutral-400">Saturday, May 27, 2026</span>
          </div>
          <div className="mt-2 h-px bg-neutral-300" />
        </div>

        {/* Headline */}
        <div className="px-6 py-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 leading-tight uppercase tracking-tight">
            {headline}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 italic">{tagline}</p>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-center gap-4 text-xs text-neutral-500 uppercase tracking-wider">
          <span>{trophyEmojis || '—'}</span>
          <span>{stats.points} pts</span>
          <span>{stats.goalsFor} GF</span>
          <span>{stats.goalsAgainst} GA</span>
          <span>Pos {stats.position}</span>
        </div>
      </div>

      <motion.p
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-sm text-white/60"
      >
        Tap to continue →
      </motion.p>
    </motion.div>
  )
}
