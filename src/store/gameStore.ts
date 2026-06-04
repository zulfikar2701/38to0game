import { create } from 'zustand'
import type {
  GamePhase,
  GameMode,
  Formation,
  Position,
  Role,
  Player,
  SimulationResult,
} from '../types/game'
import type { ClubSeasonCombo } from '../data/combos'
import { players } from '../data/players'
import {
  buildCombos,
  getPlayersForCombo,
  hasSelectablePlayers,
} from '../data/combos'
import { aggregateSquad } from '../engine/aggregation'
import { runFullSimulation } from '../engine/simulation'
import { generateSeasonCommentary } from '../engine/narrative'

export function createEmptyFormation(): Formation {
  return [
    { position: 'GK', role: 'GK', player: null },
    { position: 'DEF', role: 'FB', player: null },
    { position: 'DEF', role: 'CB', player: null },
    { position: 'DEF', role: 'CB', player: null },
    { position: 'DEF', role: 'FB', player: null },
    { position: 'MID', role: 'CM', player: null },
    { position: 'MID', role: 'CM', player: null },
    { position: 'MID', role: 'CM', player: null },
    { position: 'FWD', role: 'W', player: null },
    { position: 'FWD', role: 'ST', player: null },
    { position: 'FWD', role: 'W', player: null },
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

export function getOpenRoles(formation: Formation): Role[] {
  const open: Role[] = []
  for (const slot of formation) {
    if (slot.player === null) {
      open.push(slot.role)
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
  currentCombo: ClubSeasonCombo | null
  availablePlayers: Player[]
  usedPlayers: Set<string>
  simulationResult: SimulationResult | null
  combos: ClubSeasonCombo[]
  selectedPlayerId: string | null
  hasSpun: boolean

  startGame: (mode: GameMode) => void
  spinSlot: () => void
  useSkip: () => void
  selectPlayer: (playerId: string) => void
  assignPlayerToSlot: (slotIndex: number) => void
  removePlayerFromSlot: (slotIndex: number) => void
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
  currentCombo: null as ClubSeasonCombo | null,
  availablePlayers: [] as Player[],
  usedPlayers: new Set<string>(),
  simulationResult: null as SimulationResult | null,
  combos: buildCombos(players),
  selectedPlayerId: null as string | null,
  hasSpun: false,
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
      selectedPlayerId: null,
      hasSpun: false,
    })
  },

  spinSlot: () => {
    const { formation, usedPlayers, combos } = get()
    const openPositions = getOpenPositions(formation)
    const validCombos = combos.filter((combo) =>
      hasSelectablePlayers(players, combo, usedPlayers, openPositions),
    )

    if (validCombos.length === 0) {
      set({ currentCombo: null, availablePlayers: [], hasSpun: true })
      return
    }

    const randomCombo =
      validCombos[Math.floor(Math.random() * validCombos.length)]
    const available = getPlayersForCombo(
      players,
      randomCombo,
      usedPlayers,
      openPositions,
    )

    set({
      currentCombo: randomCombo,
      availablePlayers: available,
      selectedPlayerId: null,
      hasSpun: true,
    })
  },

  useSkip: () => {
    const { skipsRemaining } = get()
    if (skipsRemaining > 0) {
      set({ skipsRemaining: skipsRemaining - 1 })
      get().spinSlot()
    }
  },

  selectPlayer: (playerId: string) => {
    set({ selectedPlayerId: playerId })
  },

  assignPlayerToSlot: (slotIndex: number) => {
    const { selectedPlayerId, availablePlayers, formation, usedPlayers, round } = get()
    if (!selectedPlayerId) return

    const player = availablePlayers.find((p) => p.id === selectedPlayerId)
    if (!player) return

    const slot = formation[slotIndex]
    if (!slot || slot.player !== null) return

    // Validate role match
    if (slot.role !== player.role) return

    const newFormation = formation.map((s, i) =>
      i === slotIndex ? { ...s, player } : { ...s },
    ) as Formation

    const newUsedPlayers = new Set(usedPlayers)
    newUsedPlayers.add(player.id)

    if (round >= 11) {
      set({
        formation: newFormation,
        usedPlayers: newUsedPlayers,
        phase: 'confirming',
        currentCombo: null,
        availablePlayers: [],
        selectedPlayerId: null,
        hasSpun: false,
      })
    } else {
      set({
        formation: newFormation,
        usedPlayers: newUsedPlayers,
        round: round + 1,
        selectedPlayerId: null,
        currentCombo: null,
        availablePlayers: [],
        hasSpun: false,
      })
    }
  },

  removePlayerFromSlot: (slotIndex: number) => {
    const { formation, usedPlayers, round } = get()
    const slot = formation[slotIndex]
    if (!slot || !slot.player) return

    const newFormation = formation.map((s, i) =>
      i === slotIndex ? { ...s, player: null } : { ...s },
    ) as Formation

    const newUsedPlayers = new Set(usedPlayers)
    newUsedPlayers.delete(slot.player.id)

    set({
      formation: newFormation,
      usedPlayers: newUsedPlayers,
      round: Math.max(1, round - 1),
      phase: 'drafting',
      selectedPlayerId: null,
      currentCombo: null,
      availablePlayers: [],
      hasSpun: false,
    })
  },

  confirmSquad: () => {
    set({ phase: 'simulating' })
  },

  runSimulation: () => {
    const { formation } = get()
    const agg = aggregateSquad(formation)
    const result = runFullSimulation(agg.pillars)
    result.squadStrength = agg.squadStrength
    result.seasonCommentary = generateSeasonCommentary(
      agg.pillars,
      result.finalPosition,
      result.finalPoints,
    )
    set({ simulationResult: result, phase: 'results' })
  },

  resetGame: () => {
    set({ ...initialState })
  },
}))
