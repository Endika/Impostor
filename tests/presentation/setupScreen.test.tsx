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

  it('shows the invalid impostor count error with 3 players and count 3', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    const count = screen.getByLabelText(/number of impostors/i) as HTMLSelectElement
    // max is players-1 = 2; force an invalid value of 3 so validation rejects it.
    fireEvent.change(count, { target: { value: '3' } })

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(
      screen.getByText(/choose between 1 and 2 impostors/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId('screen')).toHaveTextContent('setup')
  })

  it('does not show the invalid-count error with 4 players and count 3', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')
    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    fillPlayer(3, 'Dan')

    const count = screen.getByLabelText(/number of impostors/i) as HTMLSelectElement
    fireEvent.change(count, { target: { value: '3' } })

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.queryByText(/choose between 1 and/i)).not.toBeInTheDocument()
  })

  it('dispatches START_GAME and transitions to reveal with a valid config', () => {
    setup()
    fillPlayer(0, 'Ana')
    fillPlayer(1, 'Ben')
    fillPlayer(2, 'Cleo')

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(screen.getByTestId('screen')).toHaveTextContent('reveal')
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
