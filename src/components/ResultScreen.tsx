import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationResult, Player } from '../types/game'
import { clubColors } from '../data/clubColors'
import { isFWDStats, isMIDStats, isDEFStats, isGKStats } from '../engine/aggregation'

interface ResultScreenProps {
  result: SimulationResult
  onPlayAgain: () => void
}

function getPlayerScore(player: Player): number {
  const stats = player.stats
  if (isFWDStats(stats)) return stats.goals * 3 + stats.assists * 2
  if (isMIDStats(stats)) return stats.goals * 2 + stats.assists * 2 + stats.keyPasses * 4
  if (isDEFStats(stats)) return stats.tackles * 2 + stats.interceptions * 2 + stats.blocks + stats.aerials
  if (isGKStats(stats)) return stats.cleanSheets * 5 + stats.saves * 0.1 + stats.distribution * 0.05
  return 0
}

function getStarPlayers(squad: Player[], count = 3): Player[] {
  return [...squad].sort((a, b) => getPlayerScore(b) - getPlayerScore(a)).slice(0, count)
}

function formatPlayerStats(player: Player): string {
  const stats = player.stats
  if (isFWDStats(stats)) return `${stats.goals}G ${stats.assists}A`
  if (isMIDStats(stats)) return `${stats.goals}G ${stats.assists}A ${stats.keyPasses.toFixed(1)}KP`
  if (isDEFStats(stats)) return `${stats.tackles.toFixed(1)}T ${stats.interceptions.toFixed(1)}I`
  if (isGKStats(stats)) return `${stats.cleanSheets}CS`
  return ''
}

const ROLE_BADGE_BG: Record<string, string> = {
  GK: '#A855F7',
  CB: '#3B82F6',
  FB: '#60A5FA',
  CM: '#22C55E',
  W: '#F59E0B',
  ST: '#EF4444',
}

const ROLE_BADGE_TEXT: Record<string, string> = {
  GK: 'GK',
  CB: 'CB',
  FB: 'FB',
  CM: 'CM',
  W: 'W',
  ST: 'ST',
}

function getSeasonRange(squad: Player[]): string {
  const seasons = squad.map((p) => p.season).sort()
  if (seasons.length === 0) return '2015–2025'
  const first = seasons[0]
  const last = seasons[seasons.length - 1]
  if (first === last) return first
  return `${first} – ${last}`
}

