import { motion } from 'framer-motion'
import type { Player, Tier } from '../types/game'

interface PlayerCardProps {
  player: Player
  tier: Tier
  onClick?: () => void
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const TIER_GRADIENTS: Record<Tier, string> = {
  bronze: 'from-[#8B5A2B] to-[#D2691E]',
  silver: 'from-[#A9A9A9] to-[#E8E8E8]',
  gold: 'from-[#FFD700] to-[#FFA500]',
  star: 'from-[#6B21A8] to-[#A855F7]',
}

const TIER_TEXT: Record<Tier, string> = {
  bronze: 'text-white',
  silver: 'text-gray-900',
  gold: 'text-gray-900',
  star: 'text-white',
}

const TIER_TEXT_MUTED: Record<Tier, string> = {
  bronze: 'text-white/60',
  silver: 'text-gray-700',
  gold: 'text-gray-700',
  star: 'text-white/60',
}

export function PlayerCard({ player, tier, onClick, selected, size = 'md' }: PlayerCardProps) {
  const colors = player.clubColors
  const sizeClasses =
    size === 'sm'
      ? 'w-24 h-32 text-[8px]'
      : size === 'lg'
        ? 'w-40 h-56 text-sm'
        : 'w-32 h-44 text-[10px]'

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: 1.1, rotate: 3 } : {}}
      className={[
        'relative rounded-xl overflow-hidden cursor-pointer select-none',
        'bg-gradient-to-b',
        TIER_GRADIENTS[tier],
        sizeClasses,
        'flex flex-col items-center justify-between py-2 px-1',
        'border border-white/10 shadow-lg',
        selected ? 'ring-2 ring-white/50' : '',
      ].join(' ')}
    >
      {/* Club color strip */}
      <div className="w-full h-2 flex rounded-t-lg overflow-hidden shrink-0">
        <div className="flex-1" style={{ backgroundColor: colors.primary }} />
        <div className="flex-1" style={{ backgroundColor: colors.accent }} />
      </div>

      {/* Flag + Team */}
      <div className={`flex items-center gap-1 ${TIER_TEXT_MUTED[tier]} shrink-0`}>
        <span className="text-xs">{player.flag || ''}</span>
        <span className="font-semibold truncate max-w-[80px]">{player.club}</span>
      </div>

      {/* Player name */}
      <div className={`${TIER_TEXT[tier]} font-bold text-center leading-tight px-1 truncate max-w-full`}>
        {player.name}
      </div>

      {/* Season */}
      <div className={`${TIER_TEXT_MUTED[tier]} text-center`}>{player.season}</div>

      {/* OVR */}
      <div className={`${TIER_TEXT[tier]} font-black text-4xl leading-none`}>
        {player.ovr}
      </div>

      {/* Position + Role badges */}
      <div className="flex gap-1 shrink-0">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tier === 'silver' || tier === 'gold' ? 'bg-black/20 text-gray-900' : 'bg-white/20 text-white'}`}>
          {player.position}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tier === 'silver' || tier === 'gold' ? 'bg-black/20 text-gray-900' : 'bg-white/20 text-white'}`}>
          {player.role}
        </span>
      </div>
    </motion.div>
  )
}
