import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../../src/presentation/state/gameReducer'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { GameConfig } from '../../src/domain/game/types'

const bank = new InMemoryWordBank({
  home: { es: [{ word: 'Playa', hint: 'Costa' }] },
})
const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorMin: 1,
  impostorMax: 1,
  impostorSeesClue: true,
  impostorsSeeEachOther: false,
  categoryIds: ['home'],
  locale: 'es',
}

function startAndReachVote(cfg: GameConfig): GameState {
  let s = gameReducer(initialState, {
    type: 'START_GAME',
    config: cfg,
    bank,
    rng: () => 0,
  })
  for (let i = 0; i < cfg.players.length; i++)
    s = gameReducer(s, { type: 'NEXT_REVEAL' })
  expect(s.screen).toBe('round')
  s = gameReducer(s, { type: 'END_ROUND' })
  expect(s.screen).toBe('vote')
  return s
}

function crewIds(s: GameState): string[] {
  return s
    .assignment!.players.filter((p) => !p.isImpostor)
    .map((p) => p.id)
}

describe('gameReducer', () => {
  it('starts at setup', () => {
    expect(initialState.screen).toBe('setup')
    expect(initialState.eliminatedIds).toEqual([])
    expect(initialState.lastElimination).toBeNull()
  })

  it('START_GAME assigns roles and moves to reveal', () => {
    const s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    expect(s.screen).toBe('reveal')
    expect(s.assignment?.players).toHaveLength(3)
    expect(s.eliminatedIds).toEqual([])
    expect(s.lastElimination).toBeNull()
  })

  it('walks reveal -> round -> vote -> elimination (crew win preset) -> result', () => {
    const s = startAndReachVote(config)
    // Voting out the lone impostor leaves 0 impostors -> crew win.
    const out = gameReducer(s, {
      type: 'CAST_VOTE',
      votedPlayerId: s.assignment!.impostorIds[0]!,
    })
    // CAST_VOTE always lands on the elimination screen now, even when terminal,
    // so the eliminated impostor still gets a last-chance guess.
    expect(out.screen).toBe('elimination')
    expect(out.lastElimination?.status).toBe('crew_win')
    expect(out.outcome?.winner).toBe('crew')

    // Confirming moves on to the result screen.
    const result = gameReducer(out, { type: 'SHOW_RESULT' })
    expect(result.screen).toBe('result')
    expect(result.outcome?.winner).toBe('crew')
  })

  it('continues across rounds when crew remain (7 players, 2 impostors)', () => {
    const cfg: GameConfig = {
      ...config,
      players: ['Ana', 'Ben', 'Cleo', 'Dan', 'Eve', 'Fox', 'Gil'],
      impostorMin: 2,
      impostorMax: 2,
    }
    let s = startAndReachVote(cfg)
    const crew = crewIds(s)

    // Round 1: vote out a crew -> 2 imp vs 4 crew -> continue, no outcome yet.
    s = gameReducer(s, { type: 'CAST_VOTE', votedPlayerId: crew[0]! })
    expect(s.screen).toBe('elimination')
    expect(s.lastElimination?.status).toBe('continue')
    expect(s.outcome).toBeNull()
    expect(s.eliminatedIds).toHaveLength(1)

    // Move to the next round.
    s = gameReducer(s, { type: 'NEXT_ROUND' })
    expect(s.screen).toBe('round')
    s = gameReducer(s, { type: 'END_ROUND' })
    expect(s.screen).toBe('vote')

    // Round 2: vote out another crew -> 2 imp vs 3 crew -> still continue.
    s = gameReducer(s, { type: 'CAST_VOTE', votedPlayerId: crew[1]! })
    expect(s.screen).toBe('elimination')
    expect(s.lastElimination?.status).toBe('continue')
    expect(s.outcome).toBeNull()
    expect(s.eliminatedIds).toHaveLength(2)
  })

  it('lets an eliminated impostor steal the win via a correct guess', () => {
    const s = startAndReachVote(config)
    // Eliminate the impostor (would be a crew win) ...
    let next = gameReducer(s, {
      type: 'CAST_VOTE',
      votedPlayerId: s.assignment!.impostorIds[0]!,
    })
    expect(next.screen).toBe('elimination')
    expect(next.outcome?.winner).toBe('crew')

    // ... but the impostor guesses the word and the impostors steal the win.
    next = gameReducer(next, { type: 'IMPOSTOR_GUESSED_RIGHT' })
    expect(next.screen).toBe('result')
    expect(next.outcome?.winner).toBe('impostors')
    expect(next.outcome?.votedWasImpostor).toBe(true)
  })

  it('PLAY_AGAIN keeps config but clears assignment/outcome/elimination state', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config, bank, rng: () => 0 })
    s = gameReducer(s, { type: 'PLAY_AGAIN' })
    expect(s.screen).toBe('setup')
    expect(s.config).toEqual(config)
    expect(s.assignment).toBeNull()
    expect(s.eliminatedIds).toEqual([])
    expect(s.lastElimination).toBeNull()
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