export function ResultScreen({ result, onPlayAgain }: ResultScreenProps) {
  const [showMatches, setShowMatches] = useState(false)
  const [showSquad, setShowSquad] = useState(true)

  const stars = useMemo(() => getStarPlayers(result.squad), [result.squad])
  const starIds = useMemo(() => new Set(stars.map((p) => p.id)), [stars])

  const record = `${result.matches.filter((m) => m.result === 'W').length}-${result.matches.filter((m) => m.result === 'D').length}-${result.matches.filter((m) => m.result === 'L').length}`

  const seasonRange = getSeasonRange(result.squad)

  const uniqueClubs = useMemo(() => {
    const clubs = [...new Set(result.squad.map((p) => p.club))]
    return clubs
  }, [result.squad])

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
      {/* Hero Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{result.verdict}</h1>
        <p className="text-sm text-38-muted">Season {seasonRange} · Premier League</p>
      </motion.div>

      {/* Key Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="flex flex-col items-center gap-1 rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-5">
          <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Position</span>
          <span className="text-4xl font-black text-white">{result.finalPosition}</span>
          <span className="text-[10px] text-38-muted">/ 20</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-5">
          <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Points</span>
          <span className="text-4xl font-black text-white">{result.finalPoints}</span>
          <span className="text-[10px] text-38-muted">/ 114</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-5">
          <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Record</span>
          <span className="text-2xl font-black text-white">{record}</span>
          <span className="text-[10px] text-38-muted">W · D · L</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-5">
          <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Strength</span>
          <span className="text-4xl font-black text-white">{result.squadStrength}</span>
          <span className="text-[10px] text-38-muted">/ 100</span>
        </div>
      </motion.div>

      {/* Goals summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-center gap-6 text-sm"
      >
        <span className="text-38-muted">
          Scored <span className="text-white font-bold text-lg">{result.totalGoalsFor}</span>
        </span>
        <span className="text-white/10">|</span>
        <span className="text-38-muted">
          Conceded <span className="text-white font-bold text-lg">{result.totalGoalsAgainst}</span>
        </span>
        <span className="text-white/10">|</span>
        <span className="text-38-muted">
          GD <span className="text-white font-bold text-lg">{result.totalGoalsFor - result.totalGoalsAgainst > 0 ? '+' : ''}{result.totalGoalsFor - result.totalGoalsAgainst}</span>
        </span>
      </motion.div>

      {/* Player Awards */}
      {result.playerStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {/* Player of the Season */}
          {(() => {
            const poty = [...result.playerStats].sort((a, b) => b.rating - a.rating)[0]
            if (!poty) return null
            const colors = clubColors[poty.club] || { primary: '#fff', accent: '#000' }
            return (
              <div
                className="rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-4 flex flex-col gap-2"
                style={{ borderColor: `${colors.primary}30` }}
              >
                <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Player of the Season</span>
                <span className="text-sm font-bold text-white truncate">{poty.name}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <span className="text-[10px] text-38-muted">{poty.club} · {poty.season}</span>
                </div>
                <span className="text-xs text-white/70">Rating: <span className="font-bold text-white">{poty.rating}</span></span>
              </div>
            )
          })()}

          {/* Top Scorer */}
          {(() => {
            const top = [...result.playerStats].sort((a, b) => b.goals - a.goals)[0]
            if (!top || top.goals === 0) return null
            const colors = clubColors[top.club] || { primary: '#fff', accent: '#000' }
            return (
              <div
                className="rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-4 flex flex-col gap-2"
                style={{ borderColor: `${colors.primary}30` }}
              >
                <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Top Scorer</span>
                <span className="text-sm font-bold text-white truncate">{top.name}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <span className="text-[10px] text-38-muted">{top.club} · {top.season}</span>
                </div>
                <span className="text-xs text-white/70">Goals: <span className="font-bold text-white">{top.goals}</span></span>
              </div>
            )
          })()}

          {/* Most Assists */}
          {(() => {
            const ma = [...result.playerStats].sort((a, b) => b.assists - a.assists)[0]
            if (!ma || ma.assists === 0) return null
            const colors = clubColors[ma.club] || { primary: '#fff', accent: '#000' }
            return (
              <div
                className="rounded-xl border border-38-border/40 bg-white/[0.03] backdrop-blur-sm px-4 py-4 flex flex-col gap-2"
                style={{ borderColor: `${colors.primary}30` }}
              >
                <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider">Most Assists</span>
                <span className="text-sm font-bold text-white truncate">{ma.name}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <span className="text-[10px] text-38-muted">{ma.club} · {ma.season}</span>
                </div>
                <span className="text-xs text-white/70">Assists: <span className="font-bold text-white">{ma.assists}</span></span>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Clubs assembled */}
      {uniqueClubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-[10px] text-38-muted uppercase tracking-wider">Clubs assembled</span>
          {uniqueClubs.map((club) => {
            const colors = clubColors[club] || { primary: '#fff', accent: '#000' }
            return (
              <span
                key={club}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full border"
                style={{ borderColor: `${colors.primary}40`, backgroundColor: `${colors.primary}10` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                {club}
              </span>
            )
          })}
        </motion.div>
      )}

      {/* Commentary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 text-center"
      >
        {result.seasonCommentary.map((line, i) => (
          <p key={i} className="text-sm text-38-muted leading-relaxed">
            {line}
          </p>
        ))}
      </motion.div>

      {/* Squad View */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="border border-38-border rounded-xl overflow-hidden"
      >
        <button
          onClick={() => setShowSquad(!showSquad)}
          className="w-full px-4 py-3 border-b border-38-border flex items-center justify-between text-xs font-semibold text-38-muted uppercase tracking-wider hover:bg-white/[0.03] transition-colors"
        >
          <span>Your Squad</span>
          <span>{showSquad ? '−' : '+'}</span>
        </button>

        <AnimatePresence>
          {showSquad && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Star players banner */}
              {stars.length > 0 && (
                <div className="px-4 py-3 border-b border-38-border/50 bg-white/[0.02]">
                  <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider mb-2 block">Star Players</span>
                  <div className="flex gap-2 flex-wrap">
                    {stars.map((player) => {
                      const colors = clubColors[player.club] || { primary: '#fff', accent: '#000' }
                      return (
                        <div
                          key={player.id}
                          className="flex items-center gap-2 rounded-lg border px-3 py-2"
                          style={{
                            borderColor: `${colors.primary}50`,
                            backgroundColor: `${colors.primary}10`,
                          }}
                        >
                          <div className="flex gap-0.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
                          </div>
                          <span className="text-xs font-bold text-white">{player.name}</span>
                          <span className="text-[10px] text-white/50">{formatPlayerStats(player)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Squad cards */}
              <div className="flex flex-col divide-y divide-38-border/30">
                {result.squad.map((player) => {
                  const isStar = starIds.has(player.id)
                  const colors = clubColors[player.club] || { primary: '#fff', accent: '#000' }
                  const roleBg = ROLE_BADGE_BG[player.role] || '#777'
                  return (
                    <div
                      key={player.id}
                      className={[
                        'flex items-center gap-3 px-4 py-3',
                        isStar ? 'bg-white/[0.03]' : '',
                      ].join(' ')}
                    >
                      {/* Colored left accent */}
                      <div
                        className="w-1 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: colors.primary }}
                      />
                      {/* Role badge */}
                      <span
                        className="text-[10px] font-bold w-7 h-7 rounded flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: roleBg }}
                      >
                        {ROLE_BADGE_TEXT[player.role]}
                      </span>
                      {/* Player info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-white truncate">{player.name}</span>
                        <span className="text-[10px] text-38-muted truncate">
                          {player.club} · {player.season}
                        </span>
                      </div>
                      {/* Stats */}
                      <span className="text-xs font-semibold text-white/80 shrink-0">
                        {formatPlayerStats(player)}
                      </span>
                      {/* Star indicator */}
                      {isStar && (
                        <span className="text-xs text-yellow-400 shrink-0">★</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* League Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border border-38-border rounded-xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-38-border text-xs font-semibold text-38-muted uppercase tracking-wider">
          Premier League Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-38-muted/60 border-b border-38-border">
                <th className="px-3 py-2 text-left font-medium">Pos</th>
                <th className="px-3 py-2 text-left font-medium">Team</th>
                <th className="px-2 py-2 text-center font-medium">P</th>
                <th className="px-2 py-2 text-center font-medium">W</th>
                <th className="px-2 py-2 text-center font-medium">D</th>
                <th className="px-2 py-2 text-center font-medium">L</th>
                <th className="px-2 py-2 text-center font-medium">GF</th>
                <th className="px-2 py-2 text-center font-medium">GA</th>
                <th className="px-2 py-2 text-center font-medium">GD</th>
                <th className="px-3 py-2 text-center font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {result.leagueTable.map((team, i) => {
                const isUser = team.name === 'Your XI'
                return (
                  <tr
                    key={team.name}
                    className={[
                      'border-b border-38-border/50',
                      isUser ? 'bg-white/[0.04]' : '',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2 text-38-muted">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-white">{team.name}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.played}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.won}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.drawn}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.lost}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.gf}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.ga}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td className="px-3 py-2 text-center font-bold text-white">{team.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Match Log */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowMatches(!showMatches)}
          className="w-full py-2.5 border border-38-border rounded-lg text-xs font-medium text-38-muted hover:border-white/20 transition-colors"
        >
          {showMatches ? 'Hide Match Log' : 'Show Match Log'} ({result.matches.length} games)
        </button>

        <AnimatePresence>
          {showMatches && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-px max-h-[50vh] overflow-y-auto border border-38-border rounded-lg"
            >
              {result.matches.map((match) => (
                <div
                  key={match.gameweek}
                  className="flex items-center gap-3 px-3 py-2 text-xs border-b border-38-border/50 last:border-0"
                >
                  <span className="text-38-muted/50 w-10">GW{match.gameweek}</span>
                  <span
                    className={[
                      'font-bold w-5 text-center',
                      match.result === 'W'
                        ? 'text-green-400'
                        : match.result === 'D'
                          ? 'text-38-muted'
                          : 'text-red-400',
                    ].join(' ')}
                  >
                    {match.result}
                  </span>
                  <span className="text-38-muted/50 w-8 text-center">{match.home ? 'H' : 'A'}</span>
                  <span className="text-38-muted flex-1 truncate">{match.opponent}</span>
                  <span className="font-mono font-bold text-white">
                    {match.goalsFor}-{match.goalsAgainst}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Play Again */}
      <button
        onClick={onPlayAgain}
        className="w-full py-3.5 bg-white text-38-bg font-bold rounded hover:bg-white/90 transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
