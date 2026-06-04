import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ClubSeasonCombo } from '../data/combos'
import { clubColors } from '../data/clubColors'

interface SlotMachineProps {
  combo: ClubSeasonCombo | null
  spinningClub: boolean
  spinningSeason: boolean
}

const ALL_CLUBS = [
  'Liverpool', 'Man City', 'Chelsea', 'Arsenal', 'Spurs', 'Man Utd',
  'Newcastle', 'Brighton', 'Aston Villa', 'West Ham', 'Leicester',
  'Everton', 'Crystal Palace', 'Brentford', 'Wolves', 'Fulham',
  'Bournemouth', 'Burnley', 'Southampton', 'Watford', 'Leeds',
  'Ipswich', 'Luton', 'Middlesbrough', 'Cardiff', 'Huddersfield',
  'Hull', 'Norwich', 'QPR', 'Sheffield Utd', 'Stoke', 'Sunderland',
  'Swansea', 'West Brom', "Nott'm Forest",
]

const ALL_SEASONS = [
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20',
  '2020-21', '2021-22', '2022-23', '2023-24', '2024-25',
]

export function SlotMachine({ combo, spinningClub, spinningSeason }: SlotMachineProps) {
  const [displayClub, setDisplayClub] = useState('—')
  const [displaySeason, setDisplaySeason] = useState('—')
  const comboRef = useRef(combo)

  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  // Club box animation — only depends on spinningClub
  useEffect(() => {
    if (!spinningClub) {
      if (comboRef.current) setDisplayClub(comboRef.current.club)
      return
    }

    let iter = 0
    const interval = setInterval(() => {
      iter++
      setDisplayClub(ALL_CLUBS[Math.floor(Math.random() * ALL_CLUBS.length)])
      if (iter >= 20) {
        clearInterval(interval)
        if (comboRef.current) setDisplayClub(comboRef.current.club)
      }
    }, 70)

    return () => clearInterval(interval)
  }, [spinningClub])

  // Season box animation — only depends on spinningSeason
  useEffect(() => {
    if (!spinningSeason) {
      if (comboRef.current) setDisplaySeason(comboRef.current.season)
      return
    }

    let iter = 0
    const interval = setInterval(() => {
      iter++
      setDisplaySeason(ALL_SEASONS[Math.floor(Math.random() * ALL_SEASONS.length)])
      if (iter >= 20) {
        clearInterval(interval)
        if (comboRef.current) setDisplaySeason(comboRef.current.season)
      }
    }, 70)

    return () => clearInterval(interval)
  }, [spinningSeason])

  const isLocked = combo && !spinningClub && !spinningSeason && displayClub === combo.club
  const activeColors = isLocked ? clubColors[combo.club] : undefined

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Club Box */}
      <div
        className="rounded-xl border-2 px-6 py-5 min-w-[170px] text-center backdrop-blur-md shadow-xl transition-all duration-500"
        style={{
          backgroundColor: activeColors ? `${activeColors.primary}15` : 'rgba(255,255,255,0.03)',
          borderColor: activeColors ? `${activeColors.primary}60` : 'rgba(255,255,255,0.08)',
          boxShadow: activeColors ? `0 8px 32px ${activeColors.primary}20` : 'none',
        }}
      >
        <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider block mb-1">
          Team
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={displayClub}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.04 }}
            className="text-xl font-black text-white block tracking-tight"
          >
            {displayClub}
          </motion.span>
        </AnimatePresence>
        {isLocked && activeColors && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-1 justify-center mt-2"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeColors.primary }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeColors.accent }}
            />
          </motion.div>
        )}
      </div>

      {/* VS / Separator */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-38-muted uppercase tracking-wider">Era</span>
        <div className="w-px h-8 bg-white/10" />
      </div>

      {/* Season Box */}
      <div
        className="rounded-xl border-2 px-6 py-5 min-w-[150px] text-center backdrop-blur-md shadow-xl transition-all duration-500"
        style={{
          backgroundColor: isLocked ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.03)',
          borderColor: isLocked ? 'rgba(251,191,36,0.40)' : 'rgba(255,255,255,0.08)',
          boxShadow: isLocked ? '0 8px 32px rgba(251,191,36,0.10)' : 'none',
        }}
      >
        <span className="text-[10px] font-semibold text-38-muted uppercase tracking-wider block mb-1">
          Season
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={displaySeason}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.04 }}
            className="text-xl font-black text-white block tracking-tight"
          >
            {displaySeason}
          </motion.span>
        </AnimatePresence>
        {isLocked && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[10px] text-amber-400/70 font-medium block mt-2"
          >
            Locked In
          </motion.span>
        )}
      </div>
    </div>
  )
}
