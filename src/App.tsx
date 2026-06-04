import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { SlotMachine } from './components/SlotMachine'
import { PlayerList } from './components/PlayerList'
import { PitchDiagram } from './components/PitchDiagram'
import { ResultScreen } from './components/ResultScreen'
import { SkipButton } from './components/SkipButton'
import type { GameMode } from './types/game'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
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
    setTimeout(() => runSimulation(), 500)
  }

  const handlePlayAgain = () => {
    resetGame()
    startGame('classic')
  }

  return (
    <div className="min-h-screen bg-treble-bg text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* MENU */}
          {phase === 'menu' && (
            <motion.div
              key="menu"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
            >
              <div className="text-center">
                <h1 className="text-6xl font-bold text-treble-gold mb-2">38-0</h1>
                <p className="text-xl text-gray-400">Draft an all-time XI. Chase the perfect season.</p>
                <p className="text-sm text-gray-500 mt-2">Premier League Edition · 2015–2026</p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMode('classic')}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${
                      selectedMode === 'classic'
                        ? 'border-treble-gold bg-treble-gold/20 text-treble-gold'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => setSelectedMode('blind')}
                    className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${
                      selectedMode === 'blind'
                        ? 'border-treble-gold bg-treble-gold/20 text-treble-gold'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Blind Draft
                  </button>
                </div>

                <button
                  onClick={() => startGame(selectedMode)}
                  className="w-full py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Start Game
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
              className="flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  Round <span className="text-treble-gold">{round}</span>/11
                </div>
                <SkipButton
                  skipsRemaining={skipsRemaining}
                  onSkip={useSkip}
                  disabled={isSpinning || skipsRemaining === 0}
                />
              </div>

              <SlotMachine
                combo={currentCombo}
                isSpinning={isSpinning}
                onSpinComplete={() => setIsSpinning(false)}
              />

              {!currentCombo && !isSpinning && (
                <button
                  onClick={handleSpin}
                  className="w-full py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  SPIN
                </button>
              )}

              {currentCombo && !isSpinning && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <PlayerList
                    players={availablePlayers}
                    selectedPlayerId={selectedPlayerId}
                    onSelect={selectPlayer}
                    currentCombo={currentCombo}
                  />
                  <div className="flex flex-col gap-4">
                    <PitchDiagram
                      formation={formation}
                      selectedPlayerId={selectedPlayerId}
                      onSlotClick={assignPlayerToSlot}
                      onSlotRemove={removePlayerFromSlot}
                    />
                    <div className="text-center text-sm text-gray-400">
                      {selectedPlayerId
                        ? 'Click an empty slot to assign the selected player'
                        : 'Select a player from the list, then click a slot to assign'}
                    </div>
                  </div>
                </div>
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
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-3xl font-bold text-treble-gold">Your Squad</h2>
              <PitchDiagram
                formation={formation}
                isAnimating={true}
                selectedPlayerId={null}
              />
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Confirm Squad & Simulate Season
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
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 border-4 border-treble-gold border-t-transparent rounded-full"
              />
              <p className="text-xl text-gray-400">Simulating 38-game season...</p>
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
