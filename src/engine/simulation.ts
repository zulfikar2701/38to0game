import type { TeamPillars } from './aggregation'
import type { SimulationResult } from '../types/game'

interface CompetitionConfig {
  name: string
  threshold: number
  k: number
  attackWeight: number
  defenseWeight: number
  controlWeight: number
}

const league: CompetitionConfig = {
  name: 'league',
  threshold: 800,
  k: 0.008,
  attackWeight: 1,
  defenseWeight: 1,
  controlWeight: 1,
}

const domesticCup: CompetitionConfig = {
  name: 'domesticCup',
  threshold: 600,
  k: 0.01,
  attackWeight: 1.2,
  defenseWeight: 0.8,
  controlWeight: 0.5,
}

const continentalCup: CompetitionConfig = {
  name: 'continentalCup',
  threshold: 950,
  k: 0.007,
  attackWeight: 1,
  defenseWeight: 1.2,
  controlWeight: 1,
}

const competitions: Record<string, CompetitionConfig> = {
  league,
  domesticCup,
  continentalCup,
}

export function sigmoid(rating: number, threshold: number, k: number): number {
  return 1 / (1 + Math.exp(-k * (rating - threshold)))
}

export function computeRating(pillars: TeamPillars, comp: CompetitionConfig): number {
  const weightedSum =
    pillars.teamAttack * comp.attackWeight +
    pillars.teamDefense * comp.defenseWeight +
    pillars.teamControl * comp.controlWeight
  const weightSum = comp.attackWeight + comp.defenseWeight + comp.controlWeight
  return weightedSum / weightSum
}

export function simulateCompetition(
  pillars: TeamPillars,
  compKey: string,
  rng: () => number = Math.random,
): boolean {
  const comp = competitions[compKey]
  if (!comp) {
    throw new Error(`Unknown competition: ${compKey}`)
  }
  const rating = computeRating(pillars, comp)
  const prob = sigmoid(rating, comp.threshold, comp.k)
  return rng() < prob
}

export function runFullSimulation(
  pillars: TeamPillars,
  rng: () => number = Math.random,
): SimulationResult {
  return {
    league: simulateCompetition(pillars, 'league', rng),
    domesticCup: simulateCompetition(pillars, 'domesticCup', rng),
    continentalCup: simulateCompetition(pillars, 'continentalCup', rng),
    teamAttack: pillars.teamAttack,
    teamDefense: pillars.teamDefense,
    teamControl: pillars.teamControl,
    commentary: [],
  }
}
