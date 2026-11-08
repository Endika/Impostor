import type { Assignment } from '../../domain/game/types'
import { loadStreaks, recordStreaks } from './streakStorage'

const KEY = 'impostor.impostorStreaks'
const FIELD = 'lastAssignmentId'

export function loadImpostorStreaks(): Record<string, number> {
  return loadStreaks(KEY, FIELD)
}

export function recordAssignment(assignment: Assignment): void {
  const id = assignment.players[0]?.id
  if (!id) return
  recordStreaks(
    KEY,
    FIELD,
    id,
    assignment.players.map((p) => ({ name: p.name, hit: p.isImpostor })),
  )
}
