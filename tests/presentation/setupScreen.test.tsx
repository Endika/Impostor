import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/renderWithProviders'
import { SetupScreen } from '../../src/presentation/screens/SetupScreen'
import { useGame } from '../../src/presentation/state/useGame'

function ScreenProbe() {
  const { state } = useGame()
  return <div data-testid="screen">{state.screen}</div>
}

function fillPlayer(index: number, name: string) {
  const inputs = screen.getAllByLabelText(/player name/i)
  fireEvent.change(inputs[index]!, { target: { value: name } })
}

function setup() {
  return renderWithProviders(
    <>
      <SetupScreen />
      <ScreenProbe />
    </>,
  )
}

describe('SetupScreen', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the invalid impostor count error when a fixed count exceeds players-1', () => {
    // A prefilled, out-of-range fixed count surfaces the validation error on
    // start (3 players -> max 2; a stored count of 3 is invalid).
    window.localStorage.setItem(
      'impostor.config',
      JSON.stringify({
        players: ['Ana', 'Ben', 'Cleo'],
        impostorCount: 3,
        randomImpostors: false,
        impostorSeesClue: false,
        impostorsSeeEachOther: false,
        differentCluePerImpostor: false,
        categoryIds: ['home'],
        locale: 'en',
      }),
    )
    setup()

    const count = screen.getByLabelText(
      /^number of impostors$/i,
    ) as HTMLInputElement
    expect(count.value).toBe('3')

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByText(/choose between 1 and/i)).toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
  })

  it('dispatches START_GAME and transitions to reveal with a valid fixed count', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const count = screen.getByLabelText(
      /^number of impostors$/i,
    ) as HTMLInputElement
    fireEvent.change(count, { target: { value: '2' } })

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.queryByText(/choose between 1 and/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
  })

  it('dispatches START_GAME and transitions to reveal with a valid config', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
  })

  it('clamps the count down when the player count drops', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')
    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    fillPlayer(3, 'Dan')

    const count = screen.getByLabelText(
      /^number of impostors$/i,
    ) as HTMLInputElement
    // 4 players -> max 3 impostors.
    fireEvent.change(count, { target: { value: '3' } })
    expect(count.value).toBe('3')

    // Remove a player: max drops to 2, so the count is clamped.
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0]!)
    expect(count.value).toBe('2')
  })

  it('disables the count stepper and starts a random game when the random toggle is on', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const toggle = screen.getByRole('checkbox', {
      name: /random number of impostors/i,
    }) as HTMLInputElement
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()

    const count = screen.getByLabelText(
      /^number of impostors$/i,
    ) as HTMLInputElement
    expect(count).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
    const saved = JSON.parse(
      window.localStorage.getItem('impostor.config') ?? '{}',
    )
    expect(saved.randomImpostors).toBe(true)
  })

  it('renders chips for the new categories', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Animals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cinema' })).toBeInTheDocument()
  })

  it('prefills the form from a previously saved config', () => {
    window.localStorage.setItem(
      'impostor.config',
      JSON.stringify({
        players: ['Zoe', 'Yan', 'Xal', 'Wim'],
        impostorCount: 1,
        randomImpostors: false,
        impostorSeesClue: true,
        impostorsSeeEachOther: false,
        categoryIds: ['music'],
        locale: 'en',
      }),
    )
    setup()
    const inputs = screen.getAllByLabelText(
      /player name/i,
    ) as HTMLInputElement[]
    expect(inputs).toHaveLength(4)
    expect(inputs[0]!.value).toBe('Zoe')
    expect(inputs[3]!.value).toBe('Wim')
  })

  it('renders the different-clue toggle, disabled while clues are off', () => {
    setup()
    const toggle = screen.getByRole('checkbox', {
      name: /each impostor gets a different clue/i,
    }) as HTMLInputElement
    expect(toggle).toBeInTheDocument()
    // Clues default off -> toggle disabled.
    expect(toggle).toBeDisabled()
  })

  it('keeps the different-clue toggle disabled when fewer than 2 impostors', () => {
    setup()
    // Turn clues on but leave the fixed count at 1.
    fireEvent.click(screen.getByRole('checkbox', { name: /see a clue/i }))
    const toggle = screen.getByRole('checkbox', {
      name: /each impostor gets a different clue/i,
    }) as HTMLInputElement
    expect(toggle).toBeDisabled()
  })

  it('enables the different-clue toggle when clues are on and the count is >= 2', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')
    fireEvent.click(screen.getByRole('checkbox', { name: /see a clue/i }))
    const count = screen.getByLabelText(
      /^number of impostors$/i,
    ) as HTMLInputElement
    fireEvent.change(count, { target: { value: '2' } })

    const toggle = screen.getByRole('checkbox', {
      name: /each impostor gets a different clue/i,
    }) as HTMLInputElement
    expect(toggle).not.toBeDisabled()

    fireEvent.click(toggle)
    expect(toggle).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    // Valid config -> game starts; the persisted config carries the flag.
    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
    const saved = JSON.parse(
      window.localStorage.getItem('impostor.config') ?? '{}',
    )
    expect(saved.differentCluePerImpostor).toBe(true)
  })

  it('shows the duplicate names error', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ana')
    fillPlayer(2, 'Cleo')

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByText(/names must be different/i)).toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
  })
})
