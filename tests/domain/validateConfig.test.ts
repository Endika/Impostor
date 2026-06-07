import { describe, expect, it } from 'vitest'
import { validateConfig } from '../../src/domain/game/validateConfig'
import type { GameConfig } from '../../src/domain/game/types'

const base: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorMin: 1,
  impostorMax: 1,
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

  it('rejects impostorMin below 1', () => {
    expect(validateConfig({ ...base, impostorMin: 0 })).toEqual({
      ok: false,
      error: 'invalid_impostor_count',
    })
  })

  it('rejects impostorMin greater than impostorMax', () => {
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan'],
        impostorMin: 2,
        impostorMax: 1,
      }),
    ).toEqual({ ok: false, error: 'invalid_impostor_count' })
  })

  it('rejects impostorMax greater than players-1 (3 players, max 3)', () => {
    expect(validateConfig({ ...base, impostorMin: 1, impostorMax: 3 })).toEqual(
      {
        ok: false,
        error: 'invalid_impostor_count',
      },
    )
  })

  it('accepts a wide range that leaves few crew (8 players, max 6)', () => {
    expect(
      validateConfig({
        ...base,
        players: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        impostorMin: 1,
        impostorMax: 6,
      }),
    ).toEqual({ ok: true })
  })

  it('rejects non-integer impostor bounds', () => {
    expect(
      validateConfig({
        ...base,
        players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eve'],
        impostorMin: 1,
        impostorMax: 2.5,
      }),
    ).toEqual({ ok: false, error: 'invalid_impostor_count' })
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
