import { describe, it, expect } from 'vitest'
import type { TeamPillars } from '../../src/engine/aggregation'
import { generateCommentary } from '../../src/engine/narrative'

describe('generateCommentary', () => {
  it('returns leaky defending commentary for strong attack and weak defense', () => {
    const pillars: TeamPillars = {
      teamAttack: 1000,
      teamDefense: 300,
      teamControl: 600,
    }
    const result = generateCommentary(pillars)
    expect(result[0]).toContain('leaky defending')
  })

  it('returns rock-solid backline commentary for strong defense and weak attack', () => {
    const pillars: TeamPillars = {
      teamAttack: 300,
      teamDefense: 1000,
      teamControl: 600,
    }
    const result = generateCommentary(pillars)
    expect(result[0]).toContain('rock-solid backline')
  })

  it('returns balanced machine commentary for balanced attack and defense', () => {
    const pillars: TeamPillars = {
      teamAttack: 1000,
      teamDefense: 1000,
      teamControl: 400,
    }
    const result = generateCommentary(pillars)
    expect(result[0]).toContain('balanced machine')
  })

  it('returns tempo control commentary for low control', () => {
    const pillars: TeamPillars = {
      teamAttack: 500,
      teamDefense: 500,
      teamControl: 200,
    }
    const result = generateCommentary(pillars)
    expect(result.some((line) => line.includes('struggled to control the tempo'))).toBe(true)
  })
})
