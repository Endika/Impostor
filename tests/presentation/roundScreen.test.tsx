import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { RoundScreen } from '../../src/presentation/screens/RoundScreen'
import { useGame } from '../../src/presentation/state/useGame'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment } from '../../src/domain/game/types'

function ScreenProbe() {
  const { state } = useGame()
  return <span data-testid="screen">{state.screen}</span>
}

const assignment: Assignment = {
  players: [
    { id: 'p0', name: 'Ana', isImpostor: false },
    { id: 'p1', name: 'Ben', isImpostor: true },
    { id: 'p2', name: 'Cleo', isImpostor: false },
  ],
  word: 'Playa',
  categoryId: 'places',
  clue: null,
  impostorIds: ['p1'],
}

const state: GameState = {
  screen: 'round',
  config: null,
  assignment,
  revealIndex: 3,
  outcome: null,
  votedPlayerId: null,
  eliminatedIds: [],
  lastElimination: null,
}

describe('RoundScreen', () => {
  it('announces the random starting player (deterministic rng)', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: state })
    expect(screen.getByText(/ana starts/i)).toBeInTheDocument()
  })

  it('does not pick an eliminated player as the starter', () => {
    const withElim: GameState = { ...state, eliminatedIds: ['p0'] }
    renderWithProviders(<RoundScreen rng={() => 0} />, {
      initialState: withElim,
    })
    // rng=0 would pick the first player (Ana/p0), but she is eliminated,
    // so the first alive player (Ben) starts instead.
    expect(screen.getByText(/ben starts/i)).toBeInTheDocument()
    expect(screen.queryByText(/ana starts/i)).not.toBeInTheDocument()
  })

  it('shows the round title and a vote button, with no countdown timer', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: state })
    expect(screen.getByText(/discuss/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument()
    // No timer of any kind on this screen.
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('timer')).not.toBeInTheDocument()
  })

  it('dispatches END_ROUND when clicking Vote, moving to the vote screen', () => {
    renderWithProviders(
      <>
        <RoundScreen rng={() => 0} />
        <ScreenProbe />
      </>,
      { initialState: state },
    )
    fireEvent.click(screen.getByRole('button', { name: /vote/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('vote')
  })
})
