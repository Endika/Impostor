import type { Assignment, GameOutcome, Vote } from '../domain/game/types'

export function resolveOutcome(a: Assignment, vote: Vote): GameOutcome {
  const votedWasImpostor = a.impostorIds.includes(vote.votedPlayerId)
  return {
    winner: votedWasImpostor ? 'crew' : 'impostors',
    votedWasImpostor,
    word: a.word,
    impostorIds: a.impostorIds,
  }
}
