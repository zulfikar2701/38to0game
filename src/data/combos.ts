import type { Player, Position, Era } from '../types/game'

export interface ClubEraCombo {
  club: string
  era: Era
}

export function buildCombos(players: Player[]): ClubEraCombo[] {
  const combos = new Map<string, ClubEraCombo>()
  for (const player of players) {
    const key = `${player.club}::${player.era}`
    combos.set(key, { club: player.club, era: player.era })
  }
  return Array.from(combos.values())
}

export function getPlayersForCombo(
  players: Player[],
  combo: ClubEraCombo,
  usedPlayers: Set<string>,
  openPositions: Position[],
): Player[] {
  return players.filter(
    (p) =>
      p.club === combo.club &&
      p.era === combo.era &&
      !usedPlayers.has(p.id) &&
      openPositions.includes(p.position),
  )
}

export function hasSelectablePlayers(
  players: Player[],
  combo: ClubEraCombo,
  usedPlayers: Set<string>,
  openPositions: Position[],
): boolean {
  return getPlayersForCombo(players, combo, usedPlayers, openPositions).length > 0
}
