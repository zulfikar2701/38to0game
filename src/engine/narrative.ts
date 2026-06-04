import type { TeamPillars } from './aggregation'

export function generateSeasonCommentary(
  pillars: TeamPillars,
  finalPosition: number,
  points: number,
): string[] {
  const lines: string[] = []
  const avg = (pillars.teamAttack + pillars.teamDefense + pillars.teamControl) / 3

  // Opening line based on overall achievement
  if (finalPosition === 1) {
    if (points >= 100) {
      lines.push('History has been written. A perfect season — 38 games, zero defeats.')
    } else if (points >= 90) {
      lines.push('Champions. From August to May, you were the standard everyone else chased.')
    } else {
      lines.push('Champions by the finest of margins. Every point counted.')
    }
  } else if (finalPosition <= 4) {
    lines.push('A top-four finish. Champions League football secured.')
  } else if (finalPosition <= 6) {
    lines.push('European football next season, but not the one you really wanted.')
  } else if (finalPosition <= 10) {
    lines.push('A season of consolidation. Mid-table comfort, but no glory.')
  } else if (finalPosition <= 17) {
    lines.push('It went to the wire. You survived, but only just.')
  } else {
    lines.push('The unthinkable happened. Relegation.')
  }

  // Tactical analysis based on pillar balance
  if (pillars.teamAttack > avg * 1.4 && pillars.teamDefense < avg * 0.8) {
    lines.push('Your attack thrilled the neutrals, but the defense leaked goals at an alarming rate.')
  } else if (pillars.teamDefense > avg * 1.4 && pillars.teamAttack < avg * 0.8) {
    lines.push('Built on granite foundations at the back, but the front line never quite fired.')
  } else if (pillars.teamControl > avg * 1.3 && pillars.teamAttack < avg * 0.9) {
    lines.push('You dominated possession, but dominance without penetration only gets you so far.')
  } else if (pillars.teamAttack > avg * 1.1 && pillars.teamDefense > avg * 1.1 && pillars.teamControl > avg * 1.1) {
    lines.push('A beautifully balanced side. Every department complemented the other.')
  } else {
    lines.push('A squad with clear strengths, but also areas that better teams exploited.')
  }

  // Specific control commentary
  if (pillars.teamControl < avg * 0.7) {
    lines.push('Too many games passed you by. You never imposed your rhythm on the league.')
  } else if (pillars.teamControl > avg * 1.3) {
    lines.push('The midfield was your kingdom. Opponents spent entire halves chasing shadows.')
  }

  // Chemistry hint (subtle)
  if (pillars.teamAttack + pillars.teamDefense + pillars.teamControl > 700) {
    lines.push('When it clicked, it was unstoppable.')
  }

  return lines
}
