import { create } from 'zustand'
import type {
  GamePhase,
  Era,
  Formation,
  DraftSlot,
  Player,
  SimulationResult,
  QuadrupleResult,
  Card,
} from '../types/game'
import { getPlayersByEra } from '../data/players'
import { generatePack } from '../engine/ovr'
import { runFullSimulation } from '../engine/simulation'
import { log } from '../lib/logger'

// ─── Formation Definitions ─────────────────────────────────────────────────

const FORMATIONS: Record<string, Omit<DraftSlot, 'index'>[]> = {
  '4-3-3': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'FB', label: 'LB', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'DEF', role: 'FB', label: 'RB', player: null },
    { position: 'MID', role: 'CM', label: 'LCM', player: null },
    { position: 'MID', role: 'CM', label: 'CM', player: null },
    { position: 'MID', role: 'CM', label: 'RCM', player: null },
    { position: 'FWD', role: 'W', label: 'LW', player: null },
    { position: 'FWD', role: 'ST', label: 'ST', player: null },
    { position: 'FWD', role: 'W', label: 'RW', player: null },
  ],
  '4-4-2': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'FB', label: 'LB', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'DEF', role: 'FB', label: 'RB', player: null },
    { position: 'MID', role: 'CM', label: 'LM', player: null },
    { position: 'MID', role: 'CM', label: 'LCM', player: null },
    { position: 'MID', role: 'CM', label: 'RCM', player: null },
    { position: 'MID', role: 'CM', label: 'RM', player: null },
    { position: 'FWD', role: 'ST', label: 'LST', player: null },
    { position: 'FWD', role: 'ST', label: 'RST', player: null },
  ],
  '4-2-3-1': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'FB', label: 'LB', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'DEF', role: 'FB', label: 'RB', player: null },
    { position: 'MID', role: 'CM', label: 'CDM', player: null },
    { position: 'MID', role: 'CM', label: 'CDM', player: null },
    { position: 'FWD', role: 'W', label: 'LW', player: null },
    { position: 'FWD', role: 'W', label: 'CAM', player: null },
    { position: 'FWD', role: 'W', label: 'RW', player: null },
    { position: 'FWD', role: 'ST', label: 'ST', player: null },
  ],
  '3-5-2': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'CB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'MID', role: 'CM', label: 'LWB', player: null },
    { position: 'MID', role: 'CM', label: 'LCM', player: null },
    { position: 'MID', role: 'CM', label: 'CM', player: null },
    { position: 'MID', role: 'CM', label: 'RCM', player: null },
    { position: 'MID', role: 'CM', label: 'RWB', player: null },
    { position: 'FWD', role: 'ST', label: 'LST', player: null },
    { position: 'FWD', role: 'ST', label: 'RST', player: null },
  ],
  '5-3-2': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'FB', label: 'LWB', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'CB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'DEF', role: 'FB', label: 'RWB', player: null },
    { position: 'MID', role: 'CM', label: 'LCM', player: null },
    { position: 'MID', role: 'CM', label: 'CM', player: null },
    { position: 'MID', role: 'CM', label: 'RCM', player: null },
    { position: 'FWD', role: 'ST', label: 'LST', player: null },
    { position: 'FWD', role: 'ST', label: 'RST', player: null },
  ],
  '4-5-1': [
    { position: 'GK', role: 'GK', label: 'GK', player: null },
    { position: 'DEF', role: 'FB', label: 'LB', player: null },
    { position: 'DEF', role: 'CB', label: 'LCB', player: null },
    { position: 'DEF', role: 'CB', label: 'RCB', player: null },
    { position: 'DEF', role: 'FB', label: 'RB', player: null },
    { position: 'MID', role: 'CM', label: 'LM', player: null },
    { position: 'MID', role: 'CM', label: 'LCM', player: null },
    { position: 'MID', role: 'CM', label: 'CM', player: null },
    { position: 'MID', role: 'CM', label: 'RCM', player: null },
    { position: 'MID', role: 'CM', label: 'RM', player: null },
    { position: 'FWD', role: 'ST', label: 'ST', player: null },
  ],
}

export const FORMATION_NAMES = Object.keys(FORMATIONS)

// ─── Store ───────────────────────────────────────────────────────────────

interface GameState {
  phase: GamePhase
  era: Era
  eraPlayers: Player[]
  formationName: string
  formation: Formation
  usedPlayerIds: Set<string>
  currentSlotIndex: number | null
  currentPack: Card[]
  simulationResult: SimulationResult | null
  quadrupleResult: QuadrupleResult | null
  revealIndex: number

  startGame: (era: Era) => void
  selectFormation: (name: string) => void
  openSlotPicker: (slotIndex: number) => void
  pickCard: (cardIndex: number) => void
  closePicker: () => void
  removeFromSlot: (slotIndex: number) => void
  confirmSquad: () => void
  runSimulation: () => void
  advanceReveal: () => void
  resetGame: () => void
}

