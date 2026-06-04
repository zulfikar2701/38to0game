import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ClubSeasonCombo } from '../data/combos'
import { clubColors } from '../data/clubColors'

interface SlotMachineProps {
  combo: ClubSeasonCombo | null
  isSpinning: boolean
  onSpinComplete?: () => void
}

const ALL_CLUBS = [
  'Liverpool', 'Man City', 'Chelsea', 'Arsenal', 'Spurs', 'Man Utd',
  'Newcastle', 'Brighton', 'Aston Villa', 'West Ham', 'Leicester',
  'Everton', 'Crystal Palace', 'Brentford', 'Wolves', 'Fulham',
  'Bournemouth', 'Burnley', 'Southampton', 'Watford', 'Leeds',
]

const ALL_SEASONS = [
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20',
  '2020-21', '2021-22', '2022-23', '2023-24', '2024-25',
]

export function SlotMachine({ combo, isSpinning, onSpinComplete }: SlotMachineProps) {
  const [display, setDisplay] = useState({ club: '—', season: '—' })
  const iterationRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeColors = combo ? clubColors[combo.club] : undefined

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
      }, 70)
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
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-xl border px-8 py-5 flex items-center justify-center gap-6 min-w-[280px] backdrop-blur-md shadow-xl"
        style={{
          backgroundColor: activeColors ? `${activeColors.primary}15` : 'rgba(255,255,255,0.03)',
          borderColor: activeColors ? `${activeColors.primary}40` : 'rgba(255,255,255,0.08)',
          boxShadow: activeColors ? `0 8px 32px ${activeColors.primary}15` : 'none',
        }}
      >
        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={display.club}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.04 }}
              className="text-xl font-bold block tracking-tight"
              style={{ color: activeColors?.primary ?? '#fff' }}
            >
              {display.club}
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="text-xl text-white/20 font-light">|</span>

        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={display.season}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.04 }}
              className="text-xl font-semibold text-white block tracking-tight"
            >
              {display.season}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {isLocked && activeColors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1"
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeColors.primary }}
          />
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeColors.accent }}
          />
        </motion.div>
      )}
    </div>
  )
}
