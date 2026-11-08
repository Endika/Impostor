import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameConfig } from '../../src/domain/game/types'
import { gameReducer, initialState } from '../../src/presentation/state/gameReducer'
import { saveGame } from '../../src/presentation/state/gamePersistence'
import { loadImpostorStreaks, recordAssignment } from '../../src/presentation/state/impostorStreaks'
import { renderWithProviders } from '../helpers/renderWithProviders'
import App from '../../src/presentation/App'
import { mulberry32 } from '../helpers/mulberry32'

const bank = new InMemoryWordBank({
  home: { en: [{ word: 'Beach', hints: ['Coast', 'Sand'] }] },
})
const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo', 'Dan'],
  impostorCount: 1,
  randomImpostors: false,
  impostorSeesClue: false,
  impostorsSeeEachOther: false,
  differentCluePerImpostor: false,
  categoryIds: ['home'],
  locale: 'en',
}

function deal() {
  const state = gameReducer(initialState, {
    type: 'START_GAME',
    config,
    bank,
    rng: mulberry32(11),
    impostorStreaks: loadImpostorStreaks(),
  })
  return state.assignment!
}

describe('impostor streaks storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('accumulates streaks over consecutive deals', () => {
    const first = deal()
    recordAssignment(first)
    const second = deal()
    recordAssignment(second)
    const impostor = first.players.find((p) => p.isImpostor)!.name
    const streaks = loadImpostorStreaks()
    const again = second.players.find((p) => p.isImpostor)!.name === impostor
    const expected = again ? 2 : 0
    expect(streaks[impostor]).toBe(expected)
  })

  it('does not count the same deal twice', () => {
    const a = deal()
    recordAssignment(a)
    recordAssignment({ ...a })
    const impostor = a.players.find((p) => p.isImpostor)!.name
    expect(loadImpostorStreaks()[impostor]).toBe(1)
  })

  it('sanitizes invalid stored values to 0', () => {
    window.localStorage.setItem(
      'impostor.impostorStreaks',
      JSON.stringify({ lastAssignmentId: null, streaks: { Ana: -1, Ben: 1.5, Cleo: 'x', Dan: 2 } }),
    )
    expect(loadImpostorStreaks()).toEqual({ Ana: 0, Ben: 0, Cleo: 0, Dan: 2 })
  })

  it('survives corrupt storage', () => {
    window.localStorage.setItem('impostor.impostorStreaks', '{nope')
    expect(loadImpostorStreaks()).toEqual({})
  })

  it('does not add twice when a saved game is restored on reload', () => {
    const started = gameReducer(initialState, {
      type: 'START_GAME',
      config,
      bank,
      rng: mulberry32(5),
    })
    saveGame(started)
    const impostor = started.assignment!.players.find((p) => p.isImpostor)!.name
    const first = renderWithProviders(<App />)
    expect(loadImpostorStreaks()[impostor]).toBe(1)
    first.unmount()
    renderWithProviders(<App />)
    expect(loadImpostorStreaks()[impostor]).toBe(1)
  })
})
