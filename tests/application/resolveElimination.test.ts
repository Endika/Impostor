import { describe, expect, it } from 'vitest'
import { resolveElimination } from '../../src/application/resolveElimination'
import type { Assignment, Player } from '../../src/domain/game/types'

function buildAssignment(impostorIds: string[], playerIds: string[]): Assignment {
  const players: Player[] = playerIds.map((id) => ({
    id,
    name: id,
    isImpostor: impostorIds.includes(id),
  }))
  return {
    players,
    word: 'Playa',
    categoryId: 'home',
    clue: null,
    impostorIds,
  }
}

describe('resolveElimination', () => {
  it('continues when a crew is voted while impostors and crew both remain', () => {
    // 5 players, 2 impostors (p1,p2), crew p3,p4,p5
    const a = buildAssignment(['p1', 'p2'], ['p1', 'p2', 'p3', 'p4', 'p5'])
    const r = resolveElimination(a, [], 'p3')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(2)
    expect(r.aliveCrewCount).toBe(2)
    expect(r.votedWasImpostor).toBe(false)
  })

  it('declares impostor win when the last crew is eliminated', () => {
    // 3 players, 1 impostor (p1); crew p2,p3 with p2 already out.
    const a = buildAssignment(['p1'], ['p1', 'p2', 'p3'])
    const r = resolveElimination(a, ['p2'], 'p3')
    expect(r.status).toBe('impostor_win')
    expect(r.aliveImpostorCount).toBe(1)
    expect(r.aliveCrewCount).toBe(0)
    expect(r.votedWasImpostor).toBe(false)
  })

  it('declares crew win when the last impostor is eliminated', () => {
    // 5 players, 1 impostor (p1)
    const a = buildAssignment(['p1'], ['p1', 'p2', 'p3', 'p4', 'p5'])
    const r = resolveElimination(a, [], 'p1')
    expect(r.status).toBe('crew_win')
    expect(r.aliveImpostorCount).toBe(0)
    expect(r.votedWasImpostor).toBe(true)
  })

  it('continues when a crew is eliminated and crew still outnumber impostors', () => {
    const a = buildAssignment(['p1'], ['p1', 'p2', 'p3', 'p4', 'p5'])
    const r = resolveElimination(a, [], 'p2')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(1)
    expect(r.aliveCrewCount).toBe(3)
    expect(r.votedWasImpostor).toBe(false)
  })

  it('handles a multi-round sequence with accumulating eliminations', () => {
    // 7 players, 2 impostors (p1,p2), crew p3..p7
    const a = buildAssignment(
      ['p1', 'p2'],
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    )
    const eliminated: string[] = []

    // Round 1: eliminate crew p3 -> 2 imp vs 4 crew -> continue
    let r = resolveElimination(a, eliminated, 'p3')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(2)
    expect(r.aliveCrewCount).toBe(4)
    eliminated.push('p3')

    // Round 2: eliminate crew p4 -> 2 imp vs 3 crew -> continue
    r = resolveElimination(a, eliminated, 'p4')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(2)
    expect(r.aliveCrewCount).toBe(3)
    eliminated.push('p4')

    // Round 3: eliminate impostor p1 -> 1 imp vs 3 crew -> continue
    r = resolveElimination(a, eliminated, 'p1')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(1)
    expect(r.aliveCrewCount).toBe(3)
    expect(r.votedWasImpostor).toBe(true)
    eliminated.push('p1')

    // Round 4: eliminate last impostor p2 -> 0 imp -> crew_win
    r = resolveElimination(a, eliminated, 'p2')
    expect(r.status).toBe('crew_win')
    expect(r.aliveImpostorCount).toBe(0)
    expect(r.votedWasImpostor).toBe(true)
  })

  it('reaches an impostor win only once every crew is gone', () => {
    // 7 players, 2 impostors (p1,p2), crew p3..p7
    const a = buildAssignment(
      ['p1', 'p2'],
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    )
    const eliminated: string[] = []
    const crew = ['p3', 'p4', 'p5', 'p6', 'p7']

    // Voting out crew one by one keeps the game going while any crew remains.
    for (let i = 0; i < crew.length - 1; i++) {
      const r = resolveElimination(a, eliminated, crew[i]!)
      expect(r.status).toBe('continue')
      expect(r.votedWasImpostor).toBe(false)
      eliminated.push(crew[i]!)
    }

    // Voting out the very last crew flips it to an impostor win.
    const last = resolveElimination(a, eliminated, crew[crew.length - 1]!)
    expect(last.status).toBe('impostor_win')
    expect(last.aliveCrewCount).toBe(0)
    expect(last.aliveImpostorCount).toBe(2)
  })
})
