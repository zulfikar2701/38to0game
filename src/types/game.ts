export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export type Role = 'GK' | 'CB' | 'FB' | 'CM' | 'W' | 'ST'

export interface GKStats {
  saves: number
  cleanSheets: number
  distribution: number
}

export interface DEFStats {
  tackles: number
  blocks: number
  aerials: number
  interceptions: number
}

export interface MIDStats {
  goals: number
  assists: number
  passes: number
  keyPasses: number
  dribbles: number
}

export interface FWDStats {
  goals: number
  assists: number
  shots: number
}

export type PositionStats = GKStats | DEFStats | MIDStats | FWDStats

export interface ClubColors {
  primary: string
  accent: string
}

export interface Player {
  id: string
  name: string
  club: string
  season: string
  position: Position
  positions: Position[]
  role: Role
  appearances: number
  stats: PositionStats
  eraAdjusted: PositionStats
  clubColors: ClubColors
}

export interface SquadSlot {
  position: Position
  role: Role
  player: Player | null
}

// 4-3-3 formation: 1 GK + 4 DEF + 3 MID + 3 FWD = 11 players
export type Formation = [
  SquadSlot, // GK
  SquadSlot, SquadSlot, SquadSlot, SquadSlot, // DEF
  SquadSlot, SquadSlot, SquadSlot, // MID
  SquadSlot, SquadSlot, SquadSlot, // FWD
]

export interface MatchResult {
  gameweek: number
  opponent: string
  home: boolean
  goalsFor: number
  goalsAgainst: number
  result: 'W' | 'D' | 'L'
  points: number
  commentary: string
}

export interface LeagueTeam {
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export interface PlayerSeasonStat {
  playerId: string
  name: string
  club: string
  season: string
  role: Role
  goals: number
  assists: number
  cleanSheets: number
  keyPasses: number
  tackles: number
  interceptions: number
  appearances: number
  rating: number
}

export interface SimulationResult {
  squadStrength: number
  finalPoints: number
  finalPosition: number
  totalGoalsFor: number
  totalGoalsAgainst: number
  matches: MatchResult[]
  leagueTable: LeagueTeam[]
  seasonCommentary: string[]
  verdict: string
  squad: Player[]
  playerStats: PlayerSeasonStat[]
}

export type GamePhase =
  | 'menu'
  | 'drafting'
  | 'confirming'
  | 'simulating'
  | 'results'

export type GameMode = 'classic' | 'blind'

export type Era = '90s' | '00s' | '10s' | '20s' | 'all'

export interface DraftState {
  round: number // 1-11
  formation: Formation
  skipsRemaining: number
  currentCombo: { club: string; season: string } | null
  availablePlayers: Player[]
  usedPlayers: Set<string>
}
