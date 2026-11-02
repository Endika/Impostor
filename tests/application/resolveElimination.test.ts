import { describe, expect, it } from 'vitest'
import { resolveElimination } from '../../src/application/resolveElimination'
import type { Assignment, Player } from '../../src/domain/game/types'

function buildAssignment(impostorIds: string[], playerIds: string[]): Assignment {
  const players: Player[] = playerIds.map((id) => ({
    id,
    name: id,
    isImpostor: impostorIds.includes(id),
    clue: null,
  }))
  return {
    players,
    word: 'Playa',
    categoryId: 'home',
    impostorIds,
  }
}

describe('resolveElimination', () => {
  it('continues when a crew is voted while impostors and crew both remain', () => {
    // 6 players, 2 impostors (p1,p2), crew p3..p6
    const a = buildAssignment(['p1', 'p2'], ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
    const r = resolveElimination(a, [], 'p3')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(2)
    expect(r.aliveCrewCount).toBe(3)
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
    const a = buildAssignment(['p1', 'p2'], ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'])
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

  it('declares impostor win when only one impostor and one crew are left', () => {
    // 4 players, 1 impostor (p1): 1 vs 2 after the first crew vote, 1 vs 1 after the second.
    const a = buildAssignment(['p1'], ['p1', 'p2', 'p3', 'p4'])
    expect(resolveElimination(a, [], 'p3').status).toBe('continue')
    const last = resolveElimination(a, ['p3'], 'p4')
    expect(last.status).toBe('impostor_win')
    expect(last.aliveImpostorCount).toBe(1)
    expect(last.aliveCrewCount).toBe(1)
  })

  it('keeps playing when impostors equal or outnumber a crew of two or more', () => {
    // 7 players, 3 impostors (p1..p3), crew p4..p7: 3 vs 3, then 3 vs 2.
    const a = buildAssignment(['p1', 'p2', 'p3'], ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'])
    expect(resolveElimination(a, [], 'p4').status).toBe('continue')
    expect(resolveElimination(a, ['p4'], 'p5').status).toBe('continue')
  })

  it('lets the crew still win from two against two', () => {
    // 4 players, 2 impostors (p1,p2), crew p3,p4.
    const a = buildAssignment(['p1', 'p2'], ['p1', 'p2', 'p3', 'p4'])
    expect(resolveElimination(a, [], 'p1').status).toBe('continue')
    expect(resolveElimination(a, ['p1'], 'p2').status).toBe('crew_win')
  })

  it('keeps playing with two impostors against one crew', () => {
    const a = buildAssignment(['p1', 'p2'], ['p1', 'p2', 'p3', 'p4'])
    const r = resolveElimination(a, [], 'p4')
    expect(r.status).toBe('continue')
    expect(r.aliveImpostorCount).toBe(2)
    expect(r.aliveCrewCount).toBe(1)
  })
})
