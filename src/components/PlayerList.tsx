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
    return `${stats.goals}G · ${stats.assists}A · ${stats.shots}Sh`
  }
  if (isMIDStats(stats)) {
    return `${stats.goals}G · ${stats.assists}A · ${stats.keyPasses.toFixed(1)}KP`
  }
  if (isDEFStats(stats)) {
    return `${stats.tackles.toFixed(1)}Tkl`
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
    <div className="flex flex-col gap-5">
      {currentCombo && (
        <div className="text-sm text-38-muted">
          {currentCombo.club} <span className="text-white/40">·</span> {currentCombo.season}
        </div>
      )}

      <div className="flex flex-col gap-5 max-h-[65vh] overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([pos, posPlayers]) => (
          <div key={pos} className="flex flex-col gap-1.5">
            <h4 className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">
              {POSITION_LABELS[pos]} · {posPlayers.length}
            </h4>
            {posPlayers.map((player) => {
              const isSelected = selectedPlayerId === player.id
              return (
                <button
                  key={player.id}
                  onClick={() => onSelect(player.id)}
                  className={[
                    'w-full text-left rounded-md border px-3 py-2 transition-all',
                    isSelected
                      ? 'bg-white/5 border-white/20'
                      : 'border-transparent hover:bg-white/[0.02] hover:border-white/10',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white truncate">{player.name}</span>
                      <span className="text-[11px] text-38-muted truncate">
                        {player.club} · {player.appearances} apps
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-38-muted whitespace-nowrap">
                      {formatStats(player)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center text-38-muted py-8 text-sm">
            No players available.
          </div>
        )}
      </div>
    </div>
  )
}
