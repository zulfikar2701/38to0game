import { create } from 'zustand'
import type {
  GamePhase,
  GameMode,
  Formation,
  Position,
  Player,
  SimulationResult,
} from '../types/game'
import type { ClubEraCombo } from '../data/combos'
import { samplePlayers } from '../data/samplePlayers'
import {
  buildCombos,
  getPlayersForCombo,
  hasSelectablePlayers,
} from '../data/combos'
import { aggregateSquad } from '../engine/aggregation'
import { runFullSimulation } from '../engine/simulation'
import { generateCommentary } from '../engine/narrative'

export function createEmptyFormation(): Formation {
  return [
    { position: 'GK', player: null },
    { position: 'DEF', player: null },
    { position: 'DEF', player: null },
    { position: 'DEF', player: null },
    { position: 'DEF', player: null },
    { position: 'MID', player: null },
    { position: 'MID', player: null },
    { position: 'MID', player: null },
    { position: 'FWD', player: null },
    { position: 'FWD', player: null },
    { position: 'FWD', player: null },
  ] as Formation
}

export function getOpenPositions(formation: Formation): Position[] {
  const open: Position[] = []
  for (const slot of formation) {
    if (slot.player === null) {
      open.push(slot.position)
    }
  }
  return open
}

interface GameState {
  phase: GamePhase
  mode: GameMode
  round: number
  formation: Formation
  skipsRemaining: number
  currentCombo: ClubEraCombo | null
  availablePlayers: Player[]
  usedPlayers: Set<string>
  simulationResult: SimulationResult | null
  combos: ClubEraCombo[]

  startGame: (mode: GameMode) => void
  spinSlot: () => void
  useSkip: () => void
  pickPlayer: (playerId: string) => void
  confirmSquad: () => void
  runSimulation: () => void
  resetGame: () => void
}

const initialState = {
  phase: 'menu' as GamePhase,
  mode: 'classic' as GameMode,
  round: 1,
  formation: createEmptyFormation(),
  skipsRemaining: 1,
  currentCombo: null as ClubEraCombo | null,
  availablePlayers: [] as Player[],
  usedPlayers: new Set<string>(),
  simulationResult: null as SimulationResult | null,
  combos: buildCombos(samplePlayers),
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startGame: (mode: GameMode) => {
    set({
      phase: 'drafting',
      mode,
      round: 1,
      formation: createEmptyFormation(),
      skipsRemaining: 1,
      currentCombo: null,
      availablePlayers: [],
      usedPlayers: new Set<string>(),
      simulationResult: null,
    })
    get().spinSlot()
  },

  spinSlot: () => {
    const { formation, usedPlayers, combos } = get()
    const openPositions = getOpenPositions(formation)
    const validCombos = combos.filter((combo) =>
      hasSelectablePlayers(samplePlayers, combo, usedPlayers, openPositions),
    )

    if (validCombos.length === 0) {
      set({ currentCombo: null, availablePlayers: [] })
      return
    }

    const randomCombo =
      validCombos[Math.floor(Math.random() * validCombos.length)]
    const players = getPlayersForCombo(
      samplePlayers,
      randomCombo,
      usedPlayers,
      openPositions,
    )

    set({ currentCombo: randomCombo, availablePlayers: players })
  },

  useSkip: () => {
    const { skipsRemaining } = get()
    if (skipsRemaining > 0) {
      set({ skipsRemaining: skipsRemaining - 1 })
      get().spinSlot()
    }
  },

  pickPlayer: (playerId: string) => {
    const { availablePlayers, formation, usedPlayers, round } = get()
    const player = availablePlayers.find((p) => p.id === playerId)
    if (!player) return

    const newFormation = formation.map((slot) => ({ ...slot })) as Formation
    for (const slot of newFormation) {
      if (slot.position === player.position && slot.player === null) {
        slot.player = player
        break
      }
    }

    const newUsedPlayers = new Set(usedPlayers)
    newUsedPlayers.add(playerId)

    if (round >= 11) {
      set({
        formation: newFormation,
        usedPlayers: newUsedPlayers,
        phase: 'confirming',
        currentCombo: null,
        availablePlayers: [],
      })
    } else {
      set({
        formation: newFormation,
        usedPlayers: newUsedPlayers,
        round: round + 1,
      })
      get().spinSlot()
    }
  },

  confirmSquad: () => {
    set({ phase: 'simulating' })
  },

  runSimulation: () => {
    const { formation } = get()
    const pillars = aggregateSquad(formation)
    const result = runFullSimulation(pillars)
    result.commentary = generateCommentary(pillars)
    set({ simulationResult: result, phase: 'results' })
  },

  resetGame: () => {
    set({ ...initialState })
  },
}))
