import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { RoundScreen } from '../../src/presentation/screens/RoundScreen'
import type { GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment, GameConfig } from '../../src/domain/game/types'

const config: GameConfig = {
  players: ['Ana', 'Ben', 'Cleo'],
  impostorCount: 1,
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
    { id: 'p2', name: 'Cleo', isImpostor: false, clue: null },
  ],
  word: 'Playa',
  categoryId: 'places',
  impostorIds: ['p1'],
}

const state: GameState = {
  screen: 'round',
  config,
  assignment,
  revealIndex: 3,
  outcome: null,
  votedPlayerId: null,
  eliminatedIds: ['p2'],
  lastElimination: null,
  guesserId: null,
  round: 1,
  starterId: null,
}

function open(name: string) {
  renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: state })
  fireEvent.click(screen.getByRole('button', { name }))
}

function confirm() {
  fireEvent.click(screen.getByRole('button', { name: /yes, it's me/i }))
  return screen.getByTestId('reveal-card')
}

describe('peeking at your own card during the round', () => {
  it('asks who is asking before showing anything', () => {
    open('Ana')
    const dialog = screen.getByRole('dialog', { name: /are you ana\?/i })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(screen.queryByTestId('reveal-card')).not.toBeInTheDocument()
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('closes on Cancel and on Escape without revealing', () => {
    open('Ana')
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ana' }))
    // jsdom does not turn Escape into the native close event a browser fires
    fireEvent(screen.getByRole('dialog'), new Event('close'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the crew word only while the card is held', () => {
    open('Ana')
    const card = confirm()
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()

    fireEvent.pointerDown(card)
    expect(within(card).getByText('Playa')).toBeInTheDocument()
    fireEvent.pointerUp(card)
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('shows an impostor their title and clue, never the word', () => {
    open('Ben')
    const card = confirm()
    fireEvent.pointerDown(card)
    expect(within(card).getByText(/you are the impostor/i)).toBeInTheDocument()
    expect(within(card).getByText('Tiempo')).toBeInTheDocument()
    expect(screen.queryByText('Playa')).not.toBeInTheDocument()
  })

  it('closes the card with Done', () => {
    open('Ana')
    confirm()
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not make eliminated players tappable', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: state })
    expect(screen.queryByRole('button', { name: /cleo/i })).not.toBeInTheDocument()
    expect(screen.getByText('Cleo')).toBeInTheDocument()
  })

  it('hints that names can be tapped', () => {
    renderWithProviders(<RoundScreen rng={() => 0} />, { initialState: state })
    expect(screen.getByText(/tap your name to see your card again/i)).toBeInTheDocument()
  })
})
