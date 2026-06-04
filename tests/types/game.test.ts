import { describe, it, expect } from 'vitest'
import type { Player, Formation } from '../../src/types/game'

describe('game types', () => {
  it('creates a valid FWD Player with goals stat', () => {
    const player: Player = {
      id: 'fwd-001',
      name: 'Test Forward',
      club: 'Test FC',
      season: '2023-24',
      position: 'FWD',
      appearances: 38,
      stats: {
        goals: 30,
        assists: 10,
        shots: 120,
      },
      eraAdjusted: {
        goals: 28,
        assists: 9,
        shots: 110,
      },
    }

    expect(player.position).toBe('FWD')
    expect(player.stats).toHaveProperty('goals')
    expect(player.season).toBe('2023-24')
  })

  it('creates an empty 11-slot Formation in 4-3-3 shape', () => {
    const formation: Formation = [
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
    ]

    expect(formation).toHaveLength(11)
    expect(formation[0].position).toBe('GK')
    expect(formation[10].position).toBe('FWD')
  })
})
