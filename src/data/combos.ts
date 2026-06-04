import type { Player, Position, Role } from '../types/game'

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
  usedPlayerNames: Set<string>,
  openPositions: Position[],
  openRoles?: Role[],
): Player[] {
  return players.filter(
    (p) =>
      p.club === combo.club &&
      p.season === combo.season &&
      !usedPlayers.has(p.id) &&
      !usedPlayerNames.has(p.name) &&
      openPositions.includes(p.position) &&
      (openRoles ? openRoles.includes(p.role) : true),
  )
}

export function hasSelectablePlayers(
  players: Player[],
  combo: ClubSeasonCombo,
  usedPlayers: Set<string>,
  usedPlayerNames: Set<string>,
  openPositions: Position[],
  openRoles?: Role[],
): boolean {
  return getPlayersForCombo(players, combo, usedPlayers, usedPlayerNames, openPositions, openRoles).length > 0
}
