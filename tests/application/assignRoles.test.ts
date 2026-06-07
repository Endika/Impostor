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
    impostorMin: 2,
    impostorMax: 2,
    impostorSeesClue: false,
    impostorsSeeEachOther: false,
    differentCluePerImpostor: false,
    categoryIds: ['home'],
    locale: 'es',
    ...overrides,
  }
}

describe('assignRoles', () => {
  it('uses impostorMin as the count when rng() returns 0', () => {
    const assignment = assignRoles(
      makeConfig({ impostorMin: 1, impostorMax: 3 }),
      bank,
      () => 0,
    )
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(1)
    expect(assignment.impostorIds).toHaveLength(1)
  })

  it('marks exactly impostorMin players when min equals max', () => {
    const assignment = assignRoles(makeConfig(), bank, () => 0)
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(2)
    expect(assignment.impostorIds).toHaveLength(2)
  })

  it('draws a count within [min,max], reaching max when rng() is near 1', () => {
    const assignment = assignRoles(
      makeConfig({ impostorMin: 1, impostorMax: 3 }),
      bank,
      () => 0.99,
    )
    expect(assignment.impostorIds.length).toBeGreaterThanOrEqual(1)
    expect(assignment.impostorIds.length).toBeLessThanOrEqual(3)
    expect(assignment.impostorIds).toHaveLength(3)
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
        impostorMin: 2,
        impostorMax: 2,
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
