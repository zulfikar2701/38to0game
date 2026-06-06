import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { FormationSelect } from './components/FormationSelect'
import { DraftPitch } from './components/DraftPitch'
import { CardPicker } from './components/CardPicker'
import { Newspaper } from './components/Newspaper'
import { CompetitionReveal } from './components/CompetitionReveal'
import { PlayerAwards } from './components/PlayerAwards'
import { ResultScreen } from './components/ResultScreen'
import { Logo } from './components/Logo'
import type { Era } from './types/game'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

function App() {
  const {
    phase,
    era,
    formation,
    formationName,
    currentPack,
    simulationResult,
    quadrupleResult,
    revealIndex,
    startGame,
    selectFormation,
    openSlotPicker,
    pickCard,
    closePicker,
    removeFromSlot,
    confirmSquad,
    advanceReveal,
    resetGame,
  } = useGameStore()

  const [selectedEra, setSelectedEra] = useState<Era>('all')

  const filledCount = formation.filter((s) => s.player !== null).length

  return (
    <div className="min-h-screen bg-38-bg text-38-text font-sans selection:bg-38-gold/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {/* MENU */}
          {phase === 'menu' && (
            <motion.div
              key="menu"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center min-h-[80vh] gap-10"
            >
              <div className="text-center space-y-4">
                <Logo className="w-20 h-20 mx-auto" />
                <h1 className="text-7xl font-bold tracking-tight text-white">38-0</h1>
                <p className="text-lg text-38-muted">Draft your dream XI. Dominate the Premier League.</p>
                <p className="text-sm text-38-muted/60">Premier League · 1992–2026 · 18,000+ players</p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                {/* Era selector */}
                <div className="space-y-2">
                  <p className="text-[10px] text-38-muted uppercase tracking-wider text-center">Select Era</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: '90s' as Era, label: '90s Classics', years: '1992–99' },
                      { key: '00s' as Era, label: '00s Nostalgia', years: '1999–09' },
                      { key: '10s' as Era, label: '10s Modern', years: '2009–19' },
                      { key: '20s' as Era, label: '20s Current', years: '2019–26' },
                      { key: 'all' as Era, label: 'All-Time', years: '1992–26' },
                    ]).map((e) => (
                      <button
                        key={e.key}
                        onClick={() => setSelectedEra(e.key)}
                        className={`py-2 rounded border text-xs font-medium transition-all ${
                          selectedEra === e.key
                            ? 'border-white/30 bg-white/5 text-white'
                            : 'border-38-border text-38-muted hover:border-white/20'
                        } ${e.key === 'all' ? 'col-span-3' : ''}`}
                      >
                        <span className="block font-semibold">{e.label}</span>
                        <span className="block text-[10px] opacity-60">{e.years}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startGame(selectedEra)}
                  className="w-full py-3.5 bg-white text-38-bg font-semibold text-base rounded hover:bg-white/90 transition-colors"
                >
                  Start Draft
                </button>
              </div>
            </motion.div>
          )}

          {/* FORMATION SELECT */}
          {phase === 'formation' && (
            <motion.div
              key="formation"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center min-h-[70vh] gap-6"
            >
              <FormationSelect
                onSelect={selectFormation}
                selectedName={formationName}
              />
            </motion.div>
          )}

          {/* DRAFTING */}
          {phase === 'drafting' && (
            <motion.div
              key="drafting"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-38-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-38-muted">Picked</span>
                  <span className="text-xl font-bold text-white">{filledCount}</span>
                  <span className="text-xs text-38-muted">/ 11</span>
                </div>
                <span className="text-xs text-38-muted">{formationName}</span>
              </div>

              <DraftPitch
                formation={formation}
                onSlotClick={openSlotPicker}
                onSlotRemove={removeFromSlot}
              />

              {/* Card Picker Modal */}
              <CardPicker
                cards={currentPack}
                onPick={pickCard}
                onClose={closePicker}
              />
            </motion.div>
          )}

          {/* CONFIRMING */}
          {phase === 'confirming' && (
            <motion.div
              key="confirming"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center gap-8 py-8"
            >
              <h2 className="text-2xl font-semibold text-white">Your Squad</h2>
              <DraftPitch formation={formation} onSlotClick={() => {}} onSlotRemove={removeFromSlot} />
              <button
                onClick={confirmSquad}
                className="px-10 py-3.5 bg-white text-38-bg font-semibold rounded hover:bg-white/90 transition-colors"
              >
                Simulate Season
              </button>
            </motion.div>
          )}

          {/* SIMULATING */}
          {phase === 'simulating' && (
            <motion.div
              key="simulating"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full"
              />
              <p className="text-38-muted text-sm tracking-wide">Simulating 38 games, cup runs, European nights...</p>
            </motion.div>
          )}

          {/* NEWSPAPER */}
          {phase === 'newspaper' && quadrupleResult && (
            <motion.div
              key="newspaper"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Newspaper
                headline={quadrupleResult.headline}
                tagline={quadrupleResult.tagline}
                trophies={quadrupleResult.trophies}
                stats={{
                  points: simulationResult?.finalPoints ?? 0,
                  goalsFor: simulationResult?.totalGoalsFor ?? 0,
                  goalsAgainst: simulationResult?.totalGoalsAgainst ?? 0,
                  position: simulationResult?.finalPosition ?? 0,
                }}
                onContinue={advanceReveal}
              />
            </motion.div>
          )}

          {/* REVEALING */}
          {phase === 'revealing' && quadrupleResult && (
            <motion.div
              key="revealing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CompetitionReveal
                quadruple={quadrupleResult}
                revealIndex={revealIndex}
                onAdvance={advanceReveal}
              />
            </motion.div>
          )}

          {/* RESULTS */}
          {phase === 'results' && simulationResult && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ResultScreen result={simulationResult} onPlayAgain={() => { resetGame(); setSelectedEra(era) }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
