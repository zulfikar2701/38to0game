import type { TeamPillars } from './aggregation'
import type { SimulationResult, MatchResult, LeagueTeam } from '../types/game'

export interface Opponent {
  name: string
  attack: number
  defense: number
  control: number
}

// 19 opponents representing historical Premier League seasons
const opponents: Opponent[] = [
  { name: 'Man City 2022-23', attack: 210, defense: 160, control: 180 },
  { name: 'Liverpool 2019-20', attack: 175, defense: 155, control: 165 },
  { name: 'Chelsea 2016-17', attack: 165, defense: 150, control: 155 },
  { name: 'Arsenal 2023-24', attack: 170, defense: 140, control: 160 },
  { name: 'Spurs 2016-17', attack: 165, defense: 135, control: 145 },
  { name: 'Man Utd 2022-23', attack: 145, defense: 140, control: 150 },
  { name: 'Newcastle 2022-23', attack: 150, defense: 135, control: 140 },
  { name: 'Brighton 2022-23', attack: 140, defense: 130, control: 145 },
  { name: 'Aston Villa 2023-24', attack: 150, defense: 125, control: 135 },
  { name: 'West Ham 2020-21', attack: 135, defense: 125, control: 130 },
  { name: 'Leicester 2019-20', attack: 140, defense: 120, control: 135 },
  { name: 'Everton 2016-17', attack: 130, defense: 120, control: 125 },
  { name: 'Crystal Palace 2022-23', attack: 120, defense: 115, control: 120 },
  { name: 'Brentford 2021-22', attack: 125, defense: 110, control: 115 },
  { name: 'Wolves 2019-20', attack: 110, defense: 120, control: 110 },
  { name: 'Fulham 2022-23', attack: 115, defense: 105, control: 110 },
  { name: 'Bournemouth 2022-23', attack: 105, defense: 100, control: 105 },
  { name: 'Sheffield Utd 2019-20', attack: 95, defense: 100, control: 90 },
  { name: 'Luton Town 2023-24', attack: 90, defense: 85, control: 85 },
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function poisson(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda)
  let p = 1.0
  let k = 0
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

function simulateMatch(
  user: TeamPillars,
  opponent: Opponent,
  home: boolean,
  rng: () => number,
): { goalsFor: number; goalsAgainst: number } {
  const homeBoost = home ? 1.08 : 0.92
  const controlEdge = clamp((user.teamControl - opponent.control) / 200, -0.15, 0.15)

  const userAttackEff = user.teamAttack * homeBoost * (1 + controlEdge * 0.5)
  const oppAttackEff = opponent.attack / homeBoost * (1 - controlEdge * 0.5)

  const userDefenseEff = user.teamDefense * (1 + controlEdge * 0.3)
  const oppDefenseEff = opponent.defense * (1 - controlEdge * 0.3)

  const userLambda = clamp((userAttackEff / (userAttackEff + oppDefenseEff * 0.6)) * 3.2, 0.3, 5.0)
  const oppLambda = clamp((oppAttackEff / (oppAttackEff + userDefenseEff * 0.6)) * 3.0, 0.3, 5.0)

  let goalsFor = poisson(userLambda, rng)
  let goalsAgainst = poisson(oppLambda, rng)

  // Occasional blowout or shutout modifier
  if (rng() < 0.03) {
    goalsFor += Math.floor(rng() * 3) + 1
  }
  if (rng() < 0.03) {
    goalsAgainst += Math.floor(rng() * 3) + 1
  }

  return { goalsFor, goalsAgainst }
}

function generateMatchCommentary(
  _user: TeamPillars,
  opponent: Opponent,
  goalsFor: number,
  goalsAgainst: number,
  home: boolean,
): string {
  const venue = home ? 'at home' : 'away'
  if (goalsFor >= 4 && goalsAgainst <= 1) {
    return `A dominant display ${venue} against ${opponent.name}. Your attack was simply unstoppable.`
  }
  if (goalsAgainst >= 4) {
    return `A nightmare ${venue} against ${opponent.name}. The defense was carved open repeatedly.`
  }
  if (goalsFor === 0 && goalsAgainst === 0) {
    return `A stalemate ${venue} against ${opponent.name}. Neither side could find a breakthrough.`
  }
  if (goalsFor > goalsAgainst) {
    if (goalsFor - goalsAgainst >= 3) {
      return `A comfortable win ${venue} against ${opponent.name}. Everything clicked.`
    }
    return `A hard-fought victory ${venue} against ${opponent.name}.` + (goalsFor >= 2 ? ' The front line delivered when it mattered.' : ' A defensive masterclass secured the three points.')
  }
  if (goalsFor === goalsAgainst) {
    return `A point gained ${venue} against ${opponent.name}. Could have gone either way.`
  }
  return `Defeat ${venue} against ${opponent.name}.` + (goalsAgainst >= 2 ? ' The backline will need to improve.' : ' A cruel late goal decided it.')
}

export function runFullSimulation(
  pillars: TeamPillars,
  seed?: number,
): SimulationResult {
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 1000000))

  const matches: MatchResult[] = []
  let totalPoints = 0
  let totalGF = 0
  let totalGA = 0

  // 38 games: each opponent twice
  let gameweek = 1
  for (const opponent of opponents) {
    // Home
    {
      const { goalsFor, goalsAgainst } = simulateMatch(pillars, opponent, true, rng)
      const result: 'W' | 'D' | 'L' = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
      const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
      matches.push({
        gameweek,
        opponent: opponent.name,
        home: true,
        goalsFor,
        goalsAgainst,
        result,
        points,
        commentary: generateMatchCommentary(pillars, opponent, goalsFor, goalsAgainst, true),
      })
      totalPoints += points
      totalGF += goalsFor
      totalGA += goalsAgainst
      gameweek++
    }
    // Away
    {
      const { goalsFor, goalsAgainst } = simulateMatch(pillars, opponent, false, rng)
      const result: 'W' | 'D' | 'L' = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
      const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
      matches.push({
        gameweek,
        opponent: opponent.name,
        home: false,
        goalsFor,
        goalsAgainst,
        result,
        points,
        commentary: generateMatchCommentary(pillars, opponent, goalsFor, goalsAgainst, false),
      })
      totalPoints += points
      totalGF += goalsFor
      totalGA += goalsAgainst
      gameweek++
    }
  }

  // Build league table: user + 19 opponents with their own simulated seasons
  const leagueTable: LeagueTeam[] = []

  // User team
  leagueTable.push({
    name: 'Your XI',
    played: 38,
    won: matches.filter((m) => m.result === 'W').length,
    drawn: matches.filter((m) => m.result === 'D').length,
    lost: matches.filter((m) => m.result === 'L').length,
    gf: totalGF,
    ga: totalGA,
    gd: totalGF - totalGA,
    points: totalPoints,
  })

  // Opponent teams: simulate their seasons vs each other (simplified)
  for (const opp of opponents) {
    let pts = 0
    let w = 0
    let d = 0
    let l = 0
    let gf = 0
    let ga = 0
    for (const other of opponents) {
      if (opp.name === other.name) continue
      // Simulate 2 games vs each opponent
      for (let h = 0; h < 2; h++) {
        const home = h === 0
        const { goalsFor, goalsAgainst } = simulateMatch(
          { teamAttack: opp.attack, teamDefense: opp.defense, teamControl: opp.control },
          other,
          home,
          rng,
        )
        gf += goalsFor
        ga += goalsAgainst
        if (goalsFor > goalsAgainst) {
          pts += 3
          w++
        } else if (goalsFor === goalsAgainst) {
          pts += 1
          d++
        } else {
          l++
        }
      }
    }
    // Also simulate vs user (already counted in user matches, but opponent needs those results too)
    const userHomeMatches = matches.filter((m) => m.opponent === opp.name && m.home)
    const userAwayMatches = matches.filter((m) => m.opponent === opp.name && !m.home)
    for (const m of userHomeMatches) {
      // User was home, opponent was away
      gf += m.goalsAgainst
      ga += m.goalsFor
      if (m.goalsAgainst > m.goalsFor) {
        pts += 3
        w++
      } else if (m.goalsAgainst === m.goalsFor) {
        pts += 1
        d++
      } else {
        l++
      }
    }
    for (const m of userAwayMatches) {
      // User was away, opponent was home
      gf += m.goalsAgainst
      ga += m.goalsFor
      if (m.goalsAgainst > m.goalsFor) {
        pts += 3
        w++
      } else if (m.goalsAgainst === m.goalsFor) {
        pts += 1
        d++
      } else {
        l++
      }
    }

    leagueTable.push({
      name: opp.name,
      played: 38,
      won: w,
      drawn: d,
      lost: l,
      gf,
      ga,
      gd: gf - ga,
      points: pts,
    })
  }

  // Sort league table by points, then GD, then GF
  leagueTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  const userPosition = leagueTable.findIndex((t) => t.name === 'Your XI') + 1

  // Verdict based on position
  const verdict =
    userPosition === 1
      ? totalPoints >= 100
        ? '38-0 — THE PERFECT SEASON'
        : totalPoints >= 90
          ? 'CHAMPIONS — DOMINANT'
          : 'CHAMPIONS — JUST ABOUT'
      : userPosition <= 4
        ? 'CHAMPIONS LEAGUE QUALIFIED'
        : userPosition <= 6
          ? 'EUROPA LEAGUE QUALIFIED'
          : userPosition <= 10
            ? 'MID-TABLE SECURITY'
            : userPosition <= 17
              ? 'SURVIVED RELEGATION'
              : 'RELEGATED'

  return {
    squadStrength: 0, // filled in by caller
    finalPoints: totalPoints,
    finalPosition: userPosition,
    totalGoalsFor: totalGF,
    totalGoalsAgainst: totalGA,
    matches,
    leagueTable,
    seasonCommentary: [],
    verdict,
  }
}
