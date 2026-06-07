import { screen } from '@testing-library/react'
import App from '@/presentation/App'
import { renderWithProviders } from '../helpers/renderWithProviders'

describe('App router', () => {
  it('shows the Setup screen by default', () => {
    renderWithProviders(<App />)
    // setup.title (English) is Setup-only and proves the setup screen mounted.
    expect(
      screen.getByRole('heading', { name: 'New game' }),
    ).toBeInTheDocument()
  })

  it('renders a footer with the app version label', () => {
    renderWithProviders(<App />)
    // Under vitest the Vite define is not applied, so the fallback 'dev' shows.
    expect(
      screen.getByText(/Impostor v(dev|\d+\.\d+\.\d+)/),
    ).toBeInTheDocument()
  })
})
