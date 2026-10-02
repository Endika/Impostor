import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
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
  impostorCount: 2,
  randomImpostors: false,
  impostorSeesClue: true,
  impostorsSeeEachOther: true,
  differentCluePerImpostor: false,
  categoryIds: ['home'],
  locale: 'en',
}

const assignment: Assignment = {
  players: [
    { id: 'p0', name: 'Ana', isImpostor: false, clue: null },
    { id: 'p1', name: 'Ben', isImpostor: true, clue: 'Tiempo' },
    { id: 'p2', name: 'Cleo', isImpostor: true, clue: 'Tiempo' },
    { id: 'p3', name: 'Dan', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1', 'p2'],
}

function buildState(revealIndex: number): GameState {
  return {
    screen: 'reveal',
    config,
    assignment,
    revealIndex,
    outcome: null,
    votedPlayerId: null,
    eliminatedIds: [],
    lastElimination: null,
    guesserId: null,
    round: 1,
    starterId: null,
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
    expect(within(card).getByText('Playa')).toBeInTheDocument()
    expect(within(card).getByText(/you are crew/i)).toBeInTheDocument()

    fireEvent.pointerUp(card)
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('reveals impostor role, the word hint, and other impostors', () => {
    render(1) // Ben is an impostor
    const card = screen.getByTestId('reveal-card')

    fireEvent.pointerDown(card)
    expect(within(card).getByText(/you are the impostor/i)).toBeInTheDocument()
    expect(within(card).getByText('Tiempo')).toBeInTheDocument()
    // other impostor (Cleo) is shown, current impostor (Ben) is not listed as "other"
    expect(within(card).getByText(/cleo/i)).toBeInTheDocument()
  })

  it('gives crew and impostors the exact same card so nobody reads it from afar', () => {
    // Same surface and the same skeleton: every child in the same slot with
    // the same type size, whatever the role.
    const backOf = (index: number) => {
      const { unmount } = render(index)
      const card = screen.getByTestId('reveal-card')
      fireEvent.pointerDown(card)
      const back = card.querySelector('.flip-back')!
      const shape = [back.className, ...[...back.children].map((c) => c.className)].join('|')
      unmount()
      return shape
    }
    expect(backOf(0)).toBe(backOf(1))
  })

  it('reveals while Space is held and hides on release', () => {
    render(0)
    const card = screen.getByTestId('reveal-card')

    fireEvent.keyDown(card, { key: ' ' })
    expect(within(card).getByText('Playa')).toBeInTheDocument()
    fireEvent.keyUp(card, { key: ' ' })
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(within(card).getByText('Playa')).toBeInTheDocument()
  })

  it('announces the role to screen readers only while revealed', () => {
    render(0)
    const card = screen.getByTestId('reveal-card')
    fireEvent.pointerDown(card)
    expect(screen.getByText(/you are crew\. playa\. /i)).toBeInTheDocument()
    fireEvent.pointerUp(card)
    expect(screen.queryByText(/you are crew\. playa/i)).not.toBeInTheDocument()
  })

  it('only lets the phone move on after the player has seen the card', () => {
    render(0)
    const next = screen.getByRole('button', { name: /next player/i })
    expect(next).toBeDisabled()

    const card = screen.getByTestId('reveal-card')
    fireEvent.pointerDown(card)
    fireEvent.pointerUp(card)
    expect(next).toBeEnabled()

    fireEvent.click(next)
    expect(screen.getByTestId('index')).toHaveTextContent('1')
    // The next player starts locked again.
    expect(screen.getByRole('button', { name: /next player/i })).toBeDisabled()
  })

  it('moves focus to the next player heading after passing the phone', () => {
    render(0)
    const card = screen.getByTestId('reveal-card')
    fireEvent.pointerDown(card)
    fireEvent.pointerUp(card)
    fireEvent.click(screen.getByRole('button', { name: /next player/i }))
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: /pass the phone to ben/i }),
    )
  })

  it('lets the last player start the debate', () => {
    render(3) // last player
    const card = screen.getByTestId('reveal-card')
    fireEvent.pointerDown(card)
    fireEvent.pointerUp(card)
    fireEvent.click(screen.getByRole('button', { name: /start the debate/i }))
    expect(screen.getByTestId('screen')).toHaveTextContent('round')
  })
})
