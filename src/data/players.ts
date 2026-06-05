import type { Player, Era } from '../types/game';
import players90s from './players-90s.json';
import players00s from './players-00s.json';
import players10s from './players-10s.json';
import players20s from './players-20s.json';
import playersAll from './players-all.json';

const ERA_MAP: Record<Era, Player[]> = {
  '90s': players90s as Player[],
  '00s': players00s as Player[],
  '10s': players10s as Player[],
  '20s': players20s as Player[],
  'all': playersAll as Player[],
};

export function getPlayersByEra(era: Era): Player[] {
  return ERA_MAP[era];
}

// Default: all-time (backward compat)
export const players: Player[] = playersAll as Player[];
