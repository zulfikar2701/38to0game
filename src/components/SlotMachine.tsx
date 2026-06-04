import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ClubSeasonCombo } from '../data/combos'

interface SlotMachineProps {
  combo: ClubSeasonCombo | null
  isSpinning: boolean
  onSpinComplete?: () => void
}

const ALL_CLUBS = [
  'Liverpool',
  'Man City',
  'Chelsea',
  'Arsenal',
  'Spurs',
  'Man Utd',
  'Newcastle',
  'Brighton',
  'Aston Villa',
  'West Ham',
  'Leicester',
  'Everton',
  'Crystal Palace',
  'Brentford',
  'Wolves',
  'Fulham',
  'Bournemouth',
  'Burnley',
]

const ALL_SEASONS = [
  '2015-16',
  '2016-17',
  '2017-18',
  '2018-19',
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
  '2023-24',
  '2024-25',
  '2025-26',
]

export function SlotMachine({ combo, isSpinning, onSpinComplete }: SlotMachineProps) {
  const [display, setDisplay] = useState({ club: '-', season: '-' })
  const iterationRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isSpinning) {
      iterationRef.current = 0

      intervalRef.current = setInterval(() => {
        iterationRef.current += 1

        const randomClub = ALL_CLUBS[Math.floor(Math.random() * ALL_CLUBS.length)]
        const randomSeason = ALL_SEASONS[Math.floor(Math.random() * ALL_SEASONS.length)]
        setDisplay({ club: randomClub, season: randomSeason })

        if (iterationRef.current >= 20) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          if (combo) {
            setDisplay({ club: combo.club, season: combo.season })
          }
          onSpinComplete?.()
        }
      }, 75)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isSpinning, combo, onSpinComplete])

  const isLocked = combo && !isSpinning

  return (
    <div className="flex flex-col items-center">
      <div className="bg-treble-surface rounded-xl border border-gray-700 p-6 flex items-center justify-center gap-4 min-w-[320px]">
        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={display.club}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.05 }}
              className="text-2xl font-bold text-white block"
            >
              {display.club}
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="text-2xl font-bold text-yellow-400">|</span>

        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={display.season}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.05 }}
              className="text-2xl font-bold text-white block"
            >
              {display.season}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {isLocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 px-4 py-1 rounded-full bg-yellow-400/10 border border-yellow-400 text-yellow-400 text-sm font-bold tracking-wider"
        >
          LOCKED IN
        </motion.div>
      )}
    </div>
  )
}
