import type { Formation, PositionStats, FWDStats, MIDStats, DEFStats, GKStats } from '../types/game'

export function isFWDStats(stats: PositionStats): stats is FWDStats {
  return 'shots' in stats
}

export function isMIDStats(stats: PositionStats): stats is MIDStats {
  return 'passes' in stats && 'keyPasses' in stats
}

export function isDEFStats(stats: PositionStats): stats is DEFStats {
  return 'tackles' in stats
}

export function isGKStats(stats: PositionStats): stats is GKStats {
  return 'saves' in stats
}

export interface TeamPillars {
  teamAttack: number
  teamDefense: number
  teamControl: number
}

export interface AggregationResult {
  pillars: TeamPillars
  squadStrength: number // 0-100, user-facing
  chemistryBonus: number
  balancePenalty: number
  positionalPenalty: number
}

export function aggregateSquad(formation: Formation): AggregationResult {
  let teamAttack = 0
  let teamDefense = 0
  let teamControl = 0

  const filledSlots = formation.filter((s) => s.player !== null)

  for (const slot of filledSlots) {
    if (slot.player === null) continue
    const stats = slot.player.eraAdjusted

    if (isFWDStats(stats)) {
      teamAttack += stats.goals * 2.0
      teamAttack += stats.assists * 1.5
      teamAttack += stats.shots * 0.3
    } else if (isMIDStats(stats)) {
      teamAttack += stats.goals * 1.2
      teamAttack += stats.assists * 1.0
      teamAttack += stats.keyPasses * 0.8
      teamAttack += stats.dribbles * 0.5
      teamControl += stats.passes * 0.5
      teamControl += stats.keyPasses * 0.5
    } else if (isDEFStats(stats)) {
      teamDefense += stats.tackles * 1.0
      teamDefense += stats.blocks * 1.5
      teamDefense += stats.aerials * 0.8
      teamDefense += stats.interceptions * 1.2
      teamControl += stats.aerials * 0.5
    } else if (isGKStats(stats)) {
      teamDefense += stats.saves * 0.15
      teamDefense += stats.cleanSheets * 3.0
      teamDefense += stats.distribution * 0.5
      teamControl += stats.distribution * 1.0
    }
  }

  // Chemistry bonus: pairs from same club+season
  let chemistryBonus = 0
  const clubSeasonCounts = new Map<string, number>()
  for (const slot of filledSlots) {
    if (!slot.player) continue
    const key = `${slot.player.club}::${slot.player.season}`
    clubSeasonCounts.set(key, (clubSeasonCounts.get(key) || 0) + 1)
  }
  for (const count of clubSeasonCounts.values()) {
    if (count >= 2) {
      chemistryBonus += (count - 1) * 4 // +4 per extra player from same club-season
    }
  }

  // Apply chemistry
  teamAttack += chemistryBonus * 0.5
  teamDefense += chemistryBonus * 0.5
  teamControl += chemistryBonus * 0.5

  // Balance penalty: if one pillar is >1.8x the smallest
  const pillars = [teamAttack, teamDefense, teamControl]
  const minPillar = Math.max(1, Math.min(...pillars))
  const maxPillar = Math.max(...pillars)
  let balancePenalty = 0
  if (maxPillar > minPillar * 1.8) {
    balancePenalty = (maxPillar - minPillar * 1.8) * 0.25
  }

  // Apply balance penalty to all pillars
  teamAttack -= balancePenalty
  teamDefense -= balancePenalty
  teamControl -= balancePenalty

  // Positional completeness penalty
  const gkCount = filledSlots.filter((s) => s.position === 'GK').length
  const defCount = filledSlots.filter((s) => s.position === 'DEF').length
  const midCount = filledSlots.filter((s) => s.position === 'MID').length
  const fwdCount = filledSlots.filter((s) => s.position === 'FWD').length

  let positionalPenalty = 0
  if (gkCount < 1) positionalPenalty += 25
  if (defCount < 4) positionalPenalty += (4 - defCount) * 8
  if (midCount < 3) positionalPenalty += (3 - midCount) * 8
  if (fwdCount < 3) positionalPenalty += (3 - fwdCount) * 8

  // Squad strength is a normalized 0-100 number based on total effective rating
  const rawTotal = teamAttack + teamDefense + teamControl
  const targetMax = 900 // calibrated for a top-tier XI
  const baseStrength = Math.min(100, Math.max(0, (rawTotal / targetMax) * 100))
  const squadStrength = Math.max(0, baseStrength - positionalPenalty * 0.6)

  return {
    pillars: {
      teamAttack: Math.max(0, teamAttack),
      teamDefense: Math.max(0, teamDefense),
      teamControl: Math.max(0, teamControl),
    },
    squadStrength: Math.round(squadStrength),
    chemistryBonus,
    balancePenalty,
    positionalPenalty,
  }
}
