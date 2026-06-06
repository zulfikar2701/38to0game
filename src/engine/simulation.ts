import type {
  Formation,
  Player,
  MatchResult,
  LeagueTeam,
  PlayerSeasonStat,
  SimulationResult,
  QuadrupleResult,
  CompetitionResult,
  PlayerAward,
} from '../types/game'
import { calculateSquadStrength } from './ovr'
import { generateHeadline } from './narrative'
import { log } from '../lib/logger'

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── Squad Scores ──────────────────────────────────────────────────────────

function getSquadScores(squad: Player[]) {
  const fwds = squad.filter((p) => p.role === 'ST' || p.role === 'W')
  const mids = squad.filter((p) => p.role === 'CM')
  const defs = squad.filter((p) => p.role === 'CB' || p.role === 'FB')
  const gks = squad.filter((p) => p.role === 'GK')

  const avg = (arr: Player[]) =>
    arr.length > 0 ? arr.reduce((s, p) => s + p.ovr, 0) / arr.length : 70

  return {
    attack: avg(fwds),
    midfield: avg(mids),
    defense: avg(defs),
    goalkeeping: avg(gks),
  }
}

// ─── Match Simulation ────────────────────────────────────────────────────

function simulateMatch(
  userScores: ReturnType<typeof getSquadScores>,
  opponentStrength: number,
  rng: () => number,
  isKnockout = false,
): { userGoals: number; oppGoals: number } {
  const userXG =
    (userScores.attack / 99) * 2.5 + (userScores.midfield / 99) * 0.5
  const oppXG =
    (opponentStrength / 99) * 2.5 -
    (userScores.defense / 99) * 0.8 -
    (userScores.goalkeeping / 99) * 0.5
  const clampedOppXG = Math.max(0.3, oppXG)

  let userGoals = poisson(userXG, rng)
  let oppGoals = poisson(clampedOppXG, rng)

  if (isKnockout && userGoals === oppGoals) {
    const etUser = poisson(userXG * 0.7, rng)
    const etOpp = poisson(clampedOppXG * 0.7, rng)
    userGoals += etUser
    oppGoals += etOpp
    if (userGoals === oppGoals) {
      userGoals += rng() < 0.5 ? 1 : 0
      oppGoals += userGoals === oppGoals ? 1 : 0
    }
  }

  return { userGoals, oppGoals }
}

// ─── Premier League Opponents ──────────────────────────────────────────────

const opponents: { name: string; strength: number }[] = [
  { name: 'Liverpool', strength: 94 },
  { name: 'Arsenal', strength: 92 },
  { name: 'Man City', strength: 91 },
  { name: 'Chelsea', strength: 82 },
  { name: 'Newcastle', strength: 78 },
  { name: 'Aston Villa', strength: 76 },
  { name: 'Spurs', strength: 73 },
  { name: 'Brighton', strength: 71 },
  { name: "Nott'm Forest", strength: 69 },
  { name: 'Brentford', strength: 66 },
  { name: 'Fulham', strength: 63 },
  { name: 'Crystal Palace', strength: 60 },
  { name: 'West Ham', strength: 59 },
  { name: 'Man Utd', strength: 58 },
  { name: 'Bournemouth', strength: 55 },
  { name: 'Everton', strength: 50 },
  { name: 'Wolves', strength: 46 },
  { name: 'Ipswich', strength: 38 },
  { name: 'Leicester', strength: 35 },
]

// ─── AI-vs-AI Match ───────────────────────────────────────────────────────

function simulateOpponentMatch(
  a: { name: string; strength: number },
  b: { name: string; strength: number },
  rng: () => number,
): { aGoals: number; bGoals: number } {
  const ratio = a.strength / Math.max(1, b.strength)
  const aLambda = clamp(ratio ** 1.5 * 1.5, 0.3, 4.0)
  const bLambda = clamp((1 / ratio) ** 1.5 * 1.5, 0.3, 4.0)
  let aGoals = poisson(aLambda, rng)
  let bGoals = poisson(bLambda, rng)
  if (rng() < 0.02) aGoals += Math.floor(rng() * 2) + 1
  if (rng() < 0.02) bGoals += Math.floor(rng() * 2) + 1
  return { aGoals, bGoals }
}

