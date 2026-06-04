import { describe, it, expect } from 'vitest'
import type { Formation, SquadSlot } from '../../src/types/game'
import { samplePlayers } from '../../src/data/samplePlayers'
import { aggregateSquad } from '../../src/engine/aggregation'

function buildFormation(ids: string[]): Formation {
  const positions: Array<'GK' | 'DEF' | 'MID' | 'FWD'> = [
    'GK',
    'DEF',
    'DEF',
    'DEF',
    'DEF',
    'MID',
    'MID',
    'MID',
    'FWD',
    'FWD',
    'FWD',
  ]

  const slots = Array.from({ length: 11 }, (_, i): SquadSlot => {
    const player = samplePlayers.find((p) => p.id === ids[i]) ?? null
    return { position: positions[i], player }
  })

  return slots as unknown as Formation
}

describe('aggregateSquad', () => {
  it('returns positive pillars for a full 11-player formation', () => {
    const formation = buildFormation([
      'casillas-2000',
      'maldini-1990',
      'cafu-2000',
      'puyol-2000',
      'ramos-2010',
      'zidane-1990',
      'iniesta-2010',
      'xavi-2010',
      'messi-2010',
      'ronaldo-2010',
      'pele-1960',
    ])

    const result = aggregateSquad(formation)

    expect(result.teamAttack).toBeGreaterThan(0)
    expect(result.teamDefense).toBeGreaterThan(0)
    expect(result.teamControl).toBeGreaterThan(0)
  })

  it('returns zeros for an empty formation', () => {
    const formation = buildFormation([])

    const result = aggregateSquad(formation)

    expect(result.teamAttack).toBe(0)
    expect(result.teamDefense).toBe(0)
    expect(result.teamControl).toBe(0)
  })
})
