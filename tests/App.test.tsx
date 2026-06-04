import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../src/store/gameStore'
import type { Formation } from '../src/types/game'

describe('App integration – complete game flow', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it('runs menu → drafting → confirming → simulating → results via store actions', () => {
    const store = useGameStore.getState()

    // 1. Menu phase
    expect(store.phase).toBe('menu')
    expect(store.round).toBe(1)
    expect(store.formation.every((slot) => slot.player === null)).toBe(true)

    // 2. Start a classic game → enters drafting
    store.startGame('classic')
    let state = useGameStore.getState()
    expect(state.phase).toBe('drafting')
    expect(state.mode).toBe('classic')
    expect(state.round).toBe(1)
    expect(state.skipsRemaining).toBe(1)
    expect(state.currentCombo).not.toBeNull()
    expect(state.availablePlayers.length).toBeGreaterThan(0)

    // 3. Draft all 11 players
    for (let i = 0; i < 11; i++) {
      state = useGameStore.getState()
      expect(state.phase).toBe('drafting')
      expect(state.availablePlayers.length).toBeGreaterThan(0)

      const player = state.availablePlayers[0]
      expect(player).toBeDefined()
      store.pickPlayer(player.id)
    }

    // 4. Confirming phase – full squad
    state = useGameStore.getState()
    expect(state.phase).toBe('confirming')
    expect(state.round).toBe(11)
    expect(state.formation.every((slot) => slot.player !== null)).toBe(true)
    expect(state.usedPlayers.size).toBe(11)
    expect(state.currentCombo).toBeNull()
    expect(state.availablePlayers).toEqual([])

    // Verify formation shape (1 GK + 4 DEF + 3 MID + 3 FWD)
    const formation = state.formation as Formation
    const positions = formation.map((slot) => slot.position)
    expect(positions.filter((p) => p === 'GK').length).toBe(1)
    expect(positions.filter((p) => p === 'DEF').length).toBe(4)
    expect(positions.filter((p) => p === 'MID').length).toBe(3)
    expect(positions.filter((p) => p === 'FWD').length).toBe(3)

    // 5. Simulating phase
    store.confirmSquad()
    state = useGameStore.getState()
    expect(state.phase).toBe('simulating')
    expect(state.simulationResult).toBeNull()

    // 6. Results phase
    store.runSimulation()
    state = useGameStore.getState()
    expect(state.phase).toBe('results')
    expect(state.simulationResult).not.toBeNull()

    // Verify simulation result shape
    expect(state.simulationResult).toMatchObject({
      league: expect.any(Boolean),
      domesticCup: expect.any(Boolean),
      continentalCup: expect.any(Boolean),
      teamAttack: expect.any(Number),
      teamDefense: expect.any(Number),
      teamControl: expect.any(Number),
      commentary: expect.any(Array),
    })
    expect(state.simulationResult!.commentary.length).toBeGreaterThan(0)
    expect(state.simulationResult!.teamAttack).toBeGreaterThan(0)
    expect(state.simulationResult!.teamDefense).toBeGreaterThan(0)
    expect(state.simulationResult!.teamControl).toBeGreaterThan(0)
  })

  it('can complete a full blind draft game flow', () => {
    const store = useGameStore.getState()

    store.startGame('blind')
    let state = useGameStore.getState()
    expect(state.phase).toBe('drafting')
    expect(state.mode).toBe('blind')

    for (let i = 0; i < 11; i++) {
      state = useGameStore.getState()
      const player = state.availablePlayers[0]
      store.pickPlayer(player.id)
    }

    state = useGameStore.getState()
    expect(state.phase).toBe('confirming')

    store.confirmSquad()
    store.runSimulation()
    state = useGameStore.getState()
    expect(state.phase).toBe('results')
    expect(state.simulationResult).not.toBeNull()
  })

  it('allows using a skip during drafting and still completes the flow', () => {
    const store = useGameStore.getState()

    store.startGame('classic')
    let state = useGameStore.getState()
    expect(state.skipsRemaining).toBe(1)

    // Use the skip
    store.useSkip()
    state = useGameStore.getState()
    expect(state.skipsRemaining).toBe(0)
    expect(state.currentCombo).not.toBeNull()
    expect(state.availablePlayers.length).toBeGreaterThan(0)

    // Continue drafting to completion
    for (let i = 0; i < 11; i++) {
      state = useGameStore.getState()
      const player = state.availablePlayers[0]
      store.pickPlayer(player.id)
    }

    state = useGameStore.getState()
    expect(state.phase).toBe('confirming')
    expect(state.usedPlayers.size).toBe(11)

    store.confirmSquad()
    store.runSimulation()
    state = useGameStore.getState()
    expect(state.phase).toBe('results')
    expect(state.simulationResult).not.toBeNull()
  })
})
