import { describe, it, expect, beforeEach } from 'vitest'
import { loadConfig, saveConfig } from '../../src/presentation/state/persistence'
import type { GameConfig } from '../../src/domain/game/types'

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorMin: 1,
  impostorMax: 1,
  impostorSeesClue: true,
  impostorsSeeEachOther: false,
  differentCluePerImpostor: false,
  categoryIds: ['home'],
  locale: 'es',
}

describe('persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('round-trips a config', () => {
    saveConfig(config)
    expect(loadConfig()).toEqual(config)
  })

  it('returns null when nothing is stored', () => {
    expect(loadConfig()).toBeNull()
  })

  it('returns null on corrupt data', () => {
    window.localStorage.setItem('impostor.config', '{not json')
    expect(loadConfig()).toBeNull()
  })
})
