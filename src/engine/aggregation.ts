import type { Formation, PositionStats, FWDStats, MIDStats, DEFStats, GKStats } from '../types/game'

export function isFWDStats(stats: PositionStats): stats is FWDStats {
  return 'shots' in stats
}

export function isMIDStats(stats: PositionStats): stats is MIDStats {
  return 'passes' in stats
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

export function aggregateSquad(formation: Formation): TeamPillars {
  let teamAttack = 0
  let teamDefense = 0
  let teamControl = 0

  for (const slot of formation) {
    if (slot.player === null) {
      continue
    }

    const stats = slot.player.eraAdjusted

    if (isFWDStats(stats)) {
      teamAttack += stats.goals * 2.0
      teamAttack += stats.assists * 1.5
      teamAttack += stats.shots * 0.3
      teamAttack += stats.conversionRate * 10
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
      teamDefense += stats.saves * 2.0
      teamDefense += stats.cleanSheets * 3.0
      teamDefense += stats.distribution * 0.5
      teamControl += stats.distribution * 1.0
    }
  }

  return { teamAttack, teamDefense, teamControl }
}
