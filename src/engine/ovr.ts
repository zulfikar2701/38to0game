import type { Player, DraftSlot, Tier, Card } from '../types/game'

export function getTierFromOvr(ovr: number): Tier {
  if (ovr >= 88) return 'star'
  if (ovr >= 80) return 'gold'
  if (ovr >= 72) return 'silver'
  return 'bronze'
}

/**
 * Check if a player's role can fill a given slot role.
 * FBRef data only has 4 granular roles (GK, CB, CM, ST), but our
 * formations use FB (fullback) and W (wing) as well. We map flexibly:
 *   - CB can play FB (center backs can play fullback)
 *   - CM can play W  (central mids can play wing)
 *   - ST can play W  (strikers can play wing)
 */
export function canPlayRole(playerRole: string, slotRole: string): boolean {
  if (playerRole === slotRole) return true
  if (slotRole === 'FB' && playerRole === 'CB') return true
  if (slotRole === 'W' && (playerRole === 'CM' || playerRole === 'ST')) return true
  return false
}

// Tier draw odds: Bronze 5%, Silver 20%, Gold 45%, Star 30%
export function rollTier(): Tier {
  const r = Math.random()
  if (r < 0.05) return 'bronze'
  if (r < 0.25) return 'silver'
  if (r < 0.70) return 'gold'
  return 'star'
}

export function generatePack(slot: DraftSlot, eraPlayers: Player[]): Card[] {
  const eligible = eraPlayers.filter((p) => canPlayRole(p.role, slot.role))
  const cards: Card[] = []
  for (let i = 0; i < 5; i++) {
    const tier = rollTier()
    const pool = eligible.filter((p) => p.tier === tier)
    if (pool.length === 0) {
      // Fallback: pick any eligible player with closest tier
      const fallback = eligible[Math.floor(Math.random() * eligible.length)]
      if (fallback) {
        cards.push({ player: fallback, tier: getTierFromOvr(fallback.ovr) })
      }
      continue
    }
    const player = pool[Math.floor(Math.random() * pool.length)]
    cards.push({ player, tier })
  }
  return cards
}

export function calculateSquadStrength(squad: Player[]): number {
  const avgOvr = squad.reduce((sum, p) => sum + p.ovr, 0) / squad.length
  return Math.max(0.4, Math.min(1.0, (avgOvr - 65) / 34))
}
