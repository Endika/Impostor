import { describe, expect, it } from 'vitest'
import { validateConfig } from '../../src/domain/game/validateConfig'
import type { GameConfig } from '../../src/domain/game/types'

const base: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorCount: 1,
  randomImpostors: false,
  impostorSeesClue: false,
  impostorsSeeEachOther: false,
  differentCluePerImpostor: false,
  categoryIds: ['home'],
  locale: 'es',
}

describe('validateConfig', () => {
  it('accepts a minimal valid config (3 players, 1 impostor)', () => {
    expect(validateConfig(base)).toEqual({ ok: true })
  })

  it('rejects fewer than 3 players', () => {
    expect(validateConfig({ ...base, players: ['Ana', 'Ben'] })).toEqual({
      ok: false,
      error: 'too_few_players',
    })
  })

  it('rejects a fixed impostor count of 0', () => {
    expect(validateConfig({ ...base, impostorCount: 0 })).toEqual({
      ok: false,
      error: 'invalid_impostor_count',
    })
  })

  it('rejects a fixed impostor count that would start the game at parity', () => {
    // 4 players -> max 1; two impostors against two crew would already win.
    expect(
      validateConfig({ ...base, players: ['Ana', 'Ben', 'Cleo', 'Dan'], impostorCount: 2 }),
    ).toEqual({
      ok: false,
      error: 'invalid_impostor_count',
    })
  })

  it('rejects a non-integer fixed impostor count', () => {
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eve'],
        impostorCount: 2.5,
      }),
    ).toEqual({ ok: false, error: 'invalid_impostor_count' })
  })

  it('accepts a valid fixed count at the upper bound (8 players, 3 impostors)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        impostorCount: 3,
      }),
    ).toEqual({ ok: true })
  })

  it('ignores the impostor count when randomImpostors is true (even out of range)', () => {
    expect(validateConfig({ ...base, randomImpostors: true, impostorCount: 99 })).toEqual({
      ok: true,
    })
  })

  it('rejects empty categoryIds', () => {
    expect(validateConfig({ ...base, categoryIds: [] })).toEqual({
      ok: false,
      error: 'no_category',
    })
  })

  it('rejects duplicate names', () => {
    expect(validateConfig({ ...base, players: ['Ana', 'Ana', 'Cleo'] })).toEqual({
      ok: false,
      error: 'duplicate_names',
    })
  })
})
