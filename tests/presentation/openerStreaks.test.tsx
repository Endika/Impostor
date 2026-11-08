import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryWordBank } from '../../src/domain/content/InMemoryWordBank'
import type { GameConfig } from '../../src/domain/game/types'
import { gameReducer, initialState } from '../../src/presentation/state/gameReducer'
import { saveGame } from '../../src/presentation/state/gamePersistence'
import { loadOpenerStreaks, recordOpener } from '../../src/presentation/state/openerStreaks'
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
  return gameReducer(initialState, {
    type: 'START_GAME',
    config,
    bank,
    rng: mulberry32(5),
  }).assignment!
}

describe('opener streaks storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('accumulates over consecutive rounds and resets the others', () => {
    const a = deal()
    const [ana, ben] = a.players
    recordOpener(a, 1, a.players, ana!.id)
    recordOpener(a, 2, a.players, ana!.id)
    expect(loadOpenerStreaks()).toEqual({ Ana: 2, Ben: 0, Cleo: 0, Dan: 0 })
    recordOpener(a, 3, a.players, ben!.id)
    expect(loadOpenerStreaks()).toEqual({ Ana: 0, Ben: 1, Cleo: 0, Dan: 0 })
  })

  it('does not count the same round twice', () => {
    const a = deal()
    recordOpener(a, 1, a.players, a.players[0]!.id)
    recordOpener(a, 1, a.players, a.players[0]!.id)
    expect(loadOpenerStreaks().Ana).toBe(1)
  })

  it('keeps the streak of eliminated players', () => {
    const a = deal()
    recordOpener(a, 1, a.players, a.players[0]!.id)
    recordOpener(a, 2, a.players.slice(1), a.players[1]!.id)
    expect(loadOpenerStreaks()).toEqual({ Ana: 1, Ben: 1, Cleo: 0, Dan: 0 })
  })

  it('does not count twice when a saved game is restored on reload', () => {
    const started = gameReducer(initialState, {
      type: 'START_GAME',
      config,
      bank,
      rng: mulberry32(5),
    })
    const withStarter = gameReducer(started, {
      type: 'SET_STARTER',
      playerId: started.assignment!.players[1]!.id,
    })
    saveGame(withStarter)
    const first = renderWithProviders(<App />)
    expect(loadOpenerStreaks().Ben).toBe(1)
    first.unmount()
    renderWithProviders(<App />)
    expect(loadOpenerStreaks().Ben).toBe(1)
  })
})
