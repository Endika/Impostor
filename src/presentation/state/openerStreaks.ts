import type { Assignment, Player } from '../../domain/game/types'
import { loadStreaks, recordStreaks } from './streakStorage'

const KEY = 'impostor.openerStreaks'
const FIELD = 'lastRoundKey'

export function loadOpenerStreaks(): Record<string, number> {
  return loadStreaks(KEY, FIELD)
}

export function recordOpener(
  assignment: Assignment,
  round: number,
  alivePlayers: Player[],
  openerId: string,
): void {
  const first = assignment.players[0]?.id
  if (!first) return
  recordStreaks(
    KEY,
    FIELD,
    `${first}:${round}`,
    alivePlayers.map((p) => ({ name: p.name, hit: p.id === openerId })),
  )
}
