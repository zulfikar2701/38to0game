import { describe, it, expect } from 'vitest'
import { samplePlayers } from '../../src/data/samplePlayers'
import { buildCombos, getPlayersForCombo, hasSelectablePlayers } from '../../src/data/combos'
import type { ClubEraCombo } from '../../src/data/combos'

describe('buildCombos', () => {
  it('returns unique combos and Real Madrid 2000s exists', () => {
    const combos = buildCombos(samplePlayers)
    const clubs = combos.map((c) => c.club)
    const eras = combos.map((c) => c.era)

    // Should return unique combos
    const uniqueKeys = new Set(combos.map((c) => `${c.club}::${c.era}`))
    expect(uniqueKeys.size).toBe(combos.length)

    // Real Madrid 2000s exists
    expect(combos).toContainEqual({ club: 'Real Madrid', era: '2000s' })
  })
})

describe('getPlayersForCombo', () => {
  it('with Real Madrid 2000s and openPositions [GK, DEF] returns 1 player (GK)', () => {
    const combo: ClubEraCombo = { club: 'Real Madrid', era: '2000s' }
    const result = getPlayersForCombo(samplePlayers, combo, new Set(), ['GK', 'DEF'])
    expect(result.length).toBe(1)
    expect(result[0].position).toBe('GK')
    expect(result[0].id).toBe('casillas-2000')
  })

  it('with used set containing casillas-2000 excludes that player', () => {
    const combo: ClubEraCombo = { club: 'Real Madrid', era: '2000s' }
    const used = new Set<string>(['casillas-2000'])
    const result = getPlayersForCombo(samplePlayers, combo, used, ['GK'])
    expect(result.length).toBe(0)
  })
})

describe('hasSelectablePlayers', () => {
  it('with Real Madrid 1960s and openPositions [GK] returns false', () => {
    const combo: ClubEraCombo = { club: 'Real Madrid', era: '1960s' }
    const result = hasSelectablePlayers(samplePlayers, combo, new Set(), ['GK'])
    expect(result).toBe(false)
  })
})
