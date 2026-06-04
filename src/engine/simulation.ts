import type { TeamPillars } from './aggregation'
import type { SimulationResult, MatchResult, LeagueTeam, PlayerSeasonStat, Formation, Player } from '../types/game'
import { isFWDStats, isMIDStats, isDEFStats, isGKStats } from './aggregation'

export interface Opponent {
  name: string
  attack: number
  defense: number
  control: number
  quality: number // 0-100, underlying true strength for AI-vs-AI weighting
}

// 19 opponents: 2025-26 Premier League (based on 2024-25 finishing order, Southampton omitted)
const opponents: Opponent[] = [
  { name: 'Liverpool', attack: 190, defense: 150, control: 170, quality: 94 },
  { name: 'Arsenal', attack: 195, defense: 160, control: 180, quality: 92 },
  { name: 'Man City', attack: 200, defense: 155, control: 185, quality: 91 },
  { name: 'Chelsea', attack: 175, defense: 145, control: 165, quality: 82 },
  { name: 'Newcastle', attack: 170, defense: 140, control: 155, quality: 78 },
  { name: 'Aston Villa', attack: 165, defense: 135, control: 145, quality: 76 },
  { name: 'Spurs', attack: 165, defense: 140, control: 155, quality: 73 },
  { name: 'Brighton', attack: 150, defense: 140, control: 150, quality: 71 },
  { name: "Nott'm Forest", attack: 155, defense: 140, control: 140, quality: 69 },
  { name: 'Brentford', attack: 145, defense: 130, control: 135, quality: 66 },
  { name: 'Fulham', attack: 140, defense: 125, control: 130, quality: 63 },
  { name: 'Crystal Palace', attack: 130, defense: 125, control: 130, quality: 60 },
  { name: 'West Ham', attack: 145, defense: 135, control: 140, quality: 59 },
  { name: 'Man Utd', attack: 160, defense: 145, control: 155, quality: 58 },
  { name: 'Bournemouth', attack: 135, defense: 120, control: 125, quality: 55 },
  { name: 'Everton', attack: 125, defense: 120, control: 115, quality: 50 },
  { name: 'Wolves', attack: 120, defense: 125, control: 120, quality: 46 },
  { name: 'Ipswich', attack: 110, defense: 105, control: 100, quality: 38 },
  { name: 'Leicester', attack: 115, defense: 110, control: 105, quality: 35 },
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

/**
 * When two AI opponents play each other, quality difference heavily weights the result.
 * This ensures big clubs finish top and weak clubs bottom ~80-90% of the time.
 */
function simulateOpponentMatch(
  teamA: Opponent,
  teamB: Opponent,
  homeA: boolean,
  rng: () => number,
): { goalsA: number; goalsB: number } {
  const homeBoost = homeA ? 1.08 : 0.92
  const qualityRatio = teamA.quality / Math.max(1, teamB.quality)

  // Quality gap directly scales attack/defense effectiveness
  const qualityExp = 1.5
  const aAttackMult = homeBoost * Math.pow(qualityRatio, qualityExp)
  const aDefenseMult = (1 / homeBoost) * Math.pow(qualityRatio, qualityExp * 0.7)

  const aAttackEff = teamA.attack * aAttackMult
  const bAttackEff = teamB.attack / aDefenseMult

  const aDefenseEff = teamA.defense * aDefenseMult
  const bDefenseEff = teamB.defense / aAttackMult

  // Control edge still matters but quality dominates
  const controlEdge = clamp((teamA.control - teamB.control) / 300, -0.08, 0.08)

  const aLambda = clamp((aAttackEff / (aAttackEff + bDefenseEff * 0.6)) * 3.0, 0.3, 5.0) * (1 + controlEdge)
  const bLambda = clamp((bAttackEff / (bAttackEff + aDefenseEff * 0.6)) * 3.0, 0.3, 5.0) * (1 - controlEdge)

  let goalsA = poisson(aLambda, rng)
  let goalsB = poisson(bLambda, rng)

  // Occasional blowout modifier (rarer for AI games to keep totals realistic)
  if (rng() < 0.02) {
    goalsA += Math.floor(rng() * 2) + 1
  }
  if (rng() < 0.02) {
    goalsB += Math.floor(rng() * 2) + 1
  }

  return { goalsA, goalsB }
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

function simulatePlayerSeason(
  player: Player,
  rng: () => number,
): PlayerSeasonStat {
  const stats = player.stats
  const apps = Math.round(28 + rng() * 10) // 28-38 appearances

  let goals = 0
  let assists = 0
  let cleanSheets = 0
  let keyPasses = 0
  let tackles = 0
  let interceptions = 0
  let rating = 0

  if (isFWDStats(stats)) {
    const gpg = stats.goals / Math.max(1, player.appearances)
    const apg = stats.assists / Math.max(1, player.appearances)
    goals = Math.round(gpg * apps * (0.9 + rng() * 0.2))
    assists = Math.round(apg * apps * (0.9 + rng() * 0.2))
    rating = goals * 3 + assists * 2 + apps * 0.5
  } else if (isMIDStats(stats)) {
    const gpg = stats.goals / Math.max(1, player.appearances)
    const apg = stats.assists / Math.max(1, player.appearances)
    const kppg = stats.keyPasses / Math.max(1, player.appearances)
    goals = Math.round(gpg * apps * (0.9 + rng() * 0.2))
    assists = Math.round(apg * apps * (0.9 + rng() * 0.2))
    keyPasses = Math.round(kppg * apps * (0.9 + rng() * 0.2))
    rating = goals * 2 + assists * 2 + keyPasses * 1.5 + apps * 0.5
  } else if (isDEFStats(stats)) {
    const tpg = stats.tackles / Math.max(1, player.appearances)
    const ipg = stats.interceptions / Math.max(1, player.appearances)
    tackles = Math.round(tpg * apps * (0.9 + rng() * 0.2))
    interceptions = Math.round(ipg * apps * (0.9 + rng() * 0.2))
    rating = tackles * 1.5 + interceptions * 1.5 + apps * 0.3
  } else if (isGKStats(stats)) {
    const cspg = stats.cleanSheets / Math.max(1, player.appearances)
    cleanSheets = Math.round(cspg * apps * (0.9 + rng() * 0.2))
    rating = cleanSheets * 5 + apps * 0.5
  }

  return {
    playerId: player.id,
    name: player.name,
    club: player.club,
    season: player.season,
    role: player.role,
    goals,
    assists,
    cleanSheets,
    keyPasses,
    tackles,
    interceptions,
    appearances: apps,
    rating: Math.round(rating * 10) / 10,
  }
}

export function runFullSimulation(
  pillars: TeamPillars,
  formation: Formation,
  seed?: number,
): SimulationResult {
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 1000000))

  const matches: MatchResult[] = []
  let totalPoints = 0
  let totalGF = 0
  let totalGA = 0

  // Generate fixtures: each opponent twice, home/away randomized and shuffled
  const fixtures: { opponent: Opponent; home: boolean }[] = []

  for (const opponent of opponents) {
    fixtures.push({ opponent, home: rng() < 0.5 })
  }

  for (const f of fixtures.slice(0, 19)) {
    fixtures.push({ opponent: f.opponent, home: !f.home })
  }

  for (let i = fixtures.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = fixtures[i]
    fixtures[i] = fixtures[j]
    fixtures[j] = temp
  }

  let gameweek = 1
  for (const fixture of fixtures) {
    const { goalsFor, goalsAgainst } = simulateMatch(pillars, fixture.opponent, fixture.home, rng)
    const result: 'W' | 'D' | 'L' = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
    const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
    matches.push({
      gameweek,
      opponent: fixture.opponent.name,
      home: fixture.home,
      goalsFor,
      goalsAgainst,
      result,
      points,
      commentary: generateMatchCommentary(pillars, fixture.opponent, goalsFor, goalsAgainst, fixture.home),
    })
    totalPoints += points
    totalGF += goalsFor
    totalGA += goalsAgainst
    gameweek++
  }

  // Build league table
  const leagueTable: LeagueTeam[] = []

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

  for (const opp of opponents) {
    let pts = 0
    let w = 0
    let d = 0
    let l = 0
    let gf = 0
    let ga = 0
    for (const other of opponents) {
      if (opp.name === other.name) continue
      for (let h = 0; h < 2; h++) {
        const home = h === 0
        const { goalsA, goalsB } = simulateOpponentMatch(opp, other, home, rng)
        // goalsA = opp's goals, goalsB = other's goals
        gf += goalsA
        ga += goalsB
        if (goalsA > goalsB) {
          pts += 3
          w++
        } else if (goalsA === goalsB) {
          pts += 1
          d++
        } else {
          l++
        }
      }
    }
    const userHomeMatches = matches.filter((m) => m.opponent === opp.name && m.home)
    const userAwayMatches = matches.filter((m) => m.opponent === opp.name && !m.home)
    for (const m of userHomeMatches) {
      // User was home, opp was away -> opp's goals = goalsAgainst, conceded = goalsFor
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
      // User was away, opp was home -> opp's goals = goalsAgainst, conceded = goalsFor
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

  leagueTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  const userPosition = leagueTable.findIndex((t) => t.name === 'Your XI') + 1

  // Generate player season stats
  const squadPlayers = formation.map((s) => s.player).filter(Boolean) as Player[]
  const playerStats = squadPlayers.map((p) => simulatePlayerSeason(p, rng))
  playerStats.sort((a, b) => b.rating - a.rating)

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
    squadStrength: 0,
    finalPoints: totalPoints,
    finalPosition: userPosition,
    totalGoalsFor: totalGF,
    totalGoalsAgainst: totalGA,
    matches,
    leagueTable,
    seasonCommentary: [],
    verdict,
    squad: [],
    playerStats,
  }
}
