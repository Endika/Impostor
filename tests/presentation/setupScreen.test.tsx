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

  it('shows the invalid impostor count error with 3 players, min 1 and max 3', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const max = screen.getByLabelText(/max impostors/i) as HTMLInputElement
    // New rule: max impostors = players - 1 = 2 for 3 players; max 3 is invalid.
    fireEvent.change(max, { target: { value: '3' } })

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(
      screen.getByText(/choose between 1 and/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
  })

  it('dispatches START_GAME and transitions to reveal with a valid 3-player min1/max2 config', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const min = screen.getByLabelText(/min impostors/i) as HTMLInputElement
    const max = screen.getByLabelText(/max impostors/i) as HTMLInputElement
    fireEvent.change(min, { target: { value: '1' } })
    fireEvent.change(max, { target: { value: '2' } })

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

  it('bumps max up when min is raised above it', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')
    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    fillPlayer(3, 'Dan')
    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    fillPlayer(4, 'Eve')

    const min = screen.getByLabelText(/min impostors/i) as HTMLInputElement
    const max = screen.getByLabelText(/max impostors/i) as HTMLInputElement
    // Raise min above the current max (1) -> max should follow.
    fireEvent.change(min, { target: { value: '3' } })

    expect(min.value).toBe('3')
    expect(max.value).toBe('3')
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
        impostorMin: 1,
        impostorMax: 1,
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
