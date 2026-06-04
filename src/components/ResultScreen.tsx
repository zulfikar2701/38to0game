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
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Verdict Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-treble-gold mb-2">{result.verdict}</h1>
        <div className="flex items-center justify-center gap-4 text-gray-300">
          <span className="text-lg">
            <span className="font-bold text-white">{result.finalPoints}</span> pts
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-lg">
            Position: <span className="font-bold text-white">{result.finalPosition}</span>/20
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-lg">
            Squad Strength: <span className="font-bold text-white">{result.squadStrength}</span>
          </span>
        </div>
      </motion.div>

      {/* Season Commentary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-treble-surface rounded-xl border border-gray-700 p-4"
      >
        {result.seasonCommentary.map((line, i) => (
          <p key={i} className="text-gray-300 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </motion.div>

      {/* League Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-treble-surface rounded-xl border border-gray-700 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-700 font-bold text-sm text-gray-400 uppercase tracking-wider">
          Premier League Table
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="px-3 py-2 text-left">Pos</th>
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-2 py-2 text-center">P</th>
                <th className="px-2 py-2 text-center">W</th>
                <th className="px-2 py-2 text-center">D</th>
                <th className="px-2 py-2 text-center">L</th>
                <th className="px-2 py-2 text-center">GF</th>
                <th className="px-2 py-2 text-center">GA</th>
                <th className="px-2 py-2 text-center">GD</th>
                <th className="px-3 py-2 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {result.leagueTable.map((team, i) => {
                const isUser = team.name === 'Your XI'
                return (
                  <tr
                    key={team.name}
                    className={[
                      'border-b border-gray-800',
                      isUser ? 'bg-yellow-400/10' : i % 2 === 0 ? 'bg-gray-800/20' : '',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-white">{team.name}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.played}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.won}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.drawn}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.lost}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.gf}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.ga}</td>
                    <td className="px-2 py-2 text-center text-gray-400">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td className="px-3 py-2 text-center font-bold text-white">{team.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Match Log Toggle */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowMatches(!showMatches)}
          className="w-full py-3 bg-treble-surface border border-gray-700 rounded-lg text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors"
        >
          {showMatches ? 'Hide Match Log' : 'Show Match Log'} ({result.matches.length} games)
        </button>

        <AnimatePresence>
          {showMatches && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto bg-treble-surface rounded-lg border border-gray-700 p-2"
            >
              {result.matches.map((match) => (
                <div
                  key={match.gameweek}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-800/30"
                >
                  <span className="text-xs text-gray-500 w-8">GW{match.gameweek}</span>
                  <span
                    className={[
                      'text-xs font-bold px-2 py-0.5 rounded',
                      match.result === 'W'
                        ? 'bg-green-500/20 text-green-400'
                        : match.result === 'D'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-red-500/20 text-red-400',
                    ].join(' ')}
                  >
                    {match.result}
                  </span>
                  <span className="text-xs text-gray-500 w-12 text-center">
                    {match.home ? 'H' : 'A'}
                  </span>
                  <span className="text-sm text-gray-300 flex-1 truncate">{match.opponent}</span>
                  <span className="text-sm font-mono font-bold text-white">
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
        className="w-full py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
