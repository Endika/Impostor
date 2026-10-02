import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
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

function impostorCount() {
  const group = screen.getByRole('group', { name: /^number of impostors$/i })
  return within(group).getByRole('status').textContent
}

function setCount(target: number) {
  const more = screen.getByRole('button', { name: /more impostors/i })
  const fewer = screen.getByRole('button', { name: /fewer impostors/i })
  for (let i = 0; i < 10 && Number(impostorCount()) < target; i++) fireEvent.click(more)
  for (let i = 0; i < 10 && Number(impostorCount()) > target; i++) fireEvent.click(fewer)
}

function openSettings() {
  fireEvent.click(screen.getByRole('button', { name: /settings/i }))
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

    expect(impostorCount()).toBe('3')

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByText(/choose between 1 and/i)).toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
  })

  it('dispatches START_GAME and transitions to reveal with a valid fixed count', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    setCount(2)

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

    // 4 players -> max 3 impostors.
    setCount(3)
    expect(impostorCount()).toBe('3')
    expect(screen.getByRole('button', { name: /more impostors/i })).toBeDisabled()

    // Remove a player: max drops to 2, so the count is clamped.
    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[0]!)
    expect(impostorCount()).toBe('2')
  })

  it('disables the count stepper and starts a random game when the random toggle is on', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const toggle = screen.getByRole('switch', { name: /random number of impostors/i })
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()

    expect(screen.getByRole('button', { name: /more impostors/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /fewer impostors/i })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
    const saved = JSON.parse(window.localStorage.getItem('impostor.config') ?? '{}')
    expect(saved.randomImpostors).toBe(true)
  })

  it('renders chips for the new categories', () => {
    setup()
    openSettings()
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
    const inputs = screen.getAllByLabelText(/player name/i) as HTMLInputElement[]
    expect(inputs).toHaveLength(4)
    expect(inputs[0]!.value).toBe('Zoe')
    expect(inputs[3]!.value).toBe('Wim')
  })

  it('renders the different-clue toggle, disabled while clues are off', () => {
    setup()
    openSettings()
    const toggle = screen.getByRole('switch', { name: /each impostor gets a different clue/i })
    // Clues default off -> toggle disabled, and it says why.
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveAccessibleDescription(/turn on the clue first/i)
    expect(toggle).toHaveAccessibleName('Each impostor gets a different clue')
  })

  it('keeps the different-clue toggle disabled when fewer than 2 impostors', () => {
    setup()
    openSettings()
    // Turn clues on but leave the fixed count at 1.
    fireEvent.click(screen.getByRole('switch', { name: /see a clue/i }))
    const toggle = screen.getByRole('switch', { name: /each impostor gets a different clue/i })
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveAccessibleDescription(/2 impostors/i)
  })

  it('enables the different-clue toggle when clues are on and the count is >= 2', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')
    openSettings()
    fireEvent.click(screen.getByRole('switch', { name: /see a clue/i }))
    setCount(2)

    const toggle = screen.getByRole('switch', { name: /each impostor gets a different clue/i })
    expect(toggle).not.toBeDisabled()

    fireEvent.click(toggle)
    expect(toggle).toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    // Valid config -> game starts; the persisted config carries the flag.
    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
    const saved = JSON.parse(window.localStorage.getItem('impostor.config') ?? '{}')
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

  it('names every control by what it does', () => {
    setup()
    openSettings()
    expect(screen.getByRole('button', { name: /fewer impostors/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /more impostors/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Euskara' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Valencià' })).toHaveAttribute('lang', 'ca-valencia')

    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    fillPlayer(0, 'Ana')
    expect(screen.getByRole('button', { name: 'Remove Ana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove player 2' })).toBeInTheDocument()
  })
})
