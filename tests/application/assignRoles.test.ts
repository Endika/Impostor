import { describe, expect, it } from 'vitest'
import { assignRoles } from '../../src/application/assignRoles'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameConfig } from '../../src/domain/game/types'

const bank = new InMemoryWordBank({
  home: { es: [{ word: 'Playa', hint: 'Tiempo' }] },
})

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eva'],
    impostorCount: 2,
    impostorSeesClue: false,
    impostorsSeeEachOther: false,
    categoryIds: ['home'],
    locale: 'es',
    ...overrides,
  }
}

describe('assignRoles', () => {
  it('marks exactly impostorCount players as impostors', () => {
    const assignment = assignRoles(makeConfig(), bank, () => 0)
    const impostors = assignment.players.filter((p) => p.isImpostor)
    expect(impostors).toHaveLength(2)
    expect(assignment.impostorIds).toHaveLength(2)
  })

  it('assigns the picked word and category', () => {
    const assignment = assignRoles(makeConfig(), bank, () => 0)
    expect(assignment.word).toBe('Playa')
    expect(assignment.categoryId).toBe('home')
  })

  it('sets clue to null when impostorSeesClue is false', () => {
    const assignment = assignRoles(
      makeConfig({ impostorSeesClue: false }),
      bank,
      () => 0,
    )
    expect(assignment.clue).toBeNull()
  })

  it("sets clue to the picked word's hint when impostorSeesClue is true", () => {
    const assignment = assignRoles(
      makeConfig({ impostorSeesClue: true }),
      bank,
      () => 0,
    )
    expect(assignment.clue).toBe('Tiempo')
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
          { word: 'Playa', hint: 'Costa' },
          { word: 'Montaña', hint: 'Altura' },
        ],
      },
    })
    // rng=0 would normally pick 'Playa'; excluding it leaves only 'Montaña'.
    const assignment = assignRoles(
      makeConfig(),
      multiBank,
      () => 0,
      ['Playa'],
    )
    expect(assignment.word).toBe('Montaña')
  })
})
