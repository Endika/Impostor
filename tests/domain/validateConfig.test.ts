import { describe, expect, it } from 'vitest'
import { validateConfig } from '../../src/domain/game/validateConfig'
import type { GameConfig } from '../../src/domain/game/types'

const base: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorCount: 1,
  impostorSeesClue: false,
  impostorsSeeEachOther: false,
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

  it('rejects 2 impostors with 3 players (max is 1)', () => {
    expect(validateConfig({ ...base, impostorCount: 2 })).toEqual({
      ok: false,
      error: 'invalid_impostor_count',
    })
  })

  it('accepts 2 impostors with 5 players (max is 2)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eve'],
        impostorCount: 2,
      }),
    ).toEqual({ ok: true })
  })

  it('rejects 3 impostors with 5 players (max is 2)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eve'],
        impostorCount: 3,
      }),
    ).toEqual({ ok: false, error: 'invalid_impostor_count' })
  })

  it('rejects impostorCount of 0', () => {
    expect(validateConfig({ ...base, impostorCount: 0 })).toEqual({
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
    expect(
      validateConfig({ ...base, players: ['Ana', 'Ana', 'Cleo'] }),
    ).toEqual({ ok: false, error: 'duplicate_names' })
  })
})
