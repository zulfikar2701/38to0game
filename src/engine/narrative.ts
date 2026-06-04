import type { TeamPillars } from './aggregation'

export function generateCommentary(pillars: TeamPillars): string[] {
  const lines: string[] = []
  const avg = (pillars.teamAttack + pillars.teamDefense + pillars.teamControl) / 3

  if (pillars.teamAttack > avg * 1.3 && pillars.teamDefense < avg * 0.8) {
    lines.push('Your front line was lethal, but leaky defending cost you in Europe.')
  } else if (pillars.teamDefense > avg * 1.3 && pillars.teamAttack < avg * 0.8) {
    lines.push('A rock-solid backline carried you, but you lacked cutting edge up front.')
  } else if (pillars.teamAttack > avg * 1.2 && pillars.teamDefense > avg * 1.2) {
    lines.push('A perfectly balanced machine. Every department pulled its weight.')
  } else {
    lines.push('A competitive squad, but not quite enough to conquer all fronts.')
  }

  if (pillars.teamControl < avg * 0.7) {
    lines.push('You struggled to control the tempo in big games.')
  }

  return lines
}
