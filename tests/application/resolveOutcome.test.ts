import { describe, expect, it } from 'vitest'
import { resolveOutcome } from '../../src/application/resolveOutcome'
import type { Assignment } from '../../src/domain/game/types'

const assignment: Assignment = {
  players: [
    { id: 'p1', name: 'Ana', isImpostor: false },
    { id: 'p2', name: 'Ben', isImpostor: true },
  ],
  word: 'Playa',
  categoryId: 'general',
  clue: null,
  impostorIds: ['p2'],
}

describe('resolveOutcome', () => {
  it('lets the crew win when the voted player is an impostor', () => {
    const outcome = resolveOutcome(assignment, { votedPlayerId: 'p2' })
    expect(outcome.winner).toBe('crew')
    expect(outcome.votedWasImpostor).toBe(true)
    expect(outcome.word).toBe('Playa')
    expect(outcome.impostorIds).toEqual(['p2'])
  })

  it('lets the impostors win when the voted player is crew', () => {
    const outcome = resolveOutcome(assignment, { votedPlayerId: 'p1' })
    expect(outcome.winner).toBe('impostors')
    expect(outcome.votedWasImpostor).toBe(false)
  })
})
