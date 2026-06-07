import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { EliminationScreen } from '../../src/presentation/screens/EliminationScreen'
import { useGame } from '../../src/presentation/state/useGame'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment } from '../../src/domain/game/types'

function ScreenProbe() {
  const { state } = useGame()
  return <span data-testid="screen">{state.screen}</span>
}

const assignment: Assignment = {
  players: [
    { id: 'p1', name: 'Ana', isImpostor: true, clue: null },
    { id: 'p2', name: 'Ben', isImpostor: false, clue: null },
    { id: 'p3', name: 'Cleo', isImpostor: false, clue: null },
    { id: 'p4', name: 'Dan', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1'],
}

const state: GameState = {
  screen: 'elimination',
  config: null,
  assignment,
  revealIndex: 4,
  outcome: null,
  votedPlayerId: 'p2',
  eliminatedIds: ['p2'],
  lastElimination: {
    votedPlayerId: 'p2',
    votedWasImpostor: false,
    status: 'continue',
    aliveImpostorCount: 1,
    aliveCrewCount: 2,
  },
}

function ResultProbe() {
  const { state } = useGame()
  return (
    <span data-testid="winner">{state.outcome ? state.outcome.winner : ''}</span>
  )
}

describe('EliminationScreen', () => {
  it('shows a crew elimination with no guess button and continues to the next round', () => {
    renderWithProviders(
      <>
        <EliminationScreen />
        <ScreenProbe />
      </>,
      { initialState: state },
    )
    expect(screen.getByText(/ben was not an impostor/i)).toBeInTheDocument()
    expect(
      screen.getByText(/2 crew vs 1 impostors left/i),
    ).toBeInTheDocument()
    // Voted player was crew -> no last-chance guess section.
    expect(
      screen.queryByRole('button', { name: /they said it right/i }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next round/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('round')
  })

  it('shows the guess button when an impostor is eliminated and the game continues', () => {
    const impostorOut: GameState = {
      ...state,
      votedPlayerId: 'p1',
      eliminatedIds: ['p1'],
      lastElimination: {
        votedPlayerId: 'p1',
        votedWasImpostor: true,
        status: 'continue',
        aliveImpostorCount: 1,
        aliveCrewCount: 3,
      },
    }
    renderWithProviders(
      <>
        <EliminationScreen />
        <ScreenProbe />
        <ResultProbe />
      </>,
      { initialState: impostorOut },
    )
    expect(screen.getByText(/ana was an impostor/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /they said it right/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('result')
    expect(screen.getByTestId('winner')).toHaveTextContent('impostors')
  })

  it('shows See result on a terminal status and keeps the guess button', () => {
    const crewWin: GameState = {
      ...state,
      votedPlayerId: 'p1',
      eliminatedIds: ['p1'],
      outcome: {
        winner: 'crew',
        votedWasImpostor: true,
        word: 'Playa',
        impostorIds: ['p1'],
      },
      lastElimination: {
        votedPlayerId: 'p1',
        votedWasImpostor: true,
        status: 'crew_win',
        aliveImpostorCount: 0,
        aliveCrewCount: 3,
      },
    }
    renderWithProviders(
      <>
        <EliminationScreen />
        <ScreenProbe />
      </>,
      { initialState: crewWin },
    )
    // Last impostor could still steal it -> guess button present.
    expect(
      screen.getByRole('button', { name: /they said it right/i }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /see result/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('result')
  })
})
