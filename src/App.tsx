import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { SlotMachine } from './components/SlotMachine'
import { PlayerList } from './components/PlayerList'
import { PitchDiagram } from './components/PitchDiagram'
import { ResultScreen } from './components/ResultScreen'
import { SkipButton } from './components/SkipButton'
import { Logo } from './components/Logo'
import type { GameMode } from './types/game'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

function App() {
  const {
    phase,
    round,
    skipsRemaining,
    currentCombo,
    availablePlayers,
    formation,
    simulationResult,
    selectedPlayerId,
    hasSpun,
    startGame,
    spinSlot,
    useSkip,
    selectPlayer,
    assignPlayerToSlot,
    removePlayerFromSlot,
    confirmSquad,
    runSimulation,
    resetGame,
  } = useGameStore()

  const [selectedMode, setSelectedMode] = useState<GameMode>('classic')
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpin = () => {
    setIsSpinning(true)
    spinSlot()
    setTimeout(() => setIsSpinning(false), 1500)
  }

  const handleConfirm = () => {
    confirmSquad()
    setTimeout(() => runSimulation(), 800)
  }

  const handlePlayAgain = () => {
    resetGame()
    startGame('classic')
  }

  const filledCount = formation.filter((s) => s.player !== null).length

  return (
    <div className="min-h-screen bg-38-bg text-38-text font-sans selection:bg-38-gold/30">
      <div className="max-w-5xl mx-auto px-6 py-10">
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
                <p className="text-lg text-38-muted">Draft an all-time XI. Chase the perfect season.</p>
                <p className="text-sm text-38-muted/60">Premier League · 2015–2025</p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-xs">
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMode('classic')}
                    className={`flex-1 py-2.5 rounded border text-sm font-medium transition-all ${
                      selectedMode === 'classic'
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-38-border text-38-muted hover:border-white/20'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => setSelectedMode('blind')}
                    className={`flex-1 py-2.5 rounded border text-sm font-medium transition-all ${
                      selectedMode === 'blind'
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-38-border text-38-muted hover:border-white/20'
                    }`}
                  >
                    Blind
                  </button>
                </div>

                <button
                  onClick={() => startGame(selectedMode)}
                  className="w-full py-3.5 bg-white text-38-bg font-semibold text-base rounded hover:bg-white/90 transition-colors"
                >
                  Start Draft
                </button>
              </div>
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
              className="flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-38-border pb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-38-muted">Round</span>
                  <span className="text-2xl font-bold text-white">{round}</span>
                  <span className="text-sm text-38-muted">/ 11</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-38-muted">{filledCount}/11 picked</span>
                  <SkipButton
                    skipsRemaining={skipsRemaining}
                    onSkip={useSkip}
                    disabled={isSpinning || skipsRemaining === 0 || !hasSpun}
                  />
                </div>
              </div>

              {/* Slot Machine */}
              <SlotMachine
                combo={currentCombo}
                isSpinning={isSpinning}
                onSpinComplete={() => setIsSpinning(false)}
              />

              {/* Spin Button */}
              {!hasSpun && !isSpinning && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSpin}
                  className="w-full py-4 bg-white text-38-bg font-semibold text-lg rounded hover:bg-white/90 transition-colors tracking-wide"
                >
                  SPIN
                </motion.button>
              )}

              {/* Player Selection + Formation */}
              {hasSpun && !isSpinning && currentCombo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                >
                  <PlayerList
                    players={availablePlayers}
                    selectedPlayerId={selectedPlayerId}
                    onSelect={selectPlayer}
                    currentCombo={currentCombo}
                  />
                  <div className="flex flex-col gap-6">
                    <PitchDiagram
                      formation={formation}
                      selectedPlayerId={selectedPlayerId}
                      onSlotClick={assignPlayerToSlot}
                      onSlotRemove={removePlayerFromSlot}
                    />
                    <p className="text-center text-xs text-38-muted">
                      {selectedPlayerId
                        ? 'Click an empty slot to assign'
                        : 'Select a player, then click a slot'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Post-pick: waiting for next spin */}
              {hasSpun && !isSpinning && !currentCombo && round <= 11 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 py-8"
                >
                  <PitchDiagram
                    formation={formation}
                    selectedPlayerId={null}
                    onSlotRemove={removePlayerFromSlot}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSpin}
                    className="px-12 py-3.5 bg-white text-38-bg font-semibold rounded hover:bg-white/90 transition-colors"
                  >
                    SPIN NEXT ROUND
                  </motion.button>
                </motion.div>
              )}
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
              <PitchDiagram
                formation={formation}
                isAnimating={true}
                selectedPlayerId={null}
                onSlotRemove={removePlayerFromSlot}
              />
              <button
                onClick={handleConfirm}
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
              <p className="text-38-muted text-sm tracking-wide">Simulating 38 games...</p>
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
              <ResultScreen result={simulationResult} onPlayAgain={handlePlayAgain} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
