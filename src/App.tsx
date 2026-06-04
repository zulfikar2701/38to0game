import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { SlotMachine } from './components/SlotMachine'
import { PlayerPool } from './components/PlayerPool'
import { SkipButton } from './components/SkipButton'
import { PitchDiagram } from './components/PitchDiagram'
import { SimulationScreen } from './components/SimulationScreen'
import { ShareCard } from './components/ShareCard'
import type { GameMode } from './types/game'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

function App() {
  const {
    phase,
    mode,
    round,
    skipsRemaining,
    currentCombo,
    availablePlayers,
    formation,
    simulationResult,
    startGame,
    spinSlot,
    useSkip,
    pickPlayer,
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

  const handleResultComplete = () => {
    // SimulationScreen onComplete - store already transitions to results
  }

  const getResultText = () => {
    if (!simulationResult) return ''
    const wins = [simulationResult.league, simulationResult.domesticCup, simulationResult.continentalCup].filter(Boolean).length
    if (wins === 3) return 'TREBLE!'
    if (wins === 2) return 'DOUBLE!'
    if (wins === 1) return 'SINGLE TROPHY!'
    return 'NO TROPHIES'
  }

  const getResultColor = () => {
    if (!simulationResult) return 'text-gray-400'
    const wins = [simulationResult.league, simulationResult.domesticCup, simulationResult.continentalCup].filter(Boolean).length
    if (wins === 3) return 'text-treble-gold'
    if (wins === 2) return 'text-green-500'
    if (wins === 1) return 'text-blue-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-treble-bg text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
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
                <h1 className="text-6xl font-bold text-treble-gold mb-4">Treble Draft</h1>
                <p className="text-xl text-gray-400">Build an all-time XI. Chase the treble.</p>
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

          {phase === 'drafting' && (
            <motion.div
              key="drafting"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">
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

              {currentCombo && !isSpinning && availablePlayers.length > 0 && (
                <PlayerPool
                  players={availablePlayers}
                  onSelect={pickPlayer}
                  isBlind={mode === 'blind'}
                />
              )}
            </motion.div>
          )}

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
              <PitchDiagram formation={formation} isAnimating={true} />
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Confirm Squad & Simulate
              </button>
            </motion.div>
          )}

          {phase === 'simulating' && simulationResult && (
            <motion.div
              key="simulating"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SimulationScreen result={simulationResult} onComplete={handleResultComplete} />
            </motion.div>
          )}

          {phase === 'results' && simulationResult && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center gap-8"
            >
              <h2 className={`text-5xl font-bold ${getResultColor()}`}>
                {getResultText()}
              </h2>

              <div className="flex flex-col gap-2 text-center text-gray-300">
                {simulationResult.commentary.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <ShareCard formation={formation} result={simulationResult} />

              <button
                onClick={() => {
                  resetGame()
                  startGame('classic')
                }}
                className="px-8 py-4 bg-treble-gold text-treble-bg font-bold text-xl rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
