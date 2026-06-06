import { motion } from 'framer-motion'
import type { PlayerAward, Tier } from '../types/game'

interface PlayerAwardsProps {
  awards: PlayerAward[]
}

const TIER_BG: Record<Tier, string> = {
  bronze: 'bg-gradient-to-br from-[#8B5A2B] to-[#D2691E]',
  silver: 'bg-gradient-to-br from-[#A9A9A9] to-[#E8E8E8]',
  gold: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]',
  star: 'bg-gradient-to-br from-[#6B21A8] to-[#A855F7]',
}

function AwardLabel({ type }: { type: PlayerAward['type'] }) {
  if (type === 'topScorer') return <span className="text-xl">🥇 TOP SCORER</span>
  if (type === 'mostAssists') return <span className="text-xl">🅰️ MOST ASSISTS</span>
  return <span className="text-xl">⭐ PLAYER OF THE SEASON</span>
}

function AwardValue({ type, value }: { type: PlayerAward['type']; value: number }) {
  if (type === 'topScorer') return <span>{value} GOALS</span>
  if (type === 'mostAssists') return <span>{value} ASSISTS</span>
  return <span></span>
}

export function PlayerAwards({ awards }: PlayerAwardsProps) {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
      <h2 className="text-lg font-bold text-white text-center">Player Awards</h2>
      <div className="flex flex-col gap-3">
        {awards.map((award, i) => (
          <motion.div
            key={award.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={[
              'rounded-xl p-4 text-white text-center',
              TIER_BG[award.player.tier],
              'shadow-lg border border-white/10',
            ].join(' ')}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              <AwardLabel type={award.type} />
            </div>
            <div className="text-lg font-bold">{award.player.name}</div>
            <div className="text-xs opacity-70">
              {award.player.club} · {award.player.season}
            </div>
            {award.value > 0 && (
              <div className="mt-1 text-sm font-bold">
                <AwardValue type={award.type} value={award.value} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
