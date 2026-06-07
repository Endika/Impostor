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
    { id: 'p1', name: 'Ana', isImpostor: true },
    { id: 'p2', name: 'Ben', isImpostor: false },
    { id: 'p3', name: 'Cleo', isImpostor: false },
    { id: 'p4', name: 'Dan', isImpostor: false },
  ],
  word: 'Playa',
  categoryId: 'places',
  clue: null,
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

describe('EliminationScreen', () => {
  it('shows the eliminated player was not an impostor and the remaining count', () => {
    renderWithProviders(<EliminationScreen />, { initialState: state })
    expect(screen.getByText(/ben was not an impostor/i)).toBeInTheDocument()
    expect(
      screen.getByText(/2 crew vs 1 impostors left/i),
    ).toBeInTheDocument()
  })

  it('dispatches NEXT_ROUND when clicking Next round', () => {
    renderWithProviders(
      <>
        <EliminationScreen />
        <ScreenProbe />
      </>,
      { initialState: state },
    )
    fireEvent.click(screen.getByRole('button', { name: /next round/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('round')
  })
})
