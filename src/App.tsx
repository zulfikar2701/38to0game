import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { SlotMachine } from './components/SlotMachine'
import { PlayerList } from './components/PlayerList'
import { PitchDiagram } from './components/PitchDiagram'
import { ResultScreen } from './components/ResultScreen'
import { AssignModal } from './components/AssignModal'
import { Logo } from './components/Logo'
import { clubColors } from './data/clubColors'
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
    skipClub,
    skipSeason,
    selectPlayer,
    assignPlayerToSlot,
    removePlayerFromSlot,
    confirmSquad,
    runSimulation,
    resetGame,
  } = useGameStore()

  const [selectedMode, setSelectedMode] = useState<GameMode>('classic')
  const [spinningClub, setSpinningClub] = useState(false)
  const [spinningSeason, setSpinningSeason] = useState(false)

  const isAnySpinning = spinningClub || spinningSeason

  const handleSpin = () => {
    setSpinningClub(true)
    setSpinningSeason(true)
    spinSlot()
    setTimeout(() => {
      setSpinningClub(false)
      setSpinningSeason(false)
    }, 1500)
  }

  const handleSkipClub = () => {
    setSpinningClub(true)
    skipClub()
    setTimeout(() => setSpinningClub(false), 1500)
  }

  const handleSkipSeason = () => {
    setSpinningSeason(true)
    skipSeason()
    setTimeout(() => setSpinningSeason(false), 1500)
  }

  const handleSelectPlayer = (playerId: string) => {
    selectPlayer(playerId)
  }

  const handleAssign = (slotIndex: number) => {
    assignPlayerToSlot(slotIndex)
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

  const selectedPlayer = selectedPlayerId
    ? availablePlayers.find((p) => p.id === selectedPlayerId)
    : null
  const selectedRole = selectedPlayer?.role ?? null

  const canSkip = hasSpun && !isAnySpinning && skipsRemaining > 0 && currentCombo !== null

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
              className="flex flex-col gap-4 sm:gap-6"
            >
              {/* Header — responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-38-border pb-3 sm:pb-4 gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-38-muted">Round</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">{round}</span>
                  <span className="text-xs sm:text-sm text-38-muted">/ 11</span>
                  <span className="text-[10px] sm:text-xs text-38-muted ml-1">({filledCount}/11 picked)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-38-muted uppercase tracking-wider">
                    {skipsRemaining} skip{skipsRemaining === 1 ? '' : 's'}
                  </span>
                  <button
                    onClick={handleSkipClub}
                    disabled={!canSkip}
                    className={[
                      'rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
                      canSkip
                        ? 'border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08] cursor-pointer'
                        : 'border-white/5 text-white/20 cursor-not-allowed opacity-40',
                    ].join(' ')}
                  >
                    Skip Team
                  </button>
                  <button
                    onClick={handleSkipSeason}
                    disabled={!canSkip}
                    className={[
                      'rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all',
                      canSkip
                        ? 'border-amber-400/20 bg-amber-400/[0.04] text-amber-300 hover:bg-amber-400/[0.08] cursor-pointer'
                        : 'border-white/5 text-white/20 cursor-not-allowed opacity-40',
                    ].join(' ')}
                  >
                    Skip Year
                  </button>
                </div>
              </div>

              {/* Slot Machine */}
              <SlotMachine
                combo={currentCombo}
                spinningClub={spinningClub}
                spinningSeason={spinningSeason}
              />

              {/* Desktop: split-screen layout */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-start">
                {/* Left Panel */}
                <div className="flex flex-col gap-4">
                  {currentCombo && !isAnySpinning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PlayerList
                        players={availablePlayers}
                        selectedPlayerId={selectedPlayerId}
                        onSelect={selectPlayer}
                        currentCombo={currentCombo}
                      />
                    </motion.div>
                  )}

                  {!currentCombo && !isAnySpinning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center gap-4 py-12"
                    >
                      <p className="text-sm text-38-muted text-center">
                        {filledCount === 0
                          ? 'Spin to get your first club and season'
                          : filledCount >= 11
                            ? 'Squad complete!'
                            : `${11 - filledCount} more pick${11 - filledCount === 1 ? '' : 's'} needed`}
                      </p>
                      <button
                        onClick={handleSpin}
                        className="w-full py-4 bg-white text-38-bg font-semibold text-lg rounded hover:bg-white/90 transition-colors tracking-wide"
                      >
                        SPIN
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Right Panel: Formation */}
                <div className="flex flex-col gap-6">
                  <PitchDiagram
                    formation={formation}
                    selectedPlayerId={selectedPlayerId}
                    selectedRole={selectedRole}
                    onSlotClick={assignPlayerToSlot}
                    onSlotRemove={removePlayerFromSlot}
                  />
                  <p className="text-center text-xs text-38-muted">
                    {selectedPlayerId && selectedRole
                      ? `Click a ${selectedRole} slot to assign`
                      : 'Select a player, then click a slot'}
                  </p>
                </div>
              </div>

              {/* Mobile: player list only, formation is in modal */}
              <div className="lg:hidden flex flex-col gap-4">
                {currentCombo && !isAnySpinning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PlayerList
                      players={availablePlayers}
                      selectedPlayerId={selectedPlayerId}
                      onSelect={handleSelectPlayer}
                      currentCombo={currentCombo}
                    />
                  </motion.div>
                )}

                {!currentCombo && !isAnySpinning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-4 py-12"
                  >
                    <p className="text-sm text-38-muted text-center">
                      {filledCount === 0
                        ? 'Spin to get your first club and season'
                        : filledCount >= 11
                          ? 'Squad complete!'
                          : `${11 - filledCount} more pick${11 - filledCount === 1 ? '' : 's'} needed`}
                    </p>
                    <button
                      onClick={handleSpin}
                      className="w-full py-4 bg-white text-38-bg font-semibold text-lg rounded hover:bg-white/90 transition-colors tracking-wide"
                    >
                      SPIN
                    </button>
                  </motion.div>
                )}

                {/* Mobile: mini formation preview (read-only, no scrolling needed) */}
                <div className="lg:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-38-muted uppercase tracking-wider">Squad</span>
                    <span className="text-[10px] text-38-muted">{filledCount}/11</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {formation.map((slot, i) => {
                      const hasPlayer = slot.player !== null
                      const colors = hasPlayer ? clubColors[slot.player!.club] : undefined
                      return (
                        <div
                          key={i}
                          className={[
                            'flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium border',
                            hasPlayer
                              ? 'text-white border-white/10'
                              : 'text-white/30 border-white/5 bg-white/[0.02]',
                          ].join(' ')}
                          style={hasPlayer && colors ? {
                            borderColor: `${colors.primary}50`,
                            backgroundColor: `${colors.primary}10`,
                          } : undefined}
                        >
                          <span className="font-bold">{slot.role}</span>
                          {hasPlayer && (
                            <span className="truncate max-w-[60px]">{slot.player!.name.split(' ').pop()}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Assign Modal (mobile) */}
              <AssignModal
                player={selectedPlayer ?? null}
                formation={formation}
                onAssign={handleAssign}
                onClose={() => selectPlayer('')}
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
