import { describe, it, expect } from 'vitest'
import { getTierFromOvr, canPlayRole, rollTier, generatePack, calculateSquadStrength } from './ovr'
import type { Player, DraftSlot } from '../types/game'

const mockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: '1', name: 'Test', club: 'Test FC', season: '2020',
  position: 'FWD', positions: ['FWD'], role: 'ST',
  appearances: 38, stats: { goals: 20, assists: 5, shots: 80 },
  eraAdjusted: { goals: 20, assists: 5, shots: 80 },
  clubColors: { primary: '#fff', accent: '#000' },
  ovr: 85, tier: 'gold', nation: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ...overrides,
})

describe('getTierFromOvr', () => {
  it('maps OVR to correct tier', () => {
    expect(getTierFromOvr(94)).toBe('star')
    expect(getTierFromOvr(88)).toBe('star')
    expect(getTierFromOvr(85)).toBe('gold')
    expect(getTierFromOvr(80)).toBe('gold')
    expect(getTierFromOvr(75)).toBe('silver')
    expect(getTierFromOvr(72)).toBe('silver')
    expect(getTierFromOvr(71)).toBe('bronze')
    expect(getTierFromOvr(60)).toBe('bronze')
  })
})

describe('canPlayRole', () => {
  it('allows exact role match', () => {
    expect(canPlayRole('ST', 'ST')).toBe(true)
    expect(canPlayRole('GK', 'GK')).toBe(true)
  })
  it('rejects mismatched roles', () => {
    expect(canPlayRole('ST', 'GK')).toBe(false)
    expect(canPlayRole('CB', 'ST')).toBe(false)
  })
})

describe('rollTier', () => {
  it('returns a valid tier', () => {
    const tier = rollTier()
    expect(['bronze', 'silver', 'gold', 'star']).toContain(tier)
  })
})

describe('generatePack', () => {
  it('returns 5 cards', () => {
    const slot: DraftSlot = { index: 0, position: 'FWD', role: 'ST', label: 'ST', player: null }
    const players = [mockPlayer({ role: 'ST', ovr: 80, tier: 'gold' })]
    const pack = generatePack(slot, players)
    expect(pack.length).toBe(5)
  })
  it('all cards are eligible for slot role', () => {
    const slot: DraftSlot = { index: 0, position: 'FWD', role: 'ST', label: 'ST', player: null }
    const players = [
      mockPlayer({ id: '1', role: 'ST', ovr: 80 }),
      mockPlayer({ id: '2', role: 'GK', ovr: 85 }),
    ]
    const pack = generatePack(slot, players)
    for (const card of pack) {
      expect(canPlayRole(card.player.role, slot.role)).toBe(true)
    }
  })
})

describe('calculateSquadStrength', () => {
  it('maps average OVR to 0.4-1.0 range', () => {
    const squad = [
      mockPlayer({ ovr: 99 }), mockPlayer({ ovr: 99 }),
      mockPlayer({ ovr: 99 }), mockPlayer({ ovr: 99 }),
    ]
    expect(calculateSquadStrength(squad)).toBe(1.0)
  })
  it('maps low OVR to minimum 0.4', () => {
    const squad = [mockPlayer({ ovr: 65 })]
    expect(calculateSquadStrength(squad)).toBe(0.4)
  })
})
