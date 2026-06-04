import type { Player, Position } from '../types/game'

export interface ClubSeasonCombo {
  club: string
  season: string
}

export function buildCombos(players: Player[]): ClubSeasonCombo[] {
  const combos = new Map<string, ClubSeasonCombo>()
  for (const player of players) {
    const key = `${player.club}::${player.season}`
    combos.set(key, { club: player.club, season: player.season })
  }
  return Array.from(combos.values())
}

export function getPlayersForCombo(
  players: Player[],
  combo: ClubSeasonCombo,
  usedPlayers: Set<string>,
  openPositions: Position[],
): Player[] {
  return players.filter(
    (p) =>
      p.club === combo.club &&
      p.season === combo.season &&
      !usedPlayers.has(p.id) &&
      openPositions.includes(p.position),
  )
}

export function hasSelectablePlayers(
  players: Player[],
  combo: ClubSeasonCombo,
  usedPlayers: Set<string>,
  openPositions: Position[],
): boolean {
  return getPlayersForCombo(players, combo, usedPlayers, openPositions).length > 0
}
