import type { Assignment } from '../domain/game/types'

export type RoundStatus = 'crew_win' | 'impostor_win' | 'continue'

export interface EliminationResult {
  votedPlayerId: string
  votedWasImpostor: boolean
  status: RoundStatus
  aliveImpostorCount: number
  aliveCrewCount: number
}

export function resolveElimination(
  a: Assignment,
  eliminatedIds: string[],
  votedPlayerId: string,
): EliminationResult {
  const eliminated = new Set([...eliminatedIds, votedPlayerId])
  const votedWasImpostor = a.impostorIds.includes(votedPlayerId)
  const alive = a.players.filter((p) => !eliminated.has(p.id))
  const aliveImpostorCount = alive.filter((p) => p.isImpostor).length
  const aliveCrewCount = alive.length - aliveImpostorCount
  let status: RoundStatus = 'continue'
  if (aliveImpostorCount === 0) status = 'crew_win'
  else if (aliveImpostorCount >= aliveCrewCount) status = 'impostor_win'
  return {
    votedPlayerId,
    votedWasImpostor,
    status,
    aliveImpostorCount,
    aliveCrewCount,
  }
}
