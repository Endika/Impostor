import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import App from '../../src/presentation/App'
import { ResultScreen } from '../../src/presentation/screens/ResultScreen'
import { initialState, type GameState } from '../../src/presentation/state/gameReducer'
import { loadGame, saveGame } from '../../src/presentation/state/gamePersistence'
import type { Assignment, GameConfig } from '../../src/domain/game/types'
import i18n from '../../src/presentation/i18n'

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo', 'Dan'],
  impostorCount: 1,
  randomImpostors: false,
  impostorSeesClue: false,
  impostorsSeeEachOther: false,
  differentCluePerImpostor: false,
  categoryIds: ['places'],
  locale: 'en',
}

const assignment: Assignment = {
  players: [
    { id: 'p0', name: 'Ana', isImpostor: false, clue: null },
    { id: 'p1', name: 'Ben', isImpostor: true, clue: null },
    { id: 'p2', name: 'Cleo', isImpostor: false, clue: null },
    { id: 'p3', name: 'Dan', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1'],
}

const midRound: GameState = {
  ...initialState,
  screen: 'round',
  config,
  assignment,
  revealIndex: 4,
  eliminatedIds: ['p2'],
}

describe('game lifecycle', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('resumes a game in progress after a reload', () => {
    saveGame(midRound)
    renderWithProviders(<App />)
    expect(screen.getByRole('button', { name: /^vote$/i })).toBeInTheDocument()
    expect(loadGame()?.eliminatedIds).toEqual(['p2'])
  })

  it('forgets the game once it is over', () => {
    saveGame(midRound)
    saveGame({ ...midRound, screen: 'result' })
    expect(loadGame()).toBeNull()
  })

  it('ignores a stored game it cannot use', () => {
    window.localStorage.setItem('impostor.game', '{"screen":"round"}')
    expect(loadGame()).toBeNull()
    window.localStorage.setItem('impostor.game', 'not json')
    expect(loadGame()).toBeNull()
  })

  it('leaves a game after confirming, keeping the players', () => {
    saveGame(midRound)
    renderWithProviders(<App />)

    fireEvent.click(screen.getByRole('button', { name: /^leave$/i }))
    expect(screen.getByRole('button', { name: /^vote$/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /really leave/i }))

    expect(screen.getByRole('heading', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cleo')).toBeInTheDocument()
    expect(loadGame()).toBeNull()
  })

  it('moves focus to the new screen heading', () => {
    saveGame(midRound)
    renderWithProviders(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^vote$/i }))
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('names who guessed the word on the result', () => {
    renderWithProviders(<ResultScreen />, {
      initialState: {
        ...midRound,
        screen: 'result',
        outcome: {
          winner: 'impostors',
          votedWasImpostor: true,
          word: 'Playa',
          impostorIds: ['p1'],
        },
        guesserId: 'p1',
      },
    })
    expect(screen.getByText('Ben guessed the word')).toBeInTheDocument()
    expect(screen.queryByText(/was the impostor/i)).not.toBeInTheDocument()
  })

  it('keeps the page language in step with the app', async () => {
    await i18n.changeLanguage('eu')
    expect(document.documentElement.lang).toBe('eu')
    await i18n.changeLanguage('va')
    expect(document.documentElement.lang).toBe('ca-valencia')
    await i18n.changeLanguage('en')
  })
})
