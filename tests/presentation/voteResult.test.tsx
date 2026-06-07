import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { VoteScreen } from '../../src/presentation/screens/VoteScreen'
import { ResultScreen } from '../../src/presentation/screens/ResultScreen'
import { useGame } from '../../src/presentation/state/useGame'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment, GameConfig, GameOutcome } from '../../src/domain/game/types'

function ScreenProbe() {
  const { state } = useGame()
  return (
    <div>
      <span data-testid="screen">{state.screen}</span>
      <span data-testid="winner">{state.outcome?.winner ?? ''}</span>
      <span data-testid="config-players">
        {state.config?.players.join(',') ?? ''}
      </span>
    </div>
  )
}

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorCount: 1,
  randomImpostors: false,
  impostorSeesClue: true,
  impostorsSeeEachOther: false,
  differentCluePerImpostor: false,
  categoryIds: ['home'],
  locale: 'en',
}

const assignment: Assignment = {
  players: [
    { id: 'p1', name: 'Ana', isImpostor: false, clue: null },
    { id: 'p2', name: 'Ben', isImpostor: true, clue: null },
    { id: 'p3', name: 'Cleo', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p2'],
}

describe('VoteScreen', () => {
  it('casts a vote and lands on the elimination screen with the preset outcome', () => {
    const state: GameState = {
      screen: 'vote',
      config,
      assignment,
      revealIndex: 3,
      outcome: null,
      votedPlayerId: null,
      eliminatedIds: [],
      lastElimination: null,
    }
    renderWithProviders(
      <>
        <VoteScreen />
        <ScreenProbe />
      </>,
      { initialState: state },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ben' }))
    fireEvent.click(screen.getByRole('button', { name: /confirm vote/i }))

    // CAST_VOTE always lands on the elimination screen now, even on a
    // terminal status, so the eliminated impostor can still guess the word.
    // The terminal outcome is preset for the eventual result screen.
    expect(screen.getByTestId('screen')).toHaveTextContent('elimination')
    expect(screen.getByTestId('winner')).toHaveTextContent('crew')
  })

  it('does not list players that have already been eliminated', () => {
    const state: GameState = {
      screen: 'vote',
      config,
      assignment,
      revealIndex: 3,
      outcome: null,
      votedPlayerId: 'p3',
      eliminatedIds: ['p3'],
      lastElimination: null,
    }
    renderWithProviders(<VoteScreen />, { initialState: state })

    expect(screen.getByRole('button', { name: 'Ana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ben' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Cleo' }),
    ).not.toBeInTheDocument()
  })
})

describe('ResultScreen (crew win)', () => {
  const outcome: GameOutcome = {
    winner: 'crew',
    votedWasImpostor: true,
    word: 'Playa',
    impostorIds: ['p2'],
  }
  const state: GameState = {
    screen: 'result',
    config,
    assignment,
    revealIndex: 3,
    outcome,
    votedPlayerId: 'p2',
    eliminatedIds: ['p2'],
    lastElimination: null,
  }

  it('reveals the voted player was the impostor and the crew won', () => {
    renderWithProviders(<ResultScreen />, { initialState: state })
    expect(screen.getByText(/ben was the impostor/i)).toBeInTheDocument()
    expect(screen.getByText(/the crew wins/i)).toBeInTheDocument()
    expect(screen.getByText('Playa')).toBeInTheDocument()
    // impostor name under "the impostors were"
    expect(screen.getByText(/the impostors were/i)).toBeInTheDocument()
    expect(screen.getByText('Ben')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /play again/i }),
    ).toBeInTheDocument()
  })

  it('returns to setup keeping the config on Play again', () => {
    renderWithProviders(
      <>
        <ResultScreen />
        <ScreenProbe />
      </>,
      { initialState: state },
    )
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
    expect(screen.getByTestId('config-players')).toHaveTextContent(
      'Ana,Ben,Cleo',
    )
  })
})

describe('ResultScreen (impostor win)', () => {
  it('shows the voted player was not the impostor and the impostors won', () => {
    const outcome: GameOutcome = {
      winner: 'impostors',
      votedWasImpostor: false,
      word: 'Playa',
      impostorIds: ['p2'],
    }
    const state: GameState = {
      screen: 'result',
      config,
      assignment,
      revealIndex: 3,
      outcome,
      votedPlayerId: 'p1',
      eliminatedIds: ['p1'],
      lastElimination: null,
    }
    renderWithProviders(<ResultScreen />, { initialState: state })
    expect(screen.getByText(/ana was not the impostor/i)).toBeInTheDocument()
    expect(screen.getByText(/the impostors win/i)).toBeInTheDocument()
  })
})
