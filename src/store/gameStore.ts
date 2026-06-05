import { create } from 'zustand'
import type {
  GamePhase,
  GameMode,
  Era,
  Formation,
  Position,
  Role,
  Player,
  SimulationResult,
} from '../types/game'
import type { ClubSeasonCombo } from '../data/combos'
import { players, getPlayersByEra } from '../data/players'
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
  era: Era
  eraPlayers: Player[]
  round: number
  formation: Formation
  skipsRemaining: number
  currentCombo: ClubSeasonCombo | null
  availablePlayers: Player[]
  usedPlayers: Set<string>
  usedPlayerNames: Set<string>
  simulationResult: SimulationResult | null
  combos: ClubSeasonCombo[]
  selectedPlayerId: string | null
  hasSpun: boolean

  startGame: (mode: GameMode, era: Era) => void
  spinSlot: () => void
  useSkip: () => void
  skipClub: () => void
  skipSeason: () => void
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
  era: 'all' as Era,
  eraPlayers: players,
  round: 1,
  formation: createEmptyFormation(),
  skipsRemaining: 2,
  currentCombo: null as ClubSeasonCombo | null,
  availablePlayers: [] as Player[],
  usedPlayers: new Set<string>(),
  usedPlayerNames: new Set<string>(),
  simulationResult: null as SimulationResult | null,
  combos: buildCombos(players),
  selectedPlayerId: null as string | null,
  hasSpun: false,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startGame: (mode: GameMode, era: Era) => {
    const eraPlayers = getPlayersByEra(era)
    set({
      phase: 'drafting',
      mode,
      era,
      eraPlayers,
      round: 1,
      formation: createEmptyFormation(),
      skipsRemaining: 2,
      currentCombo: null,
      availablePlayers: [],
      usedPlayers: new Set<string>(),
      usedPlayerNames: new Set<string>(),
      simulationResult: null,
      combos: buildCombos(eraPlayers),
      selectedPlayerId: null,
      hasSpun: false,
    })
  },

  spinSlot: () => {
    const { formation, usedPlayers, usedPlayerNames, combos, eraPlayers } = get()
    const openPositions = getOpenPositions(formation)
    const openRoles = getOpenRoles(formation)
    const validCombos = combos.filter((combo) =>
      hasSelectablePlayers(eraPlayers, combo, usedPlayers, usedPlayerNames, openPositions, openRoles),
    )

    if (validCombos.length === 0) {
      set({ currentCombo: null, availablePlayers: [], hasSpun: true })
      return
    }

    const randomCombo =
      validCombos[Math.floor(Math.random() * validCombos.length)]
    const available = getPlayersForCombo(
      eraPlayers,
      randomCombo,
      usedPlayers,
      usedPlayerNames,
      openPositions,
      openRoles,
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

  skipClub: () => {
    const { formation, usedPlayers, usedPlayerNames, combos, currentCombo, skipsRemaining, eraPlayers } = get()
    if (!currentCombo || skipsRemaining === 0) return

    const openPositions = getOpenPositions(formation)
    const openRoles = getOpenRoles(formation)

    const sameSeasonCombos = combos.filter((c) =>
      c.season === currentCombo.season &&
      c.club !== currentCombo.club &&
      hasSelectablePlayers(eraPlayers, c, usedPlayers, usedPlayerNames, openPositions, openRoles),
    )

    if (sameSeasonCombos.length > 0) {
      const newCombo = sameSeasonCombos[Math.floor(Math.random() * sameSeasonCombos.length)]
      const available = getPlayersForCombo(eraPlayers, newCombo, usedPlayers, usedPlayerNames, openPositions, openRoles)
      set({
        currentCombo: newCombo,
        availablePlayers: available,
        selectedPlayerId: null,
        skipsRemaining: skipsRemaining - 1,
      })
    } else {
      get().spinSlot()
      set({ skipsRemaining: skipsRemaining - 1 })
    }
  },

  skipSeason: () => {
    const { formation, usedPlayers, usedPlayerNames, combos, currentCombo, skipsRemaining, eraPlayers } = get()
    if (!currentCombo || skipsRemaining === 0) return

    const openPositions = getOpenPositions(formation)
    const openRoles = getOpenRoles(formation)

    const sameClubCombos = combos.filter((c) =>
      c.club === currentCombo.club &&
      c.season !== currentCombo.season &&
      hasSelectablePlayers(eraPlayers, c, usedPlayers, usedPlayerNames, openPositions, openRoles),
    )

    if (sameClubCombos.length > 0) {
      const newCombo = sameClubCombos[Math.floor(Math.random() * sameClubCombos.length)]
      const available = getPlayersForCombo(eraPlayers, newCombo, usedPlayers, usedPlayerNames, openPositions, openRoles)
      set({
        currentCombo: newCombo,
        availablePlayers: available,
        selectedPlayerId: null,
        skipsRemaining: skipsRemaining - 1,
      })
    } else {
      get().spinSlot()
      set({ skipsRemaining: skipsRemaining - 1 })
    }
  },

  selectPlayer: (playerId: string) => {
    set({ selectedPlayerId: playerId })
  },

  assignPlayerToSlot: (slotIndex: number) => {
    const { selectedPlayerId, availablePlayers, formation, usedPlayers, usedPlayerNames, round } = get()
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

    const newUsedPlayerNames = new Set(usedPlayerNames)
    newUsedPlayerNames.add(player.name)

    if (round >= 11) {
      set({
        formation: newFormation,
        usedPlayers: newUsedPlayers,
        usedPlayerNames: newUsedPlayerNames,
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
        usedPlayerNames: newUsedPlayerNames,
        round: round + 1,
        selectedPlayerId: null,
        currentCombo: null,
        availablePlayers: [],
        hasSpun: false,
      })
    }
  },

  removePlayerFromSlot: (slotIndex: number) => {
    const { formation, usedPlayers, usedPlayerNames, round } = get()
    const slot = formation[slotIndex]
    if (!slot || !slot.player) return

    const newFormation = formation.map((s, i) =>
      i === slotIndex ? { ...s, player: null } : { ...s },
    ) as Formation

    const newUsedPlayers = new Set(usedPlayers)
    newUsedPlayers.delete(slot.player.id)

    const newUsedPlayerNames = new Set(usedPlayerNames)
    newUsedPlayerNames.delete(slot.player.name)

    set({
      formation: newFormation,
      usedPlayers: newUsedPlayers,
      usedPlayerNames: newUsedPlayerNames,
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
    const result = runFullSimulation(agg.pillars, formation)
    result.squadStrength = agg.squadStrength
    result.seasonCommentary = generateSeasonCommentary(
      agg.pillars,
      result.finalPosition,
      result.finalPoints,
    )
    result.squad = formation.map((s) => s.player!).filter(Boolean)
    set({ simulationResult: result, phase: 'results' })
  },

  resetGame: () => {
    set({ ...initialState })
  },
}))
