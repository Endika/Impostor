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

  it('rejects an empty or blank player row once there are three names', () => {
    expect(validateConfig({ ...base, players: ['Ana', 'Ben', 'Cleo', ''] })).toEqual({
      ok: false,
      error: 'empty_player',
    })
    expect(validateConfig({ ...base, players: ['Ana', '  ', 'Ben', 'Cleo'] })).toEqual({
      ok: false,
      error: 'empty_player',
    })
  })

  it('asks for more players before complaining about empty rows', () => {
    expect(validateConfig({ ...base, players: ['Ana', 'Ben', ''] })).toEqual({
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

  it('rejects a fixed impostor count above half the players when impostors see each other', () => {
    // 4 players with impostors seeing each other -> max 2; three impostors would outnumber the crew.
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan'],
        impostorCount: 3,
        impostorsSeeEachOther: true,
      }),
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

  it('accepts a valid fixed count at the upper bound (8 players, 4 impostors, see each other)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        impostorCount: 4,
        impostorsSeeEachOther: true,
      }),
    ).toEqual({ ok: true })
  })

  it('accepts 8 players with 6 fixed impostors when they do not see each other', () => {
    expect(
      validateConfig({
        ...base,
        players: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        impostorCount: 6,
        impostorsSeeEachOther: false,
      }),
    ).toEqual({ ok: true })
  })

  it('rejects 8 players with 7 fixed impostors (only one crew left)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        impostorCount: 7,
        impostorsSeeEachOther: false,
      }),
    ).toEqual({ ok: false, error: 'invalid_impostor_count' })
  })

  it('ignores the impostor count when randomImpostors is true (even out of range)', () => {
    expect(validateConfig({ ...base, randomImpostors: true, impostorCount: 99 })).toEqual({
      ok: true,
    })
  })

  it('rejects a random maximum below 1', () => {
    expect(validateConfig({ ...base, randomImpostors: true, maxRandomImpostors: 0 })).toEqual({
      ok: false,
      error: 'invalid_impostor_count',
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
