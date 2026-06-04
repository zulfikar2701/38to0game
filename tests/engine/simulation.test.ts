import { describe, it, expect } from 'vitest'
import { simulateCompetition, runFullSimulation } from '../../src/engine/simulation'
import type { TeamPillars } from '../../src/engine/aggregation'

const godSquad: TeamPillars = { teamAttack: 3000, teamDefense: 3000, teamControl: 3000 }
const weakSquad: TeamPillars = { teamAttack: 100, teamDefense: 100, teamControl: 100 }
const midSquad: TeamPillars = { teamAttack: 700, teamDefense: 700, teamControl: 700 }

describe('simulateCompetition', () => {
  it('godSquad with rng=0.01 wins all 3 competitions', () => {
    const rng = () => 0.01
    expect(simulateCompetition(godSquad, 'league', rng)).toBe(true)
    expect(simulateCompetition(godSquad, 'domesticCup', rng)).toBe(true)
    expect(simulateCompetition(godSquad, 'continentalCup', rng)).toBe(true)
  })

  it('weakSquad with rng=0.99 loses all 3', () => {
    const rng = () => 0.99
    expect(simulateCompetition(weakSquad, 'league', rng)).toBe(false)
    expect(simulateCompetition(weakSquad, 'domesticCup', rng)).toBe(false)
    expect(simulateCompetition(weakSquad, 'continentalCup', rng)).toBe(false)
  })

  it('midSquad with rng=0.5: domesticCup=true, league=false', () => {
    const rng = () => 0.5
    expect(simulateCompetition(midSquad, 'domesticCup', rng)).toBe(true)
    expect(simulateCompetition(midSquad, 'league', rng)).toBe(false)
  })
})

describe('runFullSimulation', () => {
  it('returns all true for godSquad with rng=0.01', () => {
    const result = runFullSimulation(godSquad, () => 0.01)
    expect(result.league).toBe(true)
    expect(result.domesticCup).toBe(true)
    expect(result.continentalCup).toBe(true)
  })
})
