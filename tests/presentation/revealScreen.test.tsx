import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { RevealScreen } from '../../src/presentation/screens/RevealScreen'
import { useGame } from '../../src/presentation/state/useGame'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment, GameConfig } from '../../src/domain/game/types'

function ScreenProbe() {
  const { state } = useGame()
  return (
    <div>
      <span data-testid="screen">{state.screen}</span>
      <span data-testid="index">{state.revealIndex}</span>
    </div>
  )
}

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo', 'Dan'],
  impostorMin: 2,
  impostorMax: 2,
  impostorSeesClue: true,
  impostorsSeeEachOther: true,
  categoryIds: ['home'],
  locale: 'en',
}

const assignment: Assignment = {
  players: [
    { id: 'p0', name: 'Ana', isImpostor: false },
    { id: 'p1', name: 'Ben', isImpostor: true },
    { id: 'p2', name: 'Cleo', isImpostor: true },
    { id: 'p3', name: 'Dan', isImpostor: false },
  ],
  word: 'Playa',
  categoryId: 'places',
  clue: 'Tiempo',
  impostorIds: ['p1', 'p2'],
}

function buildState(revealIndex: number): GameState {
  return {
    screen: 'reveal',
    config,
    assignment,
    revealIndex,
    outcome: null,
  }
}

function render(revealIndex: number) {
  return renderWithProviders(
    <>
      <RevealScreen />
      <ScreenProbe />
    </>,
    { initialState: buildState(revealIndex) },
  )
}

describe('RevealScreen', () => {
  it('hides the role until the card is held', () => {
    render(0)
    expect(screen.getByText(/pass the phone to ana/i)).toBeInTheDocument()
    expect(screen.getByText(/hold to see your role/i)).toBeInTheDocument()
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('reveals the word for a crew player only while held', () => {
    render(0)
    const card = screen.getByTestId('reveal-card')

    fireEvent.pointerDown(card)
    expect(screen.getByText('Playa')).toBeInTheDocument()
    expect(screen.getByText(/you are crew/i)).toBeInTheDocument()

    fireEvent.pointerUp(card)
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('reveals impostor role, the word hint, and other impostors', () => {
    render(1) // Ben is an impostor
    const card = screen.getByTestId('reveal-card')

    fireEvent.pointerDown(card)
    expect(screen.getByText(/you are the impostor/i)).toBeInTheDocument()
    expect(screen.getByText('Tiempo')).toBeInTheDocument()
    // other impostor (Cleo) is shown, current impostor (Ben) is not listed as "other"
    expect(screen.getByText(/cleo/i)).toBeInTheDocument()
  })

  it('advances revealIndex when clicking next player', () => {
    render(0)
    fireEvent.click(screen.getByRole('button', { name: /next player/i }))
    expect(screen.getByTestId('index')).toHaveTextContent('1')
  })

  it('moves to round after the last player', () => {
    render(3) // last player
    fireEvent.click(screen.getByRole('button', { name: /next player/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('round')
  })
})
