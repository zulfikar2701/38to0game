import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../src/store/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it('starts in menu phase', () => {
    const state = useGameStore.getState()
    expect(state.phase).toBe('menu')
    expect(state.round).toBe(1)
    expect(state.currentCombo).toBeNull()
    expect(state.availablePlayers).toEqual([])
  })

  it('startGame enters drafting with round=1 and a non-null currentCombo', () => {
    useGameStore.getState().startGame('classic')
    const state = useGameStore.getState()
    expect(state.phase).toBe('drafting')
    expect(state.mode).toBe('classic')
    expect(state.round).toBe(1)
    expect(state.currentCombo).not.toBeNull()
    expect(state.availablePlayers.length).toBeGreaterThan(0)
    expect(state.skipsRemaining).toBe(1)
  })

  it('pickPlayer advances to round=2 and marks player as used', () => {
    const store = useGameStore.getState()
    store.startGame('classic')

    const beforeState = useGameStore.getState()
    const firstPlayer = beforeState.availablePlayers[0]
    expect(firstPlayer).toBeDefined()

    beforeState.pickPlayer(firstPlayer.id)

    const afterState = useGameStore.getState()
    expect(afterState.round).toBe(2)
    expect(afterState.usedPlayers.has(firstPlayer.id)).toBe(true)
  })

  it('useSkip reduces skipsRemaining from 1 to 0 and changes currentCombo', () => {
    const store = useGameStore.getState()
    store.startGame('classic')

    const beforeState = useGameStore.getState()
    const comboBefore = beforeState.currentCombo
    expect(comboBefore).not.toBeNull()

    beforeState.useSkip()

    const afterState = useGameStore.getState()
    expect(afterState.skipsRemaining).toBe(0)
    expect(afterState.currentCombo).not.toBeNull()
    expect(afterState.currentCombo).not.toEqual(comboBefore)
  })

  it('useSkip when skipsRemaining is 0 does NOT change currentCombo', () => {
    const store = useGameStore.getState()
    store.startGame('classic')

    // Use the first skip
    store.useSkip()
    expect(useGameStore.getState().skipsRemaining).toBe(0)

    const beforeState = useGameStore.getState()
    const comboBefore = beforeState.currentCombo

    // Try to skip again
    beforeState.useSkip()

    const afterState = useGameStore.getState()
    expect(afterState.skipsRemaining).toBe(0)
    expect(afterState.currentCombo).toEqual(comboBefore)
  })
})