// ─── Player Season Stats ─────────────────────────────────────────────────

function simulatePlayerSeason(player: Player, rng: () => number): PlayerSeasonStat {
  const apps = Math.round(28 + rng() * 10)
  let goals = 0
  let assists = 0
  let cleanSheets = 0
  let keyPasses = 0
  let tackles = 0
  let interceptions = 0
  let rating = 0

  const stats = player.stats

  if ('shots' in stats) {
    // FWD
    const gpg = stats.goals / Math.max(1, player.appearances)
    const apg = stats.assists / Math.max(1, player.appearances)
    goals = Math.round(gpg * apps * (0.9 + rng() * 0.2))
    assists = Math.round(apg * apps * (0.9 + rng() * 0.2))
    rating = goals * 3 + assists * 2 + apps * 0.5
  } else if ('passes' in stats && 'keyPasses' in stats) {
    // MID
    const gpg = stats.goals / Math.max(1, player.appearances)
    const apg = stats.assists / Math.max(1, player.appearances)
    const kppg = stats.keyPasses / Math.max(1, player.appearances)
    goals = Math.round(gpg * apps * (0.9 + rng() * 0.2))
    assists = Math.round(apg * apps * (0.9 + rng() * 0.2))
    keyPasses = Math.round(kppg * apps * (0.9 + rng() * 0.2))
    rating = goals * 2 + assists * 2 + keyPasses * 1.5 + apps * 0.5
  } else if ('tackles' in stats) {
    // DEF
    const tpg = stats.tackles / Math.max(1, player.appearances)
    const ipg = stats.interceptions / Math.max(1, player.appearances)
    tackles = Math.round(tpg * apps * (0.9 + rng() * 0.2))
    interceptions = Math.round(ipg * apps * (0.9 + rng() * 0.2))
    rating = tackles * 1.5 + interceptions * 1.5 + apps * 0.3
  } else if ('saves' in stats) {
    // GK
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

// ─── Competitions ────────────────────────────────────────────────────────

function simulateCommunityShield(
  userScores: ReturnType<typeof getSquadScores>,
  rng: () => number,
): CompetitionResult {
  const { userGoals, oppGoals } = simulateMatch(userScores, 85, rng, true)
  return {
    name: 'Community Shield',
    won: userGoals > oppGoals,
    roundReached: 'Final',
    finalOpponent: 'Man City',
    scoreline: `${userGoals}-${oppGoals}`,
  }
}

function simulatePremierLeague(
  userScores: ReturnType<typeof getSquadScores>,
  rng: () => number,
): { result: CompetitionResult; matches: MatchResult[]; table: LeagueTeam[]; totalGF: number; totalGA: number; points: number } {
  const matches: MatchResult[] = []
  let totalPoints = 0
  let totalGF = 0
  let totalGA = 0

  const fixtures: { opponent: typeof opponents[0]; home: boolean }[] = []
  for (const opp of opponents) {
    fixtures.push({ opponent: opp, home: rng() < 0.5 })
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
    const { userGoals, oppGoals } = simulateMatch(
      userScores,
      fixture.opponent.strength,
      rng,
    )
    const result: 'W' | 'D' | 'L' =
      userGoals > oppGoals ? 'W' : userGoals === oppGoals ? 'D' : 'L'
    const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
    log.match(fixture.opponent.name, userGoals, oppGoals, result)
    matches.push({
      gameweek,
      opponent: fixture.opponent.name,
      home: fixture.home,
      goalsFor: userGoals,
      goalsAgainst: oppGoals,
      result,
      points,
      commentary: generateMatchCommentary(fixture.opponent.name, userGoals, oppGoals, fixture.home),
    })
    totalPoints += points
    totalGF += userGoals
    totalGA += oppGoals
    gameweek++
  }

  const table: LeagueTeam[] = []
  table.push({
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
        const { aGoals, bGoals } = simulateOpponentMatch(
          opp,
          other,
          rng,
        )
        gf += aGoals
        ga += bGoals
        if (aGoals > bGoals) {
          pts += 3
          w++
        } else if (aGoals === bGoals) {
          pts += 1
          d++
        } else {
          l++
        }
      }
    }
    const userHome = matches.filter((m) => m.opponent === opp.name && m.home)
    const userAway = matches.filter((m) => m.opponent === opp.name && !m.home)
    for (const m of userHome) {
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
    for (const m of userAway) {
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
    table.push({
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

  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  const pos = table.findIndex((t) => t.name === 'Your XI') + 1
  const result: CompetitionResult = {
    name: 'Premier League',
    won: pos === 1,
    roundReached: `${pos}${getOrdinal(pos)}`,
    finalOpponent: null,
    scoreline: null,
  }

  return { result, matches, table, totalGF, totalGA, points: totalPoints }
}

function getOrdinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  if (n % 10 === 1) return 'st'
  if (n % 10 === 2) return 'nd'
  if (n % 10 === 3) return 'rd'
  return 'th'
}

function generateMatchCommentary(
  opponent: string,
  goalsFor: number,
  goalsAgainst: number,
  home: boolean,
): string {
  const venue = home ? 'at home' : 'away'
  if (goalsFor >= 4 && goalsAgainst <= 1) {
    return `A dominant display ${venue} against ${opponent}. Your attack was simply unstoppable.`
  }
  if (goalsAgainst >= 4) {
    return `A nightmare ${venue} against ${opponent}. The defense was carved open repeatedly.`
  }
  if (goalsFor === 0 && goalsAgainst === 0) {
    return `A stalemate ${venue} against ${opponent}. Neither side could find a breakthrough.`
  }
  if (goalsFor > goalsAgainst) {
    if (goalsFor - goalsAgainst >= 3) {
      return `A comfortable win ${venue} against ${opponent}. Everything clicked.`
    }
    return `A hard-fought victory ${venue} against ${opponent}.` + (goalsFor >= 2 ? ' The front line delivered when it mattered.' : ' A defensive masterclass secured the three points.')
  }
  if (goalsFor === goalsAgainst) {
    return `A point gained ${venue} against ${opponent}. Could have gone either way.`
  }
  return `Defeat ${venue} against ${opponent}.` + (goalsAgainst >= 2 ? ' The backline will need to improve.' : ' A cruel late goal decided it.')
}

// ─── Knockout Competitions ───────────────────────────────────────────────

function simulateKnockout(
  userScores: ReturnType<typeof getSquadScores>,
  rounds: { name: string; pool: number[]; opponents: string[] }[],
  rng: () => number,
): { result: CompetitionResult; rounds: { name: string; opponent: string; scoreline: string; won: boolean }[] } {
  const roundResults: { name: string; opponent: string; scoreline: string; won: boolean }[] = []
  let lastScoreline = ''
  let lastOpponent = ''

  for (const round of rounds) {
    const oppStrength = round.pool[Math.floor(rng() * round.pool.length)]
    const oppName = round.opponents[Math.floor(rng() * round.opponents.length)]
    const { userGoals, oppGoals } = simulateMatch(userScores, oppStrength, rng, true)
    const roundWon = userGoals > oppGoals
    const scoreline = `${userGoals}-${oppGoals}`
    roundResults.push({ name: round.name, opponent: oppName, scoreline, won: roundWon })
    if (!roundWon) {
      lastScoreline = scoreline
      lastOpponent = oppName
      break
    }
    lastScoreline = scoreline
    lastOpponent = oppName
  }

  const finalRound = roundResults[roundResults.length - 1]
  const result: CompetitionResult = {
    name: '',
    won: finalRound ? finalRound.won : false,
    roundReached: finalRound ? finalRound.name : 'R3',
    finalOpponent: lastOpponent,
    scoreline: lastScoreline,
  }

  return { result, rounds: roundResults }
}

function simulateFACup(
  userScores: ReturnType<typeof getSquadScores>,
  rng: () => number,
): CompetitionResult {
  const rounds = [
    { name: 'R3', pool: [55, 60, 65, 70], opponents: ['Portsmouth', 'Bolton', 'Wigan', 'Blackburn'] },
    { name: 'R4', pool: [65, 70, 75, 80], opponents: ['West Brom', 'Norwich', 'Stoke', 'Sunderland'] },
    { name: 'R5', pool: [70, 75, 80, 85], opponents: ['Sheffield Utd', 'Burnley', 'Watford', 'Leeds'] },
    { name: 'QF', pool: [80, 85, 88, 90], opponents: ['Aston Villa', 'Newcastle', 'Brighton', 'West Ham'] },
    { name: 'SF', pool: [85, 90, 92, 95], opponents: ['Spurs', 'Chelsea', 'Man Utd', 'Liverpool'] },
    { name: 'Final', pool: [90, 95, 96, 98], opponents: ['Arsenal', 'Man City', 'Chelsea', 'Liverpool'] },
  ]
  const { result } = simulateKnockout(userScores, rounds, rng)
  result.name = 'FA Cup'
  return result
}

function simulateChampionsLeague(
  userScores: ReturnType<typeof getSquadScores>,
  rng: () => number,
): CompetitionResult {
  const rounds = [
    { name: 'R16', pool: [85, 88, 90, 92], opponents: ['RB Leipzig', 'Inter', 'AC Milan', 'Atletico Madrid'] },
    { name: 'QF', pool: [88, 90, 92, 94], opponents: ['PSG', 'Bayern', 'Barcelona', 'Real Madrid'] },
    { name: 'SF', pool: [90, 92, 94, 96], opponents: ['Man City', 'Bayern', 'Real Madrid', 'Barcelona'] },
    { name: 'Final', pool: [92, 95, 96, 98], opponents: ['Real Madrid', 'Man City', 'Bayern', 'Barcelona'] },
  ]
  const { result } = simulateKnockout(userScores, rounds, rng)
  result.name = 'Champions League'
  return result
}

// ─── Player Awards ───────────────────────────────────────────────────────

function generateAwards(squad: Player[], rng: () => number): PlayerAward[] {
  const awards: PlayerAward[] = []

  // Top Scorer: weighted by tier among FWDs
  const fwds = squad.filter((p) => p.role === 'ST' || p.role === 'W')
  if (fwds.length > 0) {
    const weights = fwds.map((p) => {
      if (p.tier === 'star') return 50
      if (p.tier === 'gold') return 35
      if (p.tier === 'silver') return 12
      return 3
    })
    const total = weights.reduce((a, b) => a + b, 0)
    let r = rng() * total
    let winner = fwds[0]
    for (let i = 0; i < fwds.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        winner = fwds[i]
        break
      }
    }
    const goalRange =
      winner.tier === 'star' ? [15, 35] :
      winner.tier === 'gold' ? [10, 25] :
      winner.tier === 'silver' ? [5, 15] : [2, 8]
    const goals = goalRange[0] + Math.floor(rng() * (goalRange[1] - goalRange[0] + 1))
    awards.push({ type: 'topScorer', player: winner, value: goals })
  }

  // Most Assists: weighted by tier among MIDs
  const mids = squad.filter((p) => p.role === 'CM')
  if (mids.length > 0) {
    const weights = mids.map((p) => {
      if (p.tier === 'star') return 45
      if (p.tier === 'gold') return 35
      if (p.tier === 'silver') return 15
      return 5
    })
    const total = weights.reduce((a, b) => a + b, 0)
    let r = rng() * total
    let winner = mids[0]
    for (let i = 0; i < mids.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        winner = mids[i]
        break
      }
    }
    const assistRange =
      winner.tier === 'star' ? [12, 25] :
      winner.tier === 'gold' ? [8, 18] :
      winner.tier === 'silver' ? [4, 10] : [1, 5]
    const assists = assistRange[0] + Math.floor(rng() * (assistRange[1] - assistRange[0] + 1))
    awards.push({ type: 'mostAssists', player: winner, value: assists })
  }

  // Player of the Season: weighted by tier across all players
  const potyWeights: number[] = squad.map((p) => {
    if (p.tier === 'star') return 60
    if (p.tier === 'gold') return 30
    if (p.tier === 'silver') return 10
    return 0
  })
  const total = potyWeights.reduce((a, b) => a + b, 0)
  if (total > 0) {
    let r = rng() * total
    let winner = squad[0]
    for (let i = 0; i < squad.length; i++) {
      r -= potyWeights[i]
      if (r <= 0) {
        winner = squad[i]
        break
      }
    }
    awards.push({ type: 'playerOfSeason', player: winner, value: 0 })
  }

  return awards
}

// ─── Main Export ─────────────────────────────────────────────────────────

export function runQuadruple(
  formation: Formation,
  seed?: number,
): QuadrupleResult {
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 1000000))
  const squad = formation.map((s) => s.player).filter(Boolean) as Player[]
  const userScores = getSquadScores(squad)

  log.sim('Squad Scores', {
    attack: Math.round(userScores.attack),
    midfield: Math.round(userScores.midfield),
    defense: Math.round(userScores.defense),
    goalkeeping: Math.round(userScores.goalkeeping),
  })

  const cs = simulateCommunityShield(userScores, rng)
  const pl = simulatePremierLeague(userScores, rng)
  const fa = simulateFACup(userScores, rng)
  const cl = simulateChampionsLeague(userScores, rng)

  const trophies = [cs, pl.result, fa, cl].filter((r) => r.won).length

  const { headline, tagline } = generateHeadline(
    trophies,
    pl.totalGF,
    pl.totalGA,
    pl.table.findIndex((t) => t.name === 'Your XI') + 1,
  )

  const awards = generateAwards(squad, rng)

  return {
    communityShield: cs,
    premierLeague: pl.result,
    faCup: fa,
    championsLeague: cl,
    trophies,
    headline,
    tagline,
    awards,
  }
}

// Backward-compatible wrapper
export function runFullSimulation(
  _pillars: any,
  formation: Formation,
  seed?: number,
): SimulationResult {
  const quadruple = runQuadruple(formation, seed)
  const squad = formation.map((s) => s.player).filter(Boolean) as Player[]
  const rng = seededRandom(seed ?? Math.floor(Math.random() * 1000000))

  // Re-simulate league to get match details
  const userScores = getSquadScores(squad)
  const pl = simulatePremierLeague(userScores, rng)

  const pos = pl.table.findIndex((t) => t.name === 'Your XI') + 1
  const verdict =
    pos === 1
      ? quadruple.trophies >= 4
        ? '38-0 — THE PERFECT SEASON'
        : 'CHAMPIONS'
      : pos <= 4
        ? 'CHAMPIONS LEAGUE QUALIFIED'
        : pos <= 6
          ? 'EUROPA LEAGUE QUALIFIED'
          : pos <= 10
            ? 'MID-TABLE SECURITY'
            : pos <= 17
              ? 'SURVIVED RELEGATION'
              : 'RELEGATED'

  const playerStats = squad.map((p) => simulatePlayerSeason(p, rng))
  playerStats.sort((a, b) => b.rating - a.rating)

  return {
    squadStrength: calculateSquadStrength(squad),
    finalPoints: pl.points,
    finalPosition: pos,
    totalGoalsFor: pl.totalGF,
    totalGoalsAgainst: pl.totalGA,
    matches: pl.matches,
    leagueTable: pl.table,
    seasonCommentary: quadruple.trophies >= 4
      ? ['A perfect season. History will remember this team.']
      : quadruple.trophies >= 1
        ? ['A season of glory. The trophies tell the story.']
        : ['So near, yet so far. The margins were cruel.'],
    verdict,
    squad,
    playerStats,
    quadruple,
  }
}
