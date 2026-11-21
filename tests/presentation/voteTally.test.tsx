import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { VoteScreen } from '../../src/presentation/screens/VoteScreen'
import { useGame } from '../../src/presentation/state/useGame'
import { initialState, type GameState } from '../../src/presentation/state/gameReducer'
import type { Assignment, GameConfig } from '../../src/domain/game/types'

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

const voteState: GameState = {
  ...initialState,
  screen: 'vote',
  config,
  assignment,
  revealIndex: 3,
  round: 2,
  starterId: 'p3',
}

function Probe() {
  const { state } = useGame()
  return (
    <span data-testid="probe">
      {[state.screen, state.round, state.starterId ?? 'none', state.eliminatedIds.join('+')].join(
        '|',
      )}
    </span>
  )
}

function renderVote() {
  renderWithProviders(
    <>
      <VoteScreen />
      <Probe />
    </>,
    { initialState: voteState },
  )
}

const row = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}:`) })
const tap = (name: string, times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(row(name))
}
const primary = () =>
  screen.getAllByRole('button').find((b) => /Eliminate|Tie/.test(b.textContent ?? ''))

describe('VoteScreen tally', () => {
  it('starts empty with a disabled primary button', () => {
    renderVote()
    expect(screen.getByText('Votes: 0 of 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove a vote/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Eliminate/ })).toBeDisabled()
  })

  it('eliminates the strict leader', () => {
    renderVote()
    tap('Ana', 2)
    tap('Ben')
    expect(screen.getByText('Votes: 3 of 3')).toBeInTheDocument()
    expect(row('Ana')).toHaveAccessibleName('Ana: 2 votes')
    fireEvent.click(primary()!)
    expect(screen.getByTestId('probe')).toHaveTextContent('elimination|2|p3|p1')
  })

  it('offers another round on a tie and redraws the opener', () => {
    renderVote()
    tap('Ana')
    tap('Ben')
    fireEvent.click(screen.getByRole('button', { name: 'Tie: another round' }))
    expect(screen.getByTestId('probe')).toHaveTextContent('round|3|none|')
  })

  it('removes votes with the minus button without adding one', () => {
    renderVote()
    tap('Ana', 2)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a vote from Ana' }))
    expect(row('Ana')).toHaveAccessibleName('Ana: 1 vote')
    expect(screen.getByText('Votes: 1 of 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove a vote from Ana' }))
    expect(screen.queryByRole('button', { name: /remove a vote/i })).not.toBeInTheDocument()
    expect(screen.getByText('Votes: 0 of 3')).toBeInTheDocument()
  })

  it('stops counting at the number of alive players but still allows removing', () => {
    renderVote()
    tap('Ana', 2)
    tap('Ben')
    tap('Cleo')
    expect(screen.getByText('Votes: 3 of 3')).toBeInTheDocument()
    expect(row('Cleo')).toHaveAccessibleName('Cleo: 0 votes')
    fireEvent.click(screen.getByRole('button', { name: 'Remove a vote from Ben' }))
    tap('Cleo')
    expect(row('Cleo')).toHaveAccessibleName('Cleo: 1 vote')
  })

  it('cancels back to the same round without eliminating anyone', () => {
    renderVote()
    tap('Ana')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByTestId('probe')).toHaveTextContent('round|2|p3|')
  })
})
