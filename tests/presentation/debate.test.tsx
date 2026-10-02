import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { RoundScreen } from '../../src/presentation/screens/RoundScreen'
import { ResultScreen } from '../../src/presentation/screens/ResultScreen'
import { useGame } from '../../src/presentation/state/useGame'
import { gameReducer, initialState, type GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment, GameConfig } from '../../src/domain/game/types'

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
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
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1'],
}

const round: GameState = { ...initialState, screen: 'round', config, assignment }

function Probe() {
  const { state } = useGame()
  return (
    <div>
      <span data-testid="screen">{state.screen}</span>
      <span data-testid="starter">{state.starterId}</span>
      <span data-testid="word">{state.assignment?.word}</span>
    </div>
  )
}

describe('debate screen', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists everyone and marks who is out', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, {
      initialState: { ...round, eliminatedIds: ['p2'] },
    })
    const players = screen.getByRole('list', { name: /players/i })
    expect(players).toHaveTextContent('Ana')
    expect(players).toHaveTextContent(/cleo\s*out/i)
  })

  it('keeps the starter for the whole round', () => {
    const { unmount } = renderWithProviders(
      <>
        <RoundScreen rng={() => 0.99} />
        <Probe />
      </>,
      { initialState: { ...round, starterId: 'p0' } },
    )
    // A stored starter wins over a fresh draw (which would pick Cleo).
    expect(screen.getByText(/ana starts/i)).toBeInTheDocument()
    unmount()
  })

  it('records the drawn starter in the game', () => {
    renderWithProviders(
      <>
        <RoundScreen rng={() => 0.99} />
        <Probe />
      </>,
      { initialState: round },
    )
    expect(screen.getByTestId('starter')).toHaveTextContent('p2')
  })

  it('counts down an optional timer and calls time', () => {
    vi.useFakeTimers()
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: round })
    fireEvent.click(screen.getByRole('radio', { name: '1 min' }))
    expect(screen.getByRole('timer')).toHaveTextContent('1:00')

    fireEvent.click(screen.getByRole('button', { name: /start timer/i }))
    act(() => {
      vi.advanceTimersByTime(31_000)
    })
    expect(screen.getByRole('timer')).toHaveTextContent('0:29')

    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByRole('timer')).toHaveTextContent(/time!/i)
    expect(window.localStorage.getItem('impostor.timerMinutes')).toBe('1')
  })

  it('keeps the countdown running across a guess round trip', () => {
    vi.useFakeTimers()
    const first = renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: round })
    fireEvent.click(screen.getByRole('radio', { name: '2 min' }))
    fireEvent.click(screen.getByRole('button', { name: /start timer/i }))
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    first.unmount()

    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: round })
    expect(screen.getByRole('timer')).toHaveTextContent('1:50')
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('opens the rules', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: round })
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }))
    expect(screen.getByText(/everyone gets the same secret word/i)).toBeInTheDocument()
  })

  it('numbers the rounds', () => {
    let s: GameState = { ...round, screen: 'elimination' }
    s = gameReducer(s, { type: 'NEXT_ROUND' })
    expect(s.round).toBe(2)
    expect(s.starterId).toBeNull()
  })
})

describe('rematch', () => {
  it('deals a new word with the same players and goes straight to the reveal', () => {
    renderWithProviders(
      <>
        <ResultScreen />
        <Probe />
      </>,
      {
        initialState: {
          ...round,
          screen: 'result',
          votedPlayerId: 'p1',
          eliminatedIds: ['p1'],
          outcome: { winner: 'crew', votedWasImpostor: true, word: 'Playa', impostorIds: ['p1'] },
        },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: /rematch/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
    expect(screen.getByTestId('word').textContent).not.toBe('')
  })
})
