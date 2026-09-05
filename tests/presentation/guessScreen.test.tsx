import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { GuessScreen } from '../../src/presentation/screens/GuessScreen'
import { EliminationScreen } from '../../src/presentation/screens/EliminationScreen'
import { useGame } from '../../src/presentation/state/useGame'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment } from '../../src/domain/game/types'

function ScreenProbe() {
  const { state } = useGame()
  return <span data-testid="screen">{state.screen}</span>
}

function StateProbe() {
  const { state } = useGame()
  return (
    <div>
      <span data-testid="screen">{state.screen}</span>
      <span data-testid="winner">{state.outcome ? state.outcome.winner : ''}</span>
      <span data-testid="eliminated">{state.eliminatedIds.join(',')}</span>
      <span data-testid="failedGuess">{String(state.lastElimination?.fromFailedGuess ?? '')}</span>
    </div>
  )
}

// 5 players, 2 impostors (p1, p3).
const assignment: Assignment = {
  players: [
    { id: 'p0', name: 'Ana', isImpostor: false, clue: null },
    { id: 'p1', name: 'Ben', isImpostor: true, clue: null },
    { id: 'p2', name: 'Cleo', isImpostor: false, clue: null },
    { id: 'p3', name: 'Dan', isImpostor: true, clue: null },
    { id: 'p4', name: 'Eve', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1', 'p3'],
}

const baseState: GameState = {
  screen: 'guess',
  config: null,
  assignment,
  revealIndex: 5,
  outcome: null,
  votedPlayerId: null,
  eliminatedIds: [],
  lastElimination: null,
}

describe('GuessScreen', () => {
  it('lists alive players and lets a correct guess win for the impostors', () => {
    renderWithProviders(
      <>
        <GuessScreen />
        <StateProbe />
      </>,
      { initialState: baseState },
    )
    // Step 1: who is guessing
    expect(screen.getByText(/who is guessing/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^ben$/i }))

    // Step 2: say the word, then confirm correct
    expect(screen.getByText(/say the word out loud/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /got it right/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('result')
    expect(screen.getByTestId('winner')).toHaveTextContent('impostors')
  })

  it('eliminates a wrong crew guesser and goes to the elimination screen', () => {
    renderWithProviders(
      <>
        <GuessScreen />
        <StateProbe />
      </>,
      { initialState: baseState },
    )
    fireEvent.click(screen.getByRole('button', { name: /^ana$/i }))
    fireEvent.click(screen.getByRole('button', { name: /got it wrong/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('elimination')
    expect(screen.getByTestId('failedGuess')).toHaveTextContent('true')
    expect(screen.getByTestId('eliminated')).toHaveTextContent('p0')
  })

  it('returns to the round when clicking Back', () => {
    renderWithProviders(
      <>
        <GuessScreen />
        <ScreenProbe />
      </>,
      { initialState: baseState },
    )
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('round')
  })

  it('crew wins when the last impostor guesses wrong', () => {
    // One impostor (p3) already eliminated; p1 is the last impostor alive.
    const lastImpostor: GameState = {
      ...baseState,
      eliminatedIds: ['p3'],
    }
    renderWithProviders(
      <>
        <GuessScreen />
        <EliminationScreen />
        <StateProbe />
      </>,
      { initialState: lastImpostor },
    )
    fireEvent.click(screen.getByRole('button', { name: /^ben$/i }))
    fireEvent.click(screen.getByRole('button', { name: /got it wrong/i }))

    // Removing the last impostor is a terminal crew win.
    expect(screen.getByTestId('screen')).toHaveTextContent('elimination')
    expect(screen.getByTestId('winner')).toHaveTextContent('crew')

    fireEvent.click(screen.getByRole('button', { name: /see result/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('result')
  })
})