const initialState = {
  phase: 'menu' as GamePhase,
  era: 'all' as Era,
  eraPlayers: [] as Player[],
  formationName: '',
  formation: [] as Formation,
  usedPlayerIds: new Set<string>(),
  currentSlotIndex: null as number | null,
  currentPack: [] as Card[],
  simulationResult: null as SimulationResult | null,
  quadrupleResult: null as QuadrupleResult | null,
  revealIndex: 0,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startGame: (era: Era) => {
    log.flow(`startGame(${era})`)
    const eraPlayers = getPlayersByEra(era)
    set({
      phase: 'formation',
      era,
      eraPlayers,
      formationName: '',
      formation: [],
      usedPlayerIds: new Set(),
      currentSlotIndex: null,
      currentPack: [],
      simulationResult: null,
      quadrupleResult: null,
      revealIndex: 0,
    })
    log.store('startGame', { era, eraPlayersCount: eraPlayers.length, phase: 'formation' })
  },

  selectFormation: (name: string) => {
    log.flow(`selectFormation(${name})`)
    const slots = FORMATIONS[name]
    if (!slots) return
    const formation: Formation = slots.map((s, i) => ({ ...s, index: i }))
    set({ formationName: name, formation, phase: 'drafting' })
    log.store('selectFormation', { formationName: name, slots: slots.length, phase: 'drafting' })
  },

  openSlotPicker: (slotIndex: number) => {
    const { formation, eraPlayers, usedPlayerIds } = get()
    const slot = formation[slotIndex]
    if (!slot || slot.player !== null) return
    log.flow(`openSlotPicker(${slotIndex}) → ${slot.label} (${slot.role})`)
    const availablePlayers = eraPlayers.filter((p) => !usedPlayerIds.has(p.id))
    const pack = generatePack(slot, availablePlayers)
    set({ currentSlotIndex: slotIndex, currentPack: pack })
    log.draft(slot.label, pack)
  },

  pickCard: (cardIndex: number) => {
    const { currentSlotIndex, currentPack, formation, usedPlayerIds } = get()
    if (currentSlotIndex === null) return
    const card = currentPack[cardIndex]
    if (!card) return

    log.flow(`pickCard(${cardIndex}) → ${card.player.name} (${card.player.role}) OVR ${card.player.ovr} ${card.tier}`)

    const newFormation = formation.map((s, i) =>
      i === currentSlotIndex ? { ...s, player: card.player } : s,
    ) as Formation

    const newUsed = new Set(usedPlayerIds)
    newUsed.add(card.player.id)

    const allFilled = newFormation.every((s) => s.player !== null)

    set({
      formation: newFormation,
      usedPlayerIds: newUsed,
      currentSlotIndex: null,
      currentPack: [],
      phase: allFilled ? 'confirming' : 'drafting',
    })

    log.store('pickCard', { slotIndex: currentSlotIndex, player: card.player.name, filled: newUsed.size, allFilled, phase: allFilled ? 'confirming' : 'drafting' })
  },

  closePicker: () => {
    set({ currentSlotIndex: null, currentPack: [] })
  },

  removeFromSlot: (slotIndex: number) => {
    const { formation, usedPlayerIds } = get()
    const slot = formation[slotIndex]
    if (!slot || !slot.player) return

    const newFormation = formation.map((s, i) =>
      i === slotIndex ? { ...s, player: null } : s,
    ) as Formation

    const newUsed = new Set(usedPlayerIds)
    newUsed.delete(slot.player.id)

    set({
      formation: newFormation,
      usedPlayerIds: newUsed,
      phase: 'drafting',
    })
  },

  confirmSquad: () => {
    const { formation } = get()
    const squad = formation.map((s) => s.player).filter(Boolean) as Player[]
    log.flow('confirmSquad() → starting simulation')
    log.squad(squad)
    set({ phase: 'simulating' })
    // Run simulation after a brief delay to allow UI transition
    setTimeout(() => {
      const { formation } = get()
      const result = runFullSimulation(null, formation)
      log.results(result.quadruple)
      set({
        simulationResult: result,
        quadrupleResult: result.quadruple,
        phase: 'newspaper',
        revealIndex: 0,
      })
      log.store('simulationComplete', { phase: 'newspaper', trophies: result.quadruple.trophies, headline: result.quadruple.headline })
    }, 1500)
  },

  runSimulation: () => {
    log.flow('runSimulation()')
    const { formation } = get()
    const result = runFullSimulation(null, formation)
    log.results(result.quadruple)
    set({
      simulationResult: result,
      quadrupleResult: result.quadruple,
      phase: 'newspaper',
      revealIndex: 0,
    })
    log.store('runSimulation', { phase: 'newspaper', trophies: result.quadruple.trophies })
  },

  advanceReveal: () => {
    const { revealIndex, phase } = get()
    const next = revealIndex + 1
    log.flow(`advanceReveal() → ${next}/6`)
    if (next >= 6) {
      set({ phase: 'results', revealIndex: next })
      log.store('advanceReveal', { from: revealIndex, to: next, phase: 'results' })
    } else {
      set({ revealIndex: next })
      log.store('advanceReveal', { from: revealIndex, to: next, phase })
    }
  },

  resetGame: () => {
    log.flow('resetGame()')
    set({ ...initialState })
  },
}))
