import { motion } from 'framer-motion'
import type { Player } from '../types/game'
import { isFWDStats, isMIDStats, isDEFStats, isGKStats } from '../engine/aggregation'

interface PlayerListProps {
  players: Player[]
  selectedPlayerId: string | null
  onSelect: (id: string) => void
  currentCombo: { club: string; season: string } | null
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
}

function formatStats(player: Player): string {
  const stats = player.stats
  if (isFWDStats(stats)) {
    return `${stats.goals}G ${stats.assists}A`
  }
  if (isMIDStats(stats)) {
    return `${stats.goals}G ${stats.assists}A`
  }
  if (isDEFStats(stats)) {
    return `${stats.tackles.toFixed(1)}Tkl ${stats.interceptions.toFixed(1)}Int`
  }
  if (isGKStats(stats)) {
    return `${stats.cleanSheets}CS`
  }
  return ''
}

export function PlayerList({ players, selectedPlayerId, onSelect, currentCombo }: PlayerListProps) {
  const grouped = new Map<string, Player[]>()
  for (const pos of POSITION_ORDER) {
    const filtered = players.filter((p) => p.position === pos)
    if (filtered.length > 0) {
      grouped.set(pos, filtered)
    }
  }

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
      {currentCombo && (
        <div className="text-sm text-gray-400 mb-1">
          Showing players from <span className="text-white font-semibold">{currentCombo.club}</span>{' '}
          <span className="text-yellow-400">{currentCombo.season}</span>
        </div>
      )}

      {Array.from(grouped.entries()).map(([pos, posPlayers]) => (
        <div key={pos} className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {POSITION_LABELS[pos]}
          </h4>
          {posPlayers.map((player) => {
            const isSelected = selectedPlayerId === player.id
            return (
              <motion.button
                key={player.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(player.id)}
                className={[
                  'w-full text-left rounded-lg border px-3 py-2.5 transition-all',
                  isSelected
                    ? 'bg-white/10 border-yellow-400/60'
                    : 'bg-treble-surface/50 border-gray-700 hover:border-gray-500',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{player.name}</span>
                    <span className="text-xs text-gray-400">
                      {player.club} &middot; {player.season}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-300">{formatStats(player)}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      ))}

      {players.length === 0 && (
        <div className="text-center text-gray-500 py-8 text-sm">
          No players available for this combination.
        </div>
      )}
    </div>
  )
}
