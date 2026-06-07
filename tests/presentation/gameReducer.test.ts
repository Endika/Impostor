import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../../src/presentation/state/gameReducer'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameConfig } from '../../src/domain/game/types'

const bank = new InMemoryWordBank({ general: { es: ['Playa'] } })
const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorCount: 1,
  impostorSeesClue: true,
  impostorsSeeEachOther: false,
  categoryIds: ['general'],
  locale: 'es',
}

describe('gameReducer', () => {
  it('starts at setup', () => {
    expect(initialState.screen).toBe('setup')
  })

  it('START_GAME assigns roles and moves to reveal', () => {
    const s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    expect(s.screen).toBe('reveal')
    expect(s.assignment?.players).toHaveLength(3)
  })

  it('walks reveal -> round -> vote -> result with correct outcome', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: 'NEXT_REVEAL' })
    expect(s.screen).toBe('round')
    s = gameReducer(s, { type: 'END_ROUND' })
    expect(s.screen).toBe('vote')
    s = gameReducer(s, { type: 'CAST_VOTE', votedPlayerId: s.assignment!.impostorIds[0]! })
    expect(s.screen).toBe('result')
    expect(s.outcome?.winner).toBe('crew')
  })

  it('PLAY_AGAIN keeps config but clears assignment/outcome', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    s = gameReducer(s, { type: 'PLAY_AGAIN' })
    expect(s.screen).toBe('setup')
    expect(s.config).toEqual(config)
    expect(s.assignment).toBeNull()
  })

  it('RESET returns to initial state', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    s = gameReducer(s, { type: 'RESET' })
    expect(s).toEqual(initialState)
  })

  it('NEXT_REVEAL is a no-op without an assignment', () => {
    const s = gameReducer(initialState, { type: 'NEXT_REVEAL' })
    expect(s).toEqual(initialState)
  })
})
