import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ClubEraCombo } from '../data/combos'

interface SlotMachineProps {
  combo: ClubEraCombo | null
  isSpinning: boolean
  onSpinComplete?: () => void
}

const ALL_CLUBS = [
  'Real Madrid',
  'Barcelona',
  'Manchester United',
  'Liverpool',
  'Bayern Munich',
  'Juventus',
  'AC Milan',
  'Ajax',
]

const ALL_ERAS = [
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
]

export function SlotMachine({ combo, isSpinning, onSpinComplete }: SlotMachineProps) {
  const [display, setDisplay] = useState({ club: '-', era: '-' })
  const iterationRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isSpinning) {
      iterationRef.current = 0
      setDisplay({ club: '-', era: '-' })

      intervalRef.current = setInterval(() => {
        iterationRef.current += 1

        const randomClub = ALL_CLUBS[Math.floor(Math.random() * ALL_CLUBS.length)]
        const randomEra = ALL_ERAS[Math.floor(Math.random() * ALL_ERAS.length)]
        setDisplay({ club: randomClub, era: randomEra })

        if (iterationRef.current >= 20) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          if (combo) {
            setDisplay({ club: combo.club, era: combo.era })
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
              key={display.era}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.05 }}
              className="text-2xl font-bold text-white block"
            >
              {display.era}
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
