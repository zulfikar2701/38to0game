export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export type Era =
  | '1950s' | '1960s' | '1970s' | '1980s'
  | '1990s' | '2000s' | '2010s' | '2020s'

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
  conversionRate: number
}

export type PositionStats = GKStats | DEFStats | MIDStats | FWDStats

export interface Player {
  id: string
  name: string
  club: string
  era: Era
  position: Position
  peakSeason: string
  stats: PositionStats
  eraAdjusted: PositionStats
}

export interface SquadSlot {
  position: Position
  player: Player | null
}

// 4-3-3 formation: 1 GK + 4 DEF + 3 MID + 3 FWD = 11 players
export type Formation = [
  SquadSlot, // GK
  SquadSlot, SquadSlot, SquadSlot, SquadSlot, // DEF
  SquadSlot, SquadSlot, SquadSlot, // MID
  SquadSlot, SquadSlot, SquadSlot, // FWD
]

export interface SimulationResult {
  league: boolean
  domesticCup: boolean
  continentalCup: boolean
  teamAttack: number
  teamDefense: number
  teamControl: number
  commentary: string[]
}

export type GamePhase =
  | 'menu'
  | 'drafting'
  | 'confirming'
  | 'simulating'
  | 'results'

export type GameMode = 'classic' | 'blind'

export interface DraftState {
  round: number // 1-11
  formation: Formation
  skipsRemaining: number
  currentCombo: { club: string; era: Era } | null
  availablePlayers: Player[]
  usedPlayers: Set<string>
}
