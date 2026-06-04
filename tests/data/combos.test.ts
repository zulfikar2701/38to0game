import { describe, it, expect } from 'vitest'
import { players } from '../../src/data/players'
import { buildCombos, getPlayersForCombo, hasSelectablePlayers } from '../../src/data/combos'
import type { ClubSeasonCombo } from '../../src/data/combos'

describe('buildCombos', () => {
  it('returns unique combos and Liverpool 2019-20 exists', () => {
    const combos = buildCombos(players)

    // Should return unique combos
    const uniqueKeys = new Set(combos.map((c) => `${c.club}::${c.season}`))
    expect(uniqueKeys.size).toBe(combos.length)

    // Liverpool 2019-20 exists
    expect(combos).toContainEqual({ club: 'Liverpool', season: '2019-20' })
  })
})

describe('getPlayersForCombo', () => {
  it('with Liverpool 2019-20 and openPositions [GK, DEF] returns Alisson and Van Dijk', () => {
    const combo: ClubSeasonCombo = { club: 'Liverpool', season: '2019-20' }
    const result = getPlayersForCombo(players, combo, new Set(), ['GK', 'DEF'])
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.map((p) => p.position)).toContain('GK')
    expect(result.map((p) => p.position)).toContain('DEF')
  })

  it('with used set containing alisson-liverpool-2019 excludes that player', () => {
    const combo: ClubSeasonCombo = { club: 'Liverpool', season: '2019-20' }
    const used = new Set<string>(['alisson-liverpool-2019'])
    const result = getPlayersForCombo(players, combo, used, ['GK'])
    expect(result.map((p) => p.id)).not.toContain('alisson-liverpool-2019')
  })
})

describe('hasSelectablePlayers', () => {
  it('with Burnley 2015-16 and openPositions [GK] returns false', () => {
    const combo: ClubSeasonCombo = { club: 'Burnley', season: '2015-16' }
    const result = hasSelectablePlayers(players, combo, new Set(), ['GK'])
    expect(result).toBe(false)
  })
})
