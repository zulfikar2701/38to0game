import type { Player, Position, Role } from '../types/game'
import { isFWDStats, isMIDStats, isDEFStats, isGKStats } from '../engine/aggregation'

interface PlayerListProps {
  players: Player[]
  selectedPlayerId: string | null
  onSelect: (id: string) => void
  currentCombo: { club: string; season: string } | null
}

const POSITION_LABEL: Record<Position, string> = {
  GK: 'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD',
}

const POSITION_COLOR: Record<Position, string> = {
  GK: '#A855F7',
  DEF: '#3B82F6',
  MID: '#22C55E',
  FWD: '#EF4444',
}

const ROLE_SLOT_MAP: Record<Role, string> = {
  GK: 'GK',
  CB: 'CB (×2)',
  FB: 'LB / RB',
  CM: 'CM (×3)',
  W: 'LW / RW',
  ST: 'ST',
}

function formatStats(player: Player): string {
  const stats = player.stats
  if (isFWDStats(stats)) {
    return `${stats.goals}G · ${stats.assists}A`
  }
  if (isMIDStats(stats)) {
    return `${stats.goals}G · ${stats.assists}A · ${stats.keyPasses.toFixed(1)}KP`
  }
  if (isDEFStats(stats)) {
    return `${stats.tackles.toFixed(1)}Tkl · ${stats.interceptions.toFixed(1)}Int`
  }
  if (isGKStats(stats)) {
    return `${stats.cleanSheets}CS · ${stats.saves}Sv`
  }
  return ''
}

function getGoals(player: Player): number {
  const stats = player.stats
  if ('goals' in stats) return stats.goals
  return 0
}

export function PlayerList({ players, selectedPlayerId, onSelect, currentCombo }: PlayerListProps) {
  const sorted = [...players].sort((a, b) => getGoals(b) - getGoals(a))

  return (
    <div className="flex flex-col gap-5">
      {currentCombo && (
        <div className="text-sm text-38-muted">
          {currentCombo.club} <span className="text-white/40">·</span> {currentCombo.season}
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-1">
        {sorted.map((player) => {
          const isSelected = selectedPlayerId === player.id
          const colors = player.clubColors
          const pos = player.position
          const posColor = POSITION_COLOR[pos]

          return (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className={[
                'w-full text-left rounded-xl border px-4 py-3 transition-all backdrop-blur-sm',
                isSelected
                  ? 'bg-white/[0.08] border-white/30 shadow-lg shadow-black/20'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-lg hover:shadow-black/10',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${posColor}20`,
                        color: posColor,
                      }}
                    >
                      {POSITION_LABEL[pos]}
                    </span>
                    <span className="text-[10px] font-medium text-white/70 bg-white/[0.08] px-1.5 py-0.5 rounded">
                      {ROLE_SLOT_MAP[player.role]}
                    </span>
                    {player.positions.length > 1 && (
                      <span className="text-[10px] text-38-muted/60">
                        {player.positions.filter((p) => p !== pos).join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white mt-1 truncate">{player.name}</span>
                  <span className="text-[11px] text-38-muted truncate">
                    {player.club} · {player.season} · {player.appearances} apps
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-white/90">
                    {formatStats(player)}
                  </span>
                  <div className="flex gap-1">
                    <span
                      className="w-4 h-1 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span
                      className="w-4 h-1 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {players.length === 0 && (
          <div className="text-center text-38-muted py-8 text-sm">
            No players available.
          </div>
        )}
      </div>
    </div>
  )
}
