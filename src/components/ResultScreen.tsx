import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulationResult } from '../types/game'

interface ResultScreenProps {
  result: SimulationResult
  onPlayAgain: () => void
}

export function ResultScreen({ result, onPlayAgain }: ResultScreenProps) {
  const [showMatches, setShowMatches] = useState(false)

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-12">
      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">{result.verdict}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-38-muted">
          <span>{result.finalPoints} pts</span>
          <span className="text-white/10">|</span>
          <span>Position {result.finalPosition}/20</span>
          <span className="text-white/10">|</span>
          <span>Strength {result.squadStrength}</span>
        </div>
      </motion.div>

      {/* Commentary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        {result.seasonCommentary.map((line, i) => (
          <p key={i} className="text-sm text-38-muted leading-relaxed">
            {line}
          </p>
        ))}
      </motion.div>

      {/* League Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="border border-38-border rounded-lg overflow-hidden"
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
                      isUser ? 'bg-white/[0.03]' : '',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2 text-38-muted">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-white">{team.name}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.played}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.won}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.drawn}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.lost}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.gf}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.ga}</td>
                    <td className="px-2 py-2 text-center text-38-muted">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td className="px-3 py-2 text-center font-semibold text-white">{team.points}</td>
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
                      'font-semibold w-5 text-center',
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
                  <span className="font-mono font-semibold text-white">
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
        className="w-full py-3.5 bg-white text-38-bg font-semibold rounded hover:bg-white/90 transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
