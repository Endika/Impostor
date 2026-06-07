import { describe, expect, it } from 'vitest'
import { assignRoles } from '../../src/application/assignRoles'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameConfig } from '../../src/domain/game/types'

const bank = new InMemoryWordBank({
  home: { es: [{ word: 'Playa', hints: ['Costa', 'Arena', 'Sol'] }] },
})

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eva'],
    impostorCount: 2,
    randomImpostors: false,
    impostorSeesClue: false,
    impostorsSeeEachOther: false,
    differentCluePerImpostor: false,
    categoryIds: ['home'],
    locale: 'es',
    ...overrides,
  }
}

describe('assignRoles', () => {
  it('marks exactly impostorCount players in fixed mode', () => {
    const assignment = assignRoles(
      makeConfig({ impostorCount: 2, randomImpostors: false }),
      bank,
      () => 0,
    )
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(2)
    expect(assignment.impostorIds).toHaveLength(2)
  })

  it('picks the minimum count (1) in random mode when rng() returns 0', () => {
    const assignment = assignRoles(
      makeConfig({ randomImpostors: true }),
      bank,
      () => 0,
    )
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(1)
    expect(assignment.impostorIds).toHaveLength(1)
  })

  it('reaches players-1 in random mode when rng() is near 1', () => {
    // 5 players -> max 4 impostors.
    const assignment = assignRoles(
      makeConfig({ randomImpostors: true }),
      bank,
      () => 0.99,
    )
    expect(assignment.impostorIds).toHaveLength(4)
  })

  it('assigns the picked word and category', () => {
    const assignment = assignRoles(makeConfig(), bank, () => 0)
    expect(assignment.word).toBe('Playa')
    expect(assignment.categoryId).toBe('home')
  })

  it('gives crew players a null clue', () => {
    const assignment = assignRoles(
      makeConfig({ impostorSeesClue: true }),
      bank,
      () => 0,
    )
    for (const p of assignment.players)
      if (!p.isImpostor) expect(p.clue).toBeNull()
  })

  it('gives every impostor a null clue when impostorSeesClue is false', () => {
    const assignment = assignRoles(
      makeConfig({ impostorSeesClue: false }),
      bank,
      () => 0,
    )
    for (const p of assignment.players)
      if (p.isImpostor) expect(p.clue).toBeNull()
  })

  it('gives all impostors the same clue when differentCluePerImpostor is false', () => {
    const assignment = assignRoles(
      makeConfig({ impostorSeesClue: true, differentCluePerImpostor: false }),
      bank,
      () => 0,
    )
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors.length).toBeGreaterThanOrEqual(2)
    const clues = impostors.map((p) => p.clue)
    expect(clues.every((c) => c !== null)).toBe(true)
    expect(new Set(clues).size).toBe(1)
  })

  it('gives each impostor a distinct clue when differentCluePerImpostor is true', () => {
    const assignment = assignRoles(
      makeConfig({
        impostorCount: 2,
        randomImpostors: false,
        impostorSeesClue: true,
        differentCluePerImpostor: true,
      }),
      bank,
      () => 0,
    )
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(2)
    const clues = impostors.map((p) => p.clue)
    expect(clues.every((c) => c !== null)).toBe(true)
    // Both clues are drawn from the word's hints and are distinct.
    const hints = ['Costa', 'Arena', 'Sol']
    for (const c of clues) expect(hints).toContain(c)
    expect(new Set(clues).size).toBe(2)
  })

  it('gives every player a unique id', () => {
    const assignment = assignRoles(makeConfig(), bank, () => 0)
    const ids = assignment.players.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not pick an excluded word when alternatives exist', () => {
    const multiBank = new InMemoryWordBank({
      home: {
        es: [
          { word: 'Playa', hints: ['Costa', 'Arena'] },
          { word: 'Montaña', hints: ['Altura', 'Nieve'] },
        ],
      },
    })
    // rng=0 would normally pick 'Playa'; excluding it leaves only 'Montaña'.
    const assignment = assignRoles(makeConfig(), multiBank, () => 0, ['Playa'])
    expect(assignment.word).toBe('Montaña')
  })
})
